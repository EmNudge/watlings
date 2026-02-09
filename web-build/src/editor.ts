import { javascript } from "@codemirror/lang-javascript";
import { createWatLSP, type WatLSP } from "@emnudge/wat-lsp";
import treeSitterWasmUrl from "@emnudge/wat-lsp/wasm/tree-sitter.wasm?url";
import watLspWasmUrl from "@emnudge/wat-lsp/wasm/wat_lsp_rust_bg.wasm?url";
import { linter, type Diagnostic, lintGutter } from "@codemirror/lint";
import {
  EditorView,
  Decoration,
  type DecorationSet,
  hoverTooltip,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  type CompletionContext,
  type CompletionResult,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import {
  StreamLanguage,
  type StreamParser,
  LanguageSupport,
  syntaxHighlighting,
  HighlightStyle,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";

// ── WAT language mode for syntax highlighting ────────────────────────

const WAT_KEYWORDS = new Set([
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

const WAT_TYPES = new Set([
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

interface WatState {
  inBlockComment: boolean;
}

const watStreamParser: StreamParser<WatState> = {
  startState(): WatState {
    return { inBlockComment: false };
  },

  token(stream, state): string | null {
    // Inside block comment
    if (state.inBlockComment) {
      while (!stream.eol()) {
        if (stream.match(";)")) {
          state.inBlockComment = false;
          return "blockComment";
        }
        stream.next();
      }
      return "blockComment";
    }

    // Whitespace
    if (stream.eatSpace()) return null;

    // Block comment start
    if (stream.match("(;")) {
      state.inBlockComment = true;
      while (!stream.eol()) {
        if (stream.match(";)")) {
          state.inBlockComment = false;
          return "blockComment";
        }
        stream.next();
      }
      return "blockComment";
    }

    // Line comment
    if (stream.match(";;")) {
      stream.skipToEnd();
      return "lineComment";
    }

    // String
    if (stream.eat('"')) {
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '"') break;
        if (ch === "\\") stream.next(); // skip escaped char
      }
      return "string";
    }

    // Parentheses
    if (stream.eat("(") || stream.eat(")")) {
      return "paren";
    }

    // $ identifiers
    if (stream.eat("$")) {
      stream.eatWhile(/[\w.]/);
      return "variableName.definition";
    }

    // Words (keywords, types, instructions)
    if (stream.match(/^[a-zA-Z_][\w.]*/)) {
      const word = stream.current();
      if (WAT_TYPES.has(word)) return "typeName";
      if (WAT_KEYWORDS.has(word)) return "keyword";
      // Instructions with dots like i32.add, local.get
      if (
        /\.(get|set|tee|const|add|sub|mul|div|rem|and|or|xor|shl|shr|rotl|rotr|clz|ctz|popcnt|load|store|eq|ne|lt|gt|le|ge|eqz|wrap|extend|trunc|convert|reinterpret|promote|demote|new|get_s|get_u|fill|copy|grow|size|splat|extract_lane|replace_lane|abs|neg|sqrt|ceil|floor|nearest|min|max|copysign)/.test(
          word,
        )
      ) {
        return "keyword";
      }
      return "name";
    }

    // Numbers (hex, decimal, float)
    if (
      stream.match(/^-?0x[\da-fA-F][_\da-fA-F]*(\.[_\da-fA-F]*)?([pP][+-]?[\d]+)?/) ||
      stream.match(/^-?\d[_\d]*(\.\d[_\d]*)?([eE][+-]?\d+)?/)
    ) {
      return "number";
    }

    // Anything else
    stream.next();
    return null;
  },
};

const watLanguage = StreamLanguage.define(watStreamParser);

function watLanguageSupport() {
  return new LanguageSupport(watLanguage);
}

const initLSP = (() => {
  let cached: Promise<WatLSP> | null = null;
  return () =>
    (cached ??= createWatLSP({
      treeSitterWasmPath: treeSitterWasmUrl,
      watLspWasmPath: watLspWasmUrl,
    }));
})();

function isWatContent(doc: string): boolean {
  const trimmed = doc.trimStart();
  return trimmed.startsWith("(module") || trimmed.startsWith("(;");
}

function posToOffset(
  doc: {
    line(n: number): { from: number; to: number };
    lines: number;
    length: number;
  },
  line: number,
  character: number,
): number {
  const lineNum = Math.min(line + 1, doc.lines);
  const lineObj = doc.line(lineNum);
  return Math.min(lineObj.from + character, lineObj.to, doc.length);
}

const tokenColors = {
  keyword: "#569cd6",
  typeName: "#4ec9b0",
  variableName: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  comment: "#6a9955",
  bracket: "#d4d4d4",
  name: "#dcdcaa",
} as const;

// ── Custom editor theme (matches app dark palette) ───────────────────

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--bg)",
      color: "var(--text)",
    },
    ".cm-content": {
      caretColor: "#f5e0dc",
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      fontSize: "14px",
      lineHeight: "1.6",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#f5e0dc",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#45475a",
    },
    ".cm-panels": {
      backgroundColor: "var(--bg-sidebar)",
      color: "var(--text)",
    },
    ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--border)" },
    ".cm-panels.cm-panels-bottom": { borderTop: "1px solid var(--border)" },
    ".cm-searchMatch": {
      backgroundColor: "#45475a80",
      outline: "1px solid #585b70",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#585b7080",
    },
    ".cm-activeLine": { backgroundColor: "transparent" },
    ".cm-selectionMatch": { backgroundColor: "#45475a80" },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "#585b7080",
    },
    ".cm-gutters": {
      backgroundColor: "var(--bg-sidebar)",
      color: "var(--text-dim)",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--bg-sidebar)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "var(--text-dim)",
    },
    ".cm-tooltip": {
      border: "1px solid var(--border)",
      backgroundColor: "var(--bg)",
      color: "var(--text)",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "var(--bg)",
      borderBottomColor: "var(--bg)",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#45475a",
        color: "var(--text)",
      },
    },
    ".cm-diagnostic-error": { borderLeft: "3px solid var(--red)" },
    ".cm-diagnostic-warning": { borderLeft: "3px solid var(--yellow)" },
    ".cm-diagnostic-info": { borderLeft: "3px solid var(--accent)" },
    ".cm-lint-marker-error": { content: '"!"' },
    ".cm-lint-marker-warning": { content: '"!"' },
  },
  { dark: true },
);

// ── Highlight style using the same tokenColors as hover tooltips ─────

const codeHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: tokenColors.keyword },
  { tag: tags.typeName, color: tokenColors.typeName },
  { tag: tags.definition(tags.variableName), color: tokenColors.variableName },
  { tag: tags.variableName, color: tokenColors.variableName },
  { tag: tags.function(tags.variableName), color: tokenColors.name },
  { tag: tags.propertyName, color: tokenColors.variableName },
  { tag: tags.function(tags.propertyName), color: tokenColors.name },
  { tag: tags.className, color: tokenColors.typeName },
  { tag: tags.bool, color: tokenColors.keyword },
  { tag: tags.null, color: tokenColors.keyword },
  { tag: tags.regexp, color: tokenColors.string },
  { tag: tags.string, color: tokenColors.string },
  { tag: tags.number, color: tokenColors.number },
  { tag: tags.comment, color: tokenColors.comment },
  { tag: tags.lineComment, color: tokenColors.comment },
  { tag: tags.blockComment, color: tokenColors.comment },
  { tag: tags.paren, color: tokenColors.bracket },
  { tag: tags.name, color: tokenColors.name },
  { tag: tags.function(tags.name), color: tokenColors.name },
  { tag: tags.operator, color: tokenColors.bracket },
  { tag: tags.punctuation, color: tokenColors.bracket },
]);

function escapeHtml(s: string): string {
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

function highlightWatCode(code: string): string {
  return code
    .split("\n")
    .map((line) => tokenizeLine(line).map(tokenToHtml).join(""))
    .join("\n");
}

function renderHoverMarkdown(markdown: string): string {
  const withBlocks = markdown.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_: string, lang: string, code: string) => {
      const trimmed = code.trim();
      const highlighted =
        lang === "wat" || lang === "wast" || lang === ""
          ? highlightWatCode(trimmed)
          : escapeHtml(trimmed);
      return `<pre class="wat-hover-code"><code>${highlighted}</code></pre>`;
    },
  );

  const withInline = withBlocks
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^---$/gm, "<hr>");

  return withInline
    .split(/(<pre[\s\S]*?<\/pre>)/)
    .map((part) => (part.startsWith("<pre") ? part : part.replace(/\n/g, "<br>")))
    .join("")
    .replace(/(<br>)+<hr>(<br>)+/g, "<hr>");
}

// ── Reference highlights ─────────────────────────────────────────────

const refHighlightMark = Decoration.mark({ class: "cm-ref-highlight" });

const setRefHighlights = StateEffect.define<DecorationSet>();

const refHighlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decos, tr) {
    const effect = tr.effects.find((e) => e.is(setRefHighlights));
    if (effect) return effect.value;
    return tr.docChanged || tr.selection ? Decoration.none : decos;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ── LSP helpers ──────────────────────────────────────────────────────

/** Parse the document and return cursor position, or null if not WAT content. */
function lspCursorContext(lsp: WatLSP, view: EditorView) {
  const text = view.state.doc.toString();
  if (!isWatContent(text)) return null;

  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);
  lsp.parse(text);
  return {
    doc: view.state.doc,
    lineNum: line.number - 1,
    col: pos - line.from,
  };
}

function goToDefinition(lsp: WatLSP, view: EditorView): boolean {
  try {
    const ctx = lspCursorContext(lsp, view);
    if (!ctx) return false;

    const def = lsp.provideDefinition(ctx.lineNum, ctx.col);
    if (!def) return false;

    const target = posToOffset(ctx.doc, def.range.start.line, def.range.start.character);
    view.dispatch({
      selection: { anchor: target },
      scrollIntoView: true,
    });
    return true;
  } catch {
    return false;
  }
}

function findReferences(lsp: WatLSP, view: EditorView): boolean {
  try {
    const ctx = lspCursorContext(lsp, view);
    if (!ctx) return false;

    const refs = lsp.provideReferences(ctx.lineNum, ctx.col, true);
    if (!refs.length) return false;

    const ranges = refs
      .map((ref) => ({
        from: posToOffset(ctx.doc, ref.range.start.line, ref.range.start.character),
        to: posToOffset(ctx.doc, ref.range.end.line, ref.range.end.character),
      }))
      .sort((a, b) => a.from - b.from);
    view.dispatch({
      effects: setRefHighlights.of(
        Decoration.set(ranges.map((d) => refHighlightMark.range(d.from, d.to))),
      ),
    });
    return true;
  } catch {
    return false;
  }
}

function createParseCache(lsp: WatLSP) {
  let lastText = "";
  return (text: string) => {
    if (text !== lastText) {
      lsp.parse(text);
      lastText = text;
    }
  };
}

function createLspExtensions(lsp: WatLSP) {
  const parseIfNeeded = createParseCache(lsp);

  const watLinter = linter(
    (view) => {
      try {
        const text = view.state.doc.toString();
        if (!isWatContent(text)) return [];

        parseIfNeeded(text);
        const diags = lsp.provideDiagnostics();
        return diags.map(
          (d): Diagnostic => ({
            from: posToOffset(view.state.doc, d.range.start.line, d.range.start.character),
            to: posToOffset(view.state.doc, d.range.end.line, d.range.end.character),
            severity: d.severity === 1 ? "error" : d.severity === 2 ? "warning" : "info",
            message: d.message,
          }),
        );
      } catch {
        return [];
      }
    },
    { delay: 300 },
  );

  const watHover = hoverTooltip((view, pos) => {
    try {
      const text = view.state.doc.toString();
      if (!isWatContent(text)) return null;

      const line = view.state.doc.lineAt(pos);
      parseIfNeeded(text);
      const hover = lsp.provideHover(line.number - 1, pos - line.from);
      if (!hover) return null;

      const from = hover.range
        ? posToOffset(view.state.doc, hover.range.start.line, hover.range.start.character)
        : pos;
      const to = hover.range
        ? posToOffset(view.state.doc, hover.range.end.line, hover.range.end.character)
        : pos;
      return {
        pos: from,
        end: to,
        above: true,
        create() {
          const dom = document.createElement("div");
          dom.className = "wat-hover";
          dom.innerHTML = renderHoverMarkdown(hover.contents.value);
          return { dom };
        },
      };
    } catch {
      return null;
    }
  });

  const watCompletionSource = (ctx: CompletionContext): CompletionResult | null => {
    try {
      const text = ctx.state.doc.toString();
      if (!isWatContent(text)) return null;

      const word = ctx.matchBefore(/[\w$]+/);
      const afterDot = ctx.matchBefore(/\.\w*$/);
      if (!ctx.explicit && !word && !afterDot) return null;

      const line = ctx.state.doc.lineAt(ctx.pos);
      parseIfNeeded(text);
      const items = lsp.provideCompletion(line.number - 1, ctx.pos - line.from);
      if (!items.length) return null;

      const from = word ? word.from : ctx.pos;
      return {
        from,
        options: items.map((item) => ({
          label: item.label,
          apply: item.insertText ?? item.label,
          ...(item.detail != null && { detail: item.detail }),
          ...(item.documentation != null && { info: item.documentation }),
        })),
      };
    } catch {
      return null;
    }
  };

  // Cmd/Ctrl+click for go-to-definition
  const clickGoToDef = EditorView.domEventHandlers({
    mousedown(event, view) {
      if ((event.metaKey || event.ctrlKey) && event.button === 0) {
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos == null) return false;

        view.dispatch({ selection: { anchor: pos } });
        return goToDefinition(lsp, view);
      }
      return false;
    },
  });

  return {
    extensions: [watLinter, lintGutter(), watHover, clickGoToDef, refHighlightField],
    completionSource: watCompletionSource,
    goToDefinition: (view: EditorView) => goToDefinition(lsp, view),
    findReferences: (view: EditorView) => findReferences(lsp, view),
  };
}

export interface WatEditor {
  view: EditorView;
  getValue(): string;
  setValue(code: string): void;
  destroy(): void;
}

import type { Extension } from "@codemirror/state";

const baseExtensions: Extension[] = [
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  history(),
  editorTheme,
  syntaxHighlighting(codeHighlightStyle),
  EditorView.lineWrapping,
];

const baseKeymap = [indentWithTab, ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap];

function buildEditor(
  parent: HTMLElement,
  initialCode: string,
  extra: Extension[],
  onChange?: (code: string) => void,
): WatEditor {
  const extensions: Extension[] = [...baseExtensions, ...extra];
  if (onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString());
      }),
    );
  }
  const view = new EditorView({
    state: EditorState.create({ doc: initialCode, extensions }),
    parent,
  });
  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue(code: string) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
    },
    destroy: () => view.destroy(),
  };
}

export function createJsEditor(
  parent: HTMLElement,
  initialCode: string,
  onChange?: (code: string) => void,
): WatEditor {
  return buildEditor(
    parent,
    initialCode,
    [javascript(), keymap.of(baseKeymap), closeBrackets(), autocompletion()],
    onChange,
  );
}

export async function createEditor(
  parent: HTMLElement,
  initialCode: string,
  onChange?: (code: string) => void,
): Promise<WatEditor> {
  const lsp = await initLSP();
  const lspResult = createLspExtensions(lsp);

  return buildEditor(
    parent,
    initialCode,
    [
      watLanguageSupport(),
      keymap.of([
        { key: "F12", run: (v) => lspResult.goToDefinition(v) },
        { key: "Mod-b", run: (v) => lspResult.goToDefinition(v) },
        { key: "Shift-F12", run: (v) => lspResult.findReferences(v) },
        { key: "Mod-Shift-b", run: (v) => lspResult.findReferences(v) },
        ...baseKeymap,
      ]),
      closeBrackets(),
      autocompletion({ override: [lspResult.completionSource] }),
      ...lspResult.extensions,
    ],
    onChange,
  );
}
