import type { Element, ElementMarketSeries, ElementResearch, MarketDataCoverage, MarketPeriod } from "../types";

interface ApiError {
  error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    const body: ApiError | null = await response.json().catch(() => null);
    throw new Error(body?.error || `The element service returned ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export function getElements(): Promise<Element[]> {
  return request("/elements");
}

export function getElement(atomicNumber: number): Promise<Element> {
  return request(`/elements/${atomicNumber}`);
}

export function getElementResearch(atomicNumber: number, signal?: AbortSignal): Promise<ElementResearch> {
  return request(`/elements/${atomicNumber}/research`, { signal });
}

export function getElementMarketSeries(
  atomicNumber: number,
  period: MarketPeriod,
  signal?: AbortSignal,
): Promise<ElementMarketSeries | null> {
  return request(`/elements/${atomicNumber}/market?period=${period}`, { signal });
}

export function getMarketDataCoverage(signal?: AbortSignal): Promise<MarketDataCoverage> {
  return request("/elements/market-coverage", { signal });
}
