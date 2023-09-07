import Wabt from 'wabt';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { basename } from 'path';

/** @typedef {Promise<(filePath: string) => Promise<undefined>>} WastParser */

/** @param {string} command  @param {readonly string[]} args */
const spawnPromise = (command, args) => {
  const s = spawn(command, args, { stdio:'inherit' });
  return new Promise((res, rej) => {
    s.on('close', (err) => {
      if (err !== 1) {
        res();
      } else {
        rej(err);
      }
    });
    s.on('error', err => {
      rej(err);
    });
  });
}


/** @returns {WastParser} */
async function getWat2WasmParser() {
  return async (filePath) => {
    const fileName = basename(filePath, '.wat');
    const wasmPath = fileURLToPath(new URL(`../../.cache/${fileName}.wasm`, import.meta.url));

    await spawnPromise('wat2wasm', [filePath, '-o', wasmPath]);
  }
}

/** @returns {WastParser} */
async function getWabtParser() {
  const wabt = await Wabt();

  return async (filePath) => {
    const fileName = basename(filePath, '.wat');
    const wasmPath = fileURLToPath(new URL(`../../.cache/${fileName}.wasm`, import.meta.url));

    const fileBytes = await fs.readFile(filePath);

    const wasmFile = wabt.parseWat('inline', fileBytes, {
      mutable_globals: true,
      sat_float_to_int: true,
      sign_extension: true,
      bulk_memory: true,
    });

    const { buffer } = wasmFile.toBinary({ write_debug_names: true });
    
    await fs.writeFile(wasmPath, buffer);
  }
}

export async function getWastParser() {
  try {
    // check for wat2wasm CLI
    // Using exec on Windows returns a made up version number
    await spawnPromise('wat2wasm', ['--version']);
    
    return getWat2WasmParser();
  } catch {
    return getWabtParser();
  }
}
