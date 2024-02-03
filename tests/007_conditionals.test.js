import { instantiate } from "./utils/instantiate.mjs";
import {
  assert,
  matchObjectShape,
  test,
} from "./utils/test-runner.mjs";
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("exports isEven and getNum", async () => {
const exports = await instantiate(wasmBytes)
  assert(
    matchObjectShape(exports, {
      isEven: Function,
      getNum: Function,
    }),
    "does not export all of: isEven and getNum"
  );
});

test("isEven works", async () => {
const exports = await instantiate(wasmBytes)
  const { isEven } = exports;
  assert(isEven(42) === 1, "isEven is not returning 1");;
  assert(isEven(43) === 0, "isEven is not returning 0");;
});

test("getNum works", async () => {
const exports = await instantiate(wasmBytes)
  const { getNum } = exports;
  assert(getNum(42) === 42, "getNum is not returning 42");;;
  assert(getNum(43) === 100, "getNum is not returning 100");;;;
});
