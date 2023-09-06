import { readdir } from 'fs/promises';
import { basename, extname, } from 'path';
import { execSync } from 'child_process';

// Strip path and extension from argument
const src = process.argv[2];
const strippedFile = basename(src, extname(src));

// Search the exercises folder for the first matching file
const folderFiles = await readdir(new URL('../exercises', import.meta.url));
const targetFile = folderFiles.find(fileName => fileName.includes(strippedFile));

if (!targetFile) {
  console.log(`No file matching ${strippedFile} found in the exercises folder.`);
  process.exit(1);
}

// Strip path and extension from target
const strippedTarget = basename(targetFile, extname(targetFile));

// Apply the patch
execSync(`patch "exercises/${targetFile}" < "patch/${strippedTarget}.patch"`);

console.log(`Patch applied successfully to: ${targetFile}`);