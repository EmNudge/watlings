import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  test,
} from "./utils/test-runner.mjs";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports doubleGlobal and incGlobal", async () => {
  const global_num = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
  const exports = await instantiate(wasmBytes, {
    env: { global_num },
  });

  assert(
    matchObjectShape(exports, {
      incGlobal: Function,
      doubleGlobal: Function,
    }),
    "does not export all of: incGlobal and doubleGlobal"
  );
});

test("doubleGlobal doubles input value", async () => {
  const global_num = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
  const exports = await instantiate(wasmBytes, {
    env: { global_num },
  });

  assert(exports.doubleGlobal() === 0, "global_num is not 0 on program start");
  global_num.value = 10;
  assert(exports.doubleGlobal() === 20, "global_num is doubling when calling doubleGlobal");
});

test("incGlobal increments a global each call", async () => {
  const global_num = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
  const exports = await instantiate(wasmBytes, {
    env: { global_num },
  });

  assert(exports.incGlobal() === 1, "incGlobal is not 1 on program start");
  assert(exports.incGlobal() === 2, "incGlobal is not incrementing when calling incGlobal");
});
