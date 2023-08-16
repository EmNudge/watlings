import Wabt from 'wabt';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import { exec, spawn } from 'node:child_process';

/**
 * @returns {Promise<(filePath: string | URL) => Promise<undefined>>}
 */
export async function getWastParser() {
  try {
    // check if program exists
    await promisify(exec)('wat2wasm --version');

    return async (filePath) => {
      const path = new URL(filePath, import.meta.url).pathname;
      const fileName = path.match(/\/([^\/]+)\.wat$/)[1];
      const wasmPath = new URL(`../.cache/${fileName}.wasm`, import.meta.url).pathname;

      return new Promise((res, rej) => {
        spawn('wat2wasm', [path, '-o', wasmPath], { stdio:'inherit' })
          .on('close', (err) => {
            if (err !== 1) {
              res();
            } else {
              rej(err);
            }
          });
      });
    }
  } catch {
    const wabt = await Wabt();

    return async (filePath) => {
      const path = new URL(filePath).pathname;
      const fileName = path.match(/\/([^\/]+)\.wat$/)[1];
      const wasmPath = new URL(`../.cache/${fileName}.wasm`, import.meta.url);

      const fileBytes = await fs.readFile(path);

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
}
