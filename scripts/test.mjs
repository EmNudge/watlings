import { fileURLToPath } from 'node:url';
import { findFile } from './utils/findFile.mjs';

// Strip path and extension from argument
const sourceFileNameWithExt = await findFile(process.argv[2], 'tests');
if (!sourceFileNameWithExt) {
  console.log(`No file matching "${process.argv[2]}" found in the tests folder.`);
  process.exit(1);
}

const testFilePath = fileURLToPath(new URL(`../tests/${sourceFileNameWithExt}`, import.meta.url));
await import(testFilePath);