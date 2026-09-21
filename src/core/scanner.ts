import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { glob } from "glob";
import ignoreLib from "ignore";
import fs from "fs";
import path from "path";
import { readFileSafe } from "../utils/fs";
import { logger } from "../utils/logger";
import type { RaiConfig } from "../types/config";
import { normalizeJSXWhitespace } from "../utils/normalize";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single translatable string found in a source file.
 *
 * This is the core data unit that flows through the entire tool:
 *   scanner   → produces ExtractedString[]
 *   scaffolder → consumes ExtractedString[] to write JSON
 *   transformer → consumes ExtractedString[] to rewrite source files
 */
export interface ExtractedString {
  /**
   * Absolute path to the source file this string was found in.
   * Used by the transformer to know which file to rewrite.
   */
  filePath: string;

  /**
   * File path relative to the app root, without extension.
   * Segments are lowercased and non-alphanumeric chars replaced with underscores.
   * Route group parens are stripped.
   *
   * Used to build the namespace prefix of the translation key.
   *
   * @example
   *   src/screens/auth/SignIn.tsx  →  auth.signin
   *   src/components/ui/Button.tsx →  components.ui.button
   */
  namespace: string;

  /**
   * The flat i18n key generated from the string content.
   * Already capped to fit within maxKeyLength when combined with namespace.
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
   * The raw string as it appears in source code.
   * For plain strings: the string itself.
   * For template literals: the static parts joined with {{placeholders}}.
   *
   * @example "Welcome back"
   * @example "Hello {{firstName}}, you have {{count}} messages"
   */
  originalText: string;

  /**
   * The translation value to write into the locale JSON file.
   * For plain strings: same as originalText.
   * For template literals: originalText with {{param}} placeholders
   * using the react-i18next interpolation syntax.
   *
   * @example "Welcome back"
   * @example "Hello {{firstName}}, you have {{count}} messages"
   */
  translationValue: string;

  /**
   * Variable names extracted from template literal interpolations.
   * Empty for plain strings.
   *
   * @example [] for "Hello world"
   * @example ["firstName", "count"] for `Hello ${firstName}, you have ${count} messages`
   */
  params: string[];

  /**
   * The type of AST node this string was found in.
   * Used by the transformer to know how to rewrite the node correctly.
   *
   * 'jsx-text'        → <Text>Hello</Text>
   * 'jsx-expression'  → <Text>{"Hello"}</Text> or <Text>{`Hello`}</Text>
   * 'jsx-attribute'   → <Comp title="Hello" />
   * 'alert'           → Alert.alert('Title', 'Message')
   * 'throw'           → throw new Error('Message')
   * 'call'            → toast.show('Message')
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
   * The name of the JSX prop this string was found in.
   * Only set when sourceType is 'jsx-attribute'.
   *
   * @example "title", "message", "placeholder"
   */
  propName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * JSX prop names that carry user-visible text and should be extracted.
 *
 * Conservative by design — only props that are almost certainly
 * shown to users. Add more as your codebase needs them via customDetectCalls.
 *
 * Props NOT in this list are ignored even if they contain strings,
 * which prevents false positives like name="calendar" or type="button".
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
 * Props that are definitely NOT user-visible text.
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
 * Directories always excluded from scanning regardless of config.
 * These never contain user-facing source code.
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
 *   2. Strip leading src/ or app/ prefix (common in RN/Expo projects)
 *   3. Strip leading screens/ to keep keys shorter
 *      (screens.auth.signin → auth.signin)
 *   4. Strip Expo Router route group parentheses: (tabs) → tabs
 *   5. Lowercase each segment
 *   6. Replace non-alphanumeric characters with underscores
 *   7. Join segments with dots
 *
 * @example
 *   "src/screens/auth/SignIn"     → "auth.signin"
 *   "src/components/ui/Button"    → "components.ui.button"
 *   "app/(tabs)/HomeScreen"       → "tabs.homescreen"
 *   "src/screens/Home/index"      → "home.index"
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
        // Strip Expo Router route group parens: (tabs) → tabs
        .replace(/^\((.+)\)$/, "$1")
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
 * Steps:
 *   1. Lowercase
 *   2. Replace non-alphanumeric characters with underscores
 *   3. Trim leading/trailing underscores
 *
 * @example
 *   "Hello World!"         → "hello_world"
 *   "Loading..."           → "loading"
 *   "  Sign in to continue " → "sign_in_to_continue"
 *   "Welcome {{name}}"     → "welcome_name"  (placeholders stripped)
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
 * The string portion is trimmed to fit within maxKeyLength.
 * Trimming always happens at a word boundary (underscore) so keys
 * are never cut mid-word.
 *
 * @example
 *   namespace:    "auth.signin"
 *   text:         "Please enter your email address to reset your password"
 *   maxKeyLength: 40
 *
 *   raw segment:  "please_enter_your_email_address_to_reset_your_password"
 *   available:    40 - 11 (namespace) - 1 (dot) = 28 chars
 *   trimmed:      "please_enter_your_email_address" → last _ before 28 = "please_enter_your_email"
 *   fullKey:      "auth.signin.please_enter_your_email"  ✓
 */
function buildFullKey(
  namespace: string,
  text: string,
  maxKeyLength: number,
): { key: string; fullKey: string } {
  const rawSegment = toKeySegment(text);

  /**
   * How many characters can the string portion use?
   * Total budget minus namespace length minus 1 for the separating dot.
   */
  const available = maxKeyLength - namespace.length - 1;

  let trimmedSegment: string;

  if (rawSegment.length <= available) {
    /**
     * The key fits within the limit — use it as-is.
     * This is the common case for short strings.
     */
    trimmedSegment = rawSegment;
  } else {
    /**
     * The key exceeds the limit — trim at the last complete word.
     *
     * Strategy:
     *   1. Take the substring up to the available character limit
     *   2. Find the last underscore within that substring
     *   3. Cut there so we don't end mid-word
     *
     * Example:
     *   rawSegment: "please_enter_your_email_address_to_reset"
     *   available:  28
     *   substring:  "please_enter_your_email_addr"
     *                                        ↑ last underscore at position 23
     *   trimmed:    "please_enter_your_email"   ✓ clean word boundary
     */
    const substring = rawSegment.substring(0, available);
    const lastUnderscore = substring.lastIndexOf("_");

    if (lastUnderscore > 5) {
      /**
       * Found a word boundary far enough in — cut there.
       * The > 5 guard prevents cutting too early on a key like
       * "a_very_long..." where the first underscore is at position 1.
       */
      trimmedSegment = substring.substring(0, lastUnderscore);
    } else {
      /**
       * No good word boundary found — this happens when a single word
       * is longer than the available budget (very rare).
       * Fall back to hard-trimming at the limit.
       */
      trimmedSegment = substring;
    }
  }

  const fullKey = `${namespace}.${trimmedSegment}`;

  return { key: trimmedSegment, fullKey };
}

// ─────────────────────────────────────────────────────────────────────────────
// Extractability checks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the string value is worth extracting as a translation.
 *
 * Skips:
 *   - Empty strings or pure whitespace
 *   - Single characters (icons, separators, punctuation)
 *   - Pure numbers ("42", "3.14")
 *   - Strings that look like CSS utility classes
 *   - Strings that look like code identifiers or slugs
 *   - URL strings
 */
function isExtractable(value: string): boolean {
  const trimmed = value.trim();

  // Too short to be meaningful text
  if (trimmed.length < 2) return false;

  // Pure number
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;

  // URL
  if (/^https?:\/\//.test(trimmed)) return false;

  // Looks like a code identifier, slug, or constant
  // e.g. "cash_in", "SOME_CONSTANT", "kebab-case-slug"
  if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(trimmed) && !trimmed.includes(" ")) {
    // Allow short words that are likely real words like "Submit", "Cancel"
    // but reject things like "cash_in", "MY_CONSTANT"
    if (trimmed.includes("_") || trimmed.includes("-")) return false;
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) return false;
  }

  // CSS utility class string (Tailwind/NativeWind)
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
 * Heuristic to detect Tailwind/NativeWind className strings.
 *
 * A string is treated as a CSS class string if more than half of its
 * space-separated tokens match the pattern of CSS utility classes.
 *
 * This covers strings like:
 *   "flex-row items-center justify-between"  → skip
 *   "text-white font-semibold text-lg"       → skip
 *   "Add New Group"                          → keep (real text)
 */
function isCssClassString(value: string): boolean {
  const tokens = value.trim().split(/\s+/);

  // Single token can't be a class string (would be caught by identifier check)
  if (tokens.length < 2) return false;

  const cssPattern =
    /^[a-z]{1,4}(-[a-z0-9.[\]/]+)+$|^(flex|hidden|block|grid|p|m|w|h|gap|text|font|bg|border|rounded|shadow|items|justify|overflow|absolute|relative|fixed|inset|z|opacity|ring|cursor|pointer|animate|transition|duration|ease|scale|rotate|translate|aspect|container|sr)(-.*)?$/;

  const cssLikeCount = tokens.filter((tk) => cssPattern.test(tk)).length;
  return cssLikeCount / tokens.length > 0.5;
}

/**
 * Determines whether a JSX expression container is inside JSX content
 * (between opening and closing tags) vs inside a JSX prop value.
 *
 * This is the critical guard that prevents className={`flex-row`} from
 * being extracted — even though it's also a JSXExpressionContainer.
 *
 * How it works:
 *   <Text className={`flex`}>Hello</Text>
 *                   ↑ parent is JSXAttribute → skip
 *                              ↑ parent is JSXElement → extract
 */
function isInsideJSXContent(nodePath: any): boolean {
  const parent = nodePath.parent;
  return t.isJSXElement(parent) || t.isJSXFragment(parent);
}

// ─────────────────────────────────────────────────────────────────────────────
// Template literal handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Processes a template literal node and returns the display text
 * (with {{param}} placeholders) and the list of param names.
 *
 * Template literal AST structure:
 *   `Hello ${firstName}, you have ${count} messages`
 *
 *   quasis (static parts):  ["Hello ", ", you have ", " messages"]
 *   expressions (dynamic):  [firstName, count]
 *
 * We interleave them: static[0] + {{expr[0]}} + static[1] + {{expr[1]}} + static[2]
 *
 * Result:
 *   text:   "Hello {{firstName}}, you have {{count}} messages"
 *   params: ["firstName", "count"]
 *
 * For complex expressions (ternaries, function calls) that have no name,
 * we use positional names: arg0, arg1, arg2...
 *
 * @param node - A TemplateLiteral AST node
 */
function processTemplateLiteral(node: t.TemplateLiteral): {
  text: string;
  params: string[];
} {
  let text = "";
  const params: string[] = [];
  let argIndex = 0;

  node.quasis.forEach((quasi, i) => {
    // Add the static part of this quasi
    text += quasi.value.cooked ?? quasi.value.raw;

    // If there's a corresponding expression after this quasi, add its placeholder
    if (i < node.expressions.length) {
      const expr = node.expressions[i];

      let paramName: string;

      if (t.isIdentifier(expr)) {
        // Simple variable: ${name} → name
        paramName = expr.name;
      } else if (t.isMemberExpression(expr) && t.isIdentifier(expr.property)) {
        // Member access: ${user.name} → name
        paramName = expr.property.name;
      } else {
        // Complex expression: ${count > 1 ? 'items' : 'item'} → arg0
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
 * This function handles arbitrary nesting depth, which is necessary for
 * patterns like:
 *
 *   {isLoading ? "Loading..." : `Active: ${count} items`}
 *    ↑ ConditionalExpression
 *      ↑ consequent: StringLiteral      → extracted
 *      ↑ alternate:  TemplateLiteral    → extracted
 *
 *   {flag && "Please sign in"}
 *    ↑ LogicalExpression
 *      ↑ right: StringLiteral           → extracted
 *
 *   {a ? b ? "deep" : "also deep" : "shallow"}
 *    ↑ Nested ConditionalExpressions   → all extracted
 *
 * Results are pushed into the `results` array rather than returned,
 * because this function calls itself recursively and accumulating
 * into a shared array is simpler than merging return values.
 *
 * @param expr       - The expression node to inspect
 * @param results    - Array to push found strings into
 * @param namespace  - Namespace string for key generation
 * @param filePath   - Source file path for the result object
 * @param maxKeyLen  - Maximum key length from config
 * @param sourceType - What kind of node triggered this extraction
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
 * Extracts the callee name from a CallExpression node as a dotted string.
 *
 * Examples:
 *   Alert.alert(...)     → "Alert.alert"
 *   toast.show(...)      → "toast.show"
 *   setError(...)        → "setError"
 *   this.setState(...)   → null (not a pattern we match)
 */
function getCalleeName(node: t.CallExpression): string | null {
  const { callee } = node;

  if (t.isIdentifier(callee)) {
    return callee.name;
  }

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
 * Extracts string arguments from a function call node.
 * Only processes arguments that are string literals — skips variables,
 * expressions, and non-string arguments.
 *
 * Alert.alert('Title', 'Message', [...buttons])
 *              ↑        ↑          ↑ skipped (not a string)
 *
 * @param args      - The arguments array from a CallExpression
 * @param results   - Array to push found strings into
 * @param namespace - Namespace for key generation
 * @param filePath  - Source file path
 * @param maxKeyLen - Maximum key length
 * @param sourceType - 'alert' | 'call'
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
    if (t.isStringLiteral(arg) && isExtractable(arg.value)) {
      const { key, fullKey } = buildFullKey(namespace, arg.value, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: arg.value,
        translationValue: arg.value,
        params: [],
        sourceType,
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// File-level extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a single source file and extracts all translatable strings from it.
 *
 * Why Babel AST instead of regex?
 *   - Regex breaks on multiline strings, nested quotes, and comments
 *   - AST parsing understands code structure — we know exactly what
 *     kind of node we're looking at and what its parent is
 *   - We can distinguish className="..." from <Text>...</Text> reliably
 *
 * Babel plugins enabled:
 *   - jsx: understands JSX syntax
 *   - typescript: understands TypeScript types (strips them during parsing)
 *   - decorators-legacy: handles @decorator syntax
 *   - classProperties: handles class field syntax
 *   - optionalChaining: handles a?.b syntax
 *   - nullishCoalescingOperator: handles a ?? b syntax
 *
 * @param filePath  - Absolute path to the source file
 * @param appRoot   - Absolute path to the app root (for namespace generation)
 * @param config    - The loaded i18nauto config
 */
export function extractStringsFromFile(
  filePath: string,
  appRoot: string,
  config: RaiConfig,
): ExtractedString[] {
  const code = readFileSafe(filePath);
  if (!code) return [];

  // Build the namespace from the file path
  const relativeWithoutExt = path
    .relative(appRoot, filePath)
    .replace(/\\/g, "/")
    .replace(/\.[^/.]+$/, ""); // strip extension

  const namespace = buildNamespace(relativeWithoutExt);

  logger.debug(
    `Parsing: ${path.relative(appRoot, filePath)} → namespace: "${namespace}"`,
  );

  // Parse the file into an AST
  let ast: ReturnType<typeof parser.parse>;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"],
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

  // Build the set of custom call patterns to detect
  // Merges built-in patterns (alerts, throws) with user's customDetectCalls
  const customCallPatterns = new Set(config.customDetectCalls);

  traverse(ast, {
    // ── 1. Plain text between JSX tags ──────────────────────────────────────
    //
    //    <Text>Hello world</Text>
    //          ↑ this is a JSXText node
    //
    //    JSXText includes all whitespace and newlines between tags,
    //    so we trim and check extractability carefully.
    JSXText(nodePath) {
      /**
       * Normalize JSX whitespace before doing anything else.
       *
       * JSXText nodes often span multiple lines with indentation:
       *
       *   <ThemedText>
       *     hook lets you inspect what the
       *     user's current color scheme is.
       *   </ThemedText>
       *
       * The raw value is "\n    hook lets you inspect what the\n    user's..."
       * React collapses this to "hook lets you inspect what the user's..."
       * at render time — the newlines and indentation are invisible.
       *
       * If we store the raw value in the locale file, t() returns it with
       * literal \n characters, which React Native renders as actual line
       * breaks, breaking the layout.
       *
       * We must normalize the same way React does:
       *   1. Split on newlines
       *   2. Trim each line
       *   3. Drop empty lines
       *   4. Join with a single space
       */
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

    // ── 2. Expressions inside JSX content ───────────────────────────────────
    //
    //    <Text>{"Hello"}</Text>
    //    <Text>{`Hello ${name}`}</Text>
    //    <Text>{isLoading ? "Loading" : "Done"}</Text>
    //
    //    The isInsideJSXContent guard is critical — it prevents
    //    className={`flex-row`} from matching here.
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

    // ── 3. String props on JSX elements ─────────────────────────────────────
    //
    //    <Button title="Submit" />
    //    <Input placeholder="Enter your email" />
    //    <ErrorState message="Something went wrong" />
    //
    //    We only extract props in TRANSLATABLE_PROP_NAMES and skip
    //    anything in NON_TRANSLATABLE_PROP_NAMES.
    JSXAttribute(nodePath) {
      const { name, value } = nodePath.node;

      const propName = t.isJSXIdentifier(name) ? name.name : null;
      if (!propName) return;
      if (NON_TRANSLATABLE_PROP_NAMES.has(propName)) return;
      if (!TRANSLATABLE_PROP_NAMES.has(propName)) return;

      // Only handle plain string values: title="Hello"
      // Not expressions: title={someVariable}
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

    // ── 4. Alert.alert() calls ───────────────────────────────────────────────
    //
    //    Alert.alert('Delete Item', 'Are you sure you want to delete this?')
    //                 ↑ title        ↑ message — both extracted
    //
    //    Only active when config.detectAlerts is true.
    //    We specifically match Alert.alert (capital A) as that is the
    //    React Native API. alert() (lowercase) is the browser API
    //    which is rarely used in RN and often for debugging.
    CallExpression(nodePath) {
      const calleeName = getCalleeName(nodePath.node);
      if (!calleeName) return;

      // Alert detection
      if (config.detectAlerts && calleeName === "Alert.alert") {
        const args = nodePath.node.arguments;

        // Title (arg 0) and message (arg 1)
        for (let i = 0; i < Math.min(args.length, 2); i++) {
          const arg = args[i];
          // Skip spreads / non-expressions
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

        // Buttons array (arg 2): [{ text: "Cancel" }, ...]
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

      // Custom call patterns (toast.show, setError, etc.)
      if (customCallPatterns.has(calleeName)) {
        extractStringArgs(
          nodePath.node.arguments,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "call",
        );
        return;
      }
    },

    // ── 5. Throw statements ──────────────────────────────────────────────────
    //
    //    throw new Error('Failed to save item. Please try again.')
    //                     ↑ extracted when config.detectThrows is true
    //
    //    We look specifically for `throw new Error(string)` pattern.
    //    Plain `throw 'string'` is also handled.
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

      // throw 'message' (uncommon but valid JS)
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
// Project-level scan
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans an entire React Native project and returns all translatable strings.
 *
 * File discovery uses glob with three layers of exclusion:
 *   1. HARD_EXCLUDED_DIRS — always excluded (node_modules, android, etc.)
 *   2. config.exclude     — user-specified glob patterns
 *   3. .gitignore rules   — respects the project's git exclusions
 *
 * No deduplication is performed — the same string appearing in two files
 * gets two separate entries with different namespaces. This is intentional:
 * each occurrence needs its own key so the transformer can replace each one.
 *
 * @param appRoot - Absolute path to the root of the React Native project
 * @param config  - The loaded i18nauto config
 */
export async function scanProject(
  appRoot: string,
  config: RaiConfig,
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
    `Files after .gitignore filter: ${filteredFiles.length} / ${files.length}`,
  );

  logger.dim(`  Found ${filteredFiles.length} source files to scan.`);

  // ── Extract strings from each file ────────────────────────────────────────
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
