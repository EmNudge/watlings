import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test, setSuccess, throws } from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 015_local_tee.wat");

test("exports ping and safeDiv", async () => {
  const exports = await instantiate(wasmBytes, {});
  assert(
    matchObjectShape(exports, {
      ping: Function,
      safeDiv: Function,
    }),
    "does not export all of: ping and safeDiv"
  );
});

test("ping returns 1", async () => {
  const { ping } = await instantiate(wasmBytes, {});
  assert(ping() === 1, "ping should return 1");
});

test("safeDiv divides and traps on divide-by-zero", async () => {
  const { safeDiv } = await instantiate(wasmBytes, {});
  assert(safeDiv(8, 2) === 4, "safeDiv(8, 2) should be 4");
  assert(throws(() => safeDiv(5, 0)), "safeDiv(5, 0) should trap");
});


