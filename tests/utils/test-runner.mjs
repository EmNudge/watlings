/** @type {string[]} */
const expectStack = [];

/** @type {{ name: string, errors: string[] }[]} */
const testResults = [];
let lastTestResultId;
const scheduleTestResult = () => {
  clearTimeout(lastTestResultId);
  lastTestResultId = setTimeout(() => {
    for (const { name, errors } of testResults) {
      const marker = errors.length ? "\x1b[31m✘" : "\x1b[32m✓";
      console.log(`${marker} \x1b[0m${name}`);
      if (errors.length) {
        console.log(errors.map((e) => `  · \x1b[31m${e}\x1b[0m`).join("\n"));
      }
    }
  }, 0);
};

/** @param {string} name, @param {() => Promise<void> | void} fn */
export async function test(name, fn) {
  const testResult = { name: 'unfinished test', errors: ['test runner ran into an error (unexpected)' ]};
  // @ts-ignore
  testResults.push(testResult);

  try {
    await fn();
    if (expectStack.length) {
      testResult.name = name;
      testResult.errors = expectStack;
      expectStack.length = 0;
    } else {
      testResult.name = name;
      testResult.errors = [];
    }
  } catch (e) {
    testResult.name = name;
    testResult.errors = [e.message];
  }

  scheduleTestResult();
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
    if (b[key] === WebAssembly.Memory && a[key] instanceof WebAssembly.Memory)
      return false;

    if (typeof a[key] === "object") {
      // @ts-ignore
      if (!matchObjectShape(a[key], b[key])) {
        return false;
      }
    }
  }
}
