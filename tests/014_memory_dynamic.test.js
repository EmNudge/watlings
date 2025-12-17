import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  arrayEquals,
  test,
  setSuccess,
} from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 017");

test("exports initAndSize and memory", async () => {
  const exports = await instantiate(wasmBytes, {});

  assert(
    matchObjectShape(exports, {
      initAndSize: Function,
      memory: WebAssembly.Memory,
    }),
    "does not export all of: initAndSize and memory"
  );
});

test("initAndSize grows memory by 1 page", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { initAndSize, memory } = exports;

  const initialPages = memory.buffer.byteLength / 65536;
  initAndSize();
  const newPages = memory.buffer.byteLength / 65536;

  assert(newPages === initialPages + 1, `expected memory to grow by 1 page, got ${newPages - initialPages}`);
});

test("initAndSize fills first 10 bytes with 42", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { initAndSize, memory } = exports;

  initAndSize();
  const buffer = new Uint8Array(memory.buffer);
  const first10 = [...buffer.slice(0, 10)];
  const expected = Array(10).fill(42);

  assert(arrayEquals(first10, expected), `expected first 10 bytes to be 42, got ${first10}`);
});

test("initAndSize returns new memory size", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { initAndSize, memory } = exports;

  const result = initAndSize();
  const expectedPages = memory.buffer.byteLength / 65536;

  assert(result === expectedPages, `expected return value ${expectedPages}, got ${result}`);
});
