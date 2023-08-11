import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports doubleInt and doubleGlobal", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);

  expect(instance.exports).toMatchObject({
    doubleInt: expect.any(Function),
    doubleFloat: expect.any(Function),
  });
});

test("doubleInt works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);
  const { doubleInt } = instance.exports;
  expect(doubleInt(10)).toBe(20);
});

test("doubleFloat works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);
  const { doubleFloat } = instance.exports;
  expect(doubleFloat(10.5)).toBe(21);
});