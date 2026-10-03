import path from "path";
import { writeJson, ensureDir, exists, readJson } from "../utils/fs";
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

/** Scan results → flat locale map (first occurrence wins). */
export function buildLocaleFromStrings(strings: ExtractedString[]): LocaleFile {
  const content: LocaleFile = {};
  for (const s of strings) {
    if (content[s.fullKey] === undefined) {
      content[s.fullKey] = s.translationValue;
    }
  }
  return content;
}

/**
 * Merge scan output into an existing locale file.
 * - New keys from scan are added
 * - Existing keys keep their current values (manual translations safe)
 * - Keys only in existing are kept unless prune is true
 */
export function mergeLocaleData(
  existing: LocaleFile,
  fromScan: LocaleFile,
  options: { prune?: boolean } = {},
): { merged: LocaleFile; added: string[]; removed: string[] } {
  const added: string[] = [];
  const removed: string[] = [];

  const merged: LocaleFile = options.prune ? {} : { ...existing };

  if (options.prune) {
    for (const key of Object.keys(existing)) {
      if (key in fromScan) {
        merged[key] = existing[key];
      } else {
        removed.push(key);
      }
    }
  }

  for (const [key, value] of Object.entries(fromScan)) {
    if (!(key in merged)) {
      merged[key] = value;
      added.push(key);
    }
  }

  return { merged, added, removed };
}

function sortLocale(data: LocaleFile): LocaleFile {
  return Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b)),
  );
}

/**
 * Generates or updates the locale JSON for the default language.
 *
 * Default: merge with existing file (add-only).
 * prune: drop keys not present in this scan (use with care after replace).
 *
 * @param strings        - All extracted strings from scanProject()
 * @param lang           - Language code e.g. "en"
 * @param localesDir     - Absolute path to the locales directory
 * @param localeFileName - Custom file name from config, or null for default
 * @param options        - Pruning options
 */
export async function generateLocaleFile(
  strings: ExtractedString[],
  lang: string,
  localesDir: string,
  localeFileName: string | null,
  options: { prune?: boolean } = {},
): Promise<{
  filePath: string;
  keyCount: number;
  added: number;
  removed: number;
  isNewFile: boolean;
}> {
  ensureDir(localesDir);

  const filePath = resolveLocaleFilePath(localesDir, lang, localeFileName);
  const fromScan = buildLocaleFromStrings(strings);

  const isNewFile = !exists(filePath);
  const existing: LocaleFile = isNewFile
    ? {}
    : (readJson<LocaleFile>(filePath) ?? {});

  const { merged, added, removed } = mergeLocaleData(existing, fromScan, {
    prune: options.prune ?? false,
  });

  const sortedContent = sortLocale(merged);
  writeJson(filePath, sortedContent);

  return {
    filePath,
    keyCount: Object.keys(sortedContent).length,
    added: added.length,
    removed: removed.length,
    isNewFile,
  };
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
  if (!exists(filePath)) return {};
  const data = readJson<LocaleFile>(filePath);
  if (!data) {
    logger.warn(`Could not read locale file: ${filePath}`);
    return {};
  }
  return data;
}
