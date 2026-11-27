import type { Element, ElementCategory, ElementPhase } from "../types.js";

const ELEMENTS_URL = "https://api.periodictableofelements.org/elements/export/json/";
const PUBCHEM_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON";
const ELEMENT_COUNT = 118;

const categoryMap: Record<string, ElementCategory> = {
  alkali_metal: "alkali-metal",
  alkaline_earth_metal: "alkaline-earth-metal",
  transition_metal: "transition-metal",
  post_transition_metal: "post-transition-metal",
  metalloid: "metalloid",
  nonmetal: "reactive-nonmetal",
  noble_gas: "noble-gas",
  lanthanide: "lanthanide",
  actinide: "actinide",
  unknown: "unknown",
};

const categoryDescriptions: Record<ElementCategory, string> = {
  "alkali-metal": "a highly reactive metal in group 1",
  "alkaline-earth-metal": "a reactive metal in group 2",
  "transition-metal": "a transition metal in the d-block",
  "post-transition-metal": "a metal with properties distinct from the transition metals",
  metalloid: "a metalloid with properties between metals and nonmetals",
  "reactive-nonmetal": "a reactive nonmetal",
  "noble-gas": "a noble gas with a full outer electron shell",
  lanthanide: "a lanthanide in the f-block",
  actinide: "an actinide in the f-block",
  unknown: "an element whose chemical properties are not yet well characterized",
};

type DataRecord = Record<string, unknown>;
type PubChemRows = Map<number, Map<string, string>>;

function isRecord(value: unknown): value is DataRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`The PeriodicTableOfElements.org response is missing ${field}.`);
  }
  return value.trim();
}

function finiteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) {
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function requiredNumber(value: unknown, field: string): number {
  const parsed = finiteNumber(value);
  if (parsed === undefined) {
    throw new Error(`The PeriodicTableOfElements.org response has an invalid ${field}.`);
  }
  return parsed;
}

function normalizePhase(value: string): ElementPhase {
  const normalized = value.toLocaleLowerCase();
  if (normalized.includes("liquid"))
    return "Liquid";

  if (normalized.includes("gas"))
    return "Gas";

  if (normalized.includes("solid"))
    return "Solid";

  return "Unknown";
}

function isValidElectronShells(value: unknown, atomicNumber: number): value is number[] {
  return Array.isArray(value)
    && value.every((count: unknown) => typeof count === "number" && Number.isInteger(count) && count >= 0)
    && value.reduce((sum: number, count: number) => sum + count, 0) === atomicNumber;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}.`);
  }
  return response.json() as Promise<unknown>;
}

function parsePubChemRows(data: unknown): PubChemRows {
  if (!isRecord(data) || !isRecord(data.Table) || !isRecord(data.Table.Columns)) {
    throw new Error("PubChem returned an invalid periodic-table response.");
  }
  const columns = data.Table.Columns.Column;
  const rows = data.Table.Row;

  if (!isStringArray(columns) || !Array.isArray(rows)) {
    throw new Error("PubChem returned an invalid periodic-table response.");
  }
  const indexes = new Map(columns.map((column, index) => [column, index]));
  const atomicNumberIndex = indexes.get("AtomicNumber");
  const symbolIndex = indexes.get("Symbol");

  if (atomicNumberIndex === undefined || symbolIndex === undefined) {
    throw new Error("PubChem's periodic-table response is missing element identifiers.");
  }

  const parsed = new Map<number, Map<string, string>>();
  for (const row of rows) {
    if (!isRecord(row) || !isStringArray(row.Cell)) {
      throw new Error("PubChem returned an invalid element row.");
    }
    const cells = row.Cell;
    const atomicNumber = finiteNumber(cells[atomicNumberIndex]);
    const symbol = cells[symbolIndex];

    if (atomicNumber === undefined || typeof symbol !== "string" || parsed.has(atomicNumber)) {
      throw new Error("PubChem returned a duplicate or invalid element identifier.");
    }

    parsed.set(atomicNumber, new Map(columns.map((column, index) => [column, cells[index] ?? ""])));
  }

  return parsed;
}

function normalizeElementRecords(data: unknown, pubChemRows?: PubChemRows): Element[] {
  if (!Array.isArray(data)) {
    throw new Error("PeriodicTableOfElements.org returned an invalid element list.");
  }

  const elements = data.map((item): Element => {
    if (!isRecord(item)) {
      throw new Error("PeriodicTableOfElements.org returned an invalid element record.");
    }

    const atomicNumber = requiredNumber(item.atomic_number, "atomic number");
    const symbol = requiredString(item.symbol, `symbol for element ${atomicNumber}`);
    const pubChem = pubChemRows?.get(atomicNumber);

    if (pubChem && pubChem.get("Symbol") !== symbol) {
      throw new Error(`PubChem element ${atomicNumber} does not match symbol ${symbol}.`);
    }

    const categoryKey = requiredString(item.category, `category for element ${atomicNumber}`);
    const category = categoryMap[categoryKey];

    if (!category) {
      throw new Error(`PeriodicTableOfElements.org returned an unsupported category: ${categoryKey}.`);
    }

    const groupValue = item.group_number;
    const group = groupValue === null
      ? atomicNumber === 57 || atomicNumber === 89 ? 3 : null
      : requiredNumber(groupValue, `group for element ${atomicNumber}`);
    const periodValue = requiredNumber(item.period, `period for element ${atomicNumber}`);
    const period = group === null && category === "lanthanide"
      ? 8
      : group === null && category === "actinide" ? 9 : periodValue;
    const name = requiredString(item.name, `name for element ${atomicNumber}`);
    const atomicMass = finiteNumber(item.atomic_mass)
      ?? finiteNumber(pubChem?.get("AtomicWeight"));

    if (atomicMass === undefined) {
      throw new Error(`No atomic mass is available for element ${atomicNumber}.`);
    }
    const electronConfiguration = (
      typeof item.electron_configuration_semantic === "string"
        ? item.electron_configuration_semantic.trim()
        : ""
    ) || pubChem?.get("ElectronConfiguration")?.trim();

    if (!electronConfiguration) {
      throw new Error(`No electron configuration is available for element ${atomicNumber}.`);
    }
    const electronShells = item.electrons_per_shell;
    if (!isValidElectronShells(electronShells, atomicNumber)) {
      throw new Error(`PeriodicTableOfElements.org returned invalid electron-shell counts for element ${atomicNumber}.`);
    }
    const state = typeof item.state_at_room_temp === "string"
      ? item.state_at_room_temp
      : pubChem?.get("StandardState") ?? "";

    const phase = normalizePhase(state);
    const discoveredBy = requiredString(item.discovered_by, `discoverer for element ${atomicNumber}`);
    const seriesName = period === 8 ? "lanthanide series" : period === 9 ? "actinide series" : `period ${period}`;

    return {
      atomicNumber,
      symbol,
      name,
      atomicMass,
      category,
      group,
      period,
      phase,
      electronConfiguration,
      electronShells,
      discoveredBy,
      summary: `${name} (${symbol}) is ${categoryDescriptions[category]}. It is a ${phase.toLowerCase()} at room temperature and belongs to the ${seriesName}.`,
    };
  });

  const atomicNumbers = new Set(elements.map((element) => element.atomicNumber));
  if (atomicNumbers.size !== elements.length) {
    throw new Error("PeriodicTableOfElements.org returned duplicate atomic numbers.");
  }
  return elements.sort((left, right) => left.atomicNumber - right.atomicNumber);
}

export function normalizeElements(data: unknown, pubChemData?: unknown): Element[] {
  const pubChemRows = pubChemData === undefined ? undefined : parsePubChemRows(pubChemData);
  return normalizeElementRecords(data, pubChemRows);
}

async function loadPubChemRows(): Promise<PubChemRows | undefined> {
  try {
    return parsePubChemRows(await fetchJson(PUBCHEM_URL));
  } catch (error) {
    console.warn("PubChem data could not be loaded; using PeriodicTableOfElements.org values.", error);
    return undefined;
  }
}

export async function loadElements(): Promise<Element[]> {
  const [periodicTableData, pubChemRows] = await Promise.all([
    fetchJson(ELEMENTS_URL),
    loadPubChemRows(),
  ]);
  const elements = normalizeElementRecords(periodicTableData, pubChemRows);
  if (elements.length !== ELEMENT_COUNT || elements.some((element, index) => element.atomicNumber !== index + 1)) {
    throw new Error(`PeriodicTableOfElements.org must provide all ${ELEMENT_COUNT} elements.`);
  }
  return elements;
}
