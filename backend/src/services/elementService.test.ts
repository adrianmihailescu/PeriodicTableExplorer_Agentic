import assert from "node:assert/strict";
import { test } from "node:test";
import { getElementByAtomicNumber, getElementCount, listElements } from "./elementService.js";

test("the bundled table contains all 118 elements in atomic-number order", () => {
  assert.equal(getElementCount(), 118);
  assert.equal(getElementByAtomicNumber(1)?.symbol, "H");
  assert.equal(getElementByAtomicNumber(118)?.symbol, "Og");
});

test("search matches names, symbols, and atomic numbers without losing dataset facts", () => {
  assert.equal(listElements("oxygen")[0]?.symbol, "O");
  assert.equal(listElements("fe")[0]?.name, "Iron");
  assert.equal(listElements("79")[0]?.symbol, "Au");
  assert.equal(listElements("", "noble-gas").length, 6);
});

test("representative table positions include both detached element series", () => {
  assert.deepEqual(
    [getElementByAtomicNumber(1)?.group, getElementByAtomicNumber(1)?.period],
    [1, 1],
  );
  assert.deepEqual(
    [getElementByAtomicNumber(58)?.group, getElementByAtomicNumber(58)?.period],
    [null, 8],
  );
  assert.deepEqual(
    [getElementByAtomicNumber(90)?.group, getElementByAtomicNumber(90)?.period],
    [null, 9],
  );
});
