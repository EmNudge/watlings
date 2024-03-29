import { getWasm } from "./utils/getWasm.mjs";
import { assert, test, setSuccess } from "./utils/test-runner.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 002_ordering.wat");

test("calls log function", async () => {
  let called = false;

  const log = () => (called = true);
  await WebAssembly.instantiate(wasmBytes, { env: { log } });

  assert(called, "log was not called");
});

test("logs 42", async () => {
  let num;

  const log = (val) => (num = val);
  await WebAssembly.instantiate(wasmBytes, { env: { log } });

  assert(num === 42, "num is not 42");
});
