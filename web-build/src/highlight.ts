// ── WAT syntax highlighting (shared between editor and instruction code blocks) ──

export const WAT_KEYWORDS = new Set([
  "module",
  "func",
  "param",
  "result",
  "local",
  "global",
  "table",
  "memory",
  "type",
  "import",
  "export",
  "block",
  "loop",
  "if",
  "then",
  "else",
  "end",
  "br",
  "br_if",
  "br_table",
  "return",
  "call",
  "call_indirect",
  "drop",
  "select",
  "unreachable",
  "nop",
  "data",
  "elem",
  "start",
  "offset",
  "item",
  "mut",
  "ref",
  "struct",
  "field",
  "array",
  "rec",
  "sub",
  "tag",
  "try_table",
  "throw",
  "catch",
  "catch_all",
  "catch_ref",
  "catch_all_ref",
  "delegate",
]);

export const WAT_TYPES = new Set([
  "i32",
  "i64",
  "f32",
  "f64",
  "v128",
  "funcref",
  "externref",
  "anyref",
  "eqref",
  "i31ref",
  "structref",
  "arrayref",
  "nullfuncref",
  "nullexternref",
  "nullref",
]);

export const tokenColors = {
  keyword: "#569cd6",
  typeName: "#4ec9b0",
  variableName: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  comment: "#6a9955",
  bracket: "#d4d4d4",
  name: "#dcdcaa",
} as const;

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type TokenKind =
  | "space"
  | "comment"
  | "string"
  | "paren"
  | "variable"
  | "word"
  | "number"
  | "other";

const TOKEN_RULES: [TokenKind, RegExp][] = [
  ["space", /\s+/y],
  ["comment", /;;.*/y],
  ["string", /"(?:[^"\\]|\\.)*"/y],
  ["paren", /[()]/y],
  ["variable", /\$[\w.]+/y],
  ["word", /[a-zA-Z_][\w.]*/y],
  [
    "number",
    /-?(?:0x[\da-fA-F][\da-fA-F_]*(?:\.[\da-fA-F_]*)?(?:[pP][+-]?\d+)?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)/y,
  ],
  ["other", /./y],
];

function tokenizeLine(line: string): { kind: TokenKind; text: string }[] {
  const tokens: { kind: TokenKind; text: string }[] = [];
  let pos = 0;
  while (pos < line.length) {
    for (const [kind, re] of TOKEN_RULES) {
      re.lastIndex = pos;
      const m = re.exec(line);
      if (m) {
        tokens.push({ kind, text: m[0] });
        pos += m[0].length;
        break;
      }
    }
  }
  return tokens;
}

function wordColor(text: string): string {
  if (WAT_TYPES.has(text)) return tokenColors.typeName;
  if (WAT_KEYWORDS.has(text) || text.includes(".")) return tokenColors.keyword;
  return tokenColors.name;
}

const TOKEN_COLOR_MAP: Record<TokenKind, string | undefined> = {
  comment: tokenColors.comment,
  string: tokenColors.string,
  paren: tokenColors.bracket,
  variable: tokenColors.variableName,
  number: tokenColors.number,
  space: undefined,
  word: undefined,
  other: undefined,
};

function tokenToHtml(token: { kind: TokenKind; text: string }): string {
  const color = token.kind === "word" ? wordColor(token.text) : TOKEN_COLOR_MAP[token.kind];
  const escaped = escapeHtml(token.text);
  return color ? `<span style="color:${color}">${escaped}</span>` : escaped;
}

export function highlightWatCode(code: string): string {
  return code
    .split("\n")
    .map((line) => tokenizeLine(line).map(tokenToHtml).join(""))
    .join("\n");
}
