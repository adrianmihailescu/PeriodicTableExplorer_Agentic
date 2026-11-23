import type { Element, ElementResearch } from "../types.js";

export class ChemistryAgent {
  explain(element: Element): Pick<ElementResearch, "chemistry"> {
    const location = element.group
      ? `group ${element.group}, period ${element.period}`
      : `${element.period === 8 ? "lanthanide" : "actinide"} series`;
    return {
      chemistry: `${element.name} is classified as a ${element.category.replaceAll("-", " ")}. It is located in ${location} and is listed as a ${element.phase.toLowerCase()} at room temperature.`,
    };
  }
}
