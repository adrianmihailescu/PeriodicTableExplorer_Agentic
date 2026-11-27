import ElementTile from "./ElementTile";
import { SERIES_PERIODS } from "../data/periodicTable";
import type { PeriodicTableProps } from "./types/PeriodicTable.types";

export default function PeriodicTable({ elements, selectedElement, onSelect }: PeriodicTableProps) {
  const mainElements = elements.filter((element) => element.period <= 7);
  const seriesElements = elements.filter((element) => element.period >= 8);

  return (
    <div className="table-scroll">
      <div className="periodic-table" role="grid" aria-label="Periodic table of the elements">
        <div className="group-numbers" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <span key={index}>{index + 1}</span>)}
        </div>
        <div className="element-grid">
          {mainElements.map((element) => (
            <ElementTile
              key={element.atomicNumber}
              element={element}
              selected={selectedElement?.atomicNumber === element.atomicNumber}
              onClick={onSelect}
              style={{ "--group": element.group ?? undefined, "--period": element.period }}
            />
          ))}
        </div>
        {Object.entries(SERIES_PERIODS).map(([period, label]) => {
          const row = seriesElements.filter((element) => element.period === Number(period));
          return (
            <div className="series-row" key={period}>
              <span className="series-label">{label}</span>
              <div className="series-grid">
                {row.map((element) => (
                  <ElementTile
                    key={element.atomicNumber}
                    element={element}
                    selected={selectedElement?.atomicNumber === element.atomicNumber}
                    onClick={onSelect}
                    style={{ gridColumn: element.atomicNumber - (Number(period) === 8 ? 56 : 88) }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
