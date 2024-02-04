import { fileURLToPath } from "url";
import { test } from "../utils/test-runner.mjs";
import { readdir } from "fs/promises";
import path from "path";
import { patchFile } from "../../scripts/utils/patchFile.mjs";

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
    // await patchFile(name.split('.')[0]);
    await import(path);
    await wait(100);
  }
});
