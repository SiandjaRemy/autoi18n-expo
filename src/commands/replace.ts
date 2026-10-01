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
 * 1. Load config + locale file (scan must have run first)
 * 2. Re-scan for current string locations
 * 3. Transform files in memory
 * 4. Preview + confirm
 * 5. Backup originals, then write transformed source
 */
export async function replace(options: ReplaceOptions): Promise<void> {
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

  logger.section("eai — Replace");
  if (isDryRun) logger.warn("  Dry run — no files will be written.\n");

  // ── Step 2: Locale file ───────────────────────────────────────────────────
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

  // ── Step 3: Re-scan ───────────────────────────────────────────────────────
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

  // ── Step 4: Transform in memory ───────────────────────────────────────────
  logger.section("Computing replacements...");

  const results = await transformProject(appRoot, strings, localeData);

  const modifiedResults = results.filter((r) => r.modified);
  const totalReplacements = modifiedResults.reduce(
    (sum, r) => sum + r.replacements,
    0,
  );

  if (modifiedResults.length === 0) {
    logger.warn(
      "No replacements needed. Source may already use t() / i18n.t(), or keys no longer match.",
    );
    process.exit(0);
  }

  // ── Step 5: Preview ───────────────────────────────────────────────────────
  logger.section("Preview — files to be modified");
  logger.newline();

  for (const result of modifiedResults) {
    logger.info(
      `  ${chalk.cyan(path.relative(appRoot, result.filePath))}` +
        chalk.gray(` — ${result.replacements} replacement(s)`),
    );
  }

  logger.newline();
  logger.info(
    `  ${chalk.bold(String(modifiedResults.length))} file(s) will be modified ` +
      `with ${chalk.bold(String(totalReplacements))} total replacement(s)`,
  );
  logger.info(
    chalk.gray(
      "  Backups (.i18nbak) are created before writing. Use eai revert to restore.",
    ),
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
    "This will modify your source files.\n" +
      "  Commit first if you rely on git; backups are also written automatically.",
  );
  logger.newline();

  const shouldProceed = await confirm(
    `Modify ${modifiedResults.length} file(s) with t() / i18n.t() replacements?`,
    false,
  );

  if (!shouldProceed) {
    logger.info("Aborted. No files were modified.");
    process.exit(0);
  }

  // ── Step 7: Backup + write ────────────────────────────────────────────────
  logger.section("Applying replacements...");

  let written = 0;
  for (const result of modifiedResults) {
    if (!result.newCode) continue;

    try {
      /**
       * Backup before write. If a .i18nbak already exists, backupFile should
       * skip so the original pre-i18n file is preserved.
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
  1. ${chalk.bold("Verify the app")}
       ${chalk.cyan("npx expo start")}
       Check screens, alerts, and helpers that use i18n.

  2. ${chalk.bold("If something looks wrong")}
       ${chalk.cyan("eai revert")}
       ${chalk.gray("# restore from .i18nbak backups")}

       Or with git (if you committed before replace):
       ${chalk.cyan("git checkout .")}

  3. ${chalk.bold("If everything looks good")}
       ${chalk.cyan("eai revert --clean")}
       ${chalk.gray("# delete .i18nbak files")}
       ${chalk.cyan("git add .")}
       ${chalk.cyan('git commit -m "feat: replace strings with i18n t() calls"')}

  4. ${chalk.bold("Add other languages")}
       ${chalk.cyan("eai locales-generate --only fr,es --with-imports")}

       Flags:
         ${chalk.gray("--only fr,es")}      languages to generate
         ${chalk.gray("--with-imports")}  wire i18n.ts ${chalk.green("(recommended)")}
         ${chalk.gray("--force")}         overwrite existing locale files
         ${chalk.gray("--dry-run")}       preview only

       Then translate values in the new JSON files.
       Switch language with: ${chalk.cyan('i18n.changeLanguage("fr")')}

  5. ${chalk.bold("Reference")}
       ${chalk.cyan(path.relative(appRoot, localeFilePath).replace(/\\/g, "/"))}
`);
}
