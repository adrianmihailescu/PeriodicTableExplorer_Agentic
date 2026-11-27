import { useEffect, useMemo, useState } from "react";
import PeriodicTable from "./components/PeriodicTable";
import SearchBar from "./components/SearchBar";
import CategoryLegend from "./components/CategoryLegend";
import ElementModal from "./components/ElementModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { CATEGORY_LABELS } from "./data/periodicTable";
import { getElements, getMarketDataCoverage } from "./services/elementApi";
import type { Element, ElementCategory, MarketDataCoverage } from "./types";

const MARKET_COVERAGE_REFRESH_MS = 30 * 60 * 1000;

export default function App() {
  const [elements, setElements] = useState<Element[]>([]);
  const [marketCoverage, setMarketCoverage] = useState<MarketDataCoverage | null>(null);
  const [marketCoverageError, setMarketCoverageError] = useState("");
  const [marketCoverageRetry, setMarketCoverageRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ElementCategory | "">("");
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const marketDataAtomicNumbers = useMemo(
    () => new Set(marketCoverage?.atomicNumbers ?? []),
    [marketCoverage],
  );

  useEffect(() => {
    getElements()
      .then(setElements)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "The element service could not be reached.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let requestInProgress = false;
    const refreshMarketCoverage = () => {
      if (requestInProgress) return;
      requestInProgress = true;
      getMarketDataCoverage(controller.signal)
        .then((coverage) => {
          setMarketCoverage(coverage);
          setMarketCoverageError("");
        })
        .catch((requestError: unknown) => {
          if (!controller.signal.aborted) {
            setMarketCoverageError(requestError instanceof Error ? requestError.message : "Could not load market-data coverage.");
          }
        })
        .finally(() => {
          requestInProgress = false;
        });
    };

    refreshMarketCoverage();
    const intervalId = window.setInterval(refreshMarketCoverage, MARKET_COVERAGE_REFRESH_MS);
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [marketCoverageRetry]);

  const filteredElements = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return elements.filter((element) => {
      const matchesSearch = !normalizedSearch
        || element.name.toLocaleLowerCase().includes(normalizedSearch)
        || element.symbol.toLocaleLowerCase().includes(normalizedSearch)
        || String(element.atomicNumber) === normalizedSearch;
      return matchesSearch && (!category || element.category === category);
    });
  }, [elements, search, category]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Periodic Table Explorer home">
          <span className="brand-mark">Ag</span>
          <span>element</span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> An interactive chemistry guide</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1>The periodic table of <span>elements.</span></h1>
          <p>Explore the building blocks of everything. Pick an element, uncover its story, and see how the pieces fit together.</p>
        </div>
        <div className="hero-stat" aria-label={`${elements.length} elements`}>
          <strong>{elements.length || "118"}</strong>
          <span>known elements</span>
        </div>
      </section>

      <section className="explorer-card" aria-label="Interactive periodic table">
        <div className="explorer-toolbar">
          <div>
            <span className="section-kicker">EXPLORE THE TABLE</span>
            <h2>The periodic table</h2>
          </div>
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={filteredElements.length}
            totalCount={elements.length}
          />
        </div>
        <CategoryLegend activeCategory={category} onSelect={setCategory} />
        {error ? (
          <div className="error-state" role="alert">
            <strong>Couldn’t load the elements.</strong>
            <span>{error} Start the API with <code>npm run dev</code> from the project root.</span>
          </div>
        ) : isLoading ? (
          <LoadingSpinner label="Loading the periodic table..." size="large" />
        ) : (
          <>
            <PeriodicTable
              elements={filteredElements}
              marketDataAtomicNumbers={marketDataAtomicNumbers}
              selectedElement={selectedElement}
              onSelect={setSelectedElement}
            />
            {filteredElements.length === 0 && (
              <p className="empty-state">No elements match your search. Try another name, symbol, or family.</p>
            )}
          </>
        )}
        <div className="table-footnote">
          <span>Click any element to explore its properties</span>
          {marketCoverageError ? (
            <span className="market-coverage-error" role="alert">
              <span>
                {marketCoverage
                  ? `Coverage refresh failed; showing last successful data. ${marketCoverageError}`
                  : `Market price coverage unavailable. ${marketCoverageError}`}
              </span>
              <button type="button" onClick={() => setMarketCoverageRetry((retry) => retry + 1)}>Retry</button>
            </span>
          ) : marketCoverage ? (
            <span className="market-data-legend">
              <span className="market-data-legend-mark" aria-hidden="true">$</span>
              Market price history · source updated {marketCoverage.updatedOn.replace(/^Updated on /, "")}
            </span>
          ) : (
            <LoadingSpinner label="Checking market data coverage..." />
          )}
          {category && <button type="button" onClick={() => setCategory("")}>Clear {CATEGORY_LABELS[category]} filter ×</button>}
        </div>
      </section>

      <footer className="page-footer">
        <span>118 elements</span>
      </footer>
      <ElementModal element={selectedElement} onClose={() => setSelectedElement(null)} />
    </main>
  );
}
