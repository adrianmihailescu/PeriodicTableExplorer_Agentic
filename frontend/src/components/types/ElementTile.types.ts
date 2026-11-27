import type { Element, ElementTileStyle } from "../../types";

export interface ElementTileProps {
  element: Element;
  onClick: (element: Element) => void;
  marketDataAvailable: boolean;
  selected?: boolean;
  style?: ElementTileStyle;
}
