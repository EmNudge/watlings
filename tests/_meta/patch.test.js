import { expect, test, describe } from "vitest";
import { readdir, readFile } from "node:fs/promises";
import path, { basename } from "node:path";
import { patch as applyPatch } from "../../scripts/utils/patch.mjs";

/** @param {string} folderPath */
const getFilesInFolder = async (folderPath) => {
  const folderFiles = await readdir(folderPath);

  const fileReads = folderFiles
    .map((name) => [name, path.resolve(folderPath, name)])
    .map(async ([name, path]) => ({
      name,
      content: await readFile(path, "utf-8"),
    }));

  return Promise.all(fileReads);
};

/** @returns {Promise<Map<string, { exercise: string, patch?: string }>>} */
const getPatchMap = async () => {
  const [exercises, patches] = await Promise.all([
    getFilesInFolder(path.resolve(__dirname, "../../exercises")),
    getFilesInFolder(path.resolve(__dirname, "../../patch")),
  ]);

  const map = new Map();
  for (const { name, content } of exercises) {
    if (!name.endsWith(".wat")) continue;

    map.set(basename(name, ".wat"), { exercise: content });
  }

  for (const { name, content } of patches) {
    if (!name.endsWith(".patch")) continue;

    const baseName = basename(name, ".patch");
    if (!map.has(baseName)) {
      console.log(map);
      throw new Error(`No exercise file found for patch ${name}`);
    }
    map.get(baseName).patch = content;
  }

  return map;
};

describe("each file has an associated patch", async () => {
  const patchMap = await getPatchMap();

  for (const [name, { patch }] of patchMap) {
    test(`patch exists for ${name}`, () => {
      expect(patch).toBeDefined();
    });
  }
});

describe("can apply patch", async () => {
  const patchMap = await getPatchMap();
  for (const [name, { patch, exercise }] of patchMap) {
    test(`patching ${name}`, () => {
      expect(() => applyPatch(patch, exercise)).not.toThrowError();
    });
  }
});
