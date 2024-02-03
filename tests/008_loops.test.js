import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  arrayEquals,
  test,
} from "./utils/test-runner.mjs";
import { getWasm } from './utils/getWasm.mjs';

const wasmBytes = await getWasm(import.meta.url);

test("exports countDown, countUntil, and countEvenUntil", async () => {
  const exports = await instantiate(wasmBytes, {
    env: { log: () => void 0 },
  });

  assert(
    matchObjectShape(exports, {
      countDown: Function,
      countUntil: Function,
      countEvenUntil: Function,
    }),
    "does not export all of: countDown, countUntil, and countEvenUntil"
  );
});

test("countDown counts down", async () => {
  const logOutput = [];
  const exports = await instantiate(wasmBytes, {
    env: { log: (num) => logOutput.push(num) },
  });
  const { countDown } = exports;
  countDown(10);
  assert(
    arrayEquals(logOutput, [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]),
    "We are not counting down with countDown"
  );
});

test("countUntil counts until a number", async () => {
  const logOutput = [];
  const exports = await instantiate(wasmBytes, {
    env: { log: (num) => logOutput.push(num) },
  });
  const { countUntil } = exports;
  countUntil(10);
  assert(
    arrayEquals(logOutput, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    "We are not counting up until 10 with countUntil"
  );
});

test("countEvenUntil counts all even digits until a number", async () => {
  const logOutput = [];
  const exports = await instantiate(wasmBytes, {
    env: { log: (num) => logOutput.push(num) },
  });
  const { countEvenUntil } = exports;
  countEvenUntil(10);
  assert(
    arrayEquals(logOutput, [0, 2, 4, 6, 8]),
    "We are not counting up until 10) with countEvenUntil"
  );
});
