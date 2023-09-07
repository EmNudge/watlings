import { startVitest } from 'vitest/node'
import { compileFiles } from './utils/compileFiles.mjs';

const fileNameFilter = process.argv[2];

await compileFiles(fileNameFilter);
const vitest = await startVitest('test', [fileNameFilter], { watch: false });
await vitest?.close();