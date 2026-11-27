import assert from "node:assert/strict";
import { test } from "node:test";
import * as XLSX from "@e965/xlsx";
import { parseWorldBankMarketCoverage, parseWorldBankMarketWorkbook } from "./marketDataService.js";

function createWorkbook(): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["World Bank Commodity Price Data (The Pink Sheet)"],
    ["monthly prices in nominal US dollars, 1960 to present"],
    ["monthly series are available only in nominal US dollars"],
    ["Updated on January 02, 2025"],
    ["Date", "Aluminum", "Copper", "Gold"],
    ["", "($/mt)", "($/mt)", "($/troy oz)"],
    ["2020M01", 1800, 6000, 1500],
    ["2023M01", 2400, 8500, 1900],
    ["2024M01", 2300, 8200, 2000],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Monthly Prices");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

test("World Bank market workbook parsing returns real-series metadata and applies the selected range", () => {
  const series = parseWorldBankMarketWorkbook(
    createWorkbook(),
    29,
    "1y",
    "https://thedocs.worldbank.org/commodity-prices.xlsx",
  );

  assert.ok(series);
  assert.equal(series.element, "Copper");
  assert.equal(series.unit, "US$ per metric tonne");
  assert.equal(series.updatedOn, "Updated on January 02, 2025");
  assert.deepEqual(series.points, [
    { date: "2023-01", value: 8500 },
    { date: "2024-01", value: 8200 },
  ]);
});

test("World Bank market data leaves elements without a matching commodity series unavailable", () => {
  assert.equal(parseWorldBankMarketWorkbook(createWorkbook(), 1, "all", ""), null);
});

test("market coverage reflects the commodity columns and observations in the current workbook", () => {
  const coverage = parseWorldBankMarketCoverage(
    createWorkbook(),
    "https://thedocs.worldbank.org/commodity-prices.xlsx",
  );

  assert.deepEqual(coverage.atomicNumbers, [13, 29, 79]);
  assert.equal(coverage.updatedOn, "Updated on January 02, 2025");
});
