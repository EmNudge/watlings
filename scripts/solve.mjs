import { readdir, readFile, writeFile } from 'fs/promises';
import { basename, extname, } from 'path';
import { patch } from './utils/patch.mjs';

// Strip path and extension from argument
const targetFileName = basename(process.argv[2], extname(process.argv[2]));

const folderFiles = await readdir(new URL('../exercises', import.meta.url));
const sourceFileNameWithExt = folderFiles.find(fileName => {
  return fileName.includes(targetFileName) && fileName.endsWith('.wat');
});

if (!sourceFileNameWithExt) {
  console.log(`No file matching ${targetFileName} found in the exercises folder.`);
  process.exit(1);
}

const nameBase = basename(sourceFileNameWithExt, '.wat');

const patchFilePath = new URL(`../patch/${nameBase}.patch`, import.meta.url);
const patchFile = await readFile(patchFilePath, 'utf-8').catch(() => {
  console.error(`No patch file found under patch/${nameBase}.patch`);
  process.exit(1);
});

const sourceFilePath = new URL(`../exercises/${nameBase}.wat`, import.meta.url);
const sourceFile = await readFile(sourceFilePath, 'utf-8');

const patchedContent = patch(patchFile, sourceFile);

await writeFile(sourceFilePath, patchedContent)

console.log(`Patch applied successfully to: ${nameBase}`);