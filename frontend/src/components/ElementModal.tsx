import { useEffect, useState } from "react";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/periodicTable";
import LoadingSpinner from "./LoadingSpinner";
import { getElementResearch } from "../services/elementApi";
import type { Element, ElementResearch, ElementTileStyle } from "../types";

interface ElementModalProps {
  element: Element | null;
  onClose: () => void;
}

export default function ElementModal({ element, onClose }: ElementModalProps) {
  const [research, setResearch] = useState<ElementResearch | null>(null);
  const [researchError, setResearchError] = useState("");

  useEffect(() => {
    if (!element) return undefined;
    const controller = new AbortController();
    setResearch(null);
    setResearchError("");
    getElementResearch(element.atomicNumber, controller.signal)
      .then(setResearch)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResearchError(error instanceof Error ? error.message : "Could not load element insights.");
        }
      });
    return () => controller.abort();
  }, [element]);

  useEffect(() => {
    if (!element) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [element, onClose]);

  if (!element) return null;

  const encodedName = encodeURIComponent(element.name);
  const periodicTableUrl = `https://api.periodictableofelements.org/elements/${element.atomicNumber}/`;
  const pubChemUrl = `https://pubchem.ncbi.nlm.nih.gov/#query=${encodedName}`;
  const nistUrl = `https://webbook.nist.gov/cgi/cbook.cgi?Name=${encodedName}`;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="element-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-element-name"
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close element details">×</button>
        <div className="modal-heading">
          <div className="modal-element-icon" style={{ "--tile-color": CATEGORY_COLORS[element.category] } as ElementTileStyle}>
            <span className="tile-number">{element.atomicNumber}</span>
            <span className="tile-symbol">{element.symbol}</span>
          </div>
          <div>
            <span className="eyebrow">{CATEGORY_LABELS[element.category]}</span>
            <h2 id="modal-element-name">{element.name}</h2>
            <p className="modal-subtitle">Element {element.atomicNumber}</p>
          </div>
        </div>
        <p className="element-summary">{element.summary}</p>
        <div className="property-grid">
          <Property label="Atomic mass" value={`${element.atomicMass} u`} />
          <Property label="Phase at room temp." value={element.phase} />
          <Property label="Group" value={element.group ? String(element.group) : "—"} />
          <Property label="Period" value={element.period > 7 ? `${element.period === 8 ? "Lanthanide" : "Actinide"} series` : String(element.period)} />
          <Property label="Electron configuration" value={element.electronConfiguration} />
          <Property label="Discovered by" value={element.discoveredBy} />
        </div>
        <div className="research-panel" aria-busy={!research && !researchError}>
          <h3>Element insight</h3>
          {research ? (
            <div className="insight-copy">
              <p>{research.chemistry}</p>
              <p>{research.factCheck}</p>
            </div>
          ) : researchError ? (
            <p className="inline-error">{researchError}</p>
          ) : (
            <LoadingSpinner label="Loading element insights..." />
          )}
        </div>
        <div className="modal-footer">
          <span>Reference data · Values may vary between isotopes</span>
          <nav className="source-links" aria-label="External element sources">
            <a href={periodicTableUrl} target="_blank" rel="noreferrer">PeriodicTableOfElements.org</a>
            <a href={pubChemUrl} target="_blank" rel="noreferrer">PubChem</a>
            <a href={nistUrl} target="_blank" rel="noreferrer">NIST WebBook lookup</a>
          </nav>
        </div>
      </section>
    </div>
  );
}

interface PropertyProps {
  label: string;
  value: string;
}

function Property({ label, value }: PropertyProps) {
  return (
    <div className="property">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
