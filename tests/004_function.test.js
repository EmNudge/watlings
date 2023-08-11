import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports add, sub, and mul", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);

  expect(instance.exports).toMatchObject({
    add: expect.any(Function),
    sub: expect.any(Function),
    mul: expect.any(Function),
  });
});

test("add works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);
  const { add } = instance.exports;

  expect(add(1, 2)).toBe(3);
  expect(add(1201033, 31002)).toBe(1232035);
});

test("sub works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);
  const { sub } = instance.exports;

  expect(sub(3, 1)).toBe(2);
  expect(sub(999, 333)).toBe(666);
});

test("mul works", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes);
  const { mul } = instance.exports;

  expect(mul(3, 2)).toBe(6);
  expect(mul(1234, 4321)).toBe(5332114);
});
