import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test } from "./utils/test-runner.mjs";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

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
