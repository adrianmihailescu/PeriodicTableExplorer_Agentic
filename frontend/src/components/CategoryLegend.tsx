import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/periodicTable";
import type { ElementCategory, ElementTileStyle } from "../types";

interface CategoryLegendProps {
  activeCategory: ElementCategory | "";
  onSelect: (category: ElementCategory | "") => void;
}

export default function CategoryLegend({ activeCategory, onSelect }: CategoryLegendProps) {
  return (
    <div className="legend" aria-label="Filter by element family">
      {(Object.entries(CATEGORY_LABELS) as [ElementCategory, string][]).map(([category, label]) => (
        <button
          type="button"
          className={`legend-item${activeCategory === category ? " active" : ""}`}
          key={category}
          aria-pressed={activeCategory === category}
          onClick={() => onSelect(activeCategory === category ? "" : category)}
        >
          <span className="legend-dot" style={{ "--tile-color": CATEGORY_COLORS[category] } as ElementTileStyle} />
          {label}
        </button>
      ))}
    </div>
  );
}
