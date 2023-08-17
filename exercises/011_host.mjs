/**
 * We'll need to start talking more about the host environment.
 *
 * wat/wast files cannot be directly executed. We're using a parser (wat2wasm) to get the WASM.
 * Then we read the file into memory as a Buffer and pass it to WebAssembly.instantiate()
 *
 * There is nothing
 *
 */
import fs from "fs/promises";
import { getWastParser } from "../utils/getWastParser.mjs";

// parse WAT file to WASM and read it as Buffer
const wasmBytes = await getWastParser()
  .then((parseWast) => parseWast(import.meta.url.replace("mjs", "wat")))
  .then(() => fs.readFile("./.cache/011_host.wasm"));

// The configuration object also allows has "maximum" and "shared"
// https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory
const memory = new WebAssembly.Memory({ initial: 1 });
const imports = {
  env: {
    memory,
    log: console.log,
  },
};

const wasmModule = await WebAssembly.instantiate(wasmBytes, imports);

// pull out wasm exports
const { squareNum, logSomeNumbers, editMemory } = wasmModule.instance.exports;

const squareOf5 = squareNum(5);
console.log({ squareOf5 }); // { squareOf5: 25 }

logSomeNumbers(); // 1, 42, 88

// Edit a JS dataview into shared memory
const dataView = new Uint8Array(memory.buffer);
for (let i = 0; i < 20; i++) dataView[i] = i;

console.log(dataView.slice(0, 20).join(" "));
editMemory(0, 20);
console.log(dataView.slice(0, 20).join(" "));
editMemory(0, 20);
console.log(dataView.slice(0, 20).join(" "));
