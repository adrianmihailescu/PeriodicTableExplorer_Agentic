import type { Request, Response } from "express";
import { ELEMENT_CATEGORIES } from "../types.js";
import type { ElementCategory } from "../types.js";
import { getElementByAtomicNumber, listElements } from "../services/elementService.js";
import { researchElement } from "../services/agentService.js";

export function getElements(req: Request, res: Response): void {
  const search = typeof req.query.q === "string" ? req.query.q : "";
  const categoryParam = typeof req.query.category === "string" ? req.query.category : undefined;
  if (categoryParam && !ELEMENT_CATEGORIES.includes(categoryParam as ElementCategory)) {
    res.status(400).json({ error: "Unknown element category." });
    return;
  }
  res.json(listElements(search, categoryParam as ElementCategory | undefined));
}

export function getElement(req: Request, res: Response): void {
  const atomicNumber = Number(req.params.atomicNumber);
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    res.status(400).json({ error: "Atomic number must be an integer from 1 to 118." });
    return;
  }
  const element = getElementByAtomicNumber(atomicNumber);
  if (!element) {
    res.status(404).json({ error: "Element not found." });
    return;
  }
  res.json(element);
}

export function researchElementDetails(req: Request, res: Response): void {
  const atomicNumber = Number(req.params.atomicNumber);
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || atomicNumber > 118) {
    res.status(400).json({ error: "Atomic number must be an integer from 1 to 118." });
    return;
  }
  const element = getElementByAtomicNumber(atomicNumber);
  if (!element) {
    res.status(404).json({ error: "Element not found." });
    return;
  }
  res.json(researchElement(element));
}
