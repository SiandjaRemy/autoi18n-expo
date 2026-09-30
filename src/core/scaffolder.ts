import path from "path";
import { writeJson, ensureDir } from "../utils/fs";
import { logger } from "../utils/logger";
import type { ExtractedString } from "./scanner";

export type LocaleFile = Record<string, string>;

/**
 * Resolves the full output path for a locale file based on config.
 *
 * Two behaviours:
 *
 * localeFileName is null (default):
 *   → localesDir/lang.json
 *   → locales/en.json
 *
 * localeFileName is set:
 *   → localesDir/lang/localeFileName.json
 *   → locales/en/translation.json
 *
 * This is the single source of truth for path resolution.
 * Both scaffolder and scan command use this so they always agree
 * on where the file lives.
 *
 * @param localesDir    - Absolute path to the locales directory
 * @param lang          - Language code e.g. "en"
 * @param localeFileName - Custom file name or null
 */
export function resolveLocaleFilePath(
  localesDir: string,
  lang: string,
  localeFileName: string | null,
): string {
  if (localeFileName) {
    /**
     * Custom name: put the file inside a language subdirectory.
     * locales/en/translation.json
     */
    return path.join(localesDir, lang, `${localeFileName}.json`);
  }

  /**
   * Default: file named after the language code, flat in localesDir.
   * locales/en.json
   */
  return path.join(localesDir, `${lang}.json`);
}

/**
 * Generates the locale JSON file for the default language.
 *
 * @param strings        - All extracted strings from scanProject()
 * @param lang           - Language code e.g. "en"
 * @param localesDir     - Absolute path to the locales directory
 * @param localeFileName - Custom file name from config, or null for default
 */
export async function generateLocaleFile(
  strings: ExtractedString[],
  lang: string,
  localesDir: string,
  localeFileName: string | null,
): Promise<{ filePath: string; keyCount: number }> {
  ensureDir(localesDir);

  const content: LocaleFile = {};

  for (const s of strings) {
    content[s.fullKey] = s.translationValue;
  }

  /**
   * Sort keys alphabetically so strings from the same namespace
   * (same source file) are grouped together in the output.
   */
  const sortedContent = Object.fromEntries(
    Object.entries(content).sort(([a], [b]) => a.localeCompare(b)),
  );

  const filePath = resolveLocaleFilePath(localesDir, lang, localeFileName);

  /**
   * ensureDir is called again here because when localeFileName is set,
   * the file goes inside a subdirectory (locales/en/) that may not
   * exist yet. resolveLocaleFilePath already handles the path —
   * writeJson calls fs.mkdirSync recursively so this is covered,
   * but being explicit here makes the intent clear.
   */
  writeJson(filePath, sortedContent);

  return { filePath, keyCount: Object.keys(sortedContent).length };
}

/**
 * Reads an existing locale JSON file and returns its contents.
 * Returns an empty object if the file does not exist.
 *
 * @param lang           - Language code
 * @param localesDir     - Absolute path to the locales directory
 * @param localeFileName - Custom file name or null
 */
export function readLocaleFile(
  lang: string,
  localesDir: string,
  localeFileName: string | null,
): LocaleFile {
  const filePath = resolveLocaleFilePath(localesDir, lang, localeFileName);
  try {
    const fs = require("fs");
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as LocaleFile;
  } catch {
    logger.warn(`Could not read locale file: ${filePath}`);
    return {};
  }
}
