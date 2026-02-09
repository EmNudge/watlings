/** Runs host JS code in a Web Worker so infinite loops can be killed. */

import type { ConsoleLine } from "./types";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const IDENT_RE = /^[a-zA-Z_$][\w$]*$/;

function inspect(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return `'${v}'`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    return v.length === 0 ? "[]" : `[ ${v.map(inspect).join(", ")} ]`;
  }
  if (typeof v === "object") {
    try {
      const entries = Object.entries(v as Record<string, unknown>);
      if (entries.length === 0) return "{}";
      const parts = entries.map(([k, val]) => {
        const key = IDENT_RE.test(k) ? k : `'${k}'`;
        return `${key}: ${inspect(val)}`;
      });
      return `{ ${parts.join(", ")} }`;
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return v;
  return inspect(v);
}

function capture(output: ConsoleLine[], type: ConsoleLine["type"]) {
  return (...args: unknown[]) => {
    output.push({ type, text: args.map(formatValue).join(" ") });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- worker global
const worker = globalThis as any;

worker.onmessage = async (e: MessageEvent<{ wasmBytes: Uint8Array; hostCode: string }>) => {
  const { wasmBytes, hostCode } = e.data;
  const output: ConsoleLine[] = [];

  const fakeConsole = {
    log: capture(output, "log"),
    warn: capture(output, "warn"),
    error: capture(output, "error"),
    info: capture(output, "info"),
  };

  try {
    await new AsyncFunction("wasmBytes", "WebAssembly", "console", hostCode)(
      wasmBytes,
      WebAssembly,
      fakeConsole,
    );
  } catch (err: unknown) {
    output.push({
      type: "error",
      text: err instanceof Error ? err.message : String(err),
    });
  }

  worker.postMessage({ output });
};

export {};
