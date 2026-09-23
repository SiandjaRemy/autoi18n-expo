import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import { visit } from "ast-types";
import * as recast from "recast";
import { resolveLocaleFilePath } from "../utils/locale-path";

/**
 * Edits the i18n.ts file to import and register locale files that
 * aren't already wired in. Idempotent — safe to run repeatedly.
 *
 * Returns the list of language codes that were newly added.
 * Returns [] if the file doesn't exist or nothing needed adding.
 */
export function wireLocaleImports(
  i18nFilePath: string,
  localesDir: string,
  localeFileName: string | null,
  languages: string[],
): string[] {
  if (!fs.existsSync(i18nFilePath)) {
    console.warn(
      `⚠ ${i18nFilePath} not found — skipping import wiring.\n` +
        `  Create it first (see \`eai scan\` output for the template), ` +
        `then re-run with --with-imports.`,
    );
    return [];
  }

  const source = fs.readFileSync(i18nFilePath, "utf-8");

  const ast = recast.parse(source, {
    parser: {
      parse: (src: string) =>
        parse(src, { sourceType: "module", plugins: ["typescript"] }),
    },
  });

  const b = recast.types.builders;

  // ── 1. Collect existing import sources so we never duplicate ─────────────
  const existingImportSources = new Set<string>();

  visit(ast, {
    visitImportDeclaration(path) {
      existingImportSources.add(path.node.source.value as string);
      this.traverse(path);
    },
  });

  // ── 2. Build import declarations for languages not yet imported ──────────
  const i18nDir = path.dirname(i18nFilePath);
  const addedLangs: string[] = [];
  const newImportNodes: any[] = [];

  for (const lang of languages) {
    const localeFilePath = resolveLocaleFilePath(
      { localesDir, localeFileName },
      lang,
    );

    let importPath =
      "./" + path.relative(i18nDir, localeFilePath).replace(/\\/g, "/");
    if (!importPath.startsWith(".")) importPath = "./" + importPath;

    if (existingImportSources.has(importPath)) continue;

    newImportNodes.push(
      b.importDeclaration(
        [b.importDefaultSpecifier(b.identifier(lang))],
        b.stringLiteral(importPath),
      ),
    );
    addedLangs.push(lang);
  }

  if (newImportNodes.length === 0) {
    return []; // everything already wired
  }

  // ── 3. Insert new imports after the last existing import ─────────────────
  const programBody = ast.program.body;
  let lastImportIndex = -1;

  programBody.forEach((node: any, i: number) => {
    if (node.type === "ImportDeclaration") lastImportIndex = i;
  });

  programBody.splice(lastImportIndex + 1, 0, ...newImportNodes);

  // ── 4. Add entries to the `resources` object ──────────────────────────────
  visit(ast, {
    visitObjectProperty(path) {
      const key = path.node.key;
      const keyName = key.type === "Identifier" ? key.name : (key as any).value;

      if (
        keyName === "resources" &&
        path.node.value.type === "ObjectExpression"
      ) {
        for (const lang of addedLangs) {
          (path.node.value as any).properties.push(
            b.objectProperty(
              b.identifier(lang),
              b.objectExpression([
                b.objectProperty(
                  b.identifier("translation"),
                  b.identifier(lang),
                ),
              ]),
            ),
          );
        }
      }

      this.traverse(path);
    },
  });

  // ── 5. Write back ──────────────────────────────────────────────────────────
  const output = recast.print(ast).code;
  fs.writeFileSync(i18nFilePath, output);

  return addedLangs;
}
