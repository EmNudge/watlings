/**
 * @param {Buffer} buffer 
 * @param {any} imports
 */
export async function instantiate(buffer, imports) {
  const { instance } = await WebAssembly.instantiate(buffer, imports)
  /** @type {Record<string, any>} */
  return exports;
}