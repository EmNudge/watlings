import { expect, test } from "vitest";
import fs from "fs/promises";
import exp from "constants";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports doubleGlobal and incGlobal", async () => {
  const global_num = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { global_num },
  });

  expect(instance.exports).toMatchObject({
    incGlobal: expect.any(Function),
    doubleGlobal: expect.any(Function),
  });
});

test("doubleGlobal doubles input value", async () => {
  const global_num = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { global_num },
  });

  expect(instance.exports.doubleGlobal()).toEqual(0);
  global_num.value = 10;
  expect(instance.exports.doubleGlobal()).toEqual(20);
});

test("incGlobal increments a global each call", async () => {
  const global_num = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { global_num },
  });

  expect(instance.exports.incGlobal()).toEqual(1);
  expect(instance.exports.incGlobal()).toEqual(2);
});
