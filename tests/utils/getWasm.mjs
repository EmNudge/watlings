import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { compileFiles } from "../../scripts/utils/compileFiles.mjs";

/** @param {string} path */
const getBaseName = (path) => {
  const baseName = path.split("/").pop().split(".")[0];
  return baseName;
};

/** @param {string} path */
export async function getWasm(path) {
  const baseName = getBaseName(path);

  await compileFiles(baseName);
  console.log();

  const filePath = fileURLToPath(
    new URL(`../../.cache/${baseName}.wasm`, import.meta.url)
  );
  return await fs.readFile(filePath);
}
