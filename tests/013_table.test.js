import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports callFunc", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      func1: () => void 0,
      func2: () => void 0,
      func3: () => void 0,
      func4: () => void 0,
    }
  });

  expect(instance.exports).toMatchObject({
    callFunc: expect.any(Function),
  });
});

test("callFunc calls the right function index", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      func1: () => 1,
      func2: () => 2,
      func3: () => 3,
      func4: () => 4,
    }
  });

  const { callFunc } = instance.exports; 
  
  expect(callFunc(0)).toBe(1);
  expect(callFunc(1)).toBe(2);
  expect(callFunc(2)).toBe(3);
  expect(callFunc(3)).toBe(4);
});
