import type { Element } from "../../types";

export interface PeriodicTableProps {
  elements: Element[];
  selectedElement: Element | null;
  onSelect: (element: Element) => void;
}
