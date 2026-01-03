import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  test,
  setSuccess,
} from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 019");

test("exports sumLanes and memory", async () => {
  const exports = await instantiate(wasmBytes, {});

  assert(
    matchObjectShape(exports, {
      sumLanes: Function,
      memory: WebAssembly.Memory,
    }),
    "does not export sumLanes and memory"
  );
});

test("sumLanes adds all 4 lanes together", async () => {
  const exports = await instantiate(wasmBytes, {});
  const { sumLanes, memory } = exports;

  // Helper to write 4 i32s to memory at offset 0
  function setLanes(a, b, c, d) {
    const view = new Int32Array(memory.buffer, 0, 4);
    view[0] = a;
    view[1] = b;
    view[2] = c;
    view[3] = d;
  }

  setLanes(1, 2, 3, 4);
  assert(sumLanes() === 10, `expected 1+2+3+4 = 10, got ${sumLanes()}`);

  setLanes(10, 20, 30, 40);
  assert(sumLanes() === 100, `expected 10+20+30+40 = 100, got ${sumLanes()}`);

  setLanes(0, 0, 0, 0);
  assert(sumLanes() === 0, `expected 0+0+0+0 = 0, got ${sumLanes()}`);

  setLanes(1, -1, 1, -1);
  assert(sumLanes() === 0, `expected 1+(-1)+1+(-1) = 0, got ${sumLanes()}`);

  setLanes(100, 200, 300, 400);
  assert(sumLanes() === 1000, `expected sum = 1000, got ${sumLanes()}`);
});
