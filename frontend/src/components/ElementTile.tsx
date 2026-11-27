import { CATEGORY_COLORS } from "../data/periodicTable";
import type { ElementTileStyle } from "../types";
import type { ElementTileProps } from "./types/ElementTile.types";

export default function ElementTile({ element, onClick, marketDataAvailable, selected = false, style = {} }: ElementTileProps) {
  return (
    <button
      type="button"
      className={`element-tile${selected ? " is-selected" : ""}${marketDataAvailable ? " has-market-data" : ""}`}
      style={{ "--tile-color": CATEGORY_COLORS[element.category], ...style } as ElementTileStyle}
      onClick={() => onClick(element)}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}${marketDataAvailable ? ", historical market prices available" : ""}`}
      aria-pressed={selected}
      title={`${element.name} · ${element.atomicNumber}${marketDataAvailable ? " · Historical market prices available" : ""}`}
    >
      <span className="tile-number">{element.atomicNumber}</span>
      {marketDataAvailable && <span className="market-data-indicator" aria-hidden="true">$</span>}
      <span className="tile-symbol">{element.symbol}</span>
      <span className="tile-name">{element.name}</span>
    </button>
  );
}
