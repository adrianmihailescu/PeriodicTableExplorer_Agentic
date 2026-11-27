import type { ElementMarketSeries } from "../../types";

export interface MarketEvolutionPanelProps {
  atomicNumber: number;
  elementName: string;
  active: boolean;
}

export interface MarketPriceChartProps {
  series: ElementMarketSeries;
}
