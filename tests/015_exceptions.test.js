import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  test,
  setSuccess,
} from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 018");

test("exports safeDiv", async () => {
  const exports = await instantiate(wasmBytes, {});

  assert(
    matchObjectShape(exports, {
      safeDiv: Function,
    }),
    "does not export safeDiv"
  );
});

test("safeDiv returns a/b for non-zero divisor", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { safeDiv } = exports;

  assert(safeDiv(10, 2) === 5, `expected 10/2 = 5, got ${safeDiv(10, 2)}`);
  assert(safeDiv(100, 10) === 10, `expected 100/10 = 10, got ${safeDiv(100, 10)}`);
  assert(safeDiv(7, 2) === 3, `expected 7/2 = 3 (integer div), got ${safeDiv(7, 2)}`);
  assert(safeDiv(0, 5) === 0, `expected 0/5 = 0, got ${safeDiv(0, 5)}`);
});

test("safeDiv returns 400 when dividing by zero", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { safeDiv } = exports;

  // Helper to call safeDiv and catch runtime traps
  function trySafeDiv(a, b) {
    try {
      return { value: safeDiv(a, b), trapped: false };
    } catch (e) {
      return { value: null, trapped: true, error: e.message };
    }
  }

  const test1 = trySafeDiv(10, 0);
  assert(
    !test1.trapped && test1.value === 400,
    test1.trapped
      ? `safeDiv(10, 0) caused a runtime trap: "${test1.error}". Use try_table with catch to handle the error and return 400 instead.`
      : `expected error code 400 for division by zero, got ${test1.value}`
  );

  const test2 = trySafeDiv(0, 0);
  assert(
    !test2.trapped && test2.value === 400,
    test2.trapped
      ? `safeDiv(0, 0) caused a runtime trap: "${test2.error}". Use try_table with catch to handle the error and return 400 instead.`
      : `expected error code 400 for 0/0, got ${test2.value}`
  );

  const test3 = trySafeDiv(-5, 0);
  assert(
    !test3.trapped && test3.value === 400,
    test3.trapped
      ? `safeDiv(-5, 0) caused a runtime trap: "${test3.error}". Use try_table with catch to handle the error and return 400 instead.`
      : `expected error code 400 for -5/0, got ${test3.value}`
  );
});
