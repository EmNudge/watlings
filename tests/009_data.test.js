import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports logData, mem", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: { log_string: () => void 0 },
  });

  expect(instance.exports).toMatchObject({
    logData: expect.any(Function),
    mem: expect.any(WebAssembly.Memory),
  });
});

test("logData logs 3 strings", async () => {
  const loggedStrings = [];
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      log_string: (start, length) => {
        const dataView = new Uint8Array(mem.buffer);
        const byteSlice = dataView.slice(start, start + length);
        loggedStrings.push(new TextDecoder().decode(byteSlice, "utf-8"));
      },
    },
  });

  const { mem, logData } = instance.exports;
  logData();
  expect(loggedStrings.length).toBeGreaterThanOrEqual(3);
});

test("logData logs 3 different string(s)", async () => {
  const loggedStrings = [];
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      log_string: (start, length) => {
        const dataView = new Uint8Array(mem.buffer);
        const byteSlice = dataView.slice(start, start + length);
        loggedStrings.push(new TextDecoder().decode(byteSlice, "utf-8"));
      },
    },
  });

  const { mem, logData } = instance.exports;
  logData();
  
  expect(new Set(loggedStrings).size).greaterThanOrEqual(3);
});
