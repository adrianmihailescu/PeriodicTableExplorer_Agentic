import type { Element } from "../../types";

export interface ElementModalProps {
  element: Element | null;
  onClose: () => void;
}

export interface PropertyProps {
  label: string;
  value: string;
}
