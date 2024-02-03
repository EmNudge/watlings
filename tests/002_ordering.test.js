import { getWasm } from './utils/getWasm.mjs';
import { instantiate } from './utils/instantiate.mjs';
import { arrayEquals, assert, setSuccess, test } from './utils/test-runner.mjs';

const wasmBytes = await getWasm(import.meta.url);
setSuccess("Congrats! Continue onto 003_export.wat");

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
