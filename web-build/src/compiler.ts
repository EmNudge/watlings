import init, { parseWat } from "js-wasm-tools";
import wasmUrl from "js-wasm-tools/wasm_tools_js_bg.wasm?url";

let initialized = false;

async function ensureInit() {
  if (!initialized) {
    await init(wasmUrl);
    initialized = true;
  }
}

export async function compileWat(watSource: string): Promise<Uint8Array> {
  await ensureInit();
  return parseWat(watSource);
}
