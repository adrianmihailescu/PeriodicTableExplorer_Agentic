import type { Element, ElementResearch } from "../types.js";

export class ElementResearchAgent {
  research(element: Element): Pick<ElementResearch, "research"> {
    return {
      research: `${element.name} is element ${element.atomicNumber} (symbol ${element.symbol}). Its listed atomic mass is ${element.atomicMass} u, and its electron configuration is ${element.electronConfiguration}.`,
    };
  }
}
