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
    // Improve error message for common "empty function" errors
    const match = e.message.match(/Compiling function #\d+:"([^"]+)" failed: expected (\d+) elements on the stack for fallthru/);
    if (match) {
      const [, funcName, expectedCount] = match;
      throw new Error(
        `Function "${funcName}" is incomplete: it should return ${expectedCount} value(s) but returns nothing. ` +
        `Add the required WebAssembly instructions to produce the return value.`
      );
    }
    throw e;
  }
}
