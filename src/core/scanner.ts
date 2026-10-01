import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { glob } from "glob";
import ignoreLib from "ignore";
import fs from "fs";
import path from "path";
import { readFileSafe } from "../utils/fs";
import { logger } from "../utils/logger";
import type { EaiConfig } from "../types/config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single translatable string found in a source file.
 *
 * This is the core data unit that flows through the entire tool:
 *   scanner      → produces ExtractedString[]
 *   scaffolder   → consumes ExtractedString[] to write JSON
 *   transformer  → consumes ExtractedString[] to rewrite source files
 */
export interface ExtractedString {
  /** Absolute path to the source file this string was found in */
  filePath: string;

  /**
   * Namespace derived from the file path relative to the app root.
   * Segments are lowercased, non-alphanumeric chars replaced with underscores,
   * and Expo Router route group parentheses stripped.
   *
   * @example
   *   src/screens/auth/SignIn.tsx  →  auth.signin
   *   src/components/ui/Button.tsx →  components.ui.button
   *   app/(tabs)/HomeScreen.tsx    →  tabs.homescreen
   */
  namespace: string;

  /**
   * The flat i18n key generated from the string content.
   * Already trimmed at word boundaries to fit within maxKeyLength.
   *
   * @example "welcome_back"
   */
  key: string;

  /**
   * The full dotted key as it appears in the locale JSON file.
   * Combines namespace + key.
   *
   * @example "auth.signin.welcome_back"
   */
  fullKey: string;

  /**
   * The raw string as it appears in source code, normalized.
   * For plain strings: the string itself.
   * For template literals: static parts joined with {{placeholders}}.
   *
   * @example "Welcome back"
   * @example "Hello {{firstName}}, you have {{count}} messages"
   */
  originalText: string;

  /**
   * The translation value written into the locale JSON file.
   * Identical to originalText for the default language.
   * Uses react-i18next {{}} interpolation syntax for template literals.
   *
   * @example "Welcome back"
   * @example "Hello {{firstName}}, you have {{count}} messages"
   */
  translationValue: string;

  /**
   * Variable names from template literal interpolations.
   * Empty for plain strings.
   *
   * @example [] for "Hello world"
   * @example ["firstName", "count"] for `Hello ${firstName}, you have ${count} messages`
   */
  params: string[];

  /**
   * The AST node type this string was extracted from.
   * Used by the transformer to know how to rewrite the node.
   *
   * 'jsx-text'       → <Text>Hello</Text>
   * 'jsx-expression' → <Text>{"Hello"}</Text> or <Text>{`Hello`}</Text>
   * 'jsx-attribute'  → <Comp title="Hello" />
   * 'alert'          → Alert.alert('Title', 'Message')
   * 'throw'          → throw new Error('Message')
   * 'call'           → toast.show('Message')
   */
  sourceType:
    | "jsx-text"
    | "jsx-expression"
    | "jsx-attribute"
    | "alert"
    | "throw"
    | "call"
    | "return";

  /**
   * The JSX prop name this string was found in.
   * Only set when sourceType is 'jsx-attribute'.
   *
   * @example "title" | "placeholder" | "accessibilityLabel"
   */
  propName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JSX prop names that carry user-visible text and should be extracted.
 *
 * Conservative by design — only props that are almost certainly
 * shown to the user. Add via customDetectCalls in config as needed.
 */
const TRANSLATABLE_PROP_NAMES = new Set([
  "title",
  "message",
  "placeholder",
  "label",
  "hint",
  "subtitle",
  "description",
  "caption",
  "errorMessage",
  "helperText",
  "emptyText",
  "confirmText",
  "cancelText",
  "buttonText",
  "header",
  "footer",
  "tooltip",
  "accessibilityLabel",
  "accessibilityHint",
]);

/**
 * Props that are definitively NOT user-visible text.
 * Checked before TRANSLATABLE_PROP_NAMES — takes priority.
 */
const NON_TRANSLATABLE_PROP_NAMES = new Set([
  "className",
  "style",
  "testID",
  "name",
  "key",
  "id",
  "type",
  "variant",
  "size",
  "color",
  "icon",
  "source",
  "href",
  "to",
  "from",
  "currency",
  "format",
]);

/**
 * Directories always excluded from scanning.
 * These never contain user-facing source code in an Expo project.
 */
const HARD_EXCLUDED_DIRS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.expo/**",
  "**/android/**",
  "**/ios/**",
  "**/.git/**",
];

// ─────────────────────────────────────────────────────────────────────────────
// Key generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a file path (relative to app root, without extension) into
 * a dot-separated namespace string.
 *
 * Steps:
 *   1. Normalize Windows backslashes to forward slashes
 *   2. Strip leading src/ or app/ prefix (common in Expo projects)
 *   3. Strip leading screens/ to keep keys shorter
 *   4. Strip Expo Router route group parentheses: (tabs) → tabs
 *   5. Lowercase each segment
 *   6. Replace non-alphanumeric characters with underscores
 *   7. Join segments with dots
 *
 * @example
 *   "src/screens/auth/SignIn"     → "auth.signin"
 *   "src/components/ui/Button"    → "components.ui.button"
 *   "app/(tabs)/HomeScreen"       → "tabs.homescreen"
 */
function buildNamespace(relativePathWithoutExt: string): string {
  return relativePathWithoutExt
    .replace(/\\/g, "/")
    .replace(/^src\//, "")
    .replace(/^app\//, "")
    .replace(/^screens\//, "")
    .split("/")
    .map((segment) =>
      segment
        .replace(/^\((.+)\)$/, "$1") // strip Expo Router route group parens
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, ""),
    )
    .filter(Boolean)
    .join(".");
}

/**
 * Converts a string value into a valid i18n key segment.
 *
 * @example
 *   "Hello World!"         → "hello_world"
 *   "Loading..."           → "loading"
 *   "Welcome {{name}}"     → "welcome_name"
 */
function toKeySegment(text: string): string {
  return text
    .toLowerCase()
    .replace(/\{\{.*?\}\}/g, "") // remove {{placeholder}} before keying
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Builds the full translation key for a string.
 *
 * Format: <namespace>.<string-key>
 *
 * The string portion is trimmed at the last complete word boundary
 * to fit within maxKeyLength. Never cuts mid-word.
 *
 * @example
 *   namespace:    "auth.signin"
 *   text:         "Please enter your email address"
 *   maxKeyLength: 40
 *   result:       "auth.signin.please_enter_your_email"
 */
function buildFullKey(
  namespace: string,
  text: string,
  maxKeyLength: number,
): { key: string; fullKey: string } {
  const rawSegment = toKeySegment(text);
  const available = maxKeyLength - namespace.length - 1;

  let trimmedSegment: string;

  if (rawSegment.length <= available) {
    trimmedSegment = rawSegment;
  } else {
    const substring = rawSegment.substring(0, available);
    const lastUnderscore = substring.lastIndexOf("_");

    trimmedSegment =
      lastUnderscore > 5 ? substring.substring(0, lastUnderscore) : substring;
  }

  return {
    key: trimmedSegment,
    fullKey: `${namespace}.${trimmedSegment}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Whitespace normalization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes JSXText whitespace to match React Native's rendering behaviour.
 *
 * JSXText nodes often span multiple source lines with indentation:
 *   "\n    shake device or press\n    "
 *
 * React collapses this to "shake device or press" at render time.
 * We must do the same when storing the translation value — otherwise
 * the locale file contains literal \n characters that React Native
 * renders as actual line breaks, breaking the layout.
 *
 * Algorithm:
 *   1. Split on newlines
 *   2. Trim each line
 *   3. Drop empty lines
 *   4. Join with a single space
 *
 * @example
 *   "\n    Hello world\n    " → "Hello world"
 *   "shake device or press\n    " → "shake device or press"
 */
export function normalizeJSXWhitespace(value: string): string {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Extractability checks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if a string is worth extracting as a translation.
 *
 * Skips:
 *   - Empty strings or pure whitespace
 *   - Single characters (icons, separators)
 *   - Pure numbers
 *   - URLs
 *   - Code identifiers and slugs (cash_in, MY_CONSTANT, kebab-case)
 *   - CSS utility class strings (Tailwind/NativeWind)
 */
function isExtractable(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length < 2) return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;
  if (/^https?:\/\//.test(trimmed)) return false;

  // Looks like a code identifier, slug, or constant — no spaces
  if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(trimmed) && !trimmed.includes(" ")) {
    if (trimmed.includes("_") || trimmed.includes("-")) return false;
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) return false;
  }

  if (isCssClassString(trimmed)) return false;

  return true;
}

/**
 * Stricter check for strings found in return statements.
 * JSX / Alert / throw already have high signal; returns do not.
 */
function isLikelyUiCopy(value: string): boolean {
  const trimmed = value.trim();

  // Must still pass the general rules
  if (!isExtractable(trimmed)) return false;

  // Single token with no spaces → usually a code value ("light", "pending")
  // Allow a small set of real UI labels
  if (!/\s/.test(trimmed)) {
    const UI_SINGLE_WORDS = new Set([
      "submit",
      "cancel",
      "confirm",
      "delete",
      "save",
      "close",
      "continue",
      "back",
      "next",
      "done",
      "ok",
      "yes",
      "no",
      "loading",
      "error",
      "success",
      "retry",
      "search",
    ]);
    if (!UI_SINGLE_WORDS.has(trimmed.toLowerCase())) {
      return false;
    }
  }

  // Known technical tokens (extend as needed)
  const TECHNICAL = new Set([
    "light",
    "dark",
    "system",
    "auto",
    "pending",
    "completed",
    "failed",
    "active",
    "inactive",
    "credit",
    "debit",
    "row",
    "column",
    "center",
    "left",
    "right",
  ]);
  if (TECHNICAL.has(trimmed.toLowerCase())) return false;

  return true;
}

/** true if every interpolation is a simple identifier: ${name} */
function templateHasOnlyIdentifierExpressions(
  node: t.TemplateLiteral,
): boolean {
  return node.expressions.every((expr) => t.isIdentifier(expr));
}

/**
 * Heuristic to detect NativeWind/Tailwind className strings.
 *
 * If more than half of the space-separated tokens match CSS utility
 * class patterns, the whole string is treated as a class string.
 *
 * @example
 *   "flex-row items-center justify-between" → true  (skip)
 *   "Add New Group"                         → false (keep)
 */
function isCssClassString(value: string): boolean {
  const tokens = value.trim().split(/\s+/);
  if (tokens.length < 2) return false;

  const cssPattern =
    /^[a-z]{1,4}(-[a-z0-9.[\]/]+)+$|^(flex|hidden|block|grid|p|m|w|h|gap|text|font|bg|border|rounded|shadow|items|justify|overflow|absolute|relative|fixed|inset|z|opacity|ring|cursor|pointer|animate|transition|duration|ease|scale|rotate|translate|aspect|container|sr)(-.*)?$/;

  const cssLikeCount = tokens.filter((tk) => cssPattern.test(tk)).length;
  return cssLikeCount / tokens.length > 0.5;
}

/**
 * Returns true if a JSX expression container is a direct child of a
 * JSX element (between tags), not inside a prop value.
 *
 * This is the guard that prevents className={`flex-row`} from being
 * extracted — even though it is also a JSXExpressionContainer.
 *
 * <Text className={`flex`}>Hello</Text>
 *                ↑ parent is JSXAttribute → skip
 *                           ↑ parent is JSXElement → extract
 */
function isInsideJSXContent(nodePath: any): boolean {
  const parent = nodePath.parent;
  return t.isJSXElement(parent) || t.isJSXFragment(parent);
}

// ─────────────────────────────────────────────────────────────────────────────
// Template literal processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Processes a TemplateLiteral AST node into a display string and param list.
 *
 * Template literal structure:
 *   `Hello ${firstName}, you have ${count} messages`
 *   quasis:      ["Hello ", ", you have ", " messages"]
 *   expressions: [firstName, count]
 *
 * Output:
 *   text:   "Hello {{firstName}}, you have {{count}} messages"
 *   params: ["firstName", "count"]
 *
 * Complex expressions (ternaries, calls) use positional names: arg0, arg1
 */
function processTemplateLiteral(node: t.TemplateLiteral): {
  text: string;
  params: string[];
} {
  let text = "";
  const params: string[] = [];
  let argIndex = 0;

  node.quasis.forEach((quasi, i) => {
    text += quasi.value.cooked ?? quasi.value.raw;

    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      let paramName: string;

      if (t.isIdentifier(expr)) {
        paramName = expr.name;
      } else if (t.isMemberExpression(expr) && t.isIdentifier(expr.property)) {
        paramName = expr.property.name;
      } else {
        paramName = `arg${argIndex++}`;
      }

      params.push(paramName);
      text += `{{${paramName}}}`;
    }
  });

  return { text, params };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recursive expression extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively extracts all translatable strings from any AST expression.
 *
 * Handles arbitrary nesting depth:
 *
 *   {isLoading ? "Loading..." : `Active: ${count} items`}
 *    ↑ ConditionalExpression
 *      ↑ consequent: StringLiteral   → extracted
 *      ↑ alternate:  TemplateLiteral → extracted
 *
 *   {flag && "Please sign in"}
 *    ↑ LogicalExpression
 *      ↑ right: StringLiteral        → extracted
 *
 * Results are pushed into the shared `results` array.
 */
function extractFromExpression(
  expr: t.Expression | t.JSXEmptyExpression | null | undefined,
  results: ExtractedString[],
  namespace: string,
  filePath: string,
  maxKeyLen: number,
  sourceType: ExtractedString["sourceType"],
  strictUiCopy = false,
): void {
  if (!expr || t.isJSXEmptyExpression(expr)) return;

  const passes = (value: string) =>
    strictUiCopy ? isLikelyUiCopy(value) : isExtractable(value);

  // ── String literal ─────────────────────────────────────────────────────────
  if (t.isStringLiteral(expr)) {
    if (!passes(expr.value)) return; // ← was isExtractable(expr.value)
    const { key, fullKey } = buildFullKey(namespace, expr.value, maxKeyLen);

    results.push({
      filePath,
      namespace,
      key,
      fullKey,
      originalText: expr.value,
      translationValue: expr.value,
      params: [],
      sourceType,
    });
    return;
  }

  // ── Template literal ───────────────────────────────────────────────────────
  if (t.isTemplateLiteral(expr)) {
    if (templateHasOnlyIdentifierExpressions(expr)) {
      const { text, params } = processTemplateLiteral(expr);
      if (!isExtractable(text)) return;

      const { key, fullKey } = buildFullKey(namespace, text, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: text,
        translationValue: text,
        params,
        sourceType,
      });
      return;
    }

    // e.g. `${sign}$${abs} ${type === "credit" ? "received" : "sent"}`
    for (const subExpr of expr.expressions) {
      extractFromExpression(
        subExpr as t.Expression,
        results,
        namespace,
        filePath,
        maxKeyLen,
        sourceType,
      );
    }
    return;
  }

  // ── Ternary (conditional expression) ──────────────────────────────────────
  // condition ? "yes string" : "no string"
  if (t.isConditionalExpression(expr)) {
    // We recurse into both branches but NOT the condition
    // (the condition is logic, not user-visible text)
    extractFromExpression(
      expr.consequent,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy,
    );
    extractFromExpression(
      expr.alternate,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy,
    );
    return;
  }

  // ── Logical expression (&&, ||, ??) ───────────────────────────────────────
  // flag && "Show this"
  // value || "Default text"
  if (t.isLogicalExpression(expr)) {
    extractFromExpression(
      expr.left,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy,
    );
    extractFromExpression(
      expr.right,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy,
    );
    return;
  }

  // Other expression types (identifiers, member access, function calls, etc.)
  // are not translatable strings on their own — stop recursing.
}

/**
 * Walks the 3rd argument of Alert.alert (buttons array) and extracts
 * every `text` property that holds user-visible copy.
 *
 * Handles:
 *   [{ text: "Cancel" }, { text: "OK" }]
 *   [{ text: condition ? "Yes" : "No" }]
 *
 * Ignores:
 *   style, onPress, spreads, non-object elements
 */
function extractAlertButtonTexts(
  buttonsArg: t.Node,
  results: ExtractedString[],
  namespace: string,
  filePath: string,
  maxKeyLen: number,
): void {
  if (!t.isArrayExpression(buttonsArg)) return;

  for (const element of buttonsArg.elements) {
    if (!element || !t.isObjectExpression(element)) continue;

    for (const prop of element.properties) {
      // Skip spreads: { ...btn }
      if (!t.isObjectProperty(prop) && !t.isProperty(prop)) continue;

      const key = prop.key;
      const propName = t.isIdentifier(key)
        ? key.name
        : t.isStringLiteral(key)
          ? key.value
          : null;

      if (propName !== "text") continue;
      if (prop.computed) continue; // text: dynamicKey — skip

      extractFromExpression(
        prop.value as t.Expression,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "alert",
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Call expression helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the callee name from a CallExpression as a dotted string.
 *
 * @example
 *   Alert.alert(...)  → "Alert.alert"
 *   toast.show(...)   → "toast.show"
 *   setError(...)     → "setError"
 */
function getCalleeName(node: t.CallExpression): string | null {
  const { callee } = node;

  if (t.isIdentifier(callee)) return callee.name;

  if (
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.object) &&
    t.isIdentifier(callee.property)
  ) {
    return `${callee.object.name}.${callee.property.name}`;
  }

  return null;
}

/**
 * Extracts translatable strings from function call arguments.
 *
 * Delegates each argument to extractFromExpression so that ternaries,
 * template literals, and logical expressions inside Alert.alert() and
 * custom calls are also extracted — not just plain string literals.
 *
 * @example
 *   Alert.alert(
 *     isEnabled ? "Disable" : "Enable",   ← extracted (ternary)
 *     "Are you sure you want to continue?" ← extracted (string)
 *   )
 */
function extractStringArgs(
  args: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
  results: ExtractedString[],
  namespace: string,
  filePath: string,
  maxKeyLen: number,
  sourceType: ExtractedString["sourceType"],
): void {
  for (const arg of args) {
    if (t.isSpreadElement(arg)) continue;
    if (!t.isExpression(arg)) continue;

    extractFromExpression(
      arg,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// File-level extractor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a single source file and extracts all translatable strings.
 *
 * Why AST instead of regex?
 *   Regex breaks on nested quotes, multiline strings, and comments.
 *   AST parsing understands code structure — we know exactly what kind
 *   of node we're looking at and what its parent is.
 *
 * Babel plugins enabled:
 *   jsx              — JSX syntax
 *   typescript       — TypeScript types (stripped during parsing)
 *   decorators-legacy — @decorator syntax
 *   classProperties  — class field syntax
 *   optionalChaining — a?.b syntax
 *   nullishCoalescingOperator — a ?? b syntax
 *
 * @param filePath - Absolute path to the source file
 * @param appRoot  - Absolute path to the app root (for namespace generation)
 * @param config   - The loaded eai config
 */
export function extractStringsFromFile(
  filePath: string,
  appRoot: string,
  config: EaiConfig,
): ExtractedString[] {
  const code = readFileSafe(filePath);
  if (!code) return [];

  const relativeWithoutExt = path
    .relative(appRoot, filePath)
    .replace(/\\/g, "/")
    .replace(/\.[^/.]+$/, "");

  const namespace = buildNamespace(relativeWithoutExt);

  logger.debug(
    `Parsing: ${path.relative(appRoot, filePath)} → namespace: "${namespace}"`,
  );

  let ast: ReturnType<typeof parser.parse>;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
        "optionalChaining",
        "nullishCoalescingOperator",
      ],
    });
  } catch (err) {
    logger.warn(
      `  Could not parse ${path.relative(appRoot, filePath)} — skipping`,
    );
    logger.debug(String(err));
    return [];
  }

  const results: ExtractedString[] = [];
  const maxKeyLen = config.maxKeyLength;
  const customCallPatterns = new Set(config.customDetectCalls);

  traverse(ast, {
    // ── 1. Plain JSX text ────────────────────────────────────────────────────
    // <Text>Hello world</Text>
    JSXText(nodePath) {
      const normalized = normalizeJSXWhitespace(nodePath.node.value);
      if (!isExtractable(normalized)) return;

      const { key, fullKey } = buildFullKey(namespace, normalized, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: normalized,
        translationValue: normalized,
        params: [],
        sourceType: "jsx-text",
      });
    },

    // ── 2. JSX expression containers ────────────────────────────────────────
    // <Text>{"Hello"}</Text>
    // <Text>{isLoading ? "Wait" : "Go"}</Text>
    // <Text>{`Hello ${name}`}</Text>
    //
    // The isInsideJSXContent guard prevents className={`flex`} from matching.
    JSXExpressionContainer(nodePath) {
      if (!isInsideJSXContent(nodePath)) return;

      extractFromExpression(
        nodePath.node.expression,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "jsx-expression",
      );
    },

    // ── 3. Translatable JSX props ────────────────────────────────────────────
    // <Button title="Submit" />
    // <Input placeholder="Enter email" accessibilityLabel="Email field" />
    JSXAttribute(nodePath) {
      const { name, value } = nodePath.node;

      const propName = t.isJSXIdentifier(name) ? name.name : null;
      if (!propName) return;
      if (NON_TRANSLATABLE_PROP_NAMES.has(propName)) return;
      if (!TRANSLATABLE_PROP_NAMES.has(propName)) return;
      if (!t.isStringLiteral(value)) return;
      if (!isExtractable(value.value)) return;

      const { key, fullKey } = buildFullKey(namespace, value.value, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: value.value,
        translationValue: value.value,
        params: [],
        sourceType: "jsx-attribute",
        propName,
      });
    },

    // ── 4. Alert.alert() and custom call patterns ─────────────────────────────
    //
    // Alert.alert('Title', 'Message')
    // Alert.alert(enabled ? 'Disable' : 'Enable', 'Are you sure?', [
    //   { text: 'Cancel', style: 'cancel' },
    //   { text: 'OK' },
    // ])
    // toast.show('Saved successfully')  // via customDetectCalls
    //
    CallExpression(nodePath) {
      if (!config.detectAlerts && customCallPatterns.size === 0) return;

      const calleeName = getCalleeName(nodePath.node);
      if (!calleeName) return;

      // ── Alert.alert ─────────────────────────────────────────────────────────
      if (config.detectAlerts && calleeName === "Alert.alert") {
        const args = nodePath.node.arguments;

        // Title (0) and message (1): literals, templates, ternaries, logicals
        for (let i = 0; i < Math.min(args.length, 2); i++) {
          const arg = args[i];
          if (!arg || arg.type === "SpreadElement") continue;

          extractFromExpression(
            arg as t.Expression,
            results,
            namespace,
            filePath,
            maxKeyLen,
            "alert",
          );
        }

        // Buttons array (2): [{ text: "Cancel" }, ...]
        if (args.length >= 3) {
          extractAlertButtonTexts(
            args[2],
            results,
            namespace,
            filePath,
            maxKeyLen,
          );
        }
        return;
      }

      // ── customDetectCalls (toast.show, setError, …) ─────────────────────────
      // Top-level string literal args only (same as before)
      if (customCallPatterns.has(calleeName)) {
        extractStringArgs(
          nodePath.node.arguments,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "call",
        );
      }
    },
    
    // ── 5. Throw statements ──────────────────────────────────────────────────
    // throw new Error('Failed to save item')
    // throw new Error(condition ? 'Error A' : 'Error B')
    ThrowStatement(nodePath) {
      if (!config.detectThrows) return;

      const { argument } = nodePath.node;

      // throw new Error('message')
      if (
        t.isNewExpression(argument) &&
        t.isIdentifier(argument.callee) &&
        argument.callee.name === "Error"
      ) {
        extractStringArgs(
          argument.arguments,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "throw",
        );
        return;
      }

      // throw 'message' (uncommon but valid)
      if (t.isStringLiteral(argument) && isExtractable(argument.value)) {
        const { key, fullKey } = buildFullKey(
          namespace,
          argument.value,
          maxKeyLen,
        );
        results.push({
          filePath,
          namespace,
          key,
          fullKey,
          originalText: argument.value,
          translationValue: argument.value,
          params: [],
          sourceType: "throw",
        });
      }
    },

    // ── 5. Return statements ──────────────────────────────────────────────────
    ReturnStatement(nodePath) {
      extractFromExpression(
        nodePath.node.argument as t.Expression,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "return", // or a new sourceType e.g. "return"
        true, // ← strictUiCopy
      );
    },
  });

  logger.debug(
    `  Found ${results.length} string(s) in ${path.relative(appRoot, filePath)}`,
  );

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Project-level scanner
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans an entire Expo project and returns all translatable strings.
 *
 * File discovery uses three layers of exclusion:
 *   1. HARD_EXCLUDED_DIRS — always excluded (node_modules, android, ios, etc.)
 *   2. config.exclude    — user-specified glob patterns
 *   3. .gitignore rules  — respects the project's git exclusions
 *
 * No deduplication — the same string in two files gets two separate entries
 * with different namespaces. Each occurrence needs its own key so the
 * transformer can replace each one independently.
 *
 * @param appRoot - Absolute path to the root of the Expo project
 * @param config  - The loaded eai config
 */
export async function scanProject(
  appRoot: string,
  config: EaiConfig,
): Promise<ExtractedString[]> {
  // ── Discover files ─────────────────────────────────────────────────────────
  const files = await glob("**/*.{ts,tsx,js,jsx}", {
    cwd: appRoot,
    absolute: true,
    ignore: [...HARD_EXCLUDED_DIRS, ...config.exclude],
  });

  // ── Apply .gitignore rules ─────────────────────────────────────────────────
  const ig = ignoreLib();
  const gitignorePath = path.join(appRoot, ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    ig.add(fs.readFileSync(gitignorePath, "utf-8"));
    logger.debug("Loaded .gitignore rules");
  }

  const filteredFiles = files.filter((file) => {
    const rel = path.relative(appRoot, file).replace(/\\/g, "/");
    return !ig.ignores(rel);
  });

  logger.debug(
    `Files after .gitignore: ${filteredFiles.length} / ${files.length}`,
  );
  logger.dim(`  Found ${filteredFiles.length} source files to scan.`);

  // ── Extract strings ────────────────────────────────────────────────────────
  const allStrings: ExtractedString[] = [];
  let filesWithStrings = 0;

  for (const file of filteredFiles) {
    const found = extractStringsFromFile(file, appRoot, config);

    if (found.length > 0) {
      filesWithStrings++;
      logger.dim(
        `  ✓ ${path.relative(appRoot, file)} → ${found.length} string(s)`,
      );
      allStrings.push(...found);
    }
  }

  logger.dim(
    `\n  Scanned: ${filteredFiles.length} files | ` +
      `With strings: ${filesWithStrings} | ` +
      `Empty: ${filteredFiles.length - filesWithStrings}`,
  );

  return allStrings;
}
