import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { basename } from "path";

/** @typedef {Promise<(filePath: string) => Promise<undefined>>} WastParser */

/** @param {string} command  @param {readonly string[]} args */
const spawnPromise = (command, args) => {
  const s = spawn(command, args, { stdio: "inherit" });
  return new Promise((res, rej) => {
    s.on("close", (err) => {
      if (err !== 1) {
        res();
      } else {
        rej(err);
      }
    });
    s.on("error", (err) => {
      rej(err);
    });
  });
};

/** @returns {WastParser} */
async function getWasmToolsParser() {
  return async (filePath) => {
    const fileName = basename(filePath, ".wat");
    const wasmPath = fileURLToPath(
      new URL(`../../.cache/${fileName}.wasm`, import.meta.url)
    );

    // Use wasm-tools CLI to parse WAT into a WASM binary
    await spawnPromise("wasm-tools", ["parse", filePath, "-o", wasmPath]);
  };
}

export async function getWastParser() {
  try {
    // Check for wasm-tools CLI availability
    await spawnPromise("wasm-tools", ["--version"]);

    return getWasmToolsParser();
  } catch {
    console.error(
      "wasm-tools CLI not found. Please install it from: https://github.com/bytecodealliance/wasm-tools"
    );
    process.exit(1);
  }
}
