import type { CSSProperties } from "react";

export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth-metal"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "reactive-nonmetal"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

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

export type ElementTileStyle = CSSProperties & {
  [property: `--${string}`]: string | number | undefined;
};
