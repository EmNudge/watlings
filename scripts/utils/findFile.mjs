import { readdir } from "fs/promises";
import { basename, extname } from "path";
import { fileURLToPath } from "node:url";

/** @param {string} stub @param {'exercises' | 'patch'} dir */
export async function findFile(stub, dir) {
  const folderFiles = await readdir(
    fileURLToPath(new URL(`../../${dir}`, import.meta.url))
  );

  const targetFileName = basename(stub, extname(stub));

  const sourceFileNameWithExt = folderFiles.find((fileName) => {
    if (dir === "exercises" && !fileName.endsWith(".wat")) return false;
    if (dir === "patch" && !fileName.endsWith(".patch")) return false;
    return fileName.includes(targetFileName);
  });

  /** @type {string | undefined} */
  return sourceFileNameWithExt;
}
