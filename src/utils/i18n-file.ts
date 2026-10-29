import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { writeFile } from "../utils/fs";
import type { EaiConfig } from "../types/config";

/**
 * Resolves the absolute path to the i18n config file.
 *
 * Uses config.i18nFilePath which is relative to the app root.
 * Falls back to 'src/i18n.ts' if not set.
 */
export function resolveI18nFilePath(
  appRoot: string,
  config: EaiConfig,
): string {
  return path.join(appRoot, config.i18nFilePath ?? "src/i18n.ts");
}

/**
 * Generates the initial i18n.ts file with no locale imports.
 *
 * Called by `eai init`. At init time no locales exist yet, so
 * the resources object is empty. Subsequent commands (scan,
 * locales-generate) add locale imports via updateI18nFile().
 *
 * The generated file is intentionally minimal — just enough to
 * initialize i18next so the app doesn't crash before locales are added.
 *
 * @param appRoot - Absolute path to the project root
 * @param config  - The loaded eai config
 * @param force - When true, overwrite an existing file.
 */
export function generateInitialI18nFile(
  appRoot: string,
  config: EaiConfig,
  force = false,
): { created: boolean; skipped: boolean; path: string } {
  const filePath = resolveI18nFilePath(appRoot, config);
  const relativePath = config.i18nFilePath ?? "src/i18n.ts";

  if (fs.existsSync(filePath) && !force) {
    logger.warn(
      `  ${relativePath} already exists — skipping generation.\n` +
        `  Delete it and re-run "eai init", or use "eai init --force" to overwrite.`,
    );
    return { created: false, skipped: true, path: relativePath };
  }

  const content = buildI18nFileContent("", [], config);
  writeFile(filePath, content);

  if (force && fs.existsSync(filePath)) {
    logger.success(`Overwrote ${relativePath}`);
  } else {
    logger.success(`Generated ${relativePath}`);
  }

  return { created: true, skipped: false, path: relativePath };
}

/**
 * Adds a locale import to the i18n.ts file.
 *
 * Called after:
 *   - `eai scan` (adds the default language)
 *   - `eai locales-generate` (adds target languages)
 *
 * Strategy: rather than trying to surgically patch the file with AST,
 * we rewrite it entirely from scratch using the known locale structure.
 * This is simpler and more reliable than trying to inject into an
 * arbitrary user-edited file.
 *
 * New strategy: patch the existing file with the new language code
 * to preserve any manual update made by the user
 *
 * We read the existing file to extract which languages are already
 * imported, then regenerate with all languages including the new one.
 *
 * @param appRoot     - Absolute path to the project root
 * @param config      - The loaded eai config
 * @param newLanguage - The language code to add e.g. 'fr'
 *
 * @returns true if the file was created or updated, false if unchanged
 */
export function addLocaleToI18nFile(
  appRoot: string,
  config: EaiConfig,
  newLanguage: string,
): boolean {
  const filePath = resolveI18nFilePath(appRoot, config);

  if (!fs.existsSync(filePath)) {
    /**
     * File doesn't exist yet — generate it fresh with this language.
     * This handles the case where the user deleted i18n.ts or never
     * ran init but is now running scan.
     */
    const content = buildI18nFileContent(
      config.defaultLanguage,
      [newLanguage].filter((l) => l !== config.defaultLanguage),
      config,
    );
    writeFile(filePath, content);
    return true;
  }

  const existing = fs.readFileSync(filePath, "utf-8");

  if (localeAlreadyWired(existing, newLanguage)) {
    logger.dim(
      `  ${config.i18nFilePath} already wires "${newLanguage}" — skipping`,
    );
    return false;
  }

  const importPath = computeLocaleImportPath(config, newLanguage);
  const next = injectLocaleIntoI18nSource(existing, newLanguage, importPath);

  if (next === existing) {
    logger.warn(
      `  Could not auto-wire "${newLanguage}" into ${config.i18nFilePath}.\n` +
        `  Add manually:\n` +
        `    import ${newLanguage} from '${importPath}'\n` +
        `    // and in resources: ${newLanguage}: { translation: ${newLanguage} },`,
    );
    return false;
  }

  writeFile(filePath, next);
  logger.success(`Updated ${config.i18nFilePath} — added "${newLanguage}"`);
  return true;
}

function localeAlreadyWired(source: string, lang: string): boolean {
  // import en from '...'
  const importRe = new RegExp(
    `^import\\s+${lang}\\s+from\\s+['"][^'"]+['"]`,
    "m",
  );
  // en: { translation: en }
  const resourceRe = new RegExp(
    `(^|\\s)${lang}\\s*:\\s*\\{\\s*translation\\s*:\\s*${lang}\\s*\\}`,
    "m",
  );
  return importRe.test(source) && resourceRe.test(source);
}

function computeLocaleImportPath(config: EaiConfig, lang: string): string {
  const i18nDir = path.dirname(
    path.join("/", config.i18nFilePath ?? "src/i18n.ts"),
  );
  const localeFile = config.localeFileName
    ? `${config.localesDir}/${lang}/${config.localeFileName}.json`
    : `${config.localesDir}/${lang}.json`;
  const relative = path
    .relative(i18nDir, path.join("/", localeFile))
    .replace(/\\/g, "/");
  return relative.startsWith(".") ? relative : `./${relative}`;
}

/**
 * 1) Insert `import <lang> from '<path>'` after the last import (or after react-i18next).
 * 2) Insert `<lang>: { translation: <lang> },` inside resources: { ... }.
 */
function injectLocaleIntoI18nSource(
  source: string,
  lang: string,
  importPath: string,
): string {
  let out = source;

  // ── Import ───────────────────────────────────────────────────────────────
  const importLine = `import ${lang} from '${importPath}'`;
  if (!new RegExp(`^import\\s+${lang}\\s+from\\s+`, "m").test(out)) {
    const importLines = [...out.matchAll(/^import\s+.+$/gm)];
    if (importLines.length > 0) {
      const last = importLines[importLines.length - 1];
      const insertAt = (last.index ?? 0) + last[0].length;
      out = out.slice(0, insertAt) + "\n" + importLine + out.slice(insertAt);
    } else {
      out = importLine + "\n" + out;
    }
  }

  // ── resources entry ──────────────────────────────────────────────────────
  const entryLine = `    ${lang}: { translation: ${lang} },`;
  const entryRe = new RegExp(
    `(^|\\s)${lang}\\s*:\\s*\\{\\s*translation\\s*:\\s*${lang}\\s*\\}`,
    "m",
  );
  if (entryRe.test(out)) return out;

  // resources: { ... }  — insert before the closing brace of resources
  const resourcesMatch = out.match(/resources\s*:\s*\{/);
  if (!resourcesMatch || resourcesMatch.index === undefined) {
    return source; // can't find resources — leave file untouched
  }

  const openIdx = resourcesMatch.index + resourcesMatch[0].length;
  // Find matching } for resources object (simple brace depth from openIdx)
  let depth = 1;
  let i = openIdx;
  for (; i < out.length; i++) {
    if (out[i] === "{") depth++;
    else if (out[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return source;

  // Insert before closing brace; keep a newline
  const before = out.slice(0, i);
  const after = out.slice(i);
  const needsNewline = !before.endsWith("\n");
  out = before + (needsNewline ? "\n" : "") + entryLine + "\n" + after;

  return out;
}

/**
 * Extracts language codes that are already imported in an i18n.ts file.
 *
 * We look for import lines that match our generated pattern:
 *   import en from './locales/en.json'
 *   import fr from '../locales/fr/translation.json'
 *
 * We extract the language code from the variable name (the part after `import `).
 * This is more reliable than parsing the path since paths vary by config.
 *
 * @param content - The current content of the i18n.ts file
 */
export function extractLanguagesFromI18nFile(content: string): string[] {
  /**
   * Match lines like:
   *   import en from '...'
   *   import fr from "..."
   *
   * The variable name after `import ` is the language code.
   * We filter to only two-letter codes to avoid matching other imports
   * like `import i18n from 'i18next'`.
   */
  const importPattern = /^import\s+([a-z]{2})\s+from\s+['"][^'"]+['"]/gm;
  const languages: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(content)) !== null) {
    languages.push(match[1]);
  }

  return [...new Set(languages)]; // deduplicate
}

/**
 * Builds the full content of an i18n.ts file.
 *
 * The file structure:
 *   1. Imports for i18next and react-i18next
 *   2. Locale imports (one per language, only when locales exist)
 *   3. i18n.init() call with resources
 *   4. Default export
 *
 * Called in two scenarios:
 *
 * A) Initial generation (from `eai init`):
 *    defaultLang is 'en' and targetLanguages is [].
 *    No locale imports are emitted — resources is empty.
 *    The file is valid but does nothing until `eai scan` runs.
 *
 * B) After scan or locales-generate:
 *    defaultLang is e.g. 'en' and targetLanguages may include 'fr', 'es'.
 *    Locale imports are emitted for every language.
 *
 * The locale import path is computed relative to the i18n file's own
 * directory, not the project root, so it works regardless of where
 * i18nFilePath points.
 *
 * @param defaultLang     - The default language code e.g. 'en'.
 *                          Pass '' when generating the initial empty file.
 * @param targetLanguages - Additional language codes already generated
 *                          e.g. ['fr', 'es']. Ignored when defaultLang is ''.
 * @param config          - The full eai config (for path resolution)
 */
export function buildI18nFileContent(
  defaultLang: string,
  targetLanguages: string[],
  config: EaiConfig,
): string {
  /**
   * When defaultLang is an empty string we are generating the initial
   * placeholder file — no locales exist yet so we emit nothing.
   * When defaultLang is set, we include it plus any target languages.
   */
  const allLanguages = defaultLang ? [defaultLang, ...targetLanguages] : [];

  const hasLocales = allLanguages.length > 0;

  /**
   * The i18n file's directory — used as the base for computing
   * relative import paths to locale JSON files.
   *
   * We join with a fake absolute root '/' so path.relative works
   * consistently on both Windows and Unix without needing appRoot.
   *
   * Example:
   *   i18nFilePath: 'src/i18n.ts'  →  i18nDir: '/src'
   *   localesDir:   'src/locales'  →  localeAbsolute: '/src/locales/en.json'
   *   relative:     './locales/en.json'
   *
   *   i18nFilePath: 'src/i18n.ts'  →  i18nDir: '/src'
   *   localesDir:   'locales'      →  localeAbsolute: '/locales/en.json'
   *   relative:     '../locales/en.json'
   */
  const i18nDir = path.dirname(
    path.join("/", config.i18nFilePath ?? "src/i18n.ts"),
  );

  /**
   * Computes the import path for a single locale file, relative to
   * the i18n file's directory.
   *
   * @param lang - Language code e.g. 'en', 'fr'
   */
  function localeImportPath(lang: string): string {
    const localeFile = config.localeFileName
      ? `${config.localesDir}/${lang}/${config.localeFileName}.json`
      : `${config.localesDir}/${lang}.json`;

    const localeAbsolute = path.join("/", localeFile);
    const relative = path.relative(i18nDir, localeAbsolute).replace(/\\/g, "/");

    // Ensure path starts with ./ or ../ — bare paths don't work as imports
    return relative.startsWith(".") ? relative : `./${relative}`;
  }

  /**
   * Build locale import lines.
   * One line per language: import en from './locales/en.json'
   * Empty string when no locales exist yet.
   */
  const localeImports = hasLocales
    ? allLanguages
        .map((lang) => `import ${lang} from '${localeImportPath(lang)}'`)
        .join("\n")
    : "";

  /**
   * Build the resources object entries.
   * One line per language: en: { translation: en },
   * Empty string when no locales exist yet — resources: {} is valid i18next.
   */
  const resourcesEntries = hasLocales
    ? allLanguages
        .map((lang) => `    ${lang}: { translation: ${lang} },`)
        .join("\n")
    : "";

  /**
   * The lng value to pass to i18n.init().
   * Uses the default language when known, falls back to 'en' for the
   * initial empty file so the output is always valid TypeScript.
   */
  const activeLang = defaultLang || "en";

  /**
   * Build the file top-to-bottom. Note the three import lines at the
   * top — i18next (default), initReactI18next (named), and the optional
   * locale imports — followed by the init call and the default export.
   *
   * The leading newline before the locale imports is added only when
   * they exist, so the initial file has no trailing blank gap.
   */
  const importBlock = [
    `import i18n from 'i18next'`,
    `import { initReactI18next } from 'react-i18next'`,
    hasLocales ? localeImports : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `${importBlock}

i18n.use(initReactI18next).init({
  resources: {
${resourcesEntries}
  },
  lng: '${activeLang}',
  fallbackLng: '${activeLang}',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
`;
}

export function removeLocaleFromI18nFile(
  appRoot: string,
  config: EaiConfig,
  lang: string,
): boolean {
  const filePath = resolveI18nFilePath(appRoot, config);
  if (!fs.existsSync(filePath)) return false;

  let source = fs.readFileSync(filePath, "utf-8");
  const before = source;

  // Remove import line
  source = source.replace(
    new RegExp(`^import\\s+${lang}\\s+from\\s+['"][^'"]+['"];?\\r?\\n?`, "m"),
    "",
  );

  // Remove resources entry (with optional trailing comma handled simply)
  source = source.replace(
    new RegExp(
      `\\s*${lang}\\s*:\\s*\\{\\s*translation\\s*:\\s*${lang}\\s*\\},?\\r?\\n?`,
      "g",
    ),
    "\n",
  );

  if (source === before) return false;
  writeFile(filePath, source);
  return true;
}
