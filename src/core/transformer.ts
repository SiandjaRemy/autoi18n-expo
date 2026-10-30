import * as recast from "recast";
import { visit, builders as b } from "ast-types";
import path from "path";
import { readFileSafe } from "../utils/fs";
import { logger } from "../utils/logger";
import type { ExtractedString } from "./scanner";
import type { LocaleFile } from "./scaffolder";
import { normalizeJSXWhitespace } from "../utils/normalize";
import { requireConfig } from "../utils/config";
import type { EaiConfig } from "../types/config";
import { templateHasOnlySimpleExpressionsNode } from "../utils/templates";

export interface TransformResult {
  filePath: string;
  modified: boolean;
  replacements: number;
  newCode?: string;
}

// ─── Component / helper detection ───────────────────────────────────────────

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

function registerComponent(nodePath: any, componentBlocks: Set<any>): void {
  const node = nodePath.node;
  const parent = nodePath.parent?.node;
  if (isComponentFunction(node, parent)) {
    componentBlocks.add(node.body);
  }
}

function isNestedInsideComponent(nodePath: any): boolean {
  let current = nodePath.parent;

  while (current) {
    const node = current.node;
    const parent = current.parent?.node;
    const isFn =
      node?.type === "FunctionDeclaration" ||
      node?.type === "FunctionExpression" ||
      node?.type === "ArrowFunctionExpression";

    if (isFn && isComponentFunction(node, parent)) return true;
    current = current.parent;
  }

  return false;
}

function getHelperName(node: any, parent: any): string | null {
  if (node.type === "FunctionDeclaration" && node.id?.name) return node.id.name;
  if (
    parent?.type === "VariableDeclarator" &&
    parent.id?.type === "Identifier"
  ) {
    return parent.id.name;
  }
  return null;
}

// ─── Other utilities ───────────────────────────────────────────────────────────

function alreadyHasTParam(node: any): boolean {
  return node.params?.some(
    (p: any) => p.type === "Identifier" && p.name === "t",
  );
}

function buildTFunctionImport(): any {
  return b.importDeclaration(
    [b.importSpecifier(b.identifier("TFunction"), b.identifier("TFunction"))],
    b.literal("i18next"),
  );
}

function buildTFunctionParam(): any {
  const param = b.identifier("t");
  param.typeAnnotation = {
    type: "TSTypeAnnotation",
    typeAnnotation: {
      type: "TSTypeReference",
      typeName: { type: "Identifier", name: "TFunction" },
    },
  } as any;
  return param;
}

function functionBodyContainsTCall(block: any): boolean {
  if (!block || block.type !== "BlockStatement") return false;
  let found = false;
  visit(block, {
    visitCallExpression(p) {
      if (p.node.callee?.type === "Identifier" && p.node.callee.name === "t") {
        found = true;
        return false;
      }
      this.traverse(p);
    },
  });
  return found;
}

/**
 * True if this function is exported (named or default).
 * Non-exported local helpers may receive `t: TFunction`.
 * Exported helpers must use i18n.t so call sites in other files stay valid.
 */
function isExportedFunction(nodePath: any): boolean {
  let current = nodePath;
  while (current) {
    const node = current.node;
    const parent = current.parent?.node;

    if (
      node?.type === "ExportNamedDeclaration" ||
      node?.type === "ExportDefaultDeclaration"
    ) {
      return true;
    }

    // export function foo() {}
    if (
      parent?.type === "ExportNamedDeclaration" ||
      parent?.type === "ExportDefaultDeclaration"
    ) {
      return true;
    }

    // export { foo } — rare mid-replace; treat as exported if we only see the decl
    current = current.parent;
  }
  return false;
}

/**
 * Walk up to the nearest function; null if none (module scope).
 */
function getEnclosingFunctionPath(nodePath: any): any | null {
  let current = nodePath.parent;
  while (current) {
    const type = current.node?.type;
    if (
      type === "FunctionDeclaration" ||
      type === "FunctionExpression" ||
      type === "ArrowFunctionExpression"
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

type I18nStrategy = "t-component" | "t-helper" | "i18n";

/**
 * Decide how to rewrite a string at this AST path.
 */
function resolveI18nStrategy(
  nodePath: any,
  kind: "jsx" | "string" = "jsx",
): I18nStrategy {
  if (isNestedInsideComponent(nodePath)) return "t-component";

  // Utils / API: never inject t param
  if (kind === "string") return "i18n";

  const fnPath = getEnclosingFunctionPath(nodePath);
  if (!fnPath) return "i18n";

  if (
    !isExportedFunction(fnPath) &&
    isHelperFunction(fnPath.node, fnPath.parent?.node)
  ) {
    return "t-helper";
  }

  return "i18n";
}

// ─── AST builders ───────────────────────────────────────────────────────────

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

// ─── Lookup ─────────────────────────────────────────────────────────────────

function buildTextIndex(
  fileStrings: ExtractedString[],
): Map<string, ExtractedString> {
  const map = new Map<string, ExtractedString>();
  for (const s of fileStrings) {
    if (!map.has(s.originalText)) map.set(s.originalText, s);
  }
  return map;
}

function findExtracted(
  value: string,
  filePath: string,
  fileStrings: ExtractedString[],
  sourceType?: ExtractedString["sourceType"],
  byText?: Map<string, ExtractedString>,
): ExtractedString | undefined {
  const trimmed = value.trim();

  if (sourceType) {
    const exact = fileStrings.find(
      (s) =>
        s.filePath === filePath &&
        s.originalText === trimmed &&
        s.sourceType === sourceType,
    );
    if (exact) return exact;
  }

  if (byText?.has(trimmed)) return byText.get(trimmed);
  if (value !== trimmed && byText?.has(value)) return byText.get(value);

  return fileStrings.find(
    (s) => s.filePath === filePath && s.originalText === trimmed,
  );
}

function findExtractedTemplate(
  node: any,
  filePath: string,
  fileStrings: ExtractedString[],
  byText?: Map<string, ExtractedString>,
): ExtractedString | undefined {
  let text = "";
  const used = new Map<string, number>();

  node.quasis.forEach((quasi: any, i: number) => {
    text += quasi.value.cooked ?? quasi.value.raw ?? "";
    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      let name =
        expr.type === "Identifier"
          ? expr.name
          : expr.type === "MemberExpression" &&
              expr.property?.type === "Identifier"
            ? expr.property.name
            : `arg${i}`;
      const n = (used.get(name) ?? 0) + 1;
      used.set(name, n);
      if (n > 1) name = `${name}${n}`;
      text += `{{${name}}}`;
    }
  });

  const trimmed = text.trim();
  if (byText?.has(trimmed)) return byText.get(trimmed);
  return fileStrings.find(
    (s) => s.filePath === filePath && s.originalText === trimmed,
  );
}

function isTypeWrapper(type: string | undefined): boolean {
  return (
    type === "TSAsExpression" ||
    type === "TSSatisfiesExpression" ||
    type === "TSTypeAssertion" ||
    type === "TSNonNullExpression" ||
    type === "ParenthesizedExpression"
  );
}

function isUnderObjectLiteralRoot(nodePath: any): boolean {
  // nodePath = ObjectProperty; parent = ObjectExpression
  let current = nodePath.parent; // ObjectExpression
  if (!current || current.node?.type !== "ObjectExpression") return false;

  // Walk out through nested objects / array elements / properties
  let p = current.parent;
  while (p) {
    const type = p.node?.type;

    if (type === "VariableDeclarator") return true;
    if (type === "ReturnStatement") return true;
    if (type === "ExportDefaultDeclaration") return true;

    // Nested objects: { done: { label: "..." } }
    if (type === "ObjectExpression") {
      p = p.parent;
      continue;
    }

    // const X = [ { ... }, { ... } ]
    if (type === "ArrayExpression") {
      p = p.parent;
      continue;
    }
    // outer: { nested: { label: "..." } }
    if (type === "ObjectProperty" || type === "Property") {
      p = p.parent;
      continue;
    }
    // export const X = { ... }
    if (type === "VariableDeclaration" || type === "ExportNamedDeclaration") {
      p = p.parent;
      continue;
    }

    // CRITICAL — walk through TS / paren wrappers
    if (isTypeWrapper(type)) {
      p = p.parent;
      continue;
    }

    // {[...].map(...)} — array is callee.object of MemberExpression
    if (type === "MemberExpression") {
      p = p.parent;
      continue;
    }

    // Inline in JSX: {[ { label: "All" }, ... ]}
    if (type === "JSXExpressionContainer") {
      p = p.parent;
      continue;
    }

    // Attribute objects: options={{ title: "..." }} — handled by visitJSXAttribute
    if (type === "JSXAttribute") return false;

    // setItems([{ title, subtitle }]), etc.
    if (type === "CallExpression") {
      p = p.parent;
      continue; // then often JSXExpressionContainer → JSXElement
    }

    // Reached JSX element with inline array data
    if (type === "JSXElement" || type === "JSXFragment") {
      return true; // inline data arrays in JSX
    }

    break;
  }
  return false;
}

// ─── Imports ────────────────────────────────────────────────────────────────

function resolveI18nImportPath(
  filePath: string,
  appRoot: string,
  config: EaiConfig,
): string {
  const i18nAbs = path.join(appRoot, config.i18nFilePath ?? "src/i18n.ts");
  let rel = path.relative(path.dirname(filePath), i18nAbs).replace(/\\/g, "/");
  rel = rel.replace(/\.(ts|tsx|js|jsx)$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function hasI18nBinding(programBody: any[]): boolean {
  for (const node of programBody) {
    if (node.type !== "ImportDeclaration") continue;
    for (const spec of node.specifiers ?? []) {
      if (
        (spec.type === "ImportDefaultSpecifier" ||
          spec.type === "ImportNamespaceSpecifier" ||
          spec.type === "ImportSpecifier") &&
        spec.local?.name === "i18n"
      ) {
        return true;
      }
    }
  }
  return false;
}

function hasNamedImport(
  programBody: any[],
  source: string,
  name: string,
): boolean {
  return programBody.some(
    (node) =>
      node.type === "ImportDeclaration" &&
      node.source.value === source &&
      node.specifiers?.some(
        (spec: any) =>
          spec.type === "ImportSpecifier" && spec.imported?.name === name,
      ),
  );
}

function insertImport(programBody: any[], node: any): void {
  let lastImportIndex = -1;
  for (let i = 0; i < programBody.length; i++) {
    if (programBody[i].type === "ImportDeclaration") lastImportIndex = i;
  }
  if (lastImportIndex >= 0) programBody.splice(lastImportIndex + 1, 0, node);
  else programBody.unshift(node);
}

function addNamedImport(
  programBody: any[],
  source: string,
  name: string,
  buildFn: () => any,
): void {
  if (hasNamedImport(programBody, source, name)) return;
  insertImport(programBody, buildFn());
}

function addDefaultImport(
  programBody: any[],
  source: string,
  localName: string,
  buildFn: () => any,
): void {
  const exists = programBody.some(
    (node) =>
      node.type === "ImportDeclaration" &&
      node.source.value === source &&
      node.specifiers?.some(
        (spec: any) =>
          spec.type === "ImportDefaultSpecifier" &&
          spec.local?.name === localName,
      ),
  );
  if (exists) return;
  insertImport(programBody, buildFn());
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

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

// ─── Expression replacement ─────────────────────────────────────────────────

type ReplaceOptions = {
  useI18nInstance?: boolean;
  byText?: Map<string, ExtractedString>;
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

function buildCallForExtractedWithExprParams(
  extracted: ExtractedString,
  expressions: any[],
  useI18n: boolean,
): any {
  if (!extracted.params.length) {
    return useI18n
      ? buildI18nTCall(extracted.fullKey)
      : buildTCall(extracted.fullKey);
  }

  const props = extracted.params.map((paramName, i) => {
    const expr = expressions[i];
    if (expr?.type === "Identifier" && expr.name === paramName) {
      const prop = b.property(
        "init",
        b.identifier(paramName),
        b.identifier(paramName),
      );
      prop.shorthand = true;
      return prop;
    }
    // MemberExpression: { title: task.title }, { DEFAULT_NOTIF_COUNT: SCHEDULER_CONFIG.DEFAULT_NOTIF_COUNT }
    return b.property("init", b.identifier(paramName), expr);
  });

  const args = [b.literal(extracted.fullKey), b.objectExpression(props)];
  if (useI18n) {
    return b.callExpression(
      b.memberExpression(b.identifier("i18n"), b.identifier("t")),
      args,
    );
  }
  return b.callExpression(b.identifier("t"), args);
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
    const extracted = findExtracted(
      value,
      filePath,
      fileStrings,
      sourceType,
      options.byText,
    );
    if (!extracted) return [node, 0];
    return [buildCallForExtracted(extracted, useI18n), 1];
  }

  if (node.type === "TemplateLiteral") {
    if (templateHasOnlySimpleExpressionsNode(node)) {
      const extracted = findExtractedTemplate(
        node,
        filePath,
        fileStrings,
        options.byText,
      );
      if (!extracted) return [node, 0];
      return [
        buildCallForExtractedWithExprParams(
          extracted,
          node.expressions,
          useI18n,
        ),
        1,
      ];
    }

    const onlyIds = (node.expressions ?? []).every(
      (expr: any) => expr.type === "Identifier",
    );
    if (onlyIds) {
      const extracted = findExtractedTemplate(node, filePath, fileStrings);
      if (!extracted) return [node, 0];
      return [buildCallForExtracted(extracted, useI18n), 1];
    }
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
    const [c0, n0] = replaceStringNode(
      node.consequent,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (n0 > 0) {
      node.consequent = c0;
      count += n0;
    }
    const [c1, n1] = replaceStringNode(
      node.alternate,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (n1 > 0) {
      node.alternate = c1;
      count += n1;
    }
    return [node, count];
  }

  if (node.type === "LogicalExpression") {
    let count = 0;
    const [l, n0] = replaceStringNode(
      node.left,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (n0 > 0) {
      node.left = l;
      count += n0;
    }
    const [r, n1] = replaceStringNode(
      node.right,
      filePath,
      fileStrings,
      sourceType,
      options,
    );
    if (n1 > 0) {
      node.right = r;
      count += n1;
    }
    return [node, count];
  }

  if (node.type === "ObjectExpression") {
    let count = 0;
    for (const prop of node.properties ?? []) {
      if (prop.type !== "ObjectProperty" && prop.type !== "Property") continue;
      if (prop.computed) continue;
      const [newVal, c] = replaceStringNode(
        prop.value,
        filePath,
        fileStrings,
        sourceType,
        options,
      );
      if (c > 0) {
        prop.value = newVal;
        count += c;
      }
    }
    return [node, count];
  }

  if (node.type === "ArrayExpression") {
    let count = 0;
    for (let i = 0; i < (node.elements?.length ?? 0); i++) {
      const el = node.elements[i];
      if (!el || el.type === "SpreadElement") continue;
      const [newEl, c] = replaceStringNode(
        el,
        filePath,
        fileStrings,
        sourceType,
        options,
      );
      if (c > 0) {
        node.elements[i] = newEl;
        count += c;
      }
    }
    return [node, count];
  }

  return [node, 0];
}

function replaceAlertButtonObject(
  obj: any,
  filePath: string,
  fileStrings: ExtractedString[],
  useI18nInstance = false,
  byText?: Map<string, ExtractedString>,
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
      { useI18nInstance, byText },
    );
    if (c > 0) {
      prop.value = newValue;
      count += c;
    }
  }
  return count;
}

function replaceAlertButtonsArg(
  arg: any,
  filePath: string,
  fileStrings: ExtractedString[],
  useI18nInstance = false,
  byText?: Map<string, ExtractedString>,
): number {
  if (arg?.type !== "ArrayExpression") return 0;
  let count = 0;
  for (const el of arg.elements ?? []) {
    if (el?.type === "ObjectExpression") {
      count += replaceAlertButtonObject(
        el,
        filePath,
        fileStrings,
        useI18nInstance,
        byText,
      );
    }
  }
  return count;
}

// ─── File transform ─────────────────────────────────────────────────────────

export function transformFile(
  filePath: string,
  appRoot: string,
  strings: ExtractedString[],
  localeData: LocaleFile,
  config: EaiConfig,
): TransformResult {
  const code = readFileSafe(filePath);
  if (!code) return { filePath, modified: false, replacements: 0 };

  const fileStrings = strings.filter(
    (s) => s.filePath === filePath && localeData[s.fullKey] !== undefined,
  );

  const byText = buildTextIndex(fileStrings);

  if (fileStrings.length === 0) {
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
  let fileNeedsI18nImport = false;
  const componentBlocks = new Set<any>();
  const helpersNeedingT = new Map<string, any>();
  const helperNamesWithT = new Set<string>();

  visit(ast, {
    visitJSXText(nodePath) {
      const originalValue = nodePath.node.value as string;
      const normalized = normalizeJSXWhitespace(originalValue);
      if (!normalized) return this.traverse(nodePath);

      const extracted = findExtracted(
        normalized,
        filePath,
        fileStrings,
        "jsx-text",
        byText,
      );
      if (!extracted) return this.traverse(nodePath);

      const leadingChar = originalValue[0];
      const trailingChar = originalValue[originalValue.length - 1];

      const hasLeadingSpace = (() => {
        if (leadingChar !== " ") return false;
        const contentStart = originalValue.indexOf(normalized[0]);
        if (contentStart === 0) return false;
        return !originalValue.slice(0, contentStart).includes("\n");
      })();

      const hasTrailingSpace = (() => {
        if (trailingChar !== " ") return false;
        const contentEnd = originalValue.lastIndexOf(
          normalized[normalized.length - 1],
        );
        return !originalValue.slice(contentEnd + 1).includes("\n");
      })();

      const strategy = resolveI18nStrategy(nodePath);
      if (strategy === "i18n") fileNeedsI18nImport = true;

      const call =
        strategy === "i18n"
          ? buildI18nTCall(extracted.fullKey)
          : buildTCall(extracted.fullKey);

      // if strategy === "t-helper", register enclosing function for t injection
      if (strategy === "t-helper") {
        const fnPath = getEnclosingFunctionPath(nodePath);
        if (fnPath) {
          const name = getHelperName(fnPath.node, fnPath.parent?.node);
          if (name) helpersNeedingT.set(name, fnPath.node);
        }
      }

      if (!hasLeadingSpace && !hasTrailingSpace) {
        nodePath.replace(buildJSXExpression(call));
        totalReplacements++;
        return false;
      }

      const nodes: any[] = [];
      if (hasLeadingSpace) nodes.push(b.jsxText(" "));
      nodes.push(buildJSXExpression(call));
      if (hasTrailingSpace) nodes.push(b.jsxText(" "));

      nodePath.replace(nodes[0]);
      for (let i = nodes.length - 1; i >= 1; i--) {
        nodePath.insertAfter(nodes[i]);
      }
      totalReplacements++;
      return false;
    },

    visitJSXExpressionContainer(nodePath) {
      const parent = nodePath.parent?.node;
      if (parent?.type !== "JSXElement" && parent?.type !== "JSXFragment") {
        return this.traverse(nodePath);
      }
      const expr = nodePath.node.expression;
      if (!expr || expr.type === "JSXEmptyExpression") {
        return this.traverse(nodePath);
      }

      const strategy = resolveI18nStrategy(nodePath);
      const useI18n = strategy === "i18n";

      if (strategy === "t-helper") {
        const fnPath = getEnclosingFunctionPath(nodePath);
        if (fnPath) {
          const name = getHelperName(fnPath.node, fnPath.parent?.node);
          if (name) helpersNeedingT.set(name, fnPath.node);
        }
      }

      const replaceOpts = { useI18nInstance: useI18n, byText };

      // {[ { label: "All" }, ... ].map(...)}
      if (
        expr.type === "CallExpression" &&
        expr.callee?.type === "MemberExpression" &&
        expr.callee.object?.type === "ArrayExpression"
      ) {
        const [newArr, c] = replaceStringNode(
          expr.callee.object,
          filePath,
          fileStrings,
          "jsx-expression",
          replaceOpts,
        );
        if (c > 0) {
          expr.callee.object = newArr;
          totalReplacements += c;
          if (useI18n) fileNeedsI18nImport = true;
        }
      }

      // LogicalExpression: condition && " — string"
      // + any other expression replaceStringNode understands
      const [newExpr, count] = replaceStringNode(
        expr,
        filePath,
        fileStrings,
        "jsx-expression",
        replaceOpts,
      );
      if (count > 0) {
        nodePath.node.expression = newExpr;
        totalReplacements += count;
        if (useI18n) fileNeedsI18nImport = true;
      }

      this.traverse(nodePath);
    },

    visitJSXAttribute(nodePath) {
      const { value } = nodePath.node;

      // ── Case A: plain string attribute ───────────────────────────────────
      // <Button title="Submit" />
      if (value?.type === "StringLiteral" || value?.type === "Literal") {
        if (typeof value.value === "string") {
          const extracted = findExtracted(
            value.value,
            filePath,
            fileStrings,
            "jsx-attribute",
            byText,
          );
          if (extracted) {
            const strategy = resolveI18nStrategy(nodePath);
            if (strategy === "i18n") fileNeedsI18nImport = true;

            if (strategy === "t-helper") {
              const fnPath = getEnclosingFunctionPath(nodePath);
              if (fnPath) {
                const name = getHelperName(fnPath.node, fnPath.parent?.node);
                if (name) helpersNeedingT.set(name, fnPath.node);
              }
            }

            const call =
              strategy === "i18n"
                ? buildI18nTCall(extracted.fullKey)
                : buildTCall(extracted.fullKey);

            nodePath.node.value = buildJSXExpression(call);
            totalReplacements++;
          }
        }
        this.traverse(nodePath);
        return;
      }

      // ── Case B: expression container ─────────────────────────────────────
      // <Pressable accessibilityLabel={`Filter by ${label}`} />
      // <Input placeholder={isLoading ? "Loading..." : "Enter email"} />
      // <Tabs.Screen options={{ title: "Tasks" }} />
      if (value?.type === "JSXExpressionContainer") {
        const expr = value.expression;
        if (!expr || expr.type === "JSXEmptyExpression") {
          this.traverse(nodePath);
          return;
        }

        const strategy = resolveI18nStrategy(nodePath);
        const useI18n = strategy === "i18n";

        if (strategy === "t-helper") {
          const fnPath = getEnclosingFunctionPath(nodePath);
          if (fnPath) {
            const name = getHelperName(fnPath.node, fnPath.parent?.node);
            if (name) helpersNeedingT.set(name, fnPath.node);
          }
        }

        // Sub-case B1: non-object expression on a known translatable prop
        // e.g. accessibilityLabel={`Filter by ${label}`}
        if (expr.type !== "ObjectExpression") {
          const [newExpr, count] = replaceStringNode(
            expr,
            filePath,
            fileStrings,
            "jsx-attribute",
            { useI18nInstance: useI18n, byText },
          );
          if (count > 0) {
            value.expression = newExpr;
            totalReplacements += count;
            if (useI18n) fileNeedsI18nImport = true;
          }
          this.traverse(nodePath);
          return;
        }

        // Sub-case B2: object literal containing translatable keys
        // e.g. options={{ title: "Tasks", headerBackTitle: "Back" }}
        // Each matching property is replaced with a t() call directly —
        // no JSXExpressionContainer wrapping since we are inside a JS object.
        for (const prop of expr.properties ?? []) {
          if (prop.type !== "ObjectProperty" && prop.type !== "Property")
            continue;
          if (prop.computed) continue;

          const [newVal, count] = replaceStringNode(
            prop.value,
            filePath,
            fileStrings,
            "jsx-attribute",
            { useI18nInstance: useI18n, byText },
          );
          if (count > 0) {
            prop.value = newVal;
            totalReplacements += count;
            if (useI18n) fileNeedsI18nImport = true;
          }
        }
      }

      this.traverse(nodePath);
    },

    visitCallExpression(nodePath) {
      const { callee, arguments: args } = nodePath.node;
      let calleeName: string | null = null;

      if (callee.type === "Identifier") calleeName = (callee as any).name;
      else if (
        callee.type === "MemberExpression" &&
        callee.object?.type === "Identifier" &&
        callee.property?.type === "Identifier"
      ) {
        calleeName = `${(callee.object as any).name}.${(callee.property as any).name}`;
      }

      if (calleeName === "Alert.alert") {
        const strategy = resolveI18nStrategy(nodePath, "jsx");
        const useI18n = strategy === "i18n";

        if (strategy === "t-helper") {
          const fnPath = getEnclosingFunctionPath(nodePath);
          if (fnPath) {
            const name = getHelperName(fnPath.node, fnPath.parent?.node);
            if (name) helpersNeedingT.set(name, fnPath.node);
          }
        }

        args.forEach((arg: any, index: number) => {
          if (!arg || arg.type === "SpreadElement") return;

          if (index === 0 || index === 1) {
            const [newArg, count] = replaceStringNode(
              arg,
              filePath,
              fileStrings,
              "alert",
              { useI18nInstance: useI18n, byText },
            );
            if (count > 0) {
              nodePath.node.arguments[index] = newArg;
              totalReplacements += count;
              if (useI18n) fileNeedsI18nImport = true;
            }
          } else if (index === 2) {
            const n = replaceAlertButtonsArg(
              arg,
              filePath,
              fileStrings,
              useI18n,
              byText,
            );
            totalReplacements += n;
            if (n > 0 && useI18n) fileNeedsI18nImport = true;
          }
        });
      } else if (calleeName) {
        // Rewrite any call args that match scanned strings (byText),
        // not only sourceType === "call"
        if (fileStrings.length === 0) {
          this.traverse(nodePath);
          return;
        }

        const strategy = resolveI18nStrategy(nodePath, "string"); // module util → i18n
        const useI18n = strategy === "i18n";

        args.forEach((arg: any, index: number) => {
          if (!arg || arg.type === "SpreadElement") return;
          const [newArg, count] = replaceStringNode(
            arg,
            filePath,
            fileStrings,
            "jsx-expression", // object-literal leaves; byText still matches
            { useI18nInstance: useI18n, byText },
          );
          if (count > 0) {
            nodePath.node.arguments[index] = newArg;
            totalReplacements += count;
            if (useI18n) fileNeedsI18nImport = true;
          }
        });
      }

      this.traverse(nodePath);
    },

    visitThrowStatement(nodePath) {
      const { argument } = nodePath.node;
      if (
        argument?.type !== "NewExpression" ||
        argument.callee?.type !== "Identifier" ||
        argument.callee.name !== "Error"
      ) {
        return this.traverse(nodePath);
      }

      const useI18nInstance = !isNestedInsideComponent(nodePath);

      argument.arguments.forEach((arg: any, index: number) => {
        if (!arg || arg.type === "SpreadElement") return;
        const [newArg, count] = replaceStringNode(
          arg,
          filePath,
          fileStrings,
          "throw",
          { useI18nInstance, byText },
        );
        if (count > 0) {
          argument.arguments[index] = newArg;
          totalReplacements += count;
          if (useI18nInstance) fileNeedsI18nImport = true;
        }
      });

      this.traverse(nodePath);
    },

    visitReturnStatement(nodePath) {
      const arg = nodePath.node.argument;
      if (!arg) return this.traverse(nodePath);

      const strategy = resolveI18nStrategy(nodePath, "string");
      const useI18n = strategy === "i18n";

      /**
       * Object / array returns (e.g. return { actions: [{ label: "..." }] })
       * are scanned as object-literal leaves with sourceType "jsx-expression".
       * Scalar returns (return "...") use sourceType "return".
       * byText fallback covers mismatches either way.
       */
      const sourceType =
        arg.type === "ObjectExpression" || arg.type === "ArrayExpression"
          ? "jsx-expression"
          : "return";

      const [newArg, count] = replaceStringNode(
        arg,
        filePath,
        fileStrings,
        sourceType,
        { useI18nInstance: useI18n, byText },
      );

      if (count > 0) {
        nodePath.node.argument = newArg;
        totalReplacements += count;
        if (useI18n) fileNeedsI18nImport = true;
      }

      this.traverse(nodePath);
    },

    visitFunctionDeclaration(nodePath) {
      registerComponent(nodePath, componentBlocks);
      this.traverse(nodePath);
    },

    visitFunctionExpression(nodePath) {
      registerComponent(nodePath, componentBlocks);
      this.traverse(nodePath);
    },

    visitArrowFunctionExpression(nodePath) {
      registerComponent(nodePath, componentBlocks);
      this.traverse(nodePath);
    },

    visitObjectProperty(nodePath) {
      if (!config.detectObjectLiterals) return this.traverse(nodePath);
      if (!isUnderObjectLiteralRoot(nodePath)) return this.traverse(nodePath);

      const prop = nodePath.node;
      if (prop.type !== "ObjectProperty" && prop.type !== "Property") {
        return this.traverse(nodePath);
      }
      if (prop.computed) return this.traverse(nodePath);

      const strategy = resolveI18nStrategy(nodePath, "string");
      const useI18n = strategy === "i18n";

      const [newVal, count] = replaceStringNode(
        prop.value,
        filePath,
        fileStrings,
        "jsx-expression", // scanner uses this for object literals
        { useI18nInstance: useI18n, byText },
      );
      if (count > 0) {
        prop.value = newVal;
        totalReplacements += count;
        if (useI18n) fileNeedsI18nImport = true;
      }

      if (prop.value?.type === "ArrayExpression") {
        for (let i = 0; i < (prop.value.elements?.length ?? 0); i++) {
          const element = prop.value.elements[i];
          if (!element || element.type === "SpreadElement") continue;
          const [newEl, c] = replaceStringNode(
            element,
            filePath,
            fileStrings,
            "jsx-expression",
            { useI18nInstance: useI18n, byText },
          );
          if (c > 0) {
            prop.value.elements[i] = newEl;
            totalReplacements += c;
            if (useI18n) fileNeedsI18nImport = true;
          }
        }
      }

      this.traverse(nodePath);
    },
  });

  if (totalReplacements === 0) {
    return { filePath, modified: false, replacements: 0 };
  }

  // ── Non-exported JSX helpers: t param + same-file call sites ───────────────
  for (const [name, funcNode] of helpersNeedingT) {
    if (functionBodyContainsTCall(funcNode.body)) {
      helperNamesWithT.add(name);
    }
  }

  for (const name of helperNamesWithT) {
    const funcNode = helpersNeedingT.get(name);
    if (!funcNode || alreadyHasTParam(funcNode)) continue;
    funcNode.params.push(buildTFunctionParam());
  }

  if (helperNamesWithT.size > 0) {
    visit(ast, {
      visitCallExpression(nodePath) {
        const { callee, arguments: args } = nodePath.node;

        if (callee.type !== "Identifier") return this.traverse(nodePath);

        const calleeName = (callee as any).name;
        if (!helperNamesWithT.has(calleeName)) return this.traverse(nodePath);

        const lastArg = args[args.length - 1];
        const alreadyHasT =
          lastArg?.type === "Identifier" && (lastArg as any).name === "t";
        if (!alreadyHasT) {
          nodePath.node.arguments.push(b.identifier("t"));
        }
        this.traverse(nodePath);
      },
    });

    addNamedImport(
      ast.program.body,
      "i18next",
      "TFunction",
      buildTFunctionImport,
    );
  }

  for (const block of componentBlocks) {
    if (block?.type === "BlockStatement") injectTDeclaration(block.body);
  }

  if (componentBlocks.size > 0) {
    addNamedImport(
      ast.program.body,
      "react-i18next",
      "useTranslation",
      buildUseTranslationImport,
    );
  }

  if (fileNeedsI18nImport && !hasI18nBinding(ast.program.body)) {
    const importPath = resolveI18nImportPath(filePath, appRoot, config);
    addDefaultImport(ast.program.body, importPath, "i18n", () =>
      b.importDeclaration(
        [b.importDefaultSpecifier(b.identifier("i18n"))],
        b.literal(importPath),
      ),
    );
  }

  return {
    filePath,
    modified: true,
    replacements: totalReplacements,
    newCode: recast.print(ast).code,
  };
}

export async function transformProject(
  appRoot: string,
  strings: ExtractedString[],
  localeData: LocaleFile,
): Promise<TransformResult[]> {
  const config = await requireConfig(appRoot);
  const uniqueFiles = [...new Set(strings.map((s) => s.filePath))];
  const results: TransformResult[] = [];

  for (const filePath of uniqueFiles) {
    results.push(transformFile(filePath, appRoot, strings, localeData, config));
  }

  return results;
}
