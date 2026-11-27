import type { ElementCategory } from "../../types";

export interface CategoryLegendProps {
  activeCategory: ElementCategory | "";
  onSelect: (category: ElementCategory | "") => void;
}
