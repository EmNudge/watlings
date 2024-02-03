import { instantiate } from "./utils/instantiate.mjs";
import { assert, matchObjectShape, test } from "./utils/test-runner.mjs";
import { getWasm } from './utils/getWasm.mjs';

const wasmBytes = await getWasm(import.meta.url);

test("exports main", async () => {
  const exports = await instantiate(wasmBytes, {
    env: {
      globalExternRef: new WebAssembly.Global(
        { value: "externref" },
        { value: 42 }
      ),
      sendFuncRef: () => void 0,
      sendExternRef: () => void 0,
    },
  });

  assert(
    matchObjectShape(exports, {
      main: Function,
    }),
    "does not export a main function"
  );
});

test("calls sendExternRef with an extern ref", async () => {
  let output;
  const exports = await instantiate(wasmBytes, {
    env: {
      globalExternRef: new WebAssembly.Global(
        { value: "externref" },
        { value: 42 }
      ),
      sendExternRef: (value) => void (output = value),
      sendFuncRef: () => void 0,
    },
  });

  const { main } = exports;
  main();

  assert(output !== undefined, "output is undefined");
});

test("calls sendFuncRef with a func ref", async () => {
  /** @type {any} */
  let output;
  const exports = await instantiate(wasmBytes, {
    env: {
      globalExternRef: new WebAssembly.Global(
        { value: "externref" },
        { value: 42 }
      ),
      sendFuncRef: (value) => void (output = value),
      sendExternRef: () => void 0,
    },
  });

  const { main } = exports;
  main();

  assert(output !== undefined, "output is undefined");
  assert(
    output instanceof Function || (output === null) === true,
    "output is not a function or null"
  );
});
