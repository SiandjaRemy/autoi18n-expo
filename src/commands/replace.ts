import path from "path";
import chalk from "chalk";
import ora from "ora";
import { logger } from "../utils/logger";
import { requireConfig, validateLocalesDir } from "../utils/config";
import { scanProject } from "../core/scanner";
import { readLocaleFile, resolveLocaleFilePath } from "../core/scaffolder";
import { transformProject } from "../core/transformer";
import { writeFile, exists } from "../utils/fs";
import { confirm } from "../utils/prompt";
import { backupFile } from "../utils/backup";
interface ReplaceOptions {
  path: string;
  dryRun?: boolean;
}

/**
 * `eai replace`
 *
 * Reads the existing locale file, re-scans the project to get string
 * locations, then rewrites every source file replacing raw strings
 * with t() calls and injecting useTranslation.
 *
 * Steps:
 *   1. Load config
 *   2. Check locale file exists (scan must have been run first)
 *   3. Re-scan project to get ExtractedString locations
 *   4. Transform all files (compute changes without writing)
 *   5. Show a preview of what will change
 *   6. Confirm before writing
 *   7. Write all modified files
 *   8. Print next steps
 *
 * Why re-scan instead of saving scan results to disk?
 *   Saving scan results would require a cache file that could go stale.
 *   Re-scanning is fast (pure AST parsing, no I/O except file reads)
 *   and guarantees the locations are current.
 */
export async function replace(options: ReplaceOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isDryRun = options.dryRun ?? false;

  // ── Step 1: Load config ───────────────────────────────────────────────────
  const config = await requireConfig(appRoot);
  const localesDir = path.join(appRoot, config.localesDir);

  // ── Validate localesDir ───────────────────────────────────────────────────
  const dirError = validateLocalesDir(config.localesDir, appRoot);
  if (dirError) {
    logger.error(`Invalid "localesDir" in your config:\n  ${dirError}`);
    process.exit(1);
  }

  logger.section("eai — Replace");
  if (isDryRun) logger.warn("  Dry run — no files will be written.\n");

  // ── Step 2: Check locale file exists ─────────────────────────────────────
  const localeFilePath = resolveLocaleFilePath(
    localesDir,
    config.defaultLanguage,
    config.localeFileName,
  );

  if (!exists(localeFilePath)) {
    logger.error(
      `Locale file not found: ${path.relative(appRoot, localeFilePath)}\n` +
        `  Run "eai scan" first to generate the locale file.`,
    );
    process.exit(1);
  }

  const localeData = readLocaleFile(
    config.defaultLanguage,
    localesDir,
    config.localeFileName,
  );

  const keyCount = Object.keys(localeData).length;
  logger.info(`  Locale file : ${path.relative(appRoot, localeFilePath)}`);
  logger.info(`  Keys loaded : ${keyCount}`);

  if (keyCount === 0) {
    logger.error(`The locale file is empty. Run "eai scan" to populate it.`);
    process.exit(1);
  }

  // ── Step 3: Re-scan to get string locations ───────────────────────────────
  logger.section("Scanning for string locations...");
  const spinner = ora("Scanning...").start();

  let strings;
  try {
    strings = await scanProject(appRoot, config);
    spinner.succeed(`Found ${strings.length} string(s) across the project.`);
  } catch (err) {
    spinner.fail("Scan failed.");
    logger.error(String(err));
    process.exit(1);
  }

  if (strings.length === 0) {
    logger.warn("No strings found. Nothing to replace.");
    process.exit(0);
  }

  // ── Step 4: Compute transformations ──────────────────────────────────────
  logger.section("Computing replacements...");

  const results = await transformProject(appRoot, strings, localeData);

  const modifiedResults = results.filter((r) => r.modified);
  const totalReplacements = modifiedResults.reduce(
    (sum, r) => sum + r.replacements,
    0,
  );

  if (modifiedResults.length === 0) {
    logger.warn(
      "No replacements needed. Your source files may already use t() calls.",
    );
    process.exit(0);
  }

  // ── Step 5: Preview ───────────────────────────────────────────────────────
  logger.section("Preview — files to be modified");
  logger.newline();

  modifiedResults.forEach((result) => {
    logger.info(
      `  ${chalk.cyan(path.relative(appRoot, result.filePath))}` +
        chalk.gray(` — ${result.replacements} replacement(s)`),
    );
  });

  logger.newline();
  logger.info(
    `  ${chalk.bold(String(modifiedResults.length))} file(s) will be modified ` +
      `with ${chalk.bold(String(totalReplacements))} total replacement(s)`,
  );

  if (isDryRun) {
    logger.newline();
    logger.warn("Dry run complete — no files written.");
    logger.info("  Remove --dry-run to apply changes.");
    process.exit(0);
  }

  // ── Step 6: Confirm ───────────────────────────────────────────────────────
  logger.newline();
  logger.warn(
    "This will modify your source files directly.\n" +
      "  Make sure your changes are committed before proceeding.",
  );
  logger.newline();

  const shouldProceed = await confirm(
    `Modify ${modifiedResults.length} file(s) with t() replacements?`,
    false, // default to NO for a destructive operation
  );

  if (!shouldProceed) {
    logger.info("Aborted. No files were modified.");
    process.exit(0);
  }

  // ── Step 7: Write files ───────────────────────────────────────────────────
  logger.section("Applying replacements...");

  let written = 0;
  for (const result of modifiedResults) {
    if (!result.newCode) continue;

    try {
      /**
       * Back up the original file before writing.
       * This enables `eai revert` to restore the pre-replace state
       * even if the user did not commit beforehand.
       *
       * If a backup already exists from a previous replace run,
       * backupFile() skips it — preserving the original pre-i18n state.
       */
      backupFile(result.filePath);
      writeFile(result.filePath, result.newCode);
      written++;
      logger.success(
        `${path.relative(appRoot, result.filePath)}` +
          ` — ${result.replacements} replacement(s)`,
      );
    } catch (err) {
      logger.error(
        `Failed to write ${path.relative(appRoot, result.filePath)}: ${String(err)}`,
      );
    }
  }

  logger.newline();
  logger.success(`Done — ${written} file(s) updated.`);

  // ── Step 8: Next steps ────────────────────────────────────────────────────

  logger.section("Next steps");
  logger.info(`
  ${chalk.bold("Next steps")}

  1. ${chalk.bold("Verify the app")}
       Run the app and check screens, alerts, and any helpers that use i18n.
       ${chalk.cyan("npx expo start")}
       ${chalk.gray("# or your usual start command")}

  2. ${chalk.bold("If something looks wrong")}
       Restore files from backups:
       ${chalk.cyan("eai revert")}

       Or discard with git (only if you committed before replace):
       ${chalk.cyan("git checkout .")}

  3. ${chalk.bold("If everything looks good")}
       Remove backup files, then commit:
       ${chalk.cyan("eai revert --clean")}
       ${chalk.cyan("git add .")}
       ${chalk.cyan('git commit -m "feat: replace strings with i18n t() calls"')}

  4. ${chalk.bold("Add other languages")}
       Prefer generating locales and wiring imports in one step:
       ${chalk.cyan("eai locales-generate --only fr,es --with-imports")}

       That will:
         • create locale files from your default language
         • add the matching imports / resources entries in your i18n file

       Useful flags:
         ${chalk.gray("--only fr,es,ar")}   languages to generate
         ${chalk.gray("--with-imports")}  update i18n config automatically ${chalk.green("(recommended)")}
         ${chalk.gray("--force")}         overwrite existing locale files
         ${chalk.gray("--dry-run")}       preview without writing

       Then translate the values in the new JSON files (keys stay the same).
       Switch language at runtime with:
       ${chalk.cyan('i18n.changeLanguage("fr")')}

  5. ${chalk.bold("Reference")}
       Default locale file:
       ${chalk.cyan(path.relative(appRoot, localeFilePath).replace(/\\/g, "/"))}
`);
}
