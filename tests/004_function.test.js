import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  setSuccess,
  test,
} from "./utils/test-runner.mjs";
import { getWasm } from './utils/getWasm.mjs';

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 005_variables.wat");

test("exports add, sub, and mul", async () => {
const exports = await instantiate(wasmBytes)
  assert(
    matchObjectShape(exports, {
      add: Function,
      sub: Function,
      mul: Function,
    }),
    "does not export all of: add, sub, and mul"
  );
});

test("add works", async () => {
const exports = await instantiate(wasmBytes)
const { add } = exports;

  assert(add(1, 2) === 3, "add(1, 2) is not 3");
  assert(add(1201033, 31002) === 1232035, "add(1201033, 31002) is not 1232035");
});

test("sub works", async () => {
const exports = await instantiate(wasmBytes)
const { sub } = exports;

  assert(sub(3, 1) === 2, "sub(3, 1) is not 2");
  assert(sub(999, 333) === 666, "sub(999, 333) is not 666");
});

test("mul works", async () => {
const exports = await instantiate(wasmBytes)
const { mul } = exports;

  assert(mul(3, 2) === 6, "mul(3, 2) is not 6");
  assert(mul(1234, 4321) === 5332114, "mul(1234, 4321) is not 5332114");
});
