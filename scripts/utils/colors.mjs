/** @type {Record<string, (msg: string) => string>} */
export const colors = {
  faded: msg => `\x1b[2m${msg}\x1b[0m`,
  bold: msg => `\x1b[1m${msg}\x1b[0m`,
  red: msg => `\x1b[31m${msg}\x1b[0m`,
  green: msg => `\x1b[32m${msg}\x1b[0m`,
}