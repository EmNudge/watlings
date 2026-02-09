/**
 * Canonical chapter→exercise mapping for the web build.
 *
 * Shared between generate.mjs (build) and check-chapters.mjs (CI).
 */

import fs from "node:fs/promises";
import path from "node:path";

export const CHAPTERS = [
  {
    dir: "1-basics",
    title: "Basics",
    exercises: ["001_hello", "002_ordering", "003_export"],
  },
  {
    dir: "2-functions-and-types",
    title: "Functions & Types",
    exercises: ["004_function", "005_variables", "006_numbers"],
  },
  {
    dir: "3-control-flow",
    title: "Control Flow",
    exercises: ["007_conditionals", "008_loops"],
  },
  {
    dir: "4-data-and-memory",
    title: "Data & Memory",
    exercises: ["009_data", "010_memory"],
  },
  {
    dir: "5-host-integration",
    title: "Host Integration",
    exercises: ["011_host"],
  },
  {
    dir: "6-advanced-features",
    title: "Advanced Features",
    exercises: [
      "012_reftypes",
      "013_table",
      "014_memory_dynamic",
      "015_exceptions",
      "016_simd",
      "017_gc_types",
    ],
  },
];

/**
 * Verify every .wat file in exercisesDir appears in CHAPTERS (and vice-versa).
 * Returns { ok, missing, extra } where missing = on disk but not in CHAPTERS,
 * extra = in CHAPTERS but not on disk.
 */
export async function checkChapters(exercisesDir) {
  const allFiles = await fs.readdir(exercisesDir);
  const onDisk = new Set(
    allFiles.filter((f) => f.endsWith(".wat")).map((f) => path.basename(f, ".wat")),
  );
  const inChapters = new Set(CHAPTERS.flatMap((ch) => ch.exercises));

  const missing = [...onDisk].filter((e) => !inChapters.has(e)).sort();
  const extra = [...inChapters].filter((e) => !onDisk.has(e)).sort();

  return { ok: missing.length === 0 && extra.length === 0, missing, extra };
}
