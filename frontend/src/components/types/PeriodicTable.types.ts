import type { Element } from "../../types";

export interface PeriodicTableProps {
  elements: Element[];
  marketDataAtomicNumbers: ReadonlySet<number>;
  selectedElement: Element | null;
  onSelect: (element: Element) => void;
}
