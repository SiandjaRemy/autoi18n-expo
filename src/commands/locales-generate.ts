import fs from "fs";
import path from "path";

import { resolveLocaleFilePath } from "../utils/locale-path";
import { flattenKeys, setNestedKey } from "../utils/flatten-keys";
import { wireLocaleImports } from "./wire-i18n-imports";
import { logger } from "../utils/logger";
import { confirm } from "../utils/prompt";
import { validateLanguageCodes } from "../utils/validation";
import { requireConfig } from "../utils/config";

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
  withImports?: boolean;
  dryRun?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Single-file generation
// ─────────────────────────────────────────────────────────────────────────────

function generateLocaleFile(
  defaultContent: Record<string, any>,
  targetFilePath: string,
  locale: string,
  force: boolean,
  dryRun: boolean,
): GenerateResult {
  const fileExists = fs.existsSync(targetFilePath);
  const isNew = !fileExists || force;

  if (isNew) {
    if (!dryRun) {
      fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
      fs.writeFileSync(
        targetFilePath,
        JSON.stringify(defaultContent, null, 2) + "\n",
      );
    }

    return {
      locale,
      filePath: targetFilePath,
      isNew: !fileExists,
      keysAdded: Object.keys(flattenKeys(defaultContent)),
    };
  }

  // File exists and --force not set: diff-merge, only add missing keys
  const existingContent = JSON.parse(fs.readFileSync(targetFilePath, "utf-8"));
  const defaultFlat = flattenKeys(defaultContent);
  const existingFlat = flattenKeys(existingContent);

  const keysAdded: string[] = [];

  for (const [key, value] of Object.entries(defaultFlat)) {
    if (!(key in existingFlat)) {
      setNestedKey(existingContent, key, value);
      keysAdded.push(key);
    }
  }

  if (keysAdded.length > 0 && !dryRun) {
    fs.writeFileSync(
      targetFilePath,
      JSON.stringify(existingContent, null, 2) + "\n",
    );
  }

  return {
    locale,
    filePath: targetFilePath,
    isNew: false,
    keysAdded,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main command
// ─────────────────────────────────────────────────────────────────────────────

export async function runLocalesGenerate(
  options: GenerateOptions,
): Promise<void> {
  const appRoot = path.resolve(options.path);

  // ── Step 1: Load config ───────────────────────────────────────────────────
  const config = await requireConfig(appRoot);

  // ── Step 1: Resolve raw target list ───────────────────────────────────────
  /**
   * Language codes come from two sources:
   *   1. --only flag (takes priority when provided)
   *   2. config.targetLanguages (fallback)
   *
   * If neither is provided, there is nothing to generate.
   */
  const rawTargets = options.only ?? config.targetLanguages ?? [];

  if (rawTargets.length === 0) {
    logger.error(
      "No target languages specified.\n\n" +
        "  Option A — pass languages directly:\n" +
        "    eai locales-generate --only fr,es,ar\n\n" +
        "  Option B — add languages to your config and run without --only:\n" +
        "    targetLanguages: ['fr', 'es', 'ar']  // in eai.config.ts",
    );
    process.exit(1);
  }

  // ── Step 2: Validate language codes ───────────────────────────────────────
  const { valid, invalid } = validateLanguageCodes(rawTargets);

  /**
   * Warn about invalid codes but don't exit yet —
   * we can still proceed with whatever valid codes remain.
   */
  if (invalid.length > 0) {
    logger.warn(
      `The following code${invalid.length === 1 ? " is" : "s are"} not valid ISO 639-1 language codes and will be skipped:\n` +
        invalid.map((c) => `    • "${c}"`).join("\n"),
    );
    logger.dim(
      "  Valid examples: en, fr, es, de, ar, zh, pt, ja, ru, tr, ko, ja\n" +
        "  Full list: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes",
    );
    logger.newline();
  }

  /**
   * If ALL codes were invalid, nothing is left to do.
   */
  if (valid.length === 0) {
    logger.error(
      "No valid language codes remaining. Nothing to generate.\n\n" +
        "  Check your codes against the ISO 639-1 standard:\n" +
        "  https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes",
    );
    process.exit(1);
  }

  // ── Step 3: Filter out the default language ────────────────────────────────
  /**
   * The default language already has a locale file from `eai scan`.
   * Generating it again would overwrite the source of truth.
   * Warn and skip it rather than erroring — it's an easy mistake to make.
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

  /**
   * After filtering, we might have nothing left.
   * e.g. user ran: eai locales-generate --only en
   */
  if (targets.length === 0) {
    logger.error("No languages to generate after filtering. Nothing to do.");
    process.exit(1);
  }

  // ── Step 4: Check default locale file exists ───────────────────────────────
  const defaultFilePath = resolveLocaleFilePath(config, config.defaultLanguage);

  if (!fs.existsSync(defaultFilePath)) {
    logger.error(
      `Default locale file not found at:\n  ${defaultFilePath}\n\n` +
        '  Run "eai scan" first to generate it.',
    );
    process.exit(1);
  }

  const defaultContent = JSON.parse(fs.readFileSync(defaultFilePath, "utf-8"));
  const defaultKeyCount = Object.keys(flattenKeys(defaultContent)).length;

  // ── Step 5: --force confirmation ───────────────────────────────────────────
  if (options.force) {
    const existingTargets = targets.filter((lang) =>
      fs.existsSync(resolveLocaleFilePath(config, lang)),
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

  // ── Step 6: Generate ───────────────────────────────────────────────────────
  logger.section("eai — Locales Generate");
  logger.info(
    `  Default locale : ${config.defaultLanguage} (${defaultKeyCount} keys)`,
  );
  logger.info(`  Targets        : ${targets.join(", ")}`);
  if (options.dryRun)
    logger.info("  Mode           : dry run (no files written)");
  logger.newline();
  logger.info("Generating...");
  logger.newline();

  const results: GenerateResult[] = [];

  for (const lang of targets) {
    const targetFilePath = resolveLocaleFilePath(config, lang);
    const result = generateLocaleFile(
      defaultContent,
      targetFilePath,
      lang,
      !!options.force,
      !!options.dryRun,
    );
    results.push(result);

    const displayPath =
      targetFilePath.length > 60
        ? "..." + targetFilePath.slice(-57)
        : targetFilePath;

    if (result.isNew) {
      logger.success(
        `${displayPath} — created (${result.keysAdded.length} keys, all pending translation)`,
      );
    } else if (result.keysAdded.length > 0) {
      logger.success(
        `${displayPath} — exists, ${result.keysAdded.length} new key(s) added:`,
      );
      for (const key of result.keysAdded) {
        logger.dim(`      · ${key}`);
      }
    } else {
      logger.info(`${displayPath} — up to date, no new keys`);
    }
  }

  // ── Step 7: Wire imports ───────────────────────────────────────────────────
  if (options.withImports && !options.dryRun) {
    if (!config.i18nFilePath) {
      logger.warn(
        "i18nFilePath not set in eai.config.ts — skipping import wiring.",
      );
    } else {
      const wired = wireLocaleImports(
        config.i18nFilePath,
        config.localesDir,
        config.localeFileName,
        targets,
      );

      if (wired.length > 0) {
        logger.success(
          `Wired into ${config.i18nFilePath}: ${wired.join(", ")}`,
        );
      } else {
        logger.info(
          `${config.i18nFilePath} already up to date — no imports added.`,
        );
      }
    }
  }

  // ── Step 8: Next steps ─────────────────────────────────────────────────────
  const pendingTranslation = results.filter((r) => r.keysAdded.length > 0);

  if (pendingTranslation.length > 0) {
    logger.section("Next steps");
    logger.info(
      "  Translate the pending keys in each generated file.\n" +
        "  The values currently match your default language — replace them with translations.",
    );

    if (!options.withImports && config.i18nFilePath) {
      logger.newline();
      logger.info(
        `  Once translated, wire the imports into your i18n config:\n` +
          `    eai locales-generate --only ${targets.join(",")} --with-imports`,
      );
    }
  }

  logger.newline();
}
