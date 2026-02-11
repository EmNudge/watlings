import { fileURLToPath } from "node:url";
import { test } from "../utils/test-runner.mjs";
import { readdir } from "node:fs/promises";
import path from "node:path";

/** @param {number} ms */
const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

test("can run all tests", async () => {
  const folderPath = fileURLToPath(new URL("../", import.meta.url));
  const folderFiles = await readdir(folderPath);

  const testFiles = folderFiles
    .filter((fileName) => fileName.endsWith(".test.js"))
    .map((fileName) => ({
      path: path.join(folderPath, fileName),
      name: fileName,
    }));

  for (const { path, name } of testFiles) {
    console.log(`running "${name}":`);
    await import(path);
    await wait(100);
  }
});
