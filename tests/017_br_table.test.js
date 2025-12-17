import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test, setSuccess } from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 018_table_ops.wat");

test("exports pick", async () => {
  const exports = await instantiate(wasmBytes, {});
  assert(
    matchObjectShape(exports, {
      pick: Function,
    }),
    "does not export pick"
  );
});

test("pick uses br_table style selection", async () => {
  const { pick } = await instantiate(wasmBytes, {});
  assert(pick(0) === 10, "pick(0) should be 10");
  assert(pick(1) === 20, "pick(1) should be 20");
  assert(pick(2) === 30, "pick(2) should be 30");
  assert(pick(3) === 99, "pick(3) should be 99");
  assert(pick(42) === 99, "pick(42) should be 99");
});


