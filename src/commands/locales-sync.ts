import path from "path";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { logger } from "../utils/logger";
import { requireConfig, validateLocalesDir } from "../utils/config";
import { SUPPORTED_LANGUAGE_CODES } from "../types/config";
import { resolveLocaleFilePath, readLocaleFile } from "../core/scaffolder";
import { writeJson } from "../utils/fs";
import { confirm } from "../utils/prompt";

interface LocalesSyncOptions {
  path: string;
  only?: string;
  dryRun?: boolean;
}

/**
 * Result of syncing a single target locale file.
 */
interface SyncResult {
  /** Language code e.g. 'fr' */
  language: string;
  /** Absolute path to the locale file */
  filePath: string;
  /** Keys added from the default locale (with unsyncedPrefix) */
  addedKeys: string[];
  /** Keys in this locale that no longer exist in the default locale */
  removedKeys: string[];
  /** Whether the file was actually modified */
  modified: boolean;
}

/**
 * `eai locales-sync`
 *
 * Compares the default locale file (source of truth) against each target
 * locale file and brings them in sync:
 *
 *   New keys (in default, missing from target):
 *     Added with the unsyncedPrefix so they are easy to find and translate.
 *     e.g. "[UNTRANSLATED] New feature added"
 *
 *   Removed keys (in target, no longer in default):
 *     Flagged in the output but NOT deleted automatically.
 *     The developer decides whether to remove them manually.
 *
 *   Existing keys:
 *     Never touched — existing translations are always preserved.
 *
 * Steps:
 *   1. Load and validate config
 *   2. Parse and validate --only flag if provided
 *   3. Read the default locale file
 *   4. For each target language, compute the diff
 *   5. Show preview of all changes
 *   6. Confirm before writing
 *   7. Write updated locale files
 *   8. Print summary
 */
export async function localesSync(options: LocalesSyncOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isDryRun = options.dryRun ?? false;

  // ── Step 1: Load config ───────────────────────────────────────────────────
  const config = await requireConfig(appRoot);
  const localesDir = path.join(appRoot, config.localesDir);

  const dirError = validateLocalesDir(config.localesDir, appRoot);
  if (dirError) {
    logger.error(`Invalid "localesDir" in your config:\n  ${dirError}`);
    process.exit(1);
  }

  logger.section("eai — Locales Sync");
  if (isDryRun) logger.warn("  Dry run — no files will be written.\n");

  // ── Step 2: Resolve target languages ─────────────────────────────────────
  /**
   * Language codes come from two sources:
   *   1. --only flag (takes priority when provided)
   *   2. config.targetLanguages (fallback)
   *
   * We also auto-detect any locale files that exist on disk but are not
   * in targetLanguages — the user may have added them manually.
   */
  let targetLanguages: string[] = [];

  if (options.only) {
    /**
     * Parse and validate codes from --only flag.
     * Invalid codes are warned about and skipped.
     * If all codes are invalid we exit early.
     */
    const rawCodes = options.only
      .split(",")
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const code of rawCodes) {
      if ((SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(code)) {
        valid.push(code);
      } else {
        invalid.push(code);
      }
    }

    if (invalid.length > 0) {
      logger.warn(
        `The following code${invalid.length === 1 ? " is" : "s are"} ` +
          `not valid ISO 639-1 codes and will be skipped:\n` +
          invalid.map((c) => `    • "${c}"`).join("\n"),
      );
      logger.newline();
    }

    if (valid.length === 0) {
      logger.error(
        "No valid language codes provided. Nothing to sync.\n\n" +
          "  Example: eai locales-sync --only fr,es,ar",
      );
      process.exit(1);
    }

    targetLanguages = valid;
  } else if (config.targetLanguages.length > 0) {
    targetLanguages = [...config.targetLanguages];
  } else {
    /**
     * No --only and no targetLanguages in config.
     * Auto-detect locale files on disk that are not the default language.
     */
    targetLanguages = detectExistingLocales(
      localesDir,
      config.defaultLanguage,
      config.localeFileName,
    );

    if (targetLanguages.length === 0) {
      logger.warn(
        "No target languages found.\n\n" +
          "  Either:\n" +
          "    • Add target languages to your config: targetLanguages: ['fr', 'es']\n" +
          "    • Pass them directly: eai locales-sync --only fr,es\n" +
          "    • Run eai locales-generate first to create target locale files",
      );
      process.exit(0);
    }

    logger.dim(
      `  No targetLanguages in config — auto-detected: ${targetLanguages.join(", ")}`,
    );
  }

  /**
   * Remove the default language from targets if it was accidentally included.
   * Syncing the default language against itself makes no sense.
   */
  const filteredTargets = targetLanguages.filter((lang) => {
    if (lang === config.defaultLanguage) {
      logger.warn(`  Skipping "${lang}" — this is your default language.`);
      return false;
    }
    return true;
  });

  if (filteredTargets.length === 0) {
    logger.error("No languages to sync after filtering. Nothing to do.");
    process.exit(1);
  }

  logger.info(`  Default language : ${config.defaultLanguage}`);
  logger.info(`  Syncing          : ${filteredTargets.join(", ")}`);
  logger.info(`  Unsynced prefix  : "${config.unsyncedPrefix}"`);

  // ── Step 3: Read default locale ───────────────────────────────────────────
  const defaultLocale = readLocaleFile(
    config.defaultLanguage,
    localesDir,
    config.localeFileName,
  );

  if (Object.keys(defaultLocale).length === 0) {
    logger.error(
      `Default locale file is empty or not found.\n` +
        `  Run "eai scan" first to generate it.`,
    );
    process.exit(1);
  }

  const defaultKeys = new Set(Object.keys(defaultLocale));
  logger.dim(`\n  Default locale has ${defaultKeys.size} keys.\n`);

  // ── Step 4: Compute diffs for each target ─────────────────────────────────
  const spinner = ora("Computing diffs...").start();

  const results: SyncResult[] = [];

  for (const lang of filteredTargets) {
    const filePath = resolveLocaleFilePath(
      localesDir,
      lang,
      config.localeFileName,
    );

    if (!fs.existsSync(filePath)) {
      spinner.warn(
        `  "${lang}" locale file not found at ${path.relative(appRoot, filePath)}`,
      );
      logger.dim(
        `    Run "eai locales-generate --only ${lang}" to create it first.`,
      );
      continue;
    }

    const targetLocale = readLocaleFile(
      lang,
      localesDir,
      config.localeFileName,
    );
    const targetKeys = new Set(Object.keys(targetLocale));

    /**
     * Keys in the default locale that are NOT in this target locale.
     * These are new strings that need to be added with the unsynced prefix.
     */
    const addedKeys = [...defaultKeys].filter((k) => !targetKeys.has(k));

    /**
     * Keys in this target locale that are NOT in the default locale.
     * These strings were removed from the app — flagged but not deleted.
     */
    const removedKeys = [...targetKeys].filter((k) => !defaultKeys.has(k));

    results.push({
      language: lang,
      filePath,
      addedKeys,
      removedKeys,
      modified: addedKeys.length > 0,
    });
  }

  spinner.stop();

  // ── Step 5: Preview ───────────────────────────────────────────────────────
  logger.section("Sync preview");

  if (results.length === 0) {
    logger.warn(
      'No locale files found to sync. Run "eai locales-generate" first.',
    );
    process.exit(0);
  }

  let totalAdded = 0;
  let totalFlagged = 0;
  let filesNeedingUpdate = 0;

  for (const result of results) {
    logger.newline();
    logger.info(
      `  ${chalk.bold(result.language)} — ${path.relative(appRoot, result.filePath)}`,
    );

    if (result.addedKeys.length === 0 && result.removedKeys.length === 0) {
      logger.dim(`    ✓ Already in sync — no changes needed`);
      continue;
    }

    if (result.addedKeys.length > 0) {
      filesNeedingUpdate++;
      totalAdded += result.addedKeys.length;
      logger.info(
        chalk.green(`    + ${result.addedKeys.length} new key(s) to add:`),
      );
      /**
       * Show up to 5 added keys in the preview.
       * If there are more, show a count of the remaining ones.
       */
      const preview = result.addedKeys.slice(0, 5);
      const remaining = result.addedKeys.length - preview.length;

      preview.forEach((k) => {
        logger.dim(
          `      ${chalk.green("+")} ${k}: "${config.unsyncedPrefix} ${defaultLocale[k]}"`,
        );
      });

      if (remaining > 0) {
        logger.dim(`      ... and ${remaining} more`);
      }
    }

    if (result.removedKeys.length > 0) {
      totalFlagged += result.removedKeys.length;
      logger.info(
        chalk.yellow(
          `    ? ${result.removedKeys.length} key(s) no longer in default locale:`,
        ),
      );
      const preview = result.removedKeys.slice(0, 3);
      const remaining = result.removedKeys.length - preview.length;

      preview.forEach((k) => logger.dim(`      ${chalk.yellow("?")} ${k}`));
      if (remaining > 0) {
        logger.dim(`      ... and ${remaining} more`);
      }
      logger.dim(
        `      These were NOT removed — delete them manually if no longer needed.`,
      );
    }
  }

  logger.newline();
  logger.info(
    `  Summary: ${chalk.green(`+${totalAdded} keys to add`)} across ` +
      `${filesNeedingUpdate} file(s)` +
      (totalFlagged > 0
        ? `, ${chalk.yellow(`${totalFlagged} keys flagged`)}`
        : ""),
  );

  if (isDryRun) {
    logger.newline();
    logger.warn("Dry run complete — no files written.");
    logger.info("  Remove --dry-run to apply changes.");
    process.exit(0);
  }

  if (filesNeedingUpdate === 0) {
    logger.newline();
    logger.success("All target locale files are already in sync.");
    process.exit(0);
  }

  // ── Step 6: Confirm ───────────────────────────────────────────────────────
  logger.newline();
  const shouldProceed = await confirm(
    `Add ${totalAdded} key(s) across ${filesNeedingUpdate} locale file(s)?`,
  );

  if (!shouldProceed) {
    logger.info("Aborted. No files were written.");
    process.exit(0);
  }

  // ── Step 7: Write updated locale files ────────────────────────────────────
  logger.section("Syncing locale files...");

  let written = 0;

  for (const result of results) {
    if (!result.modified) {
      logger.dim(`  ${result.language} — already in sync, skipped`);
      continue;
    }

    const targetLocale = readLocaleFile(
      result.language,
      localesDir,
      config.localeFileName,
    );

    /**
     * Add new keys with the unsyncedPrefix prepended to the default value.
     *
     * Format: "<unsyncedPrefix> <defaultValue>"
     *
     * e.g. with unsyncedPrefix "[UNTRANSLATED]":
     *   "home.new_feature": "[UNTRANSLATED] New feature added"
     *
     * The developer can Ctrl+F for "[UNTRANSLATED]" to find all values
     * that still need to be translated in this file.
     */
    for (const key of result.addedKeys) {
      targetLocale[key] = `${config.unsyncedPrefix} ${defaultLocale[key]}`;
    }

    /**
     * Re-sort the merged content alphabetically so keys from the same
     * namespace stay grouped together, making the file easier to read.
     */
    const sortedContent = Object.fromEntries(
      Object.entries(targetLocale).sort(([a], [b]) => a.localeCompare(b)),
    );

    try {
      writeJson(result.filePath, sortedContent);
      written++;
      logger.success(
        `${result.language} — added ${result.addedKeys.length} key(s)`,
      );
    } catch (err) {
      logger.error(
        `Failed to write ${path.relative(appRoot, result.filePath)}: ${String(err)}`,
      );
    }
  }

  // ── Step 8: Summary ───────────────────────────────────────────────────────
  logger.newline();
  logger.success(`Done — ${written} file(s) updated.`);

  if (totalAdded > 0) {
    logger.section("Next steps");
    logger.info(`
  1. Open each updated locale file and search for "${config.unsyncedPrefix}"
     to find all values that need translation.

  2. Translate each flagged value and remove the "${config.unsyncedPrefix}" prefix.

  3. If any flagged keys (marked with ?) are no longer needed,
     delete them manually from the locale files.

  4. Commit your changes:
       ${chalk.cyan("git add .")}
       ${chalk.cyan('git commit -m "chore: sync locale files"')}
    `);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects locale files that exist on disk by inspecting the locales directory.
 *
 * Used as a fallback when neither --only nor config.targetLanguages is set.
 *
 * For flat structure (localeFileName: null):
 *   Looks for *.json files in localesDir, uses the filename as the language code.
 *   e.g. locales/fr.json → 'fr'
 *
 * For named structure (localeFileName: 'translation'):
 *   Looks for subdirectories in localesDir, uses the dirname as the language code.
 *   e.g. locales/fr/translation.json → 'fr'
 *
 * @param localesDir     - Absolute path to the locales directory
 * @param defaultLang    - Default language code to exclude from results
 * @param localeFileName - Custom file name or null
 */
function detectExistingLocales(
  localesDir: string,
  defaultLang: string,
  localeFileName: string | null,
): string[] {
  if (!fs.existsSync(localesDir)) return [];

  try {
    if (localeFileName) {
      /**
       * Named structure: look for subdirectories containing the locale file.
       * locales/fr/translation.json → 'fr'
       */
      return fs
        .readdirSync(localesDir, { withFileTypes: true })
        .filter((entry) => {
          if (!entry.isDirectory()) return false;
          if (entry.name === defaultLang) return false;
          const localeFile = path.join(
            localesDir,
            entry.name,
            `${localeFileName}.json`,
          );
          return fs.existsSync(localeFile);
        })
        .map((entry) => entry.name);
    } else {
      /**
       * Flat structure: look for *.json files.
       * locales/fr.json → 'fr'
       */
      return fs
        .readdirSync(localesDir)
        .filter((file) => {
          if (!file.endsWith(".json")) return false;
          const lang = file.replace(".json", "");
          return lang !== defaultLang;
        })
        .map((file) => file.replace(".json", ""));
    }
  } catch {
    return [];
  }
}
