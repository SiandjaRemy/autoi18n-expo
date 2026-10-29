import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import fg from "fast-glob";
import ignoreLib from "ignore";
import fs from "fs";
import path from "path";
import { readFileSafe } from "../utils/fs";
import { logger } from "../utils/logger";
import type { EaiConfig } from "../types/config";
import {
  DEFAULT_SINGLE_WORD_BLOCKLIST,
  DEFAULT_UI_SINGLE_WORDS,
} from "../constants/string-filters";
import {
  HARD_EXCLUDED_DIRS,
  NON_TRANSLATABLE_PROP_NAMES,
  OBJECT_LITERAL_BUILTIN_EXCLUDE_KEYS,
  RN_STYLE_KEYS,
  TRANSLATABLE_PROP_NAMES,
} from "../constants/scan-sets";

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

function isStyleObject(objNode: t.ObjectExpression): boolean {
  if (objNode.properties.length === 0) return false;

  const keys = objNode.properties
    .filter((p): p is t.ObjectProperty => t.isObjectProperty(p) && !p.computed)
    .map((p) => (t.isIdentifier(p.key) ? p.key.name : null))
    .filter(Boolean) as string[];

  if (keys.length === 0) return false;

  const styleKeyCount = keys.filter((k) => RN_STYLE_KEYS.has(k)).length;
  return styleKeyCount / keys.length >= 0.5;
}

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
): { key: string; fullKey: string } | null {
  const rawSegment = toKeySegment(text);

  /**
   * Guard: if the string produced no valid key characters after normalization
   * (e.g. pure emoji, punctuation-only strings like "...", "←", "• • •"),
   * skip it entirely rather than generating a key ending in a bare dot.
   *
   * Without this guard: toKeySegment("...") → "" → fullKey becomes "namespace."
   * which produces the broken "components.backbutton.": "..." entry in the locale file.
   */
  if (!rawSegment) return null;

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

type ExtractOptions = {
  /** When true, skip single-word blocklist (e.g. object key "label") */
  relaxSingleWordRules?: boolean;
};

function isBlockedSingleWord(token: string, config?: EaiConfig): boolean {
  if (config?.allowSingleWords?.includes(token)) return false;

  if (DEFAULT_SINGLE_WORD_BLOCKLIST.has(token)) return true;
  if (config?.blockSingleWords?.includes(token)) return true;

  return false;
}

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
function isExtractable(
  value: string,
  config?: EaiConfig,
  options: ExtractOptions = {},
): boolean {
  const trimmed = value.trim();

  if (trimmed.length < 2) return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return false;
  if (/^\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|dp|sp|rpx)$/.test(trimmed))
    return false;
  if (/^\d+[smhd]$/.test(trimmed)) return false;
  if (/^https?:\/\//.test(trimmed)) return false;
  if (/^@[a-zA-Z]/.test(trimmed)) return false;
  if (/^\.?[a-z0-9]+\/[a-z0-9]/.test(trimmed)) return false;
  if (trimmed === "true" || trimmed === "false") return false;
  if (trimmed === "null" || trimmed === "undefined") return false;

  if (!trimmed.includes(" ")) {
    // Allowlisted object keys (label, title, …): keep "IDLE", "DONE", etc.
    if (!options.relaxSingleWordRules) {
      if (isBlockedSingleWord(trimmed, config)) return false;
    }

    // Identifiers / slugs — still skip unless relaxed
    if (!options.relaxSingleWordRules) {
      if (
        config?.skipSnakeCase !== false &&
        /^[a-zA-Z][a-zA-Z0-9]*([_-][a-zA-Z0-9]+)+$/.test(trimmed)
      ) {
        return false;
      }
      if (
        config?.skipCamelCase !== false &&
        /^[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*$/.test(trimmed)
      ) {
        return false;
      }
      // Optional: multi-hump PascalCase only when not relaxed
      if (/^[A-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*$/.test(trimmed)) {
        return false;
      }
    }
  }

  if (isCssClassString(trimmed)) return false;
  return true;
}

/**
 * Stricter check for strings found in return statements.
 * JSX / Alert / throw already have high signal; returns do not.
 */
function isLikelyUiCopy(value: string, config?: EaiConfig): boolean {
  const trimmed = value.trim();
  if (!isExtractable(trimmed, config)) return false;

  if (!/\s/.test(trimmed)) {
    const allowed =
      DEFAULT_UI_SINGLE_WORDS.has(trimmed.toLowerCase()) ||
      config?.allowSingleWords?.includes(trimmed);
    if (!allowed) return false;
  }
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

  /**
   * Matches individual Tailwind/NativeWind utility class tokens.
   *
   * Handles:
   *   - Plain utilities:       text-sm, flex-row, bg-primary
   *   - Dark mode variants:    dark:text-white, dark:bg-surface
   *   - Other variants:        hover:opacity-70, active:scale-95
   *   - Arbitrary values:      w-[100px], text-[13px]
   *   - Custom tokens:         text-text-secondary (multi-hyphen)
   */
  const cssPattern =
    /^([a-z][a-z0-9]*:)?([a-z]{1,4}(-[a-z0-9.[\]/]+)+)$|^([a-z][a-z0-9]*:)?(flex|hidden|block|grid|p|m|w|h|gap|text|font|bg|border|rounded|shadow|items|justify|overflow|absolute|relative|fixed|inset|z|opacity|ring|cursor|pointer|animate|transition|duration|ease|scale|rotate|translate|aspect|container|sr)(-.*)?$/;

  const cssLikeCount = tokens.filter((tk) => cssPattern.test(tk)).length;
  return cssLikeCount / tokens.length >= 0.4;
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
  config?: EaiConfig,
  relaxSingleWordRules = false,
): void {
  if (!expr || t.isJSXEmptyExpression(expr)) return;

  const passes = (value: string) =>
    strictUiCopy
      ? isLikelyUiCopy(value, config)
      : isExtractable(value, config, { relaxSingleWordRules });

  // ── String literal ─────────────────────────────────────────────────────────
  if (t.isStringLiteral(expr)) {
    if (!passes(expr.value)) return; // ← was isExtractable(expr.value)

    const builtKey = buildFullKey(namespace, expr.value, maxKeyLen);
    if (!builtKey) return;
    const { key, fullKey } = builtKey;

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
      if (!isExtractable(text, config, { relaxSingleWordRules })) return;

      const builtKey = buildFullKey(namespace, text, maxKeyLen);
      if (!builtKey) return;
      const { key, fullKey } = builtKey;

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
        strictUiCopy,
        config,
        relaxSingleWordRules,
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
      config,
      relaxSingleWordRules,
    );
    extractFromExpression(
      expr.alternate,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy,
      config,
      relaxSingleWordRules,
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
      config,
      relaxSingleWordRules,
    );
    extractFromExpression(
      expr.right,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy,
      config,
      relaxSingleWordRules,
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
  config: EaiConfig,
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
        false,
        config,
      );
    }
  }
}

/**
 * Extracts translatable strings from a plain object literal.
 *
 * Used when config.detectObjectLiterals is true. Handles three value shapes:
 *   string:           title: "Tasks Limit"
 *   template literal: description: `Up to ${LIMIT} tasks`
 *   array of strings: details: ["First item", "Second item"]
 *
 * Which keys are extracted depends on the config:
 *   - If objectLiteralIncludeKeys is set → only those keys (allowlist)
 *   - Otherwise → all keys except OBJECT_LITERAL_BUILTIN_EXCLUDE_KEYS
 *     and objectLiteralExcludeKeys (blocklist)
 *
 * @param objNode  - The ObjectExpression AST node to walk
 * @param config   - The loaded eai config
 * @param results  - Array to push found strings into
 * @param namespace - Namespace for key generation
 * @param filePath - Source file path
 * @param maxKeyLen - Maximum key length
 * @param depth - to document
 */
function extractFromObjectLiteral(
  objNode: t.ObjectExpression,
  config: EaiConfig,
  results: ExtractedString[],
  namespace: string,
  filePath: string,
  maxKeyLen: number,
  depth: number = 0,
): void {
  /**
   * Depth guard: prevent runaway recursion on deeply nested objects.
   * 3 levels is enough for any realistic data structure:
   *   level 0: infoItems
   *   level 1: infoItems.tasksLimit
   *   level 2: infoItems.tasksLimit.title / details
   */
  if (depth > 3) return;

  // Skip React Native style objects — their values are style constants,
  // not user-facing strings
  if (isStyleObject(objNode)) return;

  for (const prop of objNode.properties) {
    if (!t.isObjectProperty(prop)) continue;
    if (prop.computed) continue;

    const keyName = t.isIdentifier(prop.key)
      ? prop.key.name
      : t.isStringLiteral(prop.key)
        ? prop.key.value
        : null;

    if (!keyName) continue;

    // ── Nested object — always recurse regardless of key filtering ──────────
    // e.g. infoItems.tasksLimit is an object — recurse into it even though
    // "tasksLimit" is not in objectLiteralIncludeKeys, because its children
    // (title, description, details) may be.
    if (t.isObjectExpression(prop.value)) {
      extractFromObjectLiteral(
        prop.value,
        config,
        results,
        namespace,
        filePath,
        maxKeyLen,
        depth + 1,
      );
      continue;
    }

    // ── Key filtering — only apply to leaf string/array values ──────────────
    if (config.objectLiteralIncludeKeys.length > 0) {
      if (!config.objectLiteralIncludeKeys.includes(keyName)) continue;
    } else {
      if (OBJECT_LITERAL_BUILTIN_EXCLUDE_KEYS.has(keyName)) continue;
      if (config.objectLiteralExcludeKeys.includes(keyName)) continue;
    }

    const relax =
      config.objectLiteralIncludeKeys.length > 0 &&
      config.objectLiteralIncludeKeys.includes(keyName);

    // ── Array value: details: ["item one", "item two"] ───────────────────────
    if (t.isArrayExpression(prop.value)) {
      for (const element of prop.value.elements) {
        if (!element || t.isSpreadElement(element)) continue;
        if (!t.isExpression(element)) continue;
        extractFromExpression(
          element,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "jsx-expression",
          false,
          config,
          relax,
        );
      }
      continue;
    }

    // ── String, template literal, ternary ────────────────────────────────────
    if (t.isExpression(prop.value)) {
      extractFromExpression(
        prop.value,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "jsx-expression",
        false,
        config,
        relax,
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
  config?: EaiConfig,
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
      false,
      config,
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
      if (!isExtractable(normalized, config)) return;

      const builtKey = buildFullKey(namespace, normalized, maxKeyLen);
      if (!builtKey) return;
      const { key, fullKey } = builtKey;

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
        false,
        config,
      );
    },

    // ── 3. Translatable JSX props ────────────────────────────────────────────
    //
    // Direct string attribute:
    //   <Button title="Submit" />
    //   <Input placeholder="Enter email" />
    //
    // Expression container (template literal or ternary):
    //   <Pressable accessibilityLabel={`Filter by ${label}`} />
    //   <Input placeholder={isLoading ? "Loading..." : "Enter email"} />
    //
    // Object literal containing translatable keys:
    //   <Tabs.Screen options={{ title: "Tasks" }} />
    //   <Stack.Screen options={{ title: "Profile", headerBackTitle: "Back" }} />
    JSXAttribute(nodePath) {
      const { name, value } = nodePath.node;

      const propName = t.isJSXIdentifier(name) ? name.name : null;
      if (!propName) return;

      /**
       * Merge the static translatable prop names with any user-configured
       * additions. We build this once per file rather than on every attribute
       * visit to avoid redundant Set construction.
       */
      const effectiveTranslatablePropNames =
        config.additionalTranslatablePropNames.length > 0
          ? new Set([
              ...TRANSLATABLE_PROP_NAMES,
              ...config.additionalTranslatablePropNames,
            ])
          : TRANSLATABLE_PROP_NAMES;

      // ── Case A: direct string value ──────────────────────────────────────
      // <Button title="Submit" />
      if (t.isStringLiteral(value)) {
        if (NON_TRANSLATABLE_PROP_NAMES.has(propName)) return;
        if (!effectiveTranslatablePropNames.has(propName)) return;
        if (!isExtractable(value.value, config)) return;

        const builtKey = buildFullKey(namespace, value.value, maxKeyLen);
        if (!builtKey) return;
        const { key, fullKey } = builtKey;
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
        return;
      }

      // ── Case B: expression container ─────────────────────────────────────
      // <Pressable accessibilityLabel={`Filter by ${label}`} />
      // <Input placeholder={isLoading ? "Loading..." : "Enter email"} />
      if (t.isJSXExpressionContainer(value)) {
        const expr = value.expression;
        if (!expr || t.isJSXEmptyExpression(expr)) return;

        // Sub-case B1: expression on a translatable prop
        // e.g. accessibilityLabel={`Filter by ${label}`}
        if (
          !NON_TRANSLATABLE_PROP_NAMES.has(propName) &&
          TRANSLATABLE_PROP_NAMES.has(propName)
        ) {
          extractFromExpression(
            expr,
            results,
            namespace,
            filePath,
            maxKeyLen,
            "jsx-attribute",
            false,
            config,
          );
          return;
        }

        // Sub-case B2: object literal on any prop
        // e.g. options={{ title: "Tasks", headerBackTitle: "Back" }}
        // We walk into the object and check each property key
        // independently against the translatable names lists.
        if (t.isObjectExpression(expr)) {
          for (const prop of expr.properties) {
            if (!t.isObjectProperty(prop)) continue;
            if (prop.computed) continue; // skip dynamic keys: { [key]: "..." }

            const objKeyName = t.isIdentifier(prop.key)
              ? prop.key.name
              : t.isStringLiteral(prop.key)
                ? prop.key.value
                : null;

            if (!objKeyName) continue;
            if (NON_TRANSLATABLE_PROP_NAMES.has(objKeyName)) continue;
            if (!effectiveTranslatablePropNames.has(objKeyName)) continue;

            extractFromExpression(
              prop.value as t.Expression,
              results,
              namespace,
              filePath,
              maxKeyLen,
              "jsx-attribute",
              false,
              config,
            );
          }
        }
      }
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
      const calleeName = getCalleeName(nodePath.node);
      if (!calleeName) return;

      // ── Alert.alert ─────────────────────────────────────────────────────────
      if (config.detectAlerts && calleeName === "Alert.alert") {
        const args = nodePath.node.arguments;

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
            false,
            config,
          );
        }

        if (args.length >= 3) {
          extractAlertButtonTexts(
            args[2],
            results,
            namespace,
            filePath,
            maxKeyLen,
            config,
          );
        }
        return;
      }

      // ── customDetectCalls ───────────────────────────────────────────────────
      if (customCallPatterns.has(calleeName)) {
        extractStringArgs(
          nodePath.node.arguments,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "call",
          config,
        );
        return;
      }

      // ── useState-style setters ────────────────────────────────────────────
      // setError("..."), setMessage(`...`), setTitle("...")
      // Detected when config.detectStateSetters is true (default).
      // Only the first argument is extracted — state setters
      // almost always receive a single user-facing string.
      if (config.detectStateSetters !== false && /^set[A-Z]/.test(calleeName)) {
        const arg0 = nodePath.node.arguments[0];
        if (!arg0 || !t.isExpression(arg0)) return;

        extractFromExpression(
          arg0,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "call",
          false,
          config,
        );
        return;
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
          config,
        );
        return;
      }

      // throw 'message' (uncommon but valid)
      if (
        t.isStringLiteral(argument) &&
        isExtractable(argument.value, config)
      ) {
        const builtKey = buildFullKey(namespace, argument.value, maxKeyLen);
        if (!builtKey) return;
        const { key, fullKey } = builtKey;

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
        config,
      );
    },

    // ── 6. Object literals ────────────────────────────────────────────────────
    //
    // Detects translatable strings inside plain TypeScript object literals
    // when config.detectObjectLiterals is true.
    //
    // Covers:
    //   export const TASK_FILTERS = [{ label: "All" }, { label: "Active" }]
    //   const infoItems = { tasksLimit: { title: "Tasks Limit", details: [...] } }
    //
    // Only top-level object literals and objects inside arrays are processed.
    // Objects inside function call arguments, JSX props, and return statements
    // are handled by their own visitors — processing them here too would cause
    // duplicate extractions.
    ObjectExpression(nodePath) {
      if (!config.detectObjectLiterals) return;

      /**
       * Scope guard: only process objects that are directly assigned to a
       * variable or are elements of an array literal.
       *
       * This prevents double-extraction of objects that are already handled
       * by other visitors:
       *   - JSX attribute objects: options={{ title: "..." }} → JSXAttribute visitor
       *   - Alert button arrays: Alert.alert(..., [...]) → extractAlertButtonTexts
       *   - Function call args: fn({ text: "..." }) → CallExpression visitor
       *   - Return statement objects: return { label: "..." } → ReturnStatement visitor
       */
      const parent = nodePath.parent;
      const parentType = (parent as any)?.type;

      const isVariableInit = parentType === "VariableDeclarator";
      const isArrayElement = parentType === "ArrayExpression";
      const isReturnArg = parentType === "ReturnStatement";

      /**
       * Process objects that are:
       *   - Assigned to a variable: const x = { ... }
       *   - Inside an array: [{ ... }, { ... }]
       *   - Directly returned: return { title: "...", details: [...] }
       *   - A value inside another object (nested): { outer: { inner: "..." } }
       *     — handled by extractFromObjectLiteral's recursion, but we still
       *     need the visitor to fire on the top-level object.
       *
       * Skip objects inside JSX attributes (handled by visitJSXAttribute)
       * and function call arguments (too broad, handled by customDetectCallsWithObjects).
       */
      if (!isVariableInit && !isArrayElement && !isReturnArg) return;

      // Skip React Native style objects
      if (isStyleObject(nodePath.node)) return;

      extractFromObjectLiteral(
        nodePath.node,
        config,
        results,
        namespace,
        filePath,
        maxKeyLen,
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

// Normalize --only so users can pass either a folder or a full glob.

// src/utils          → src/utils/**/*.{ts,tsx,js,jsx}
// src/utils/**       → src/utils/**/*.{ts,tsx,js,jsx}
// src/utils/**/*.ts  → unchanged

function normalizeOnlyPattern(only?: string): string {
  const defaultPattern = "**/*.{ts,tsx,js,jsx}";
  if (!only || !only.trim()) return defaultPattern;

  let p = only.trim().replace(/\\/g, "/").replace(/^\.\//, "");

  // Bare directory or trailing /**
  if (!p.includes("*") && !p.includes("?")) {
    p = p.replace(/\/$/, "");
    return `${p}/**/*.{ts,tsx,js,jsx}`;
  }

  if (p.endsWith("/**")) {
    return `${p}/*.{ts,tsx,js,jsx}`;
  }

  if (p.endsWith("/**/*")) {
    return `${p}.{ts,tsx,js,jsx}`;
  }

  // Already a file glob
  return p;
}

export interface ScanProjectOptions {
  // Glob relative to appRoot, e.g. "src/utils/**" or "src/utils/**/*.{ts,tsx}"
  only?: string;
}

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
  options: ScanProjectOptions = {},
): Promise<ExtractedString[]> {
  const pattern = normalizeOnlyPattern(options.only);
  // ── Discover files ─────────────────────────────────────────────────────────

  const files = await fg(pattern, {
    cwd: appRoot,
    absolute: true,
    onlyFiles: true,
    ignore: [
      ...HARD_EXCLUDED_DIRS,
      // ...
      ...config.exclude,
    ],
  });

  if (!Array.isArray(files)) {
    throw new Error(
      `fast-glob() did not return an array (got ${typeof files}). Check fast-glob version and await.`,
    );
  }

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
