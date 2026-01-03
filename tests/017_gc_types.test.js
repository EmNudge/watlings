import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  test,
  setSuccess,
} from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! You've completed the GC types lesson!");

test("exports makePoint, getX, and getY", async () => {
  const exports = await instantiate(wasmBytes, {});

  assert(
    matchObjectShape(exports, {
      makePoint: Function,
      getX: Function,
      getY: Function,
    }),
    "does not export all of: makePoint, getX, and getY"
  );
});

test("makePoint creates a point struct", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { makePoint } = exports;

  const point = makePoint(10, 20);
  assert(point !== null && point !== undefined, "makePoint should return a struct reference");
});

test("getX extracts the x field from a point", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { makePoint, getX } = exports;

  // Use distinct values to catch x/y swapping bugs
  const point1 = makePoint(42, 100);
  assert(getX(point1) === 42, `expected getX to return 42 (the x value), got ${getX(point1)} (the y value). Check: struct.new should receive x then y; struct.get should use $x field.`);

  const point2 = makePoint(-5, 77);
  assert(getX(point2) === -5, `expected getX to return -5 (the x value), got ${getX(point2)} (the y value)`);

  const point3 = makePoint(0, 999);
  assert(getX(point3) === 0, `expected getX to return 0 (the x value), got ${getX(point3)} (the y value)`);
});

test("getY extracts the y field from a point", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { makePoint, getY } = exports;

  // Use distinct values to catch x/y swapping bugs
  const point1 = makePoint(42, 100);
  assert(getY(point1) === 100, `expected getY to return 100 (the y value), got ${getY(point1)} (the x value). Check: struct.new should receive x then y; struct.get should use $y field.`);

  const point2 = makePoint(-5, 77);
  assert(getY(point2) === 77, `expected getY to return 77 (the y value), got ${getY(point2)} (the x value)`);

  const point3 = makePoint(999, 0);
  assert(getY(point3) === 0, `expected getY to return 0 (the y value), got ${getY(point3)} (the x value)`);
});
