#!/usr/bin/env node
/**
 * Standalone parity check: ensures every exercise on disk is listed in
 * CHAPTERS and every CHAPTERS entry exists on disk.
 *
 * Usage:  node web-build/check-chapters.mjs
 * Exit 1 on mismatch, 0 on success.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkChapters } from "./chapters.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exercisesDir = path.resolve(__dirname, "..", "exercises");

const { ok, missing, extra } = await checkChapters(exercisesDir);

if (!ok) {
  if (missing.length) {
    console.error(`Exercises on disk but missing from CHAPTERS: ${missing.join(", ")}`);
  }
  if (extra.length) {
    console.error(`Exercises in CHAPTERS but not on disk: ${extra.join(", ")}`);
  }
  console.error("\nUpdate web-build/chapters.mjs to fix this.");
  process.exit(1);
}

console.log("All exercises accounted for in CHAPTERS.");
