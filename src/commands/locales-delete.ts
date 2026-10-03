import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";
import { confirm } from "../utils/prompt";
import { requireConfig } from "../utils/config";
import { resolveLocaleFilePath } from "../core/scaffolder";
import { validateLanguageCodes } from "../utils/validation";
import { writeFile } from "../utils/fs";
import type { EaiConfig } from "../types/config";
import { buildI18nFileContent, extractLanguagesFromI18nFile, resolveI18nFilePath } from "../utils/i18n-file";

export interface LocalesDeleteOptions {
  path: string;
  only?: string[];
  dryRun?: boolean;
  yes?: boolean;
}

function listExistingLocaleLangs(
  localesDir: string,
  localeFileName: string | null,
  knownLangs: string[],
): string[] {
  /**
   * Prefer checking paths for known codes (from i18n + config targets).
   * Also optional: glob localesDir for *.json — keep it simple with knownLangs.
   */
  return knownLangs.filter((lang) =>
    fs.existsSync(resolveLocaleFilePath(localesDir, lang, localeFileName)),
  );
}

function removeLanguagesFromI18nFile(
  appRoot: string,
  config: EaiConfig,
  langsToRemove: string[],
): boolean {
  const filePath = resolveI18nFilePath(appRoot, config);
  if (!fs.existsSync(filePath)) {
    logger.dim("  i18n file not found — skipping import cleanup.");
    return false;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const existing = extractLanguagesFromI18nFile(content);
  const remaining = existing.filter((l) => !langsToRemove.includes(l));

  if (remaining.length === existing.length) {
    logger.dim("  i18n file had no matching locale imports — unchanged.");
    return false;
  }

  const defaultLang = config.defaultLanguage;
  const targets = remaining.filter((l) => l !== defaultLang);
  const hasDefault = remaining.includes(defaultLang);

  const next = buildI18nFileContent(
    hasDefault ? defaultLang : (remaining[0] ?? defaultLang),
    targets,
    config,
  );

  writeFile(filePath, next);
  return true;
}

export async function localesDelete(
  options: LocalesDeleteOptions,
): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isDryRun = options.dryRun ?? false;

  const config = await requireConfig(appRoot);
  const localesDir = path.join(appRoot, config.localesDir);

  // ── Resolve which languages to delete ─────────────────────────────────────
  let candidates: string[];

  if (options.only?.length) {
    const { valid, invalid } = validateLanguageCodes(options.only);
    if (invalid.length > 0) {
      logger.warn(
        `Skipping invalid language code(s): ${invalid.map((c) => `"${c}"`).join(", ")}`,
      );
    }
    candidates = valid;
  } else {
    /**
     * No --only: delete every non-default language we know about
     * (config targets + languages currently in i18n.ts), if files exist.
     */
    const i18nPath = resolveI18nFilePath(appRoot, config);
    let fromI18n: string[] = [];
    if (fs.existsSync(i18nPath)) {
      fromI18n = extractLanguagesFromI18nFile(
        fs.readFileSync(i18nPath, "utf-8"),
      );
    }
    const known = [
      ...new Set([...(config.targetLanguages ?? []), ...fromI18n]),
    ];
    candidates = known.filter((l) => l !== config.defaultLanguage);
  }

  // Never delete the default language
  const blocked = candidates.filter((l) => l === config.defaultLanguage);
  if (blocked.length > 0) {
    logger.warn(
      `  Refusing to delete default language "${config.defaultLanguage}" ` +
        `(managed by eai scan).`,
    );
  }

  const targets = candidates.filter((l) => l !== config.defaultLanguage);

  if (targets.length === 0) {
    logger.error("No locales to delete.");
    process.exit(1);
  }

  // Only delete files that exist
  const toDelete = targets.filter((lang) =>
    fs.existsSync(
      resolveLocaleFilePath(localesDir, lang, config.localeFileName),
    ),
  );

  if (toDelete.length === 0) {
    logger.warn("No locale files found on disk for the requested languages.");
    logger.info(`  Requested: ${targets.join(", ")}`);
    // Still offer to clean i18n.ts if imports remain
  }

  logger.section("eai — Locales Delete");
  logger.info(`  Default (kept) : ${config.defaultLanguage}`);
  logger.info(
    `  To delete      : ${(toDelete.length ? toDelete : targets).join(", ")}`,
  );
  if (isDryRun) logger.info("  Mode           : dry run");
  logger.newline();

  for (const lang of toDelete) {
    const p = resolveLocaleFilePath(localesDir, lang, config.localeFileName);
    logger.dim(`    ${path.relative(appRoot, p)}`);
  }

  if (!options.yes && !isDryRun) {
    logger.newline();
    const ok = await confirm(
      `Delete ${toDelete.length || targets.length} locale(s) and remove them from i18n.ts?`,
      false,
    );
    if (!ok) {
      logger.info("Aborted. Nothing deleted.");
      process.exit(0);
    }
  }

  if (isDryRun) {
    logger.warn("Dry run complete — no files deleted.");
    process.exit(0);
  }

  // ── Delete files ──────────────────────────────────────────────────────────
  let deleted = 0;
  for (const lang of toDelete) {
    const filePath = resolveLocaleFilePath(
      localesDir,
      lang,
      config.localeFileName,
    );
    try {
      fs.unlinkSync(filePath);
      deleted++;
      logger.success(`Deleted ${path.relative(appRoot, filePath)}`);

      // Optional: remove empty language dir when localeFileName is set
      // (locales/fr/translation.json → remove locales/fr if empty)
      if (config.localeFileName) {
        const dir = path.dirname(filePath);
        try {
          if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      logger.error(`Failed to delete ${filePath}: ${String(err)}`);
    }
  }

  // ── Update i18n.ts ────────────────────────────────────────────────────────
  const removedFromI18n = removeLanguagesFromI18nFile(
    appRoot,
    config,
    targets, // all requested non-default langs, even if file was already gone
  );

  logger.newline();
  logger.success(
    `Done — ${deleted} file(s) deleted` +
      (removedFromI18n ? `, ${config.i18nFilePath} updated` : ""),
  );
}
