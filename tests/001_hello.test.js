import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("calls log function", async () => {
  let called = false;

  const log = () => (called = true);
  await WebAssembly.instantiate(wasmBytes, { env: { log } });

  expect(called).toBe(true);
});

test("logs 42", async () => {
  let num;

  const log = (val) => (num = val);
  await WebAssembly.instantiate(wasmBytes, { env: { log } });

  expect(num).toBe(42);
});
