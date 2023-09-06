// An attempt at a "readable" regex
const PATCH_REGEX_SOURCE = [
  /(?<srcRangeStart>[0-9]+)(?:,(?<srcRangeEnd>[0-9]+))?/, // range
  /c/,
  /[0-9]+(?:,[0-9]+)?/, // range
  /\n(?:<[^\n]+\n)+/,    // lines to delete (preceded by <)
  /---/,
  /(?<addLines>(?:\n>[^\n]+)+)/,      // lines to add (preceded by >)
].map(regex => regex.source).join('');
const PATCH_REGEX = new RegExp(PATCH_REGEX_SOURCE, 'g');

/** @param {string} patchString @param {string} targetString */
export function patch(patchString, targetString) {
  const targetArr = targetString.split('\n');

  for (const match of patchString.matchAll(PATCH_REGEX)) {
    const { srcRangeStart, srcRangeEnd, addLines } = match.groups;
    
    const start = Number(srcRangeStart) - 1;
    const length = srcRangeEnd ? Number(srcRangeEnd) - start : 1;
    const lines = addLines.trim().split('\n').map(line => line.slice(1))

    targetArr.splice(start, length, ...lines);
  }

  return targetArr.join('\n');
}