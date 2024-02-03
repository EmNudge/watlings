import { readdir, readFile, writeFile } from 'fs/promises';
import { basename, extname, } from 'path';
import { patch } from './utils/patch.mjs';
import { fileURLToPath } from 'node:url';
import { findFile } from './utils/findFile.mjs';

// Strip path and extension from argument
const sourceFileNameWithExt = await findFile(process.argv[2], 'patch');
if (!sourceFileNameWithExt) {
  console.log(`No file matching ${process.argv[2]} found in the exercises folder.`);
  process.exit(1);
}

const nameBase = basename(sourceFileNameWithExt, '.wat');

const patchFilePath = fileURLToPath(new URL(`../patch/${nameBase}.patch`, import.meta.url));
const patchFile = await readFile(patchFilePath, 'utf-8').catch(() => {
  console.error(`No patch file found under patch/${nameBase}.patch`);
  process.exit(1);
});

const sourceFilePath = fileURLToPath(new URL(`../exercises/${nameBase}.wat`, import.meta.url));
const sourceFile = await readFile(sourceFilePath, 'utf-8');

try {
  const patchedContent = patch(patchFile, sourceFile);
  
  await writeFile(sourceFilePath, patchedContent)
  
  console.log(`Patch applied successfully to: ${nameBase}`);
} catch (e) {
  console.error(`Error applying patch: ${e.message}`);
  console.info('\nYou may want to stash your changes to the file before trying again,')
}