import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { confirm } from "../utils/prompt";
import { requireConfig } from "../utils/config";
import { resolveLocaleFilePath } from "../core/scaffolder";
import { validateLanguageCodes } from "../utils/validation";
import { addLocaleToI18nFile } from "../utils/i18n-file";

export interface GenerateResult {
  locale: string;
  filePath: string;
  isNew: boolean;
  keysAdded: string[];
}

export interface GenerateOptions {
  path: string;
  only?: string[];
  force?: boolean;
  yes?: boolean;
  dryRun?: boolean;
  /** When true, do not update i18n.ts (default: wire imports). */
  noImports?: boolean;
}

type LocaleMap = Record<string, string>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mergeMissingKeys(
  existing: LocaleMap,
  fromDefault: LocaleMap,
): { next: LocaleMap; keysAdded: string[] } {
  const next: LocaleMap = { ...existing };
  const keysAdded: string[] = [];

  for (const [key, value] of Object.entries(fromDefault)) {
    if (!(key in next)) {
      next[key] = value;
      keysAdded.push(key);
    }
  }

  return { next, keysAdded };
}

function sortLocale(data: LocaleMap): LocaleMap {
  return Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function readLocaleMap(filePath: string): LocaleMap {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as LocaleMap;
}

function writeLocaleMap(filePath: string, data: LocaleMap): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(sortLocale(data), null, 2) + "\n");
}

/**
 * Create or update one target locale file from the default-language content.
 *
 * - New file or --force → full copy of default content
 * - Existing file → add missing keys only (keep existing translations)
 */
function generateOneLocaleFile(
  defaultContent: LocaleMap,
  targetFilePath: string,
  locale: string,
  force: boolean,
  dryRun: boolean,
): GenerateResult {
  const fileExists = fs.existsSync(targetFilePath);

  if (!fileExists || force) {
    if (!dryRun) {
      writeLocaleMap(targetFilePath, defaultContent);
    }

    return {
      locale,
      filePath: targetFilePath,
      isNew: !fileExists,
      keysAdded: Object.keys(defaultContent),
    };
  }

  const existing = readLocaleMap(targetFilePath);
  const { next, keysAdded } = mergeMissingKeys(existing, defaultContent);

  if (keysAdded.length > 0 && !dryRun) {
    writeLocaleMap(targetFilePath, next);
  }

  return {
    locale,
    filePath: targetFilePath,
    isNew: false,
    keysAdded,
  };
}

function displayPath(appRoot: string, absolutePath: string): string {
  return path.relative(appRoot, absolutePath).replace(/\\/g, "/");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main command
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `eai locales-generate`
 *
 * Copies / merges keys from the default locale into target language files.
 * Values start as the default-language text (pending translation).
 *
 * Imports are wired into i18n.ts by default. Pass --no-imports to skip.
 */
export async function localesGenerate(options: GenerateOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isDryRun = options.dryRun ?? false;
  const force = options.force ?? false;
  const noImports = options.noImports ?? false;

  // ── Step 1: Load config ───────────────────────────────────────────────────
  const config = await requireConfig(appRoot);
  const localesDir = path.join(appRoot, config.localesDir);

  // ── Step 2: Resolve target languages ──────────────────────────────────────
  /**
   * Language codes come from:
   *   1. --only (highest priority)
   *   2. config.targetLanguages
   */
  const rawTargets = options.only ?? config.targetLanguages ?? [];

  if (rawTargets.length === 0) {
    logger.error(
      "No target languages specified.\n\n" +
        "  Option A — pass languages directly:\n" +
        "    eai locales-generate --only fr,es,ar\n\n" +
        "  Option B — set them in config and run without --only:\n" +
        "    targetLanguages: ['fr', 'es', 'ar']  // in eai.config.ts",
    );
    process.exit(1);
  }

  // ── Step 3: Validate language codes ───────────────────────────────────────
  const { valid, invalid } = validateLanguageCodes(rawTargets);

  if (invalid.length > 0) {
    logger.warn(
      `The following code${invalid.length === 1 ? " is" : "s are"} not valid ISO 639-1 language codes and will be skipped:\n` +
        invalid.map((c) => `    • "${c}"`).join("\n"),
    );
    logger.dim(
      "  Valid examples: en, fr, es, de, ar, zh, pt, ja, ru, tr, ko\n" +
        "  Full list: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes",
    );
    logger.newline();
  }

  if (valid.length === 0) {
    logger.error(
      "No valid language codes remaining. Nothing to generate.\n\n" +
        "  Check your codes against the ISO 639-1 standard:\n" +
        "  https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes",
    );
    process.exit(1);
  }

  // ── Step 4: Filter out the default language ───────────────────────────────
  /**
   * Default language is owned by `eai scan`. Generating it here would
   * risk overwriting the source of truth.
   */
  const skippedDefault = valid.filter((c) => c === config.defaultLanguage);
  const targets = valid.filter((c) => c !== config.defaultLanguage);

  if (skippedDefault.length > 0) {
    logger.warn(
      `  Skipping "${config.defaultLanguage}" — this is your default language.\n` +
        '  Its locale file is managed by "eai scan", not "eai locales-generate".',
    );
    logger.newline();
  }

  if (targets.length === 0) {
    logger.error("No languages to generate after filtering. Nothing to do.");
    process.exit(1);
  }

  // ── Step 5: Default locale must exist ─────────────────────────────────────
  const defaultFilePath = resolveLocaleFilePath(
    localesDir,
    config.defaultLanguage,
    config.localeFileName,
  );

  if (!fs.existsSync(defaultFilePath)) {
    logger.error(
      `Default locale file not found at:\n  ${defaultFilePath}\n\n` +
        '  Run "eai scan" first to generate it.',
    );
    process.exit(1);
  }

  const defaultContent = readLocaleMap(defaultFilePath);
  const defaultKeyCount = Object.keys(defaultContent).length;

  // ── Step 6: --force confirmation ──────────────────────────────────────────
  if (force) {
    const existingTargets = targets.filter((lang) =>
      fs.existsSync(
        resolveLocaleFilePath(localesDir, lang, config.localeFileName),
      ),
    );

    if (existingTargets.length > 0 && !options.yes) {
      const confirmed = await confirm(
        `--force will overwrite ${existingTargets.length} existing locale file(s) ` +
          `(${existingTargets.join(", ")}), discarding any manual translations. Continue?`,
        false,
      );

      if (!confirmed) {
        logger.info("Aborted — no files were changed.");
        return;
      }
    }
  }

  // ── Step 7: Generate ──────────────────────────────────────────────────────
  logger.section("eai — Locales Generate");
  logger.info(
    `  Default locale : ${config.defaultLanguage} (${defaultKeyCount} keys)`,
  );
  logger.info(`  Targets        : ${targets.join(", ")}`);
  logger.info(
    `  i18n imports   : ${noImports ? "skipped (--no-imports)" : "enabled (default)"}`,
  );
  if (isDryRun) {
    logger.info("  Mode           : dry run (no files written)");
  }
  logger.newline();
  logger.info("Generating...");
  logger.newline();

  const results: GenerateResult[] = [];

  for (const lang of targets) {
    const targetFilePath = resolveLocaleFilePath(
      localesDir,
      lang,
      config.localeFileName,
    );

    const result = generateOneLocaleFile(
      defaultContent,
      targetFilePath,
      lang,
      force,
      isDryRun,
    );
    results.push(result);

    const rel = displayPath(appRoot, targetFilePath);

    if (result.isNew) {
      logger.success(
        `${rel} — created (${result.keysAdded.length} keys, pending translation)`,
      );
    } else if (result.keysAdded.length > 0) {
      logger.success(
        `${rel} — exists, ${result.keysAdded.length} new key(s) added:`,
      );
      for (const key of result.keysAdded) {
        logger.dim(`      · ${key}`);
      }
    } else {
      logger.info(`${rel} — up to date, no new keys`);
    }
  }

  // ── Step 8: Wire imports (default on) ─────────────────────────────────────
  /**
   * After locale files exist, add matching imports / resources entries
   * to i18n.ts so the app can load each language without hand-editing.
   *
   * Skipped when:
   *   - --dry-run
   *   - --no-imports
   *   - i18nFilePath is unset (should not happen with defaults)
   */
  if (!isDryRun && !noImports) {
    if (!config.i18nFilePath) {
      logger.warn(
        "i18nFilePath not set in eai.config.ts — skipping import wiring.",
      );
    } else {
      const wired: string[] = [];

      for (const lang of targets) {
        /**
         * addLocaleToI18nFile should be idempotent: skip if the language
         * is already imported / listed under resources.
         */
        const didWire = addLocaleToI18nFile(appRoot, config, lang);
        if (didWire) wired.push(lang);
      }

      if (wired.length > 0) {
        logger.success(`Updated ${config.i18nFilePath}: ${wired.join(", ")}`);
      } else {
        logger.info(
          `${config.i18nFilePath} already up to date — no imports added.`,
        );
      }
    }
  } else if (noImports && !isDryRun) {
    logger.dim("  Skipped i18n import wiring (--no-imports).");
  }

  // ── Step 9: Next steps ────────────────────────────────────────────────────
  const pendingTranslation = results.filter((r) => r.keysAdded.length > 0);

  if (pendingTranslation.length > 0) {
    logger.section("Next steps");
    logger.info(
      "  Translate the values in each generated locale file.\n" +
        "  Keys match your default language; replace the values with translations.",
    );

    if (!noImports) {
      logger.info(
        "\n  Locale imports were wired into your i18n file automatically.\n" +
          '  Switch language at runtime with: i18n.changeLanguage("fr")',
      );
    } else if (config.i18nFilePath) {
      logger.info(
        `\n  You skipped import wiring. Re-run without --no-imports to update ${config.i18nFilePath},\n` +
          "  or add the imports manually.",
      );
    }
  }

  logger.newline();
}
