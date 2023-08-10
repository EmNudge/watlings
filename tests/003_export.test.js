import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports a main function", async () => {
  const log = () => void 0;

  const { instance } = await WebAssembly.instantiate(wasmBytes, { env: { log } });

  expect(instance.exports).toMatchObject({ main: expect.any(Function) });
});

test("doesn't call log until manually invoked", async () => {
  let called = false;
  const log = () => called = true;

  const { instance } = await WebAssembly.instantiate(wasmBytes, { env: { log } });

  expect(called).toBe(false);

  instance.exports.main();

  expect(called).toBe(true);
});
