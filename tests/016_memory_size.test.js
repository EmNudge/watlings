import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test, setSuccess } from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 017_br_table.wat");

test("exports getPages and growBy", async () => {
  const exports = await instantiate(wasmBytes, {});
  assert(
    matchObjectShape(exports, {
      getPages: Function,
      growBy: Function,
    }),
    "does not export all of: getPages and growBy"
  );
});

test("memory.size and memory.grow behavior", async () => {
  const { getPages, growBy } = await instantiate(wasmBytes, {});
  assert(getPages() === 1, "initial pages should be 1");

  const prev = growBy(2);
  assert(prev === 1, "growBy(2) should return previous size (1)");
  assert(getPages() === 3, "pages should now be 3 after growth");
});


