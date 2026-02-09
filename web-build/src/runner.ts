import { compileWat } from "./compiler";
import type { ConsoleLine, TestResult } from "./types";

function formatStackError(err: Error): Error | null {
  const match = err.message.match(
    /Compiling function #\d+:"([^"]+)" failed: expected (\d+) elements on the stack for fallthru(?:, found (\d+))?/,
  );
  if (!match) return null;

  const [, funcName, expected, found] = match;
  const detail =
    found === undefined || found === "0"
      ? `it should return ${expected} value(s) but returns nothing. Add the required WebAssembly instructions to produce the return value.`
      : `expected ${expected} value(s) on the stack but found ${found}. Check that your instructions produce the correct number of values.`;
  return new Error(
    `Function "${funcName}" ${found === undefined || found === "0" ? "is incomplete" : "has a stack mismatch"}: ${detail}`,
  );
}

async function instantiate(
  buffer: Uint8Array,
  imports?: WebAssembly.Imports,
): Promise<Record<string, unknown>> {
  try {
    const result = await WebAssembly.instantiate(buffer as BufferSource, imports);
    return (result as WebAssembly.WebAssemblyInstantiatedSource).instance.exports as Record<
      string,
      unknown
    >;
  } catch (e: unknown) {
    throw formatStackError(e as Error) ?? e;
  }
}

function arrayEquals(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

function matchesType(actual: unknown, expected: unknown): boolean {
  if (expected === Function) return typeof actual === "function";
  if (expected === Object) return typeof actual === "object";
  if (expected === Number) return typeof actual === "number";
  if (expected === String) return typeof actual === "string";
  if (expected === Boolean) return typeof actual === "boolean";
  if (expected === WebAssembly.Memory) return actual instanceof WebAssembly.Memory;

  return (
    typeof actual === "object" &&
    matchObjectShape(actual as Record<string, unknown>, expected as Record<string, unknown>)
  );
}

function matchObjectShape(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (typeof a !== "object" || typeof b !== "object") return false;

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.toString() !== bKeys.toString()) return false;

  return aKeys.every(
    (key) => a[key] !== undefined && b[key] !== undefined && matchesType(a[key], b[key]),
  );
}

function throws(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export async function runTests(
  watSource: string,
  testCode: string,
  hasWasm: boolean,
  hostCode?: string,
): Promise<TestResult[]> {
  const registered: Array<{ name: string; fn: () => Promise<void> | void }> = [];
  const errors: string[] = [];
  const wasmBytes = hasWasm || hostCode ? await compileWat(watSource) : null;

  // When host code is present, prepend it so its variables are in scope for tests
  const fullCode = hostCode ? hostCode + "\n\n" + testCode : testCode;

  await new AsyncFunction(
    "test",
    "assert",
    "instantiate",
    "matchObjectShape",
    "arrayEquals",
    "throws",
    "wasmBytes",
    "setSuccess",
    "setFailure",
    "WebAssembly",
    fullCode,
  )(
    (name: string, fn: () => Promise<void> | void) => registered.push({ name, fn }),
    (condition: boolean, message: string) => {
      if (!condition) errors.push(message);
    },
    instantiate,
    matchObjectShape,
    arrayEquals,
    throws,
    wasmBytes,
    () => {},
    () => {},
    WebAssembly,
  );

  const results: TestResult[] = [];
  for (const { name, fn } of registered) {
    errors.length = 0;
    try {
      await fn();
      results.push(
        errors.length > 0
          ? { name, passed: false, errors: [...errors] }
          : { name, passed: true, errors: [] },
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ name, passed: false, errors: [msg] });
    }
  }
  return results;
}

// ── Worker-based live preview for host lessons ──────────────────────

const PREVIEW_TIMEOUT_MS = 3000;

let activeCleanup: (() => void) | null = null;

export async function runHostPreview(watSource: string, hostCode: string): Promise<ConsoleLine[]> {
  const wasmBytes = await compileWat(watSource);

  // Cancel previous run (resolves its promise with [] so it doesn't hang)
  if (activeCleanup) activeCleanup();

  return new Promise<ConsoleLine[]>((resolve) => {
    const worker = new Worker(new URL("./preview-worker.ts", import.meta.url), {
      type: "module",
    });

    const timeout = setTimeout(() => {
      done([{ type: "error", text: "Execution timed out (3s limit)" }]);
    }, PREVIEW_TIMEOUT_MS);

    function done(result: ConsoleLine[]) {
      clearTimeout(timeout);
      worker.terminate();
      if (activeCleanup === cancel) activeCleanup = null;
      resolve(result);
    }

    function cancel() {
      done([]);
    }

    activeCleanup = cancel;

    worker.onmessage = (e: MessageEvent<{ output: ConsoleLine[] }>) => done(e.data.output);
    worker.onerror = (e: ErrorEvent) =>
      done([{ type: "error", text: e.message || "Worker error" }]);

    worker.postMessage({ wasmBytes, hostCode });
  });
}
