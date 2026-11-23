export default function SearchBar({ value, onChange, resultCount, totalCount }) {
  return (
    <div className="search-wrap">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="search-icon">
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.4 4.4" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search elements..."
        aria-label="Search elements by name, symbol, or atomic number"
      />
      <span className="result-count">{resultCount} / {totalCount}</span>
    </div>
  );
}
