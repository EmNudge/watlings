/**
 * @param {Buffer} buffer
 * @param {any} imports
 * @returns {Promise<Record<string, any>>}
 */
export async function instantiate(buffer, imports) {
  try {
    const { instance } = await WebAssembly.instantiate(buffer, imports);
    return instance.exports;
  } catch (e) {
    // Improve error message for common stack mismatch errors
    const match = e.message.match(/Compiling function #\d+:"([^"]+)" failed: expected (\d+) elements on the stack for fallthru(?:, found (\d+))?/);
    if (match) {
      const [, funcName, expectedCount, foundCount] = match;
      if (foundCount === undefined || foundCount === "0") {
        throw new Error(
          `Function "${funcName}" is incomplete: it should return ${expectedCount} value(s) but returns nothing. ` +
          `Add the required WebAssembly instructions to produce the return value.`
        );
      } else {
        throw new Error(
          `Function "${funcName}" has a stack mismatch: expected ${expectedCount} value(s) on the stack but found ${foundCount}. ` +
          `Check that your instructions produce the correct number of values.`
        );
      }
    }
    throw e;
  }
}
