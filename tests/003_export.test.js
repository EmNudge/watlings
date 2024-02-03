import {
  assert,
  matchObjectShape,
  test,
} from "./utils/test-runner.mjs";
import { instantiate } from "./utils/instantiate.mjs";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports a main function", async () => {
  const log = () => void 0;

  const exports = await instantiate(wasmBytes, {
    env: { log },
  });

  assert(
    matchObjectShape(exports, { main: Function }),
    "does not export a main function"
  );
});

test("doesn't call log until manually invoked", async () => {
  let called = false;
  const log = () => (called = true);

  const exports = await instantiate(wasmBytes, {
    env: { log },
  });

  assert(called == false, "log was called before main was invoked");

  exports.main();

  assert(called, "log was not called");
});

test("main function still logs 42", async () => {
  let output;
  const log = (num) => (output = num);

  const exports = await instantiate(wasmBytes, {
    env: { log },
  });

  exports.main();

  assert(output === 42, "output is not 42");
});
