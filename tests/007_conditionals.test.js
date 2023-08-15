import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports isEven and getNum", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);

  expect(instance.exports).toMatchObject({
    isEven: expect.any(Function),
    getNum: expect.any(Function),
  });
});

test("isEven works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);

  const { isEven } = instance.exports;
  expect(isEven(42)).toBe(1);
  expect(isEven(43)).toBe(0);
});

test("getNum works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);

  const { getNum } = instance.exports;
  expect(getNum(42)).toBe(42);
  expect(getNum(43)).toBe(100);
});
