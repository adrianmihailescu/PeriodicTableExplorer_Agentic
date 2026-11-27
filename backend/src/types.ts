export const ELEMENT_CATEGORIES = [
  "alkali-metal",
  "alkaline-earth-metal",
  "transition-metal",
  "post-transition-metal",
  "metalloid",
  "reactive-nonmetal",
  "noble-gas",
  "lanthanide",
  "actinide",
  "unknown",
] as const;

export type ElementCategory = (typeof ELEMENT_CATEGORIES)[number];
export type ElementPhase = "Solid" | "Liquid" | "Gas" | "Unknown";

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  group: number | null;
  period: number;
  phase: ElementPhase;
  electronConfiguration: string;
  electronShells: number[];
  discoveredBy: string;
  summary: string;
}

export interface ElementResearch {
  atomicNumber: number;
  element: string;
  research: string;
  chemistry: string;
  factCheck: string;
  source: string;
}

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

export interface CachedWorkbook {
  data: Buffer;
  sourceUrl: string;
  expiresAt: number;
}
