/** @type {string[]} */
const expectStack = [];

/** @param {string} name, @param {() => Promise<void> | void} fn */
export async function test(name, fn) {
  await fn();
  if (expectStack.length) {
    console.log(`\x1b[31m✘ \x1b[0m${name}`);
    console.log(expectStack.map((msg) => "  \x1b[31m" + msg).join("\n"));
    expectStack.length = 0;
  } else {
    console.log(`\x1b[32m✓ \x1b[0m${name}`);
  }
}

/** @param {boolean} boolExpression @param {string} errorMessage */
export function assert(boolExpression, errorMessage) {
  if (!boolExpression) {
    expectStack.push(errorMessage);
  }
}

/** @param {any[]} a @param {any[]} b */
export function arrayEquals(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** @param {any} a @param {import('./types.d.ts').ObjectShape} b */
export function matchObjectShape(a, b) {
  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.toString() !== bKeys.toString()) {
    return false;
  }

  for (const key of aKeys) {
    if (a[key] === undefined || b[key] === undefined) {
      return false;
    }

    if (b[key] === Function && typeof a[key] !== "function") return false;
    if (b[key] === Object && typeof a[key] !== "object") return false;
    if (b[key] === Number && typeof a[key] !== "number") return false;
    if (b[key] === String && typeof a[key] !== "string") return false;
    if (b[key] === Boolean && typeof a[key] !== "boolean") return false;
    if (b[key] === WebAssembly.Memory && a[key] instanceof WebAssembly.Memory) return false;

    if (typeof a[key] === "object") {

      // @ts-ignore
      if (!matchObjectShape(a[key], b[key])) {
        return false;
      }
    }
  }
}
