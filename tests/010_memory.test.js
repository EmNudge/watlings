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

setSuccess("Congrats! Continue onto 011_host.wat");

test("exports incrementData, doubleData", async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  const exports = await instantiate(wasmBytes, {
    env: { mem: memory },
  });

  assert(
    matchObjectShape(exports, {
      incrementData: Function,
      doubleData: Function,
    }),
    "does not export all of: incrementData and doubleData"
  );
});

test("incrementData increments all numbers in range by 1", async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const buffer = new Uint8Array(memory.buffer);

  const exports = await instantiate(wasmBytes, {
    env: { mem: memory },
  });

  const { incrementData } = exports;

  incrementData(0, 20);
  assert(arrayEquals([...buffer.slice(0, 20)], Array(20).fill(1)), "");

  incrementData(0, 20);
  assert(arrayEquals([...buffer.slice(0, 20)], Array(20).fill(2)), "");

  incrementData(0, 20);
  assert(arrayEquals([...buffer.slice(0, 21)], [...Array(20).fill(3), 0]), "");
});

test("doubleData doubles all numbers in range", async () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const buffer = new Uint8Array(memory.buffer);

  const exports = await instantiate(wasmBytes, {
    env: { mem: memory },
  });

  const { doubleData } = exports;

  doubleData(0, 20);
  assert(arrayEquals([...buffer.slice(0, 20)], Array(20).fill(0)), "");

  for (let i = 0; i < 20; i++) buffer[i] = 4;
  doubleData(0, 20);
  assert(arrayEquals([...buffer.slice(0, 20)], Array(20).fill(8)), "");
});
