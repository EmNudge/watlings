/**
 * @param {Buffer} buffer
 * @param {any} imports
 * @returns {Promise<Record<string, any>>}
 */
export async function instantiate(buffer, imports) {
  const { instance } = await WebAssembly.instantiate(buffer, imports);
  return instance.exports;
}
