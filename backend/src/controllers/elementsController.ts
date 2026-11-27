import type { Request, Response } from "express";
import { ELEMENT_CATEGORIES } from "../types.js";
import type { ElementCategory, MarketPeriod } from "../types.js";
import { getElementByAtomicNumber, listElements } from "../services/elementService.js";
import { researchElement } from "../services/agentService.js";
import { getElementMarketSeries } from "../services/marketDataService.js";

const MARKET_PERIODS: MarketPeriod[] = ["1y", "5y", "all"];

function isMarketPeriod(value: string): value is MarketPeriod {
  return MARKET_PERIODS.some((period) => period === value);
}

function sendDataSourceError(res: Response, error: unknown): void {
  const reason = error instanceof Error ? error.message : "Unknown data-source error.";
  console.error("Could not retrieve public element data.", error);
  res.status(502).json({ error: `Could not retrieve public element data. ${reason}` });
}

export async function getElements(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.q === "string" ? req.query.q : "";
  const categoryParam = typeof req.query.category === "string" ? req.query.category : undefined;
  if (categoryParam && !ELEMENT_CATEGORIES.includes(categoryParam as ElementCategory)) {
    res.status(400).json({ error: "Unknown element category." });
    return;
  }
  try {
    res.json(await listElements(search, categoryParam as ElementCategory | undefined));
  } catch (error) {
    sendDataSourceError(res, error);
  }
}

export async function getElement(req: Request, res: Response): Promise<void> {
  const atomicNumber = Number(req.params.atomicNumber);
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    res.status(400).json({ error: "Atomic number must be an integer from 1 to 118." });
    return;
  }
  try {
    const element = await getElementByAtomicNumber(atomicNumber);
    if (!element) {
      res.status(404).json({ error: "Element not found." });
      return;
    }
    res.json(element);
  } catch (error) {
    sendDataSourceError(res, error);
  }
}

export async function researchElementDetails(req: Request, res: Response): Promise<void> {
  const atomicNumber = Number(req.params.atomicNumber);
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    res.status(400).json({ error: "Atomic number must be an integer from 1 to 118." });
    return;
  }
  try {
    const element = await getElementByAtomicNumber(atomicNumber);
    if (!element) {
      res.status(404).json({ error: "Element not found." });
      return;
    }
    res.json(researchElement(element));
  } catch (error) {
    sendDataSourceError(res, error);
  }
}

export async function getElementMarketData(req: Request, res: Response): Promise<void> {
  const atomicNumber = Number(req.params.atomicNumber);
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    res.status(400).json({ error: "Atomic number must be an integer from 1 to 118." });
    return;
  }

  const periodParam = req.query.period;
  const period = periodParam === undefined
    ? "5y"
    : typeof periodParam === "string" && isMarketPeriod(periodParam)
      ? periodParam
      : undefined;
  if (!period) {
    res.status(400).json({ error: "Period must be 1y, 5y, or all." });
    return;
  }

  try {
    res.json(await getElementMarketSeries(atomicNumber, period));
  } catch (error) {
    console.error("Could not retrieve World Bank market data.", error);
    const reason = error instanceof Error ? error.message : "Unknown data-source error.";
    res.status(502).json({ error: `Could not retrieve World Bank market data. ${reason}` });
  }
}
