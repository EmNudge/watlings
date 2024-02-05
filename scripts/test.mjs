import { fileURLToPath } from 'node:url';
import { findFile } from './utils/findFile.mjs';

const stub = process.argv[2] ?? '001_hello';
const sourceFileNameWithExt = await findFile(stub, 'tests');
if (!sourceFileNameWithExt) {
  console.log(`No file matching "${stub}" found in the tests folder.`);
  process.exit(1);
}

const testFilePath = fileURLToPath(new URL(`../tests/${sourceFileNameWithExt}`, import.meta.url));
await import(testFilePath);