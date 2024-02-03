import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, setSuccess, test } from "./utils/test-runner.mjs";
import { getWasm } from './utils/getWasm.mjs';

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 007_conditionals.wat");

test("exports doubleInt and doubleGlobal", async () => {
  const exports = await instantiate(wasmBytes);
  assert(
    matchObjectShape(exports, {
      doubleInt: Function,
      doubleFloat: Function,
    }),
    "does not export all of: doubleInt and doubleFloat"
  );
});

test("doubleInt works", async () => {
  const exports = await instantiate(wasmBytes);
  const { doubleInt } = exports;
  assert(doubleInt(10) === 20, "doubleInt is not doubling");
});

test("doubleFloat works", async () => {
  const exports = await instantiate(wasmBytes);
  const { doubleFloat } = exports;
  assert(doubleFloat(10.5) === 21, "doubleFloat is not doubling");
});
