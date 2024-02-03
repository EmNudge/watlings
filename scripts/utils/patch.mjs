/**
 * We're reimplementing `patch` for use on Windows. 
 * This may not be "spec compliant", but it should suffice for our use cases.
 * 
 * Here's an unofficial syntax description:
 * 
 * RANGE = num+ | num+ ',' num+
 * ACTION_CHAR = 'a' | 'c' | 'd'
 * ACTION_HEADER<T = ACTION_CHAR> = RANGE <T> RANGE
 * DEL_BODY = ( '<' text+ )+
 * ADD_BODY = ( '>' text+ )+
 * ACTION<T = ACTION_CHAR> = 
 *  ACTION_HEADER<'c'> DEL_BODY '---' ADD_BODY 
 *  | ACTION_HEADER<'d'> DEL_BODY 
 *  | ACTION_HEADER<'a'> ADD_BODY
 * FILE = ACTION<T>+
 */

// An attempt at a "readable" RegEx. This does not verify, only parse (possible false-positives).
const PATCH_REGEX_SOURCE = [
  /(?<srcRange>[0-9]+(?:,[0-9]+)?)/,  // RANGE
  /(c|a|d)/,
  /([0-9]+(?:,[0-9]+)?)/,            // RANGE
  /(?<delLines>\n(?:<[^\n]+\n)+)?/,  // DEL_BODY
  /(?:---)?/,
  /(?<addLines>(?:\n>[^\n]+)+)?/,    // ADD_BODY
].map(regex => regex.source).join('');
const PATCH_REGEX = new RegExp(PATCH_REGEX_SOURCE, 'g');

/** @param {string} patchString */
export function parsePatch(patchString) {
  return [...patchString.matchAll(PATCH_REGEX)].map(({ groups }) => {
    const { srcRange, addLines, delLines } = groups;

    const [start, end] = srcRange.split(',').map(Number);
    const length = end ? end - (start - 1) : 1;
    const lines = addLines?.trim().split('\n').map(line => line.slice(2)) ?? [];
    return { start, deleteCount: length, addLines: lines, delLines };
  })
}

/** 
 * @param {string} patchString 
 * @param {string} targetString 
 */
export function patch(patchString, targetString) {
  // Fix Windows inserting carriage returns
  if (process.platform === 'win32') {
    targetString = targetString.replace(/\r/g, '');
    patchString = patchString.replace(/\r/g, '');
  }

  const targetArr = targetString.split('\n');

  for (const { delLines, addLines, deleteCount, start } of parsePatch(patchString)) {
    if (delLines && !targetString.includes(delLines.slice(1).replace(/< /g, ''))) {
      throw new Error('Patch contains deletion that does not exist in target');
    }

    targetArr.splice(start - 1, deleteCount, ...addLines);
  }

  return targetArr.join('\n');
}