import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { writeFile } from "../utils/fs";
import type { RaiConfig } from "../types/config";

/**
 * Resolves the absolute path to the i18n config file.
 *
 * Uses config.i18nFilePath which is relative to the app root.
 * Falls back to 'src/i18n.ts' if not set.
 */
export function resolveI18nFilePath(
  appRoot: string,
  config: RaiConfig,
): string {
  return path.join(appRoot, config.i18nFilePath ?? "src/i18n.ts");
}

/**
 * Generates the initial i18n.ts file with no locale imports.
 *
 * Called by `rai init`. At init time no locales exist yet, so
 * the resources object is empty. Subsequent commands (scan,
 * locales-generate) add locale imports via updateI18nFile().
 *
 * The generated file is intentionally minimal — just enough to
 * initialize i18next so the app doesn't crash before locales are added.
 *
 * @param appRoot - Absolute path to the project root
 * @param config  - The loaded rai config
 */
export function generateInitialI18nFile(
  appRoot: string,
  config: RaiConfig,
): void {
  const filePath = resolveI18nFilePath(appRoot, config);

  /**
   * Don't overwrite an existing i18n file — the user may have
   * customized it. They can delete it and re-run init if they want
   * a fresh one.
   */
  if (fs.existsSync(filePath)) {
    logger.warn(
      `  ${config.i18nFilePath} already exists — skipping generation.\n` +
        `  Delete it and re-run "rai init" if you want a fresh one.`,
    );
    return;
  }

  const content = buildI18nFileContent("", [], config);
  writeFile(filePath, content);
  logger.success(`Generated ${config.i18nFilePath}`);
}

/**
 * Adds a locale import to the i18n.ts file.
 *
 * Called after:
 *   - `rai scan` (adds the default language)
 *   - `rai locales-generate` (adds target languages)
 *
 * Strategy: rather than trying to surgically patch the file with AST,
 * we rewrite it entirely from scratch using the known locale structure.
 * This is simpler and more reliable than trying to inject into an
 * arbitrary user-edited file.
 *
 * We read the existing file to extract which languages are already
 * imported, then regenerate with all languages including the new one.
 *
 * @param appRoot     - Absolute path to the project root
 * @param config      - The loaded rai config
 * @param newLanguage - The language code to add e.g. 'fr'
 */
export function addLocaleToI18nFile(
  appRoot: string,
  config: RaiConfig,
  newLanguage: string,
): void {
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
    logger.success(`Generated ${config.i18nFilePath} with "${newLanguage}"`);
    return;
  }

  /**
   * File exists — extract which languages are already present by
   * parsing the import lines, then regenerate with the new one added.
   */
  const existingContent = fs.readFileSync(filePath, "utf-8");
  const existingLanguages = extractLanguagesFromI18nFile(existingContent);

  if (existingLanguages.includes(newLanguage)) {
    logger.dim(
      `  ${config.i18nFilePath} already imports "${newLanguage}" — skipping`,
    );
    return;
  }

  const allLanguages = [...existingLanguages, newLanguage];
  const targetLanguages = allLanguages.filter(
    (l) => l !== config.defaultLanguage,
  );

  const content = buildI18nFileContent(
    config.defaultLanguage,
    targetLanguages,
    config,
  );

  writeFile(filePath, content);
  logger.success(`Updated ${config.i18nFilePath} — added "${newLanguage}"`);
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
function extractLanguagesFromI18nFile(content: string): string[] {
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
 *   1. Optional 'use client' directive (Next.js App Router)
 *   2. Imports for i18next and react-i18next
 *   3. Locale imports (one per language, only when locales exist)
 *   4. i18n.init() call with resources
 *   5. Default export
 *
 * Called in two scenarios:
 *
 * A) Initial generation (from `rai init`):
 *    defaultLang is '' and targetLanguages is [].
 *    No locale imports are emitted — resources is empty.
 *    The file is valid but does nothing until `rai scan` runs.
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
 * @param config          - The full rai config (for path resolution)
 */
function buildI18nFileContent(
  defaultLang: string,
  targetLanguages: string[],
  config: RaiConfig,
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
   * 'use client' directive for Next.js App Router.
   * Must be the very first line — before any imports.
   * Omitted for React Native / Expo / Pages Router projects.
   */
  const useClientDirective = config.addUseClientDirective
    ? `'use client'\n\n`
    : "";

  /**
   * The lng value to pass to i18n.init().
   * Uses the default language when known, falls back to 'en' for the
   * initial empty file so the output is always valid TypeScript.
   */
  const activeLang = defaultLang || "en";

  return `${useClientDirective}import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
${hasLocales ? `\n${localeImports}\n` : ""}
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
