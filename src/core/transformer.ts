import * as recast from "recast";
import { visit, builders as b } from "ast-types";
import path from "path";
import { readFileSafe } from "../utils/fs";
import { logger } from "../utils/logger";
import type { ExtractedString } from "./scanner";
import type { LocaleFile } from "./scaffolder";
import { normalizeJSXWhitespace } from "../utils/normalize";
import { requireConfig } from "../utils/config";
import { eaiConfig } from "../types/config";

let fileNeedsI18nImport = false;

export interface TransformResult {
  filePath: string;
  modified: boolean;
  replacements: number;
  newCode?: string;
}

/**
 * Checks whether a given node path is nested inside a React component
 * function body — meaning it has access to the component's scope
 * through closure.
 *
 * If true, the helper does NOT need t passed as a parameter because
 * it can close over the t declared in the enclosing component.
 *
 * If false, the helper is at module level and has no access to any
 * component's t — it needs t: TFunction as a parameter.
 *
 * @param nodePath - The path of the helper function node
 */
function isNestedInsideComponent(nodePath: any): boolean {
  let current = nodePath.parent;

  while (current) {
    const node = current.node;
    const parent = current.parent?.node;

    const isFn =
      node?.type === "FunctionDeclaration" ||
      node?.type === "FunctionExpression" ||
      node?.type === "ArrowFunctionExpression";

    if (isFn && isComponentFunction(node, parent)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

/**
 * Checks whether the file already has a 'use client' directive.
 * In Next.js App Router, any file using hooks must be a Client Component.
 */
function hasUseClientDirective(programBody: any[]): boolean {
  const firstStatement = programBody[0];
  return (
    firstStatement?.type === "ExpressionStatement" &&
    firstStatement?.expression?.type === "StringLiteral" &&
    firstStatement?.expression?.value === "use client"
  );
}

/**
 * Adds 'use client' as the very first statement in the file.
 * Must come before any imports — Next.js requires it to be
 * the first expression in the file.
 */
function addUseClientDirective(programBody: any[]): void {
  if (hasUseClientDirective(programBody)) return;

  programBody.unshift({
    type: "ExpressionStatement",
    expression: b.literal("use client"),
    directive: "use client",
  });
}
// ─────────────────────────────────────────────────────────────────────────────
// AST node builders
// ─────────────────────────────────────────────────────────────────────────────

function buildTCall(key: string): any {
  return b.callExpression(b.identifier("t"), [b.literal(key)]);
}

function buildTCallWithParams(key: string, params: string[]): any {
  const props = params.map((param) => {
    const prop = b.property("init", b.identifier(param), b.identifier(param));
    prop.shorthand = true;
    return prop;
  });
  return b.callExpression(b.identifier("t"), [
    b.literal(key),
    b.objectExpression(props),
  ]);
}

function buildI18nTCall(key: string): any {
  return b.callExpression(
    b.memberExpression(b.identifier("i18n"), b.identifier("t")),
    [b.literal(key)],
  );
}

function buildI18nTCallWithParams(key: string, params: string[]): any {
  const props = params.map((param) => {
    const prop = b.property("init", b.identifier(param), b.identifier(param));
    prop.shorthand = true;
    return prop;
  });
  return b.callExpression(
    b.memberExpression(b.identifier("i18n"), b.identifier("t")),
    [b.literal(key), b.objectExpression(props)],
  );
}

function buildI18nImport(importPath: string): any {
  return b.importDeclaration(
    [b.importDefaultSpecifier(b.identifier("i18n"))],
    b.literal(importPath),
  );
}

function buildJSXExpression(call: any): any {
  return b.jsxExpressionContainer(call);
}

function buildUseTranslationImport(): any {
  return b.importDeclaration(
    [
      b.importSpecifier(
        b.identifier("useTranslation"),
        b.identifier("useTranslation"),
      ),
    ],
    b.literal("react-i18next"),
  );
}

function buildUseTranslationCall(): any {
  const prop = b.property("init", b.identifier("t"), b.identifier("t"));
  prop.shorthand = true;
  return b.variableDeclaration("const", [
    b.variableDeclarator(
      b.objectPattern([prop]),
      b.callExpression(b.identifier("useTranslation"), []),
    ),
  ]);
}

/**
 * Builds: import { TFunction } from 'i18next'
 *
 * TFunction is the type of the `t` function returned by useTranslation.
 * We import it so helper functions can type their `t` parameter correctly:
 *   function getStatusText(status: Status, t: TFunction) { ... }
 */
function buildTFunctionImport(): any {
  return b.importDeclaration(
    [b.importSpecifier(b.identifier("TFunction"), b.identifier("TFunction"))],
    b.literal("i18next"),
  );
}

/**
 * Builds a `t: TFunction` parameter node for a function signature.
 *
 * The result is an Identifier node named 't' with a TypeAnnotation
 * of TFunction — which TypeScript renders as: t: TFunction
 *
 * We build the type annotation manually since ast-types doesn't have
 * a first-class builder for TypeScript type references on parameters.
 */
function buildTFunctionParam(): any {
  const param = b.identifier("t");

  /**
   * Attach a TypeScript type annotation to the parameter.
   * This produces the `: TFunction` part of `t: TFunction`.
   *
   * The annotation structure:
   *   typeAnnotation: TSTypeAnnotation {
   *     typeAnnotation: TSTypeReference {
   *       typeName: Identifier { name: 'TFunction' }
   *     }
   *   }
   */
  param.typeAnnotation = {
    type: "TSTypeAnnotation",
    typeAnnotation: {
      type: "TSTypeReference",
      typeName: {
        type: "Identifier",
        name: "TFunction",
      },
    },
  } as any;

  return param;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

function findExtracted(
  value: string,
  filePath: string,
  fileStrings: ExtractedString[],
  sourceType?: ExtractedString["sourceType"],
): ExtractedString | undefined {
  return fileStrings.find(
    (s) =>
      s.filePath === filePath &&
      s.originalText === value.trim() &&
      (sourceType ? s.sourceType === sourceType : true),
  );
}

function findExtractedTemplate(
  node: any,
  filePath: string,
  fileStrings: ExtractedString[],
): ExtractedString | undefined {
  let text = "";
  let argIndex = 0;

  node.quasis.forEach((quasi: any, i: number) => {
    text += quasi.value.cooked ?? quasi.value.raw;
    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      let paramName: string;
      if (expr.type === "Identifier") {
        paramName = expr.name;
      } else if (
        expr.type === "MemberExpression" &&
        expr.property.type === "Identifier"
      ) {
        paramName = expr.property.name;
      } else {
        paramName = `arg${argIndex++}`;
      }
      text += `{{${paramName}}}`;
    }
  });

  return fileStrings.find(
    (s) => s.filePath === filePath && s.originalText === text.trim(),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Import helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveI18nImportPath(
  filePath: string,
  appRoot: string,
  config: eaiConfig,
): string {
  const i18nAbs = path.join(appRoot, config.i18nFilePath ?? "src/i18n.ts");
  let rel = path.relative(path.dirname(filePath), i18nAbs).replace(/\\/g, "/");
  // strip extension for TS-style imports
  rel = rel.replace(/\.(ts|tsx|js|jsx)$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

/**
 * True if the file already imports a binding named `i18n`
 * (any path: @/i18n, ../i18n, src/i18n, etc.).
 */
function hasI18nBinding(programBody: any[]): boolean {
  for (const node of programBody) {
    if (node.type !== "ImportDeclaration") continue;

    for (const spec of node.specifiers ?? []) {
      // import i18n from '...'
      if (
        spec.type === "ImportDefaultSpecifier" &&
        spec.local?.name === "i18n"
      ) {
        return true;
      }
      // import * as i18n from '...'
      if (
        spec.type === "ImportNamespaceSpecifier" &&
        spec.local?.name === "i18n"
      ) {
        return true;
      }
      // import { default as i18n } from '...'  (rare)
      if (spec.type === "ImportSpecifier" && spec.local?.name === "i18n") {
        return true;
      }
    }
  }
  return false;
}

function hasDefaultImport(
  programBody: any[],
  source: string,
  localName: string,
): boolean {
  return programBody.some(
    (node) =>
      node.type === "ImportDeclaration" &&
      node.source.value === source &&
      node.specifiers?.some(
        (spec: any) =>
          spec.type === "ImportDefaultSpecifier" &&
          spec.local?.name === localName,
      ),
  );
}

function addDefaultImport(
  programBody: any[],
  source: string,
  localName: string,
  buildFn: () => any,
): void {
  if (hasDefaultImport(programBody, source, localName)) return;

  let lastImportIndex = -1;
  for (let i = 0; i < programBody.length; i++) {
    if (programBody[i].type === "ImportDeclaration") lastImportIndex = i;
  }

  const node = buildFn();
  if (lastImportIndex >= 0) {
    programBody.splice(lastImportIndex + 1, 0, node);
  } else {
    // After 'use client' if present
    if (hasUseClientDirective(programBody)) {
      programBody.splice(1, 0, node);
    } else {
      programBody.unshift(node);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook injection
// ─────────────────────────────────────────────────────────────────────────────

function hasTDeclaration(statements: any[]): boolean {
  return statements.some((stmt) => {
    if (stmt.type !== "VariableDeclaration") return false;
    return stmt.declarations.some((decl: any) => {
      if (decl.id?.type !== "ObjectPattern") return false;
      if (decl.init?.type !== "CallExpression") return false;
      if (decl.init?.callee?.name !== "useTranslation") return false;
      return decl.id.properties?.some(
        (prop: any) => prop.key?.name === "t" || prop.value?.name === "t",
      );
    });
  });
}

function injectTDeclaration(blockBody: any[]): void {
  if (hasTDeclaration(blockBody)) return;
  blockBody.unshift(buildUseTranslationCall());
}

// ─────────────────────────────────────────────────────────────────────────────
// Component and helper detection
// ─────────────────────────────────────────────────────────────────────────────

function isComponentFunction(node: any, parent: any): boolean {
  if (node.body?.type !== "BlockStatement") return false;

  if (node.type === "FunctionDeclaration" && node.id?.name) {
    return /^[A-Z]/.test(node.id.name);
  }

  if (
    parent?.type === "VariableDeclarator" &&
    parent.id?.type === "Identifier" &&
    /^[A-Z]/.test(parent.id.name)
  ) {
    return true;
  }

  if (parent?.type === "ExportDefaultDeclaration") return true;

  return false;
}

/**
 * Checks if a function is a helper — lowercase name, block body.
 * Helpers cannot call useTranslation() directly (rules of hooks).
 * Instead, they receive `t` as a parameter from the component.
 */
function isHelperFunction(node: any, parent: any): boolean {
  if (node.body?.type !== "BlockStatement") return false;

  if (node.type === "FunctionDeclaration" && node.id?.name) {
    return /^[a-z]/.test(node.id.name);
  }

  if (
    parent?.type === "VariableDeclarator" &&
    parent.id?.type === "Identifier" &&
    /^[a-z]/.test(parent.id.name)
  ) {
    return true;
  }

  return false;
}

/**
 * Gets the name of a helper function from its node + parent.
 * Returns null if the name cannot be determined.
 */
function getHelperName(node: any, parent: any): string | null {
  if (node.type === "FunctionDeclaration" && node.id?.name) {
    return node.id.name;
  }
  if (
    parent?.type === "VariableDeclarator" &&
    parent.id?.type === "Identifier"
  ) {
    return parent.id.name;
  }
  return null;
}

/**
 * Checks whether `t` is already a parameter of the given function node.
 * Used to avoid adding the parameter twice if replace is run again.
 */
function alreadyHasTParam(node: any): boolean {
  return node.params?.some(
    (p: any) => p.type === "Identifier" && p.name === "t",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expression replacement
// ─────────────────────────────────────────────────────────────────────────────

type ReplaceOptions = {
  /** Module-level helpers: i18n.t(...). Components / nested helpers: t(...) */
  useI18nInstance?: boolean;
};

function buildCallForExtracted(
  extracted: ExtractedString,
  useI18nInstance: boolean,
): any {
  if (useI18nInstance) {
    return extracted.params.length > 0
      ? buildI18nTCallWithParams(extracted.fullKey, extracted.params)
      : buildI18nTCall(extracted.fullKey);
  }
  return extracted.params.length > 0
    ? buildTCallWithParams(extracted.fullKey, extracted.params)
    : buildTCall(extracted.fullKey);
}

function replaceStringNode(
  node: any,
  filePath: string,
  fileStrings: ExtractedString[],
  sourceType: ExtractedString["sourceType"],
  options: ReplaceOptions = {},
): [any, number] {
  if (!node) return [node, 0];

  const useI18n = options.useI18nInstance === true;

  if (node.type === "StringLiteral" || node.type === "Literal") {
    const value = node.value;
    if (typeof value !== "string") return [node, 0];

    const extracted = findExtracted(value, filePath, fileStrings, sourceType);
    if (!extracted) return [node, 0];

    return [buildCallForExtracted(extracted, useI18n), 1];
  }

  if (node.type === "TemplateLiteral") {
    const onlyIds = (node.expressions ?? []).every(
      (expr: any) => expr.type === "Identifier",
    );

    if (onlyIds) {
      const extracted = findExtractedTemplate(node, filePath, fileStrings);
      if (!extracted) return [node, 0];
      return [buildCallForExtracted(extracted, useI18n), 1];
    }

    // Option A: keep template, replace string leaves inside expressions
    let count = 0;
    for (let i = 0; i < node.expressions.length; i++) {
      const [newExpr, c] = replaceStringNode(
        node.expressions[i],
        filePath,
        fileStrings,
        sourceType,
        options,
      );
      if (c > 0) {
        node.expressions[i] = newExpr;
        count += c;
      }
    }
    return [node, count];
  }

  if (node.type === "ConditionalExpression") {
    let count = 0;
    const [newConsequent, c1] = replaceStringNode(
      node.consequent,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (c1 > 0) {
      node.consequent = newConsequent;
      count += c1;
    }

    const [newAlternate, c2] = replaceStringNode(
      node.alternate,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (c2 > 0) {
      node.alternate = newAlternate;
      count += c2;
    }

    return [node, count];
  }

  if (node.type === "LogicalExpression") {
    let count = 0;
    const [newLeft, c1] = replaceStringNode(
      node.left,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (c1 > 0) {
      node.left = newLeft;
      count += c1;
    }

    const [newRight, c2] = replaceStringNode(
      node.right,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (c2 > 0) {
      node.right = newRight;
      count += c2;
    }

    return [node, count];
  }

  return [node, 0];
}

/**
 * Rewrites `text: "..."` on an Alert button object.
 * Leaves style / onPress / etc. untouched.
 */
function replaceAlertButtonObject(
  obj: any,
  filePath: string,
  fileStrings: ExtractedString[],
): number {
  if (obj?.type !== "ObjectExpression") return 0;

  let count = 0;

  for (const prop of obj.properties ?? []) {
    if (prop.type !== "ObjectProperty" && prop.type !== "Property") continue;
    if (prop.computed) continue;

    const keyName =
      prop.key?.type === "Identifier"
        ? prop.key.name
        : prop.key?.type === "StringLiteral" || prop.key?.type === "Literal"
          ? prop.key.value
          : null;

    if (keyName !== "text") continue;

    const [newValue, c] = replaceStringNode(
      prop.value,
      filePath,
      fileStrings,
      "alert",
      { useI18nInstance: false },
    );

    if (c > 0) {
      prop.value = newValue;
      count += c;
    }
  }

  return count;
}

/**
 * Rewrites the 3rd argument of Alert.alert: [{ text: "..." }, ...]
 */
function replaceAlertButtonsArg(
  arg: any,
  filePath: string,
  fileStrings: ExtractedString[],
): number {
  if (arg?.type !== "ArrayExpression") return 0;

  let count = 0;
  for (const el of arg.elements ?? []) {
    if (!el) continue;
    if (el.type === "ObjectExpression") {
      count += replaceAlertButtonObject(el, filePath, fileStrings);
    }
  }
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
// File transformer
// ─────────────────────────────────────────────────────────────────────────────

export function transformFile(
  filePath: string,
  appRoot: string,
  strings: ExtractedString[],
  localeData: LocaleFile,
  config: eaiConfig,
): TransformResult {
  const code = readFileSafe(filePath);
  if (!code) return { filePath, modified: false, replacements: 0 };

  const fileStrings = strings.filter(
    (s) => s.filePath === filePath && localeData[s.fullKey] !== undefined,
  );

  if (fileStrings.length === 0) {
    logger.debug(`  No matching strings: ${path.relative(appRoot, filePath)}`);
    return { filePath, modified: false, replacements: 0 };
  }

  let ast: any;
  try {
    ast = recast.parse(code, {
      parser: {
        parse(source: string) {
          const babelParser = require("@babel/parser");
          return babelParser.parse(source, {
            sourceType: "module",
            tokens: true,
            plugins: [
              "jsx",
              "typescript",
              "decorators-legacy",
              "classProperties",
              "optionalChaining",
              "nullishCoalescingOperator",
            ],
          });
        },
      },
    });
  } catch (err) {
    logger.warn(
      `  Could not parse ${path.relative(appRoot, filePath)} — skipping`,
    );
    logger.debug(String(err));
    return { filePath, modified: false, replacements: 0 };
  }

  let totalReplacements = 0;

  /**
   * Component blocks that need `const { t } = useTranslation()` injected.
   */
  const componentBlocks = new Set<any>();

  /**
   * Helper function nodes that need `t: TFunction` added to their params.
   *
   * We store the node itself (not just its name) so we can directly
   * mutate node.params after traversal.
   *
   * Map shape: helperName → { node, replacementsInsideIt }
   */
  const helpersNeedingT = new Map<string, any>();

  /**
   * Names of helpers that received t() calls inside them.
   * Used to find their call sites and add `t` as an argument.
   */
  const helperNamesWithT = new Set<string>();

  // ── Traversal ─────────────────────────────────────────────────────────────
  visit(ast, {
    visitJSXText(nodePath) {
      const originalValue = nodePath.node.value as string;

      /**
       * Normalize using the same function as the scanner.
       *
       * The scanner stores keys using normalizeJSXWhitespace, which collapses
       * multiline JSXText like:
       *   " sets up\n              the tab navigator."
       * into:
       *   "sets up the tab navigator."
       *
       * If the transformer looks up by .trim() instead, it produces:
       *   "sets up\n              the tab navigator."
       * which does NOT match the stored key, so the lookup fails silently
       * and the string is left unreplaced.
       *
       * Both scanner and transformer must use identical normalization.
       */
      const normalized = normalizeJSXWhitespace(originalValue);
      if (!normalized) return this.traverse(nodePath);

      const extracted = findExtracted(
        normalized,
        filePath,
        fileStrings,
        "jsx-text",
      );
      if (!extracted) return this.traverse(nodePath);

      /**
       * Determine whether to preserve leading/teailing whitespace.
       *
       * The rule: only preserve a space if the whitespace is a SINGLE
       * SPACE CHARACTER (0x20), not newlines or indentation.
       *
       * Why? JSXText nodes often start with \n + indentation spaces
       * because of how JSX is formatted:
       *
       *   <Text>
       *     Hello world        ← originalValue is "\n    Hello world"
       *   </Text>
       *
       * That leading \n + spaces is formatting whitespace — React ignores
       * it for rendering. We must NOT emit a {" "} for it.
       *
       * But in:
       *   <Text>shake device or press <Code>m</Code> in terminal</Text>
       *
       * The JSXText "shake device or press " has a TeaiLING SPACE that IS
       * meaningful — it separates the text from the <Code> element visually.
       * Same for " in terminal" which has a leading space.
       *
       * Detection: check the character immediately before/after the trimmed
       * content in the original string. If it's exactly a space (not \n,
       * not \t, not multiple spaces that are indentation), preserve it.
       */
      const leadingChar = originalValue[0];
      const teailingChar = originalValue[originalValue.length - 1];

      /**
       * A space is "meaningful" if:
       *   1. It is a space character (not newline or tab)
       *   2. It is a single space OR directly adjacent to non-space content
       *      (not part of a multi-space indentation block)
       *
       * The simplest reliable check: the character right before/after the
       * trimmed text in the original is exactly ' ' (0x20).
       *
       * We also verify it's not preceded by a newline — if the content
       * before the space is a newline, it's indentation, not a word space.
       */
      const hasLeadingSpace = (() => {
        if (leadingChar !== " ") return false;
        // Find where the normalized content starts
        const contentStart = originalValue.indexOf(normalized[0]);
        if (contentStart === 0) return false;
        // Check if there's a newline anywhere before the content
        const beforeContent = originalValue.slice(0, contentStart);
        return !beforeContent.includes("\n");
      })();

      const hasTeailingSpace = (() => {
        if (teailingChar !== " ") return false;
        // Find where the normalized content ends
        const contentEnd = originalValue.lastIndexOf(
          normalized[normalized.length - 1],
        );
        const afterContent = originalValue.slice(contentEnd + 1);
        return !afterContent.includes("\n");
      })();

      const call = buildTCall(extracted.fullKey);

      if (!hasLeadingSpace && !hasTeailingSpace) {
        // No meaningful surrounding spaces — simple replacement
        nodePath.replace(buildJSXExpression(call));
        totalReplacements++;
        return false;
      }

      /**
       * Build the list of replacement nodes, including space nodes
       * only where the space is genuinely meaningful.
       *
       * We use b.jsxText(' ') for spaces rather than {" "} expressions
       * because JSXText is lighter and produces cleaner output.
       * Both render identically — React treats them the same way.
       */
      const nodes: any[] = [];

      if (hasLeadingSpace) nodes.push(b.jsxText(" "));
      nodes.push(buildJSXExpression(call));
      if (hasTeailingSpace) nodes.push(b.jsxText(" "));

      /**
       * Replace the current node with the first replacement node,
       * then insert remaining siblings after it.
       *
       * insertAfter inserts in reverse order so we iterate backwards
       * to maintain the correct final order.
       */
      nodePath.replace(nodes[0]);
      for (let i = nodes.length - 1; i >= 1; i--) {
        nodePath.insertAfter(nodes[i]);
      }

      totalReplacements++;
      return false;
    },

    visitJSXExpressionContainer(nodePath) {
      const parent = nodePath.parent?.node;
      const isChild =
        parent?.type === "JSXElement" || parent?.type === "JSXFragment";
      if (!isChild) return this.traverse(nodePath);

      const expr = nodePath.node.expression;
      if (!expr || expr.type === "JSXEmptyExpression") {
        return this.traverse(nodePath);
      }

      const [newExpr, count] = replaceStringNode(
        expr,
        filePath,
        fileStrings,
        "jsx-expression",
      );
      if (count > 0) {
        nodePath.node.expression = newExpr;
        totalReplacements += count;
      }
      this.traverse(nodePath);
    },

    visitJSXAttribute(nodePath) {
      const { value } = nodePath.node;
      if (value?.type === "StringLiteral" || value?.type === "Literal") {
        const strValue = value.value;
        if (typeof strValue === "string") {
          const extracted = findExtracted(
            strValue,
            filePath,
            fileStrings,
            "jsx-attribute",
          );
          if (extracted) {
            nodePath.node.value = buildJSXExpression(
              buildTCall(extracted.fullKey),
            );
            totalReplacements++;
          }
        }
      }
      this.traverse(nodePath);
    },

    visitCallExpression(nodePath) {
      const { callee, arguments: args } = nodePath.node;
      let calleeName: string | null = null;

      if (callee.type === "Identifier") {
        calleeName = (callee as any).name;
      } else if (
        callee.type === "MemberExpression" &&
        callee.object?.type === "Identifier" &&
        callee.property?.type === "Identifier"
      ) {
        calleeName = `${(callee.object as any).name}.${(callee.property as any).name}`;
      }

      // ── Alert.alert ──────────────────────────────────────────────────────────
      if (calleeName === "Alert.alert") {
        args.forEach((arg: any, index: number) => {
          if (!arg || arg.type === "SpreadElement") return;

          // Title (0) and message (1): literals, templates, ternaries, logicals
          if (index === 0 || index === 1) {
            const [newArg, count] = replaceStringNode(
              arg,
              filePath,
              fileStrings,
              "alert",
              { useI18nInstance: false },
            );
            if (count > 0) {
              nodePath.node.arguments[index] = newArg;
              totalReplacements += count;
            }
            return;
          }

          // Buttons array (2)
          if (index === 2) {
            totalReplacements += replaceAlertButtonsArg(
              arg,
              filePath,
              fileStrings,
            );
          }
        });
      }
      // ── customDetectCalls ────────────────────────────────────────────────────
      else if (calleeName && fileStrings.some((s) => s.sourceType === "call")) {
        args.forEach((arg: any, index: number) => {
          if (!arg || arg.type === "SpreadElement") return;

          const [newArg, count] = replaceStringNode(
            arg,
            filePath,
            fileStrings,
            "call",
            { useI18nInstance: false },
          );
          if (count > 0) {
            nodePath.node.arguments[index] = newArg;
            totalReplacements += count;
          }
        });
      }

      this.traverse(nodePath);
    },

    visitThrowStatement(nodePath) {
      const { argument } = nodePath.node;
      if (
        argument?.type === "NewExpression" &&
        argument.callee?.type === "Identifier" &&
        (argument.callee as any).name === "Error"
      ) {
        argument.arguments.forEach((arg: any, index: number) => {
          const isStr = arg.type === "StringLiteral" || arg.type === "Literal";
          if (!isStr || typeof arg.value !== "string") return;

          const extracted = findExtracted(
            arg.value,
            filePath,
            fileStrings,
            "throw",
          );
          if (!extracted) return;

          argument.arguments[index] = buildTCall(extracted.fullKey);
          totalReplacements++;
        });
      }
      this.traverse(nodePath);
    },

    // ── Return statements (utils / helpers) ───────────────────────────────────
    visitReturnStatement(nodePath) {
      const arg = nodePath.node.argument;
      if (!arg) return this.traverse(nodePath);

      /**
       * Nested inside a React component → use t from useTranslation (closure).
       * Module-level helper → use i18n.t and import the singleton.
       */
      const insideComponent = isNestedInsideComponent(nodePath);
      const useI18nInstance = !insideComponent;

      const [newArg, count] = replaceStringNode(
        arg,
        filePath,
        fileStrings,
        "return", // must match scanner sourceType for returns
        { useI18nInstance },
      );

      if (count > 0) {
        nodePath.node.argument = newArg;
        totalReplacements += count;
        if (useI18nInstance) {
          fileNeedsI18nImport = true;
        }
      }

      this.traverse(nodePath);
    },

    // ── Component visitors — collect blocks for hook injection ────────────────
    visitFunctionDeclaration(nodePath) {
      const node = nodePath.node;
      const parent = nodePath.parent?.node;

      if (isComponentFunction(node, parent)) {
        componentBlocks.add(node.body);
      } else if (isHelperFunction(node, parent)) {
        /**
         * Only register module-level helpers as needing t injected.
         * Helpers defined INSIDE a component have access to the
         * component's t via closure — no parameter needed.
         */
        if (!isNestedInsideComponent(nodePath)) {
          const name = getHelperName(node, parent);
          if (name) helpersNeedingT.set(name, node);
        }
      }

      this.traverse(nodePath);
    },

    visitFunctionExpression(nodePath) {
      const node = nodePath.node;
      const parent = nodePath.parent?.node;

      if (isComponentFunction(node, parent)) {
        componentBlocks.add(node.body);
      } else if (isHelperFunction(node, parent)) {
        if (!isNestedInsideComponent(nodePath)) {
          const name = getHelperName(node, parent);
          if (name) helpersNeedingT.set(name, node);
        }
      }

      this.traverse(nodePath);
    },

    visitArrowFunctionExpression(nodePath) {
      const node = nodePath.node;
      const parent = nodePath.parent?.node;

      if (isComponentFunction(node, parent)) {
        componentBlocks.add(node.body);
      } else if (isHelperFunction(node, parent)) {
        if (!isNestedInsideComponent(nodePath)) {
          const name = getHelperName(node, parent);
          if (name) helpersNeedingT.set(name, node);
        }
      }

      this.traverse(nodePath);
    },
  });

  if (totalReplacements === 0) {
    return { filePath, modified: false, replacements: 0 };
  }

  // ── Determine which helpers actually contain t() calls ────────────────────
  /**
   * After replacement, any helper function whose body now contains
   * a CallExpression with callee name 't' needs `t: TFunction` added
   * to its signature.
   *
   * We check by looking at the body's serialized replacement count —
   * simpler: we check if any t() call exists in the helper's body AST.
   */
  for (const [name, funcNode] of helpersNeedingT.entries()) {
    if (functionBodyContainsTCall(funcNode.body)) {
      helperNamesWithT.add(name);
    }
  }

  // ── Inject t: TFunction into helper signatures ────────────────────────────
  for (const name of helperNamesWithT) {
    const funcNode = helpersNeedingT.get(name);
    if (!funcNode) continue;
    if (alreadyHasTParam(funcNode)) continue;

    /**
     * Add `t: TFunction` as the last parameter.
     * Last is better than first — it doesn't break existing call signatures
     * for any positional parameters the function already has.
     */
    funcNode.params.push(buildTFunctionParam());

    logger.debug(`  Injected t: TFunction param into helper: ${name}`);
  }

  // ── Update call sites of helpers that now need t passed in ───────────────
  /**
   * Find every call to a helper that now takes `t` as a parameter,
   * and append `t` as the last argument at each call site.
   *
   * We only handle call sites WITHIN THE SAME FILE.
   * Cross-file call sites are out of scope for v1.
   *
   * We do a second traversal specifically for call site patching.
   * This is cleaner than trying to do it in the first traversal
   * because we don't know which helpers need patching until the
   * first traversal + helper analysis is complete.
   */
  if (helperNamesWithT.size > 0) {
    visit(ast, {
      visitCallExpression(nodePath) {
        const { callee, arguments: args } = nodePath.node;

        /**
         * Match simple function calls: getStatusText(status)
         * We don't match member expression calls (obj.method()) here
         * since helpers are typically plain functions.
         */
        if (callee.type !== "Identifier") return this.traverse(nodePath);

        const calleeName = (callee as any).name;
        if (!helperNamesWithT.has(calleeName)) return this.traverse(nodePath);

        /**
         * Check if `t` is already the last argument to avoid
         * adding it twice if replace is run again on already-patched code.
         */
        const lastArg = args[args.length - 1];
        const alreadyHasT =
          lastArg?.type === "Identifier" && (lastArg as any).name === "t";

        if (!alreadyHasT) {
          nodePath.node.arguments.push(b.identifier("t"));
          logger.debug(`  Added t argument to call site: ${calleeName}()`);
        }

        this.traverse(nodePath);
      },
    });
  }

  // ── Inject const { t } = useTranslation() into components ────────────────
  for (const block of componentBlocks) {
    if (block?.type === "BlockStatement") {
      injectTDeclaration(block.body);
    }
  }

  // ── Inject imports ────────────────────────────────────────────────────────
  /**
   * Add useTranslation import if any component blocks were found.
   */
  if (componentBlocks.size > 0) {
    addDefaultImport(
      ast.program.body,
      "react-i18next",
      "useTranslation",
      buildUseTranslationImport,
    );

    if (config.addUseClientDirective) {
      addUseClientDirective(ast.program.body);
    }
  }

  /**
   * Add TFunction import if any helpers now receive t as a parameter.
   * TFunction comes from 'i18next' (not 'react-i18next').
   */
  if (helperNamesWithT.size > 0) {
    addDefaultImport(
      ast.program.body,
      "i18next",
      "TFunction",
      buildTFunctionImport,
    );
  }

  if (fileNeedsI18nImport) {
    if (!hasI18nBinding(ast.program.body)) {
      const importPath = resolveI18nImportPath(filePath, appRoot, config);
      addDefaultImport(ast.program.body, importPath, "i18n", () =>
        b.importDeclaration(
          [b.importDefaultSpecifier(b.identifier("i18n"))],
          b.literal(importPath),
        ),
      );
    } else {
      logger.debug(
        `  Skipped i18n import — binding already exists in ${path.relative(appRoot, filePath)}`,
      );
    }
  }

  const newCode = recast.print(ast).code;

  return {
    filePath,
    modified: true,
    replacements: totalReplacements,
    newCode,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check if a block statement contains any t() calls
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the given block statement body contains at least
 * one call to `t(...)`.
 *
 * Used to determine whether a helper function actually uses t()
 * after the replacement pass — so we only add `t: TFunction` to
 * helpers that actually need it.
 *
 * We do a simple recursive node walk rather than a full visit()
 * traversal to keep this lightweight.
 */
function functionBodyContainsTCall(block: any): boolean {
  if (!block || block.type !== "BlockStatement") {
    return false;
  }

  let found = false;

  visit(block, {
    visitCallExpression(path) {
      const node = path.node;

      if (node.callee?.type === "Identifier" && node.callee.name === "t") {
        found = true;
        return false;
      }

      this.traverse(path);
    },
  });

  return found;
}

// ─────────────────────────────────────────────────────────────────────────────
// Project transformer
// ─────────────────────────────────────────────────────────────────────────────

export async function transformProject(
  appRoot: string,
  strings: ExtractedString[],
  localeData: LocaleFile,
): Promise<TransformResult[]> {
  const config = await requireConfig(appRoot);

  const uniqueFiles = [...new Set(strings.map((s) => s.filePath))];
  logger.dim(`  Processing ${uniqueFiles.length} file(s)...`);

  const results: TransformResult[] = [];

  for (const filePath of uniqueFiles) {
    const result = transformFile(
      filePath,
      appRoot,
      strings,
      localeData,
      config,
    );
    results.push(result);

    if (result.modified) {
      logger.dim(
        `  ✓ ${path.relative(appRoot, filePath)}` +
          ` — ${result.replacements} replacement(s)`,
      );
    } else {
      logger.debug(`  ○ ${path.relative(appRoot, filePath)} — no changes`);
    }
  }

  return results;
}
