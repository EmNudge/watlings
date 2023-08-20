import { expect, test } from "vitest";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports main", async () => {
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      globalExternRef: new WebAssembly.Global({ value: 'externref' }, { value: 42 }), 
      sendFuncRef: () => void 0,
      sendExternRef: () => void 0,
    }
  });

  expect(instance.exports).toMatchObject({
    main: expect.any(Function),
  });
});

test("calls sendExternRef with an extern ref", async () => {
  let output;
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      globalExternRef: new WebAssembly.Global({ value: 'externref' }, { value: 42 }), 
      sendExternRef: (value) => void (output = value),
      sendFuncRef: () => void 0,
    }
  });

  const { main } = instance.exports; 
  main();
  
  expect(output).not.toBe(undefined);
});

test("calls sendFuncRef with a func ref", async () => {
  let output;
  const { instance } = await WebAssembly.instantiate(wasmBytes, {
    env: {
      globalExternRef: new WebAssembly.Global({ value: 'externref' }, { value: 42 }), 
      sendFuncRef: (value) => void (output = value),
      sendExternRef: () => void 0,
    }
  });

  const { main } = instance.exports; 
  main();

  expect(output).not.toBe(undefined);
  expect(output instanceof Function || output === null).toBe(true);
});
