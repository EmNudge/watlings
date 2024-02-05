import { readFile, writeFile } from "fs/promises";
import { basename } from "path";
import { patch } from "./patch.mjs";
import { fileURLToPath } from "node:url";
import { findFile } from "./findFile.mjs";
import { colors } from "./colors.mjs";

export async function patchFile(stub = process.argv[2]) {
  const sourceFileNameWithExt = await findFile(stub, "patch");
  if (!sourceFileNameWithExt) {
    console.log(`No file matching ${stub} found in the exercises folder.`);
    process.exit(1);
  }

  const nameBase = basename(sourceFileNameWithExt, ".patch");

  const patchFilePath = fileURLToPath(
    new URL(`../../patch/${nameBase}.patch`, import.meta.url)
  );
  const patchFile = await readFile(patchFilePath, "utf-8").catch(() => {
    console.error(`No patch file found under patch/${nameBase}.patch`);
    process.exit(1);
  });

  const sourceFilePath = fileURLToPath(
    new URL(`../../exercises/${nameBase}.wat`, import.meta.url)
  );
  const sourceFile = await readFile(sourceFilePath, "utf-8");

  try {
    const patchedContent = patch(patchFile, sourceFile);

    await writeFile(sourceFilePath, patchedContent);

    console.log(`Patch applied successfully to: ${colors.bold(nameBase)}`);
  } catch (e) {
    console.error(`Error applying patch: ${colors.red(e.message)}`);
    console.info(
      "\nYou may want to stash your changes to the file before trying again,"
    );
  }
}
