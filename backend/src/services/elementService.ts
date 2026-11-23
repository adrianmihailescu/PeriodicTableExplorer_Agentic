import rawElements from "../data/periodicTable.json" with { type: "json" };
import type { Element, ElementCategory, ElementPhase } from "../types.js";

type ElementRow = [
  string,
  string,
  number,
  ElementCategory,
  number | null,
  number,
  ElementPhase,
  string,
  string,
];

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

const elements: Element[] = (rawElements as ElementRow[]).map((row, index) => {
  const [symbol, name, atomicMass, category, group, period, phase, electronConfiguration, discoveredBy] = row;
  const seriesName = period === 8 ? "lanthanide series" : period === 9 ? "actinide series" : `period ${period}`;
  return {
    atomicNumber: index + 1,
    symbol,
    name,
    atomicMass,
    category,
    group,
    period,
    phase,
    electronConfiguration,
    discoveredBy,
    summary: `${name} (${symbol}) is ${categoryDescriptions[category]}. It is a ${phase.toLowerCase()} at room temperature and belongs to the ${seriesName}.`,
  };
});

export function listElements(search = "", category?: ElementCategory): Element[] {
  const query = search.trim().toLocaleLowerCase();
  return elements.filter((element) => {
    const matchesSearch = !query
      || element.name.toLocaleLowerCase().includes(query)
      || element.symbol.toLocaleLowerCase().includes(query)
      || String(element.atomicNumber) === query;
    return matchesSearch && (!category || element.category === category);
  });
}

export function getElementByAtomicNumber(atomicNumber: number): Element | undefined {
  return elements[atomicNumber - 1];
}

export function getElementCount(): number {
  return elements.length;
}
