import { useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { getElementMarketSeries } from "../services/elementApi";
import type { ElementMarketSeries, MarketPeriod } from "../types";
import type { MarketEvolutionPanelProps, MarketPriceChartProps } from "./types/MarketEvolutionPanel.types";

const PERIOD_OPTIONS: { value: MarketPeriod; label: string }[] = [
  { value: "1y", label: "1 year" },
  { value: "5y", label: "5 years" },
  { value: "all", label: "All available" },
];
const WORLD_BANK_COMMODITY_PAGE = "https://www.worldbank.org/en/research/commodity-markets";

export default function MarketEvolutionPanel({ atomicNumber, elementName, active }: MarketEvolutionPanelProps) {
  const [period, setPeriod] = useState<MarketPeriod>("5y");
  const [series, setSeries] = useState<ElementMarketSeries | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [loadingKey, setLoadingKey] = useState("");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const queryKey = `${atomicNumber}:${period}`;

  useEffect(() => {
    if (!active || loadedKey === queryKey) return undefined;
    const controller = new AbortController();
    setLoadingKey(queryKey);
    setError("");
    getElementMarketSeries(atomicNumber, period, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSeries(result);
          setLoadedKey(queryKey);
          setLoadingKey("");
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "Could not load market data.");
          setLoadingKey("");
        }
      });
    return () => controller.abort();
  }, [active, atomicNumber, loadedKey, period, queryKey, retryCount]);

  const currentSeries = loadedKey === queryKey ? series : null;
  const isLoading = active && loadedKey !== queryKey && !error && (loadingKey === queryKey || loadingKey === "");

  return (
    <div className="market-panel-content">
      <div className="market-toolbar">
        <div>
          <h3>{elementName} market evolution</h3>
          <p>Monthly commodity prices in nominal US dollars</p>
        </div>
        <label className="market-period">
          Period
          <select
            value={period}
            onChange={(event) => {
              const option = PERIOD_OPTIONS.find((candidate) => candidate.value === event.target.value);
              if (option) setPeriod(option.value);
            }}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      {isLoading ? (
        <LoadingSpinner label={`Loading ${elementName} market data and graph...`} />
      ) : error ? (
        <div className="market-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => { setError(""); setRetryCount((count) => count + 1); }}>
            Retry
          </button>
        </div>
      ) : loadedKey === queryKey && currentSeries ? (
        <MarketPriceChart series={currentSeries} />
      ) : loadedKey === queryKey ? (
        <div className="market-unavailable" aria-label={`${elementName} market evolution`}>
          <p className="market-na">N/A</p>
          <p>No monthly commodity price series for {elementName} is included in the World Bank Pink Sheet.</p>
          <a className="market-source-link" href={WORLD_BANK_COMMODITY_PAGE} target="_blank" rel="noreferrer">
            World Bank commodity data
          </a>
        </div>
      ) : (
        <LoadingSpinner label={`Loading ${elementName} market data and graph...`} />
      )}
    </div>
  );
}

function MarketPriceChart({ series }: MarketPriceChartProps) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const width = 760;
  const height = 270;
  const left = 64;
  const right = 744;
  const top = 24;
  const bottom = 220;
  const values = series.points.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const valueRange = maximum - minimum || 1;
  const coordinateFor = (index: number, value: number) => ({
    x: left + (series.points.length === 1 ? 0 : (index / (series.points.length - 1)) * (right - left)),
    y: bottom - ((value - minimum) / valueRange) * (bottom - top),
  });
  const path = series.points.map((point, index) => {
    const { x, y } = coordinateFor(index, point.value);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const latest = series.points[series.points.length - 1];
  const first = series.points[0];
  const last = latest;
  if (!first || !last) return null;
  const highlightedPoint = highlightedIndex === null ? null : series.points[highlightedIndex] ?? null;
  const highlightedPosition = highlightedPoint ? coordinateFor(highlightedIndex ?? 0, highlightedPoint.value) : null;
  const tooltipX = highlightedPosition
    ? Math.max(left, Math.min(right - 150, highlightedPosition.x > (left + right) / 2 ? highlightedPosition.x - 162 : highlightedPosition.x + 12))
    : 0;
  const tooltipY = highlightedPosition
    ? highlightedPosition.y - 54 < top ? Math.min(bottom - 46, highlightedPosition.y + 10) : highlightedPosition.y - 54
    : 0;

  function moveHighlight(event: ReactKeyboardEvent<SVGSVGElement>) {
    if (series.points.length === 0) return;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(series.points.length - 1, (index ?? -1) + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(0, (index ?? series.points.length) - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(series.points.length - 1);
    }
  }

  return (
    <div className="market-chart">
      <div className="market-latest">
        <strong>{formatPrice(last.value)}</strong>
        <span>{formatMonth(last.date)} · {series.unit}</span>
      </div>
      <svg
        className="market-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${series.commodity} monthly price time series from ${formatMonth(first.date)} to ${formatMonth(last.date)}. Hover to inspect values or focus and use the arrow keys.`}
        tabIndex={0}
        onKeyDown={moveHighlight}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * width;
          const fraction = Math.max(0, Math.min(1, (x - left) / (right - left)));
          setHighlightedIndex(Math.round(fraction * (series.points.length - 1)));
        }}
        onPointerLeave={() => setHighlightedIndex(null)}
        onBlur={() => setHighlightedIndex(null)}
      >
        {[0, 1, 2, 3].map((step) => {
          const ratio = step / 3;
          const y = top + ratio * (bottom - top);
          const value = maximum - ratio * (maximum - minimum);
          return (
            <g key={step}>
              <line className="market-chart-grid" x1={left} x2={right} y1={y} y2={y} />
              <text className="market-chart-axis" x={left - 8} y={y + 4} textAnchor="end">{formatAxisPrice(value)}</text>
            </g>
          );
        })}
        <path className="market-chart-line" d={path} />
        <rect className="market-chart-hit-area" x={left} y={top} width={right - left} height={bottom - top} />
        {highlightedPoint && highlightedPosition && (
          <g className="market-chart-highlight" pointerEvents="none">
            <line className="market-chart-crosshair" x1={highlightedPosition.x} x2={highlightedPosition.x} y1={top} y2={bottom} />
            <circle className="market-chart-point" cx={highlightedPosition.x} cy={highlightedPosition.y} r="5" />
            <g className="market-chart-tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
              <rect width="150" height="46" rx="6" />
              <text className="market-chart-tooltip-value" x="9" y="19">{formatPrice(highlightedPoint.value)}</text>
              <text className="market-chart-tooltip-date" x="9" y="36">{formatMonth(highlightedPoint.date)}</text>
            </g>
          </g>
        )}
        <text className="market-chart-axis" x={left} y={bottom + 24}>{formatMonth(first.date)}</text>
        <text className="market-chart-axis" x={right} y={bottom + 24} textAnchor="end">{formatMonth(last.date)}</text>
      </svg>
      <p className="market-chart-caption">{series.points.length} monthly observations · Source updated {series.updatedOn}</p>
      <a className="market-source-link" href={series.sourceUrl} target="_blank" rel="noreferrer">
        Source: {series.sourceName}
      </a>
    </div>
  );
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatAxisPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMonth(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}
