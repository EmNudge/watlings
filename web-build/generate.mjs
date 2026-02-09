/**
 * Generate lessons.json from watlings exercises.
 *
 * Reads exercises/*.wat, patch/*.patch, and tests/*.test.js from the parent
 * repo and produces src/lessons.json with pre-rendered HTML instructions.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { patch as applyPatch } from "../scripts/utils/patch.mjs";
import { CHAPTERS, checkChapters } from "./chapters.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(__dirname, "src", "lessons.json");

// ── Extract instruction comment block from a .wat file ──────────────

function extractInstructions(watSource) {
  const match = watSource.match(/^\s*\(;([\s\S]*?);\)/);
  if (!match) return "";
  const raw = match[1];
  const lines = raw.split("\n");

  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  const minIndent = lines
    .filter((l) => l.trim().length > 0)
    .reduce((min, l) => {
      const indent = l.match(/^(\s*)/)[1].length;
      return Math.min(min, indent);
    }, Infinity);

  return lines.map((l) => l.slice(minIndent)).join("\n");
}

function stripInstructions(watSource) {
  return watSource.replace(/^\s*\(;[\s\S]*?;\)\s*\n*/, "");
}

// ── Pretty title from exercise name ─────────────────────────────────

function prettyTitle(name) {
  const raw = name.replace(/^\d+_/, "");
  return raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Simple instruction text to HTML ─────────────────────────────────

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function instructionsToHtml(text) {
  if (!text) return "";

  const lines = text.split("\n");
  const blocks = [];
  let current = [];
  let inCode = false;

  for (const line of lines) {
    const isIndented = line.startsWith("  ") && line.trim().length > 0;
    const isEmpty = line.trim() === "";

    if (isEmpty) {
      if (current.length > 0) {
        blocks.push({ type: inCode ? "code" : "text", lines: current });
        current = [];
      }
      inCode = false;
      continue;
    }

    if (isIndented && !inCode && current.length > 0) {
      // Transitioning from text to code
      blocks.push({ type: "text", lines: current });
      current = [line];
      inCode = true;
    } else if (!isIndented && inCode) {
      // Transitioning from code to text
      blocks.push({ type: "code", lines: current });
      current = [line];
      inCode = false;
    } else {
      if (isIndented) inCode = true;
      current.push(line);
    }
  }

  if (current.length > 0) {
    blocks.push({ type: inCode ? "code" : "text", lines: current });
  }

  return blocks
    .map((block) => {
      if (block.type === "code") {
        // Find min indent for code blocks
        const minIndent = block.lines.reduce((min, l) => {
          const indent = l.match(/^(\s*)/)[1].length;
          return Math.min(min, indent);
        }, Infinity);
        const code = block.lines.map((l) => escapeHtml(l.slice(minIndent))).join("\n");
        return `<pre><code>${code}</code></pre>`;
      } else {
        // Text paragraph — handle inline backtick code
        let html = block.lines.map((l) => escapeHtml(l)).join("<br>");
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        return `<p>${html}</p>`;
      }
    })
    .join("\n");
}

// ── Transform host .mjs file for browser execution ──────────────────

function transformHostForBrowser(mjsSource) {
  let code = mjsSource;

  // Strip top block comment
  code = code.replace(/^\/\*[\s\S]*?\*\/\s*\n?/, "");

  // Strip ES imports
  code = code.replace(/^import\s+.*from\s*["'][^"']+["'];?\s*$/gm, "");

  // Strip the wasmBytes loading pipeline and its preceding comment
  code = code.replace(
    /(?:\/\/[^\n]*\n)*const wasmBytes = await getWastParser\(\)[\s\S]*?;[ \t]*\n?/,
    "",
  );

  // Replace wasmModule.instance.exports with instance.exports
  code = code.replace(
    /const wasmModule = await WebAssembly\.instantiate\(wasmBytes, imports\);/,
    "const { instance } = await WebAssembly.instantiate(wasmBytes, imports);",
  );
  code = code.replace(/wasmModule\.instance\.exports/g, "instance.exports");

  // Clean up excessive blank lines
  code = code.replace(/\n{3,}/g, "\n\n").trim();

  return code;
}

// ── Transform test for browser execution ────────────────────────────

function transformTestForBrowser(testSource) {
  const hasWasm = testSource.includes("getWasm");
  let code = testSource;

  // Strip multi-line imports: import { ... } from "...";
  code = code.replace(/^import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?\s*$/gm, "");

  // Strip single-line imports: import foo from "...";
  code = code.replace(/^import\s+\w.*from\s*["'][^"']+["'];?\s*$/gm, "");

  // Strip getWasm call
  code = code.replace(/const wasmBytes = await getWasm\([^)]*\);\s*\n?/g, "");

  // Strip setSuccess/setFailure calls (may span multiple lines)
  code = code.replace(/setSuccess\([\s\S]*?\);\s*\n?/g, "");
  code = code.replace(/setFailure\([\s\S]*?\);\s*\n?/g, "");

  // Clean up excessive blank lines
  code = code.replace(/\n{3,}/g, "\n\n").trim();

  return { code, hasWasm };
}

// ── Main generation ─────────────────────────────────────────────────

async function main() {
  // Ensure every exercise in exercises/ is covered by CHAPTERS
  const { ok, missing, extra } = await checkChapters(path.join(ROOT, "exercises"));
  if (!ok) {
    const parts = [];
    if (missing.length) parts.push(`On disk but not in CHAPTERS: ${missing.join(", ")}`);
    if (extra.length) parts.push(`In CHAPTERS but not on disk: ${extra.join(", ")}`);
    throw new Error(parts.join("\n") + "\nUpdate web-build/chapters.mjs to fix this.");
  }

  console.log("Generating lessons.json from watlings exercises...\n");

  const chapters = [];
  let lessonCount = 0;

  for (const chapter of CHAPTERS) {
    const chapterData = {
      id: chapter.dir,
      title: chapter.title,
      lessons: [],
    };

    for (const name of chapter.exercises) {
      const watPath = path.join(ROOT, "exercises", `${name}.wat`);
      const watSource = await fs.readFile(watPath, "utf-8");

      const instructions = extractInstructions(watSource);
      const instructionsHtml = instructionsToHtml(instructions);
      const title = prettyTitle(name);
      const exerciseCode = stripInstructions(watSource);

      // Solution (apply patch if available)
      let solutionCode = exerciseCode;
      const patchPath = path.join(ROOT, "patch", `${name}.patch`);
      try {
        const patchContent = await fs.readFile(patchPath, "utf-8");
        const solved = applyPatch(patchContent, watSource);
        solutionCode = stripInstructions(solved);
      } catch {
        // No patch file — solution is same as exercise
      }

      // Test file
      let testCode = "";
      let hasWasm = false;
      const testPath = path.join(ROOT, "tests", `${name}.test.js`);
      try {
        const testSource = await fs.readFile(testPath, "utf-8");
        const transformed = transformTestForBrowser(testSource);
        testCode = transformed.code;
        hasWasm = transformed.hasWasm;
      } catch {
        console.warn(`  Warning: No test file found for ${name}`);
      }

      // Host .mjs file (for host integration lessons)
      let hostCode = undefined;
      let hostSolutionCode = undefined;
      const mjsPath = path.join(ROOT, "exercises", `${name}.mjs`);
      try {
        const mjsSource = await fs.readFile(mjsPath, "utf-8");
        hostCode = transformHostForBrowser(mjsSource);
        hostSolutionCode = hostCode; // same unless a patch exists

        const mjsPatchPath = path.join(ROOT, "patch", `${name}.mjs.patch`);
        try {
          const mjsPatchContent = await fs.readFile(mjsPatchPath, "utf-8");
          const solvedMjs = applyPatch(mjsPatchContent, mjsSource);
          hostSolutionCode = transformHostForBrowser(solvedMjs);
        } catch {
          // No .mjs patch — solution is same as exercise
        }
      } catch {
        // No .mjs file — not a host integration lesson
      }

      const lessonId = name.replace(/^\d+_/, "");
      const lesson = {
        id: lessonId,
        title,
        instructionsHtml,
        exerciseCode,
        solutionCode,
        testCode,
        hasWasm,
      };
      if (hostCode != null) {
        lesson.hostCode = hostCode;
        lesson.hostSolutionCode = hostSolutionCode;
      }
      chapterData.lessons.push(lesson);

      lessonCount++;
      console.log(`  ✓ ${name} → ${chapter.dir}/${lessonId}`);
    }

    chapters.push(chapterData);
  }

  await fs.writeFile(OUTPUT, JSON.stringify({ chapters }, null, 2));
  console.log(`\nGenerated ${lessonCount} lessons → src/lessons.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
