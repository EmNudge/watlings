import { instantiate } from './utils/instantiate.mjs';
import { arrayEquals, assert, test } from './utils/test-runner.mjs';
import fs from "fs/promises";

const { 1: baseName } = import.meta.url.match(/\/([^\/.]+)[^\/]+$/);
const wasmBytes = await fs.readFile(`./.cache/${baseName}.wasm`);

test("calls log function with numbers", async () => {
  const nums = [];

  const log = (...args) => nums.push(...args);
  await instantiate(wasmBytes, { env: { log } });

  assert(nums.length > 0, "log was not called");
});

test("calls log with the correct ordering", async () => {
  const nums = [];

  const log = (...args) => nums.push(...args);
  await instantiate(wasmBytes, { env: { log } });

  assert(arrayEquals(nums, [1, 2, 3]), "log was not called");
});
