import fs from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { getWastParser } from './utils/getWastParser.mjs'

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
  const regex = new RegExp(fileNameFilter ?? '', 'i');
  
  return changedFiles.filter(fileName => {
    if (fileNameFilter && !regex.test(fileName)) return false;
    return fileName.endsWith('.wat');
  });
}

async function main() {
  const fileNames = await getFileNames();
  
  if (!fileNames.length) {
    console.log('no changes detected.');
    return;
  }

  const parseWast = await getWastParser();

  const cachePath = new URL('./.cache/cache.txt', import.meta.url);
  const cacheFileHandle = await fs.open(cachePath, 'a')

  let successCount = 0;
  await Promise.all(fileNames.map(async file => {
    try {
      const jsFilePath = new URL('./exercises/' + file.replace(/\.[^.]+$/, '.mjs'), import.meta.url);
      await fs.access(jsFilePath);
      console.log(`${file} has associated JS file`);
      return;
    } catch {}
    
    const filePath = new URL('./exercises/' + file, import.meta.url);
    
    try {
      await parseWast(filePath.pathname);

      // add WAT hash
      const fileBytes = await fs.readFile(filePath);
      const hash = await getSha1Hash(fileBytes);
      cacheFileHandle.write(`${file}:${hash}\n`);
      successCount++;
    } catch (e) {
      console.error(`Error at ${filePath}:`, e);
      process.exit(1);
    }
  }));

  await cacheFileHandle.close();

  console.log(`compiled ${successCount} files`);
}

main();