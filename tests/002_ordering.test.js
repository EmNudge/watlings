import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("calls log function with numbers", async () => {
  const nums = [];

  const log = (...args) => nums.push(...args);
  await WebAssembly.instantiate(wasmBytes, { env: { log } });

  expect(nums.length).toBeTruthy();
});

test("calls log with the correct ordering", async () => {
  const nums = [];

  const log = (...args) => nums.push(...args);
  await WebAssembly.instantiate(wasmBytes, { env: { log } });

  expect(nums).toEqual([1, 2, 3]);
});
