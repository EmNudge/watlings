import { readdir, readFile, writeFile } from 'fs/promises';
import { basename, extname, } from 'path';
import { parsePatch, patch } from './utils/patch.mjs';
import { fileURLToPath } from 'node:url';

// Strip path and extension from argument
const targetFileName = basename(process.argv[2], extname(process.argv[2]));

const folderFiles = await readdir(fileURLToPath(new URL('../exercises', import.meta.url)));
const sourceFileNameWithExt = folderFiles.find(fileName => {
  return fileName.includes(targetFileName) && fileName.endsWith('.wat');
});

if (!sourceFileNameWithExt) {
  console.log(`No file matching ${targetFileName} found in the exercises folder.`);
  process.exit(1);
}

const nameBase = basename(sourceFileNameWithExt, '.wat');

const patchFilePath = fileURLToPath(new URL(`../patch/${nameBase}.patch`, import.meta.url));
const patchFile = await readFile(patchFilePath, 'utf-8').catch(() => {
  console.error(`No patch file found under patch/${nameBase}.patch`);
  process.exit(1);
});


try {
  const lines = parsePatch(patchFile).map(({ addLines, start }) => `on line ${start}:\n${addLines.join('\n')}`).join('\n\n');
  
  console.log(`Try adding this to file ${sourceFileNameWithExt}:\n ${lines}`);
} catch (e) {
  console.error(`Error fetching solution: ${e.message}`);
}