import { useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../data/periodicTable";
import ElectronShellDiagram from "./ElectronShellDiagram";
import LoadingSpinner from "./LoadingSpinner";
import MarketEvolutionPanel from "./MarketEvolutionPanel";
import { getElementResearch } from "../services/elementApi";
import type { ElementResearch, ElementTileStyle } from "../types";
import type { ElementModalProps, PropertyProps } from "./types/ElementModal.types";

export default function ElementModal({ element, onClose }: ElementModalProps) {
  const [research, setResearch] = useState<ElementResearch | null>(null);
  const [researchError, setResearchError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "market-evolution">("details");

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const currentIndex = tabs.indexOf(event.currentTarget);
    const nextIndex = event.key === "ArrowRight" || event.key === "ArrowDown"
      ? (currentIndex + 1) % tabs.length
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? (currentIndex - 1 + tabs.length) % tabs.length
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : currentIndex;

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      tabs[nextIndex].focus();
      setActiveTab(tabs[nextIndex].id === "details-tab" ? "details" : "market-evolution");
    }
  }

  useEffect(() => {
    if (!element) return undefined;
    const controller = new AbortController();
    setResearch(null);
    setResearchError("");
    setActiveTab("details");
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
        <div className="modal-tabs" role="tablist" aria-label={`${element.name} information`}>
          <button
            id="details-tab"
            className="modal-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === "details"}
            aria-controls="details-panel"
            onClick={() => setActiveTab("details")}
            onKeyDown={handleTabKeyDown}
          >
            Details
          </button>
          <button
            id="market-evolution-tab"
            className="modal-tab"
            type="button"
            role="tab"
            aria-selected={activeTab === "market-evolution"}
            aria-controls="market-evolution-panel"
            onClick={() => setActiveTab("market-evolution")}
            onKeyDown={handleTabKeyDown}
          >
            Market evolution
          </button>
        </div>
        <div id="details-panel" className="modal-tab-panel" role="tabpanel" aria-labelledby="details-tab" hidden={activeTab !== "details"}>
          <p className="element-summary">{element.summary}</p>
          <div className="property-grid">
            <Property label="Atomic mass" value={`${element.atomicMass} u`} />
            <Property label="Phase at room temp." value={element.phase} />
            <Property label="Group" value={element.group ? String(element.group) : "—"} />
            <Property label="Period" value={element.period > 7 ? `${element.period === 8 ? "Lanthanide" : "Actinide"} series` : String(element.period)} />
            <Property label="Electron configuration" value={element.electronConfiguration} />
            <Property label="Discovered by" value={element.discoveredBy} />
          </div>
          <ElectronShellDiagram element={element} />
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
        </div>
        <div id="market-evolution-panel" className="modal-tab-panel" role="tabpanel" aria-labelledby="market-evolution-tab" hidden={activeTab !== "market-evolution"}>
          <MarketEvolutionPanel
            atomicNumber={element.atomicNumber}
            elementName={element.name}
            active={activeTab === "market-evolution"}
          />
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

function Property({ label, value }: PropertyProps) {
  return (
    <div className="property">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
