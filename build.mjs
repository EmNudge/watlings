import Wabt from 'wabt';
import fs from 'node:fs/promises';
import { webcrypto } from 'node:crypto';

/**
 * Get SHA-1 hash of file - used for detecting updates
 * 
 * @param {ArrayBuffer} buffer file buffer
 * @returns {Promise<string>}
 */
const getSha1Hash = async (buffer) => {
  const byteHash = await webcrypto.subtle.digest('SHA-1', buffer);

  const hash = Array.from(new Uint8Array(byteHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hash;
}

/**
 * Get list of files that have since been updated since last run
 * Also return files that do not have a corresponding build
 * 
 * @param {string[]} files file names
 * @returns {Promise<string[]>}
 */
async function getChangedFiles(files) {
  const cachePath = new URL('./.cache/cache.txt', import.meta.url);
  let contents = new Map();

  try {
    await fs.access('.cache');
  } catch {
    await fs.mkdir('.cache');
  }

  try {
    const bytes = await fs.readFile(cachePath);
    const fileText = new TextDecoder('utf-8').decode(bytes);
    contents = new Map(fileText.split('\n').map(line => line.split(':')))
  } catch {}

  const filePromises = files.map(async name => {
    const path = new URL(`./exercises/${name}`, import.meta.url);
    const bytes = await fs.readFile(path);

    return [name, await getSha1Hash(bytes)];
  });

  const fileHashes = await Promise.all(filePromises);

  const changedFiled = fileHashes
    .filter(([name, hash]) => contents.get(name) !== hash)
    .map(([name]) => name);
  
  return changedFiled;
}

async function getFileNames() {
  const fileNames = await fs.readdir('exercises');
  const changedFiles = await getChangedFiles(fileNames);

  const fileNameFilter = process.argv[2];
  
  if (fileNameFilter) {
    const regex = new RegExp(fileNameFilter, 'i');
    return changedFiles.filter(fileName => regex.test(fileName));
  }
  return changedFiles;
}

async function main() {
  const fileNames = await getFileNames();
  
  if (!fileNames.length) {
    console.log('no changes detected.');
    return;
  }

  const wabt = await Wabt();

  const cachePath = new URL('./.cache/cache.txt', import.meta.url);
  const cacheFileHandle = await fs.open(cachePath, 'a')

  await Promise.all(fileNames.map(async file => {
    const filePath = new URL('./exercises/' + file, import.meta.url);
    const fileBytes = await fs.readFile(filePath);

    try {
      const wasmFile = wabt.parseWat('inline', fileBytes, {
        mutable_globals: true,
        sat_float_to_int: true,
        sign_extension: true,
        bulk_memory: true,
      });

      const compiledName = file.replace(/\.[^.]+?$/, '.wasm');
      const wasmPath = new URL('./.cache/' + compiledName, import.meta.url);
      const { buffer } = wasmFile.toBinary({ write_debug_names: true });
      
      await fs.writeFile(wasmPath, buffer);

      // add WAT hash
      const hash = await getSha1Hash(fileBytes);
      cacheFileHandle.write(`${file}:${hash}\n`);
    } catch (e) {
      console.error('Error at ' + filePath);
      console.log(e);
    }
  }));

  await cacheFileHandle.close();

  console.log(`compiled ${fileNames.length} files`);
}

main();