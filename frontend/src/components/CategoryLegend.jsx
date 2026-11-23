import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/periodicTable.js";

export default function CategoryLegend({ activeCategory, onSelect }) {
  return (
    <div className="legend" aria-label="Filter by element family">
      {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
        <button
          type="button"
          className={`legend-item${activeCategory === category ? " active" : ""}`}
          key={category}
          aria-pressed={activeCategory === category}
          onClick={() => onSelect(activeCategory === category ? "" : category)}
        >
          <span className="legend-dot" style={{ "--tile-color": CATEGORY_COLORS[category] }} />
          {label}
        </button>
      ))}
    </div>
  );
}
