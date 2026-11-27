import { loadElements } from "./elementDataSource.js";
import type { Element, ElementCategory } from "../types.js";

const CACHE_DURATION_MS = 60 * 60 * 1000;
let cachedElements: { elements: Element[]; expiresAt: number } | undefined;
let loadingElements: Promise<Element[]> | undefined;

async function getElements(): Promise<Element[]> {
  if (cachedElements && cachedElements.expiresAt > Date.now()) {
    return cachedElements.elements;
  }
  if (!loadingElements) {
    loadingElements = loadElements()
      .then((elements) => {
        cachedElements = { elements, expiresAt: Date.now() + CACHE_DURATION_MS };
        return elements;
      })
      .finally(() => {
        loadingElements = undefined;
      });
  }
  return loadingElements;
}

export async function listElements(search = "", category?: ElementCategory): Promise<Element[]> {
  const query = search.trim().toLocaleLowerCase();
  const elements = await getElements();
  return elements.filter((element) => {
    const matchesSearch = !query
      || element.name.toLocaleLowerCase().includes(query)
      || element.symbol.toLocaleLowerCase().includes(query)
      || String(element.atomicNumber) === query;
    return matchesSearch && (!category || element.category === category);
  });
}

export async function getElementByAtomicNumber(atomicNumber: number): Promise<Element | undefined> {
  const elements = await getElements();
  return elements.find((element) => element.atomicNumber === atomicNumber);
}

export function getElementCount(): number {
  return 118;
}
