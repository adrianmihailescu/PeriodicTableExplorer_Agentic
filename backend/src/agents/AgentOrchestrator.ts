import { ChemistryAgent } from "./ChemistryAgent.js";
import { ElementResearchAgent } from "./ElementResearchAgent.js";
import { FactAgent } from "./FactAgent.js";
import type { Element, ElementResearch } from "../types.js";

export class AgentOrchestrator {
  constructor(
    private readonly researchAgent = new ElementResearchAgent(),
    private readonly chemistryAgent = new ChemistryAgent(),
    private readonly factAgent = new FactAgent(),
  ) {}

  research(element: Element): ElementResearch {
    return {
      atomicNumber: element.atomicNumber,
      element: element.name,
      ...this.researchAgent.research(element),
      ...this.chemistryAgent.explain(element),
      ...this.factAgent.check(element),
      source: "Bundled periodic-table dataset",
    };
  }
}
