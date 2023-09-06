import { startVitest } from 'vitest/node'
import { compileFiles } from './utils/compileFiles.mjs';

const fileNameFilter = process.argv[2];

const exitCode = await compileFiles(fileNameFilter);
if (exitCode !== 1) {
  const vitest = await startVitest('test', [fileNameFilter], { watch: false });
  await vitest?.close();
}