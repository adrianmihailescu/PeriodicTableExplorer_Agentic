import * as XLSX from "@e965/xlsx";

export type MarketPeriod = "1y" | "5y" | "all";

export interface MarketPricePoint {
  date: string;
  value: number;
}

export interface ElementMarketSeries {
  element: string;
  commodity: string;
  unit: string;
  period: MarketPeriod;
  updatedOn: string;
  sourceName: string;
  sourceUrl: string;
  points: MarketPricePoint[];
}

const WORLD_BANK_COMMODITY_PAGE = "https://www.worldbank.org/en/research/commodity-markets";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_WORKBOOK_BYTES = 10 * 1024 * 1024;
const SOURCE_NAME = "World Bank Commodity Price Data (The Pink Sheet)";

const ELEMENT_COMMODITIES: Record<number, { element: string; commodity: string }> = {
  13: { element: "Aluminum", commodity: "Aluminum" },
  29: { element: "Copper", commodity: "Copper" },
  82: { element: "Lead", commodity: "Lead" },
  50: { element: "Tin", commodity: "Tin" },
  28: { element: "Nickel", commodity: "Nickel" },
  30: { element: "Zinc", commodity: "Zinc" },
  79: { element: "Gold", commodity: "Gold" },
  78: { element: "Platinum", commodity: "Platinum" },
  47: { element: "Silver", commodity: "Silver" },
};

interface CachedWorkbook {
  data: Buffer;
  sourceUrl: string;
  expiresAt: number;
}

let cachedWorkbook: CachedWorkbook | undefined;
let workbookRequest: Promise<CachedWorkbook> | undefined;

async function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

async function loadWorkbook(): Promise<CachedWorkbook> {
  const pageResponse = await fetchWithTimeout(WORLD_BANK_COMMODITY_PAGE);
  if (!pageResponse.ok) {
    throw new Error(`The World Bank data page returned ${pageResponse.status}.`);
  }
  const page = await pageResponse.text();
  const workbookMatch = page.match(/href=["'](https:\/\/thedocs\.worldbank\.org\/[^"']*CMO-Historical-Data-Monthly\.xlsx)["']/i);
  if (!workbookMatch?.[1]) {
    throw new Error("The World Bank page did not provide its monthly commodity workbook.");
  }

  const sourceUrl = workbookMatch[1];
  const workbookResponse = await fetchWithTimeout(sourceUrl);
  if (!workbookResponse.ok) {
    throw new Error(`The World Bank commodity workbook returned ${workbookResponse.status}.`);
  }
  const contentLength = Number(workbookResponse.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_WORKBOOK_BYTES) {
    throw new Error("The World Bank commodity workbook exceeded the allowed download size.");
  }

  const data = Buffer.from(await workbookResponse.arrayBuffer());
  if (data.byteLength > MAX_WORKBOOK_BYTES) {
    throw new Error("The World Bank commodity workbook exceeded the allowed download size.");
  }
  const workbook = { data, sourceUrl, expiresAt: Date.now() + CACHE_DURATION_MS };
  cachedWorkbook = workbook;
  return workbook;
}

async function getWorkbook(): Promise<CachedWorkbook> {
  if (cachedWorkbook && cachedWorkbook.expiresAt > Date.now()) {
    return cachedWorkbook;
  }
  if (!workbookRequest) {
    workbookRequest = loadWorkbook();
  }
  try {
    return await workbookRequest;
  } finally {
    workbookRequest = undefined;
  }
}

export function parseWorldBankMarketWorkbook(
  data: Buffer,
  atomicNumber: number,
  period: MarketPeriod,
  sourceUrl: string,
): ElementMarketSeries | null {
  const mapping = ELEMENT_COMMODITIES[atomicNumber];
  if (!mapping) return null;

  const workbook = XLSX.read(data, { type: "buffer" });
  const sheet = workbook.Sheets["Monthly Prices"];
  if (!sheet) {
    throw new Error("The World Bank workbook is missing its Monthly Prices sheet.");
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null });
  const headers = rows[4];
  const units = rows[5];
  if (!headers || !units) {
    throw new Error("The World Bank workbook is missing commodity headers or units.");
  }
  const commodityColumn = headers.findIndex((header) => header === mapping.commodity);
  if (commodityColumn < 0) {
    throw new Error(`The World Bank workbook does not include ${mapping.commodity}.`);
  }

  const rawUnit = units[commodityColumn];
  const unit = rawUnit === "($/mt)"
    ? "US$ per metric tonne"
    : rawUnit === "($/troy oz)"
      ? "US$ per troy ounce"
      : null;
  if (!unit) {
    throw new Error(`The World Bank workbook has an unsupported unit for ${mapping.commodity}.`);
  }

  const allPoints: MarketPricePoint[] = [];
  for (const row of rows.slice(6)) {
    const dateCell = row[0];
    const valueCell = row[commodityColumn];

    if (typeof dateCell !== "string" || typeof valueCell !== "number" || !Number.isFinite(valueCell))
      continue;

    const dateMatch = /^(\d{4})M(\d{2})$/.exec(dateCell);

    if (!dateMatch)
      continue;

    allPoints.push({ date: `${dateMatch[1]}-${dateMatch[2]}`, value: valueCell });
  }
  if (allPoints.length === 0) {
    throw new Error(`The World Bank workbook has no monthly prices for ${mapping.commodity}.`);
  }

  const latestDate = allPoints[allPoints.length - 1]?.date;
  if (!latestDate) {
    throw new Error(`The World Bank workbook has no latest date for ${mapping.commodity}.`);
  }
  const months = period === "1y" ? 12 : period === "5y" ? 60 : 0;
  const latestMonth = Number(latestDate.slice(0, 4)) * 12 + Number(latestDate.slice(5, 7)) - 1;
  const cutoffMonth = months ? latestMonth - months : Number.NEGATIVE_INFINITY;
  const points = allPoints.filter((point) => {
    const pointMonth = Number(point.date.slice(0, 4)) * 12 + Number(point.date.slice(5, 7)) - 1;
    return pointMonth >= cutoffMonth;
  });

  const updatedRow = rows[3];
  const updatedOn = typeof updatedRow?.[0] === "string" ? updatedRow[0] : "Not provided";
  return {
    element: mapping.element,
    commodity: mapping.commodity,
    unit,
    period,
    updatedOn,
    sourceName: SOURCE_NAME,
    sourceUrl,
    points,
  };
}

export async function getElementMarketSeries(
  atomicNumber: number,
  period: MarketPeriod,
): Promise<ElementMarketSeries | null> {
  if (!ELEMENT_COMMODITIES[atomicNumber])
    return null;

  const workbook = await getWorkbook();
  return parseWorldBankMarketWorkbook(workbook.data, atomicNumber, period, workbook.sourceUrl);
}
