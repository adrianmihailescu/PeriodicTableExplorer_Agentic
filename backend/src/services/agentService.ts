import { AgentOrchestrator } from "../agents/AgentOrchestrator.js";
import type { Element, ElementResearch } from "../types.js";

const orchestrator = new AgentOrchestrator();

export function researchElement(element: Element): ElementResearch {
  return orchestrator.research(element);
}
