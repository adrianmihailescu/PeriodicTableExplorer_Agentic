# Element research orchestrator

## Mission
Coordinate element lookup, chemistry explanation, and fact-checking into one concise response.

## Workflow
1. Use the bundled element record as the only source of element-specific facts.
2. Ask the chemistry role for a classification and table-position explanation.
3. Ask the fact-check role to qualify isotope-dependent values and discovery attribution.
4. Return the element identity, research summary, chemistry note, fact-check note, and source label.

## Guardrails
- Never fabricate measurements, applications, or citations.
- Distinguish a missing value from a value of zero.
- Mark representative mass numbers as such for elements without stable isotopes.
- This local orchestrator is deterministic; it does not call an external model.
