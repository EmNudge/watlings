import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  setSuccess,
  test,
} from "./utils/test-runner.mjs";
import { getWasm } from "./utils/getWasm.mjs";

const wasmBytes = await getWasm(import.meta.url);

setSuccess("Congrats! Continue onto 010_memory.wat");

test("exports logData, mem", async () => {
  const exports = await instantiate(wasmBytes, {
    env: { log_string: () => void 0 },
  });

  assert(
    matchObjectShape(exports, {
      logData: Function,
      mem: WebAssembly.Memory,
    }),
    "does not export all of: logData and mem"
  );
});

test("logData logs 3 strings", async () => {
  const loggedStrings = [];
  const exports = await instantiate(wasmBytes, {
    env: {
      log_string: (start, length) => {
        const dataView = new Uint8Array(mem.buffer);
        const byteSlice = dataView.slice(start, start + length);
        loggedStrings.push(new TextDecoder().decode(byteSlice));
      },
    },
  });

  const { mem, logData } = exports;
  logData();
  assert(loggedStrings.length >= 3, "logData did not log 3 strings");
});

test("logData logs 3 different string(s)", async () => {
  const loggedStrings = [];
  const exports = await instantiate(wasmBytes, {
    env: {
      log_string: (start, length) => {
        const dataView = new Uint8Array(mem.buffer);
        const byteSlice = dataView.slice(start, start + length);
        loggedStrings.push(new TextDecoder().decode(byteSlice));
      },
    },
  });

  const { mem, logData } = exports;
  logData();

  assert(
    new Set(loggedStrings).size >= 3,
    "logData logged the same string 3 times"
  );
});
