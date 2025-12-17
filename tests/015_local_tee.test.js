import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test, setSuccess } from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 016_memory_size.wat");

test("exports incTwice", async () => {
  const exports = await instantiate(wasmBytes, {});
  assert(
    matchObjectShape(exports, {
      incTwice: Function,
    }),
    "does not export incTwice"
  );
});

test("incTwice computes (n+1) + (n+1)", async () => {
  const { incTwice } = await instantiate(wasmBytes, {});
  assert(incTwice(0) === 2, "incTwice(0) should be 2");
  assert(incTwice(10) === 22, "incTwice(10) should be 22");
  assert(incTwice(41) === 84, "incTwice(41) should be 84");
});


