import { CATEGORY_COLORS } from "../data/periodicTable.js";

export default function ElementTile({ element, onClick, selected = false, style = {} }) {
  return (
    <button
      type="button"
      className={`element-tile${selected ? " is-selected" : ""}`}
      style={{ "--tile-color": CATEGORY_COLORS[element.category], ...style }}
      onClick={() => onClick(element)}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}`}
      aria-pressed={selected}
      title={`${element.name} · ${element.atomicNumber}`}
    >
      <span className="tile-number">{element.atomicNumber}</span>
      <span className="tile-symbol">{element.symbol}</span>
      <span className="tile-name">{element.name}</span>
    </button>
  );
}
