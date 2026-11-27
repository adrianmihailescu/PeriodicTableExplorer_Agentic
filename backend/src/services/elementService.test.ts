import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeElements } from "./elementDataSource.js";
import { getElementCount } from "./elementService.js";

test("the API contract continues to represent all 118 elements", () => {
  assert.equal(getElementCount(), 118);
});

test("source normalization retains element fields and detached-series layout", () => {
  const elements = normalizeElements([
    {
      atomic_number: 1,
      symbol: "H",
      name: "Hydrogen",
      atomic_mass: 1.008,
      category: "nonmetal",
      group_number: 1,
      period: 1,
      state_at_room_temp: "gas",
      electron_configuration_semantic: "1s1",
      electrons_per_shell: [1],
      discovered_by: "Henry Cavendish",
    },
    {
      atomic_number: 58,
      symbol: "Ce",
      name: "Cerium",
      atomic_mass: 140.12,
      category: "lanthanide",
      group_number: null,
      period: 6,
      state_at_room_temp: "solid",
      electron_configuration_semantic: "[Xe] 4f1 5d1 6s2",
      electrons_per_shell: [2, 8, 18, 19, 9, 2],
      discovered_by: "Jons Jacob Berzelius, Wilhelm Hisinger",
    },
    {
      atomic_number: 57,
      symbol: "La",
      name: "Lanthanum",
      atomic_mass: 138.90547,
      category: "lanthanide",
      group_number: null,
      period: 6,
      state_at_room_temp: "solid",
      electron_configuration_semantic: "[Xe] 5d1 6s2",
      electrons_per_shell: [2, 8, 18, 18, 9, 2],
      discovered_by: "Carl Gustaf Mosander",
    },
    {
      atomic_number: 90,
      symbol: "Th",
      name: "Thorium",
      atomic_mass: 232.038,
      category: "actinide",
      group_number: null,
      period: 7,
      state_at_room_temp: "solid",
      electron_configuration_semantic: "[Rn] 6d2 7s2",
      electrons_per_shell: [2, 8, 18, 32, 18, 10, 2],
      discovered_by: "Jons Jacob Berzelius",
    },
    {
      atomic_number: 89,
      symbol: "Ac",
      name: "Actinium",
      atomic_mass: 227.02775,
      category: "actinide",
      group_number: null,
      period: 7,
      state_at_room_temp: "solid",
      electron_configuration_semantic: "[Rn] 6d1 7s2",
      electrons_per_shell: [2, 8, 18, 32, 18, 9, 2],
      discovered_by: "Friedrich Oskar Giesel, Andre-Louis Debierne",
    },
  ]);

  assert.deepEqual(
    [elements[0]?.symbol, elements[0]?.category, elements[0]?.phase, elements[0]?.electronShells, elements[0]?.discoveredBy],
    ["H", "reactive-nonmetal", "Gas", [1], "Henry Cavendish"],
  );
  assert.deepEqual(
    [elements[1]?.symbol, elements[1]?.group, elements[1]?.period],
    ["La", 3, 6],
  );
  assert.deepEqual(
    [elements[3]?.symbol, elements[3]?.group, elements[3]?.period],
    ["Ac", 3, 7],
  );
  assert.deepEqual(
    [elements[4]?.group, elements[4]?.period],
    [null, 9],
  );
  assert.deepEqual(
    [elements[2]?.group, elements[2]?.period],
    [null, 8],
  );
});

test("PubChem values supplement absent mass and electron configuration", () => {
  const elements = normalizeElements(
    [{
      atomic_number: 1,
      symbol: "H",
      name: "Hydrogen",
      atomic_mass: null,
      category: "nonmetal",
      group_number: 1,
      period: 1,
      state_at_room_temp: "gas",
      electron_configuration_semantic: "",
      electrons_per_shell: [1],
      discovered_by: "Henry Cavendish",
    }],
    {
      Table: {
        Columns: {
          Column: ["AtomicNumber", "Symbol", "AtomicWeight", "ElectronConfiguration", "StandardState"],
        },
        Row: [{
          Cell: ["1", "H", "1.0080", "1s1", "Gas"],
        }],
      },
    },
  );
  assert.deepEqual(
    [elements[0]?.atomicMass, elements[0]?.electronConfiguration],
    [1.008, "1s1"],
  );
});
