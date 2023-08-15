import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports countDown, countUntil, and countEvenUntil", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { log: () => void 0 },
  });

  expect(instance.exports).toMatchObject({
    countDown: expect.any(Function),
    countUntil: expect.any(Function),
    countEvenUntil: expect.any(Function),
  });
});

test("countDown counts down", async () => {
  const logOutput = [];
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { log: (num) => logOutput.push(num) },
  });
  const { countDown } = instance.exports;
  countDown(10);
  expect(logOutput).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
});

test("countUntil counts until a number", async () => {
  const logOutput = [];
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { log: (num) => logOutput.push(num) },
  });
  const { countUntil } = instance.exports;
  countUntil(10);
  expect(logOutput).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
});

test("countEvenUntil counts all even digits until a number", async () => {
  const logOutput = [];
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { log: (num) => logOutput.push(num) },
  });
  const { countEvenUntil } = instance.exports;
  countEvenUntil(10);
  expect(logOutput).toEqual([0, 2, 4, 6, 8])
});
