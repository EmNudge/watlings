import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test, setSuccess } from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Nice! You covered more MVP gaps.");

test("exports call0, call1, swap", async () => {
  const exports = await instantiate(wasmBytes, {
    env: {
      a: () => 1,
      b: () => 2,
    },
  });
  assert(
    matchObjectShape(exports, {
      call0: Function,
      call1: Function,
      swap: Function,
    }),
    "does not export all of: call0, call1, swap"
  );
});

test("table.set/table.get allow swapping table entries", async () => {
  const { call0, call1, swap } = await instantiate(wasmBytes, {
    env: {
      a: () => 1,
      b: () => 2,
    },
  });

  assert(call0() === 1, "call0 should return 1 initially");
  assert(call1() === 2, "call1 should return 2 initially");

  swap();

  assert(call0() === 2, "call0 should return 2 after swap");
  assert(call1() === 1, "call1 should return 1 after swap");
});


