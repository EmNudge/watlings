import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  setSuccess,
  test,
} from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! You've finished the course!");

test("exports callFunc", async () => {
  const exports = await instantiate(wasmBytes, {
    env: {
      func1: () => void 0,
      func2: () => void 0,
      func3: () => void 0,
      func4: () => void 0,
    },
  });

  assert(
    matchObjectShape(exports, {
      callFunc: Function,
    }),
    "does not export a callFunc function"
  );
});

test("callFunc calls the right function index", async () => {
  const exports = await instantiate(wasmBytes, {
    env: {
      func1: () => 1,
      func2: () => 2,
      func3: () => 3,
      func4: () => 4,
    },
  });

  const { callFunc } = exports;

  assert(callFunc(0) === 1, "callFunc is not calling func1");
  assert(callFunc(1) === 2, "callFunc is not calling func2");
  assert(callFunc(2) === 3, "callFunc is not calling func3");
  assert(callFunc(3) === 4, "callFunc is not calling func4");
});
