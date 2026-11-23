import type { Element, ElementResearch } from "../types.js";

export class FactAgent {
  check(element: Element): Pick<ElementResearch, "factCheck"> {
    const massNote = element.atomicNumber >= 84
      ? "The displayed mass is a representative mass number because these elements have no stable isotopes."
      : "The displayed atomic mass is a standard reference value and isotope mixtures may vary.";
    return {
      factCheck: `${massNote} Discovery attribution shown for ${element.name}: ${element.discoveredBy}.`,
    };
  }
}
