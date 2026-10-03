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
      if (expr.type === "Identifier") paramName = expr.name;
      else if (
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

type ReplaceOptions = { useI18nInstance?: boolean };

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

  return [node, 0];
}

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

function replaceAlertButtonsArg(
  arg: any,
  filePath: string,
  fileStrings: ExtractedString[],
): number {
  if (arg?.type !== "ArrayExpression") return 0;
  let count = 0;
  for (const el of arg.elements ?? []) {
    if (el?.type === "ObjectExpression") {
      count += replaceAlertButtonObject(el, filePath, fileStrings);
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

      const call = buildTCall(extracted.fullKey);
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
        if (typeof value.value === "string") {
          const extracted = findExtracted(
            value.value,
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

      if (callee.type === "Identifier") calleeName = (callee as any).name;
      else if (
        callee.type === "MemberExpression" &&
        callee.object?.type === "Identifier" &&
        callee.property?.type === "Identifier"
      ) {
        calleeName = `${(callee.object as any).name}.${(callee.property as any).name}`;
      }

      if (calleeName === "Alert.alert") {
        args.forEach((arg: any, index: number) => {
          if (!arg || arg.type === "SpreadElement") return;
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
          } else if (index === 2) {
            totalReplacements += replaceAlertButtonsArg(
              arg,
              filePath,
              fileStrings,
            );
          }
        });
      } else if (
        calleeName &&
        fileStrings.some((s) => s.sourceType === "call")
      ) {
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
        argument?.type !== "NewExpression" ||
        argument.callee?.type !== "Identifier" ||
        argument.callee.name !== "Error"
      ) {
        return this.traverse(nodePath);
      }

      const useI18nInstance = !isNestedInsideComponent(nodePath);

      argument.arguments.forEach((arg: any, index: number) => {
        if (
          (arg.type !== "StringLiteral" && arg.type !== "Literal") ||
          typeof arg.value !== "string"
        ) {
          return;
        }
        const extracted = findExtracted(
          arg.value,
          filePath,
          fileStrings,
          "throw",
        );
        if (!extracted) return;

        argument.arguments[index] = buildCallForExtracted(
          extracted,
          useI18nInstance,
        );
        totalReplacements++;
        if (useI18nInstance) fileNeedsI18nImport = true;
      });

      this.traverse(nodePath);
    },

    visitReturnStatement(nodePath) {
      const arg = nodePath.node.argument;
      if (!arg) return this.traverse(nodePath);

      const useI18nInstance = !isNestedInsideComponent(nodePath);
      const [newArg, count] = replaceStringNode(
        arg,
        filePath,
        fileStrings,
        "return",
        { useI18nInstance },
      );
      if (count > 0) {
        nodePath.node.argument = newArg;
        totalReplacements += count;
        if (useI18nInstance) fileNeedsI18nImport = true;
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
  });

  if (totalReplacements === 0) {
    return { filePath, modified: false, replacements: 0 };
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
