import { readdir, readFile, writeFile, rm } from "node:fs/promises";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { colors } from "./utils/colors.mjs";

const execFile = promisify(execFileCb);
const rootDir = fileURLToPath(new URL("..", import.meta.url));
const exercisesDir = path.join(rootDir, "exercises");
const patchDir = path.join(rootDir, "patch");

async function getExercises() {
  const files = await readdir(exercisesDir);
  return files
    .filter((f) => f.endsWith(".wat"))
    .map((f) => path.basename(f, ".wat"))
    .sort();
}

async function isEmptyPatch(name) {
  const content = await readFile(
    path.join(patchDir, `${name}.patch`),
    "utf-8",
  ).catch(() => "");
  return content.trim().length === 0;
}

async function runTest(name) {
  try {
    const { stdout } = await execFile(
      "node",
      ["--experimental-wasm-exnref", "scripts/test.mjs", name],
      { cwd: rootDir, timeout: 30_000 },
    );
    return { passed: true, output: stdout };
  } catch (e) {
    return { passed: false, output: e.stdout ?? "", error: e.stderr ?? "" };
  }
}

async function applyPatch(name) {
  await execFile("node", ["scripts/solve.mjs", name], { cwd: rootDir });
}

async function backupExercises() {
  const backup = new Map();
  const files = await readdir(exercisesDir);
  for (const file of files) {
    if (file.endsWith(".wat") || file.endsWith(".mjs")) {
      backup.set(file, await readFile(path.join(exercisesDir, file), "utf-8"));
    }
  }
  return backup;
}

async function restoreExercises(backup) {
  for (const [file, content] of backup) {
    await writeFile(path.join(exercisesDir, file), content);
  }
}

const exercises = await getExercises();
const backup = await backupExercises();
const failures = [];

// Clear compilation cache for a clean run
await rm(path.join(rootDir, ".cache"), { recursive: true, force: true });

try {
  // Phase 1: unsolved exercises should fail (unless patch is empty)
  console.log(colors.bold("Phase 1: Verify unsolved exercises fail\n"));

  for (const name of exercises) {
    const empty = await isEmptyPatch(name);
    const { passed, output, error } = await runTest(name);

    if (empty) {
      if (passed) {
        console.log(`  ${colors.green("✓")} ${name} (no patch needed)`);
      } else {
        console.log(
          `  ${colors.red("✘")} ${name} — expected pass (empty patch) but failed`,
        );
        if (error) console.log(`    ${colors.faded(error)}`);
        failures.push(`${name}: should pass without patch`);
      }
    } else {
      if (!passed) {
        console.log(`  ${colors.green("✓")} ${name} (correctly fails)`);
      } else {
        console.log(
          `  ${colors.red("✘")} ${name} — should fail before patch but passed`,
        );
        failures.push(`${name}: should fail without patch`);
      }
    }
  }

  // Phase 2: apply patches, then all exercises should pass
  console.log(colors.bold("\nPhase 2: Apply patches and verify all pass\n"));

  for (const name of exercises) {
    if (!(await isEmptyPatch(name))) await applyPatch(name);
  }

  // Clear cache so solved exercises get compiled fresh
  await rm(path.join(rootDir, ".cache"), { recursive: true, force: true });

  for (const name of exercises) {
    const { passed, error } = await runTest(name);
    if (passed) {
      console.log(`  ${colors.green("✓")} ${name}`);
    } else {
      console.log(`  ${colors.red("✘")} ${name} — fails after patch`);
      if (error) console.log(`    ${colors.faded(error)}`);
      failures.push(`${name}: fails after patch`);
    }
  }
} finally {
  await restoreExercises(backup);
}

console.log("\n" + "=".repeat(50));
if (failures.length) {
  console.log(`\n${failures.length} failure(s):`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exitCode = 1;
} else {
  console.log(colors.green("\nAll exercises verified successfully!"));
}
