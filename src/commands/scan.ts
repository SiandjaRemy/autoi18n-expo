import path from "path";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { logger } from "../utils/logger";
import { requireConfig } from "../utils/config";
import { scanProject, type ExtractedString } from "../core/scanner";
import { addLocaleToI18nFile } from "../utils/i18n-file";
import { validateLocalesDir } from "../utils/config";
import { EaiConfig } from "../types/config";
import { generateLocaleFile } from "../core/scaffolder";
import { confirm } from "../utils/prompt";

interface ScanOptions {
  path: string;
  dryRun?: boolean;
  prune?: boolean;
}
/**
 * `eai scan`
 *
 * Scans the entire Expo project for translatable strings and generates
 * a locale JSON file for the default language.
 *
 * Steps:
 *   1. Load and validate config
 *   2. Validate localesDir parent exists
 *   3. Scan all source files using AST
 *   4. Show preview table grouped by namespace
 *   5. Ask for confirmation before writing
 *   6. Write the locale JSON file (merge with existing by default)
 *   7. Update i18n.ts with the default locale import
 *   8. Print next steps
 *
 * Re-running scan after replace is safe: existing keys are kept and only
 * new keys from the current scan are added, unless --prune is passed.
 */
export async function scan(options: ScanOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isDryRun = options.dryRun ?? false;
  const prune = options.prune ?? false;

  // ── Step 1: Load config ───────────────────────────────────────────────────
  const config = await requireConfig(appRoot);
  const localesDir = path.join(appRoot, config.localesDir);

  // ── Step 2: Validate localesDir ───────────────────────────────────────────
  /**
   * Validate before scanning so we don't do expensive AST work
   * only to fail at the file-write step with a confusing error.
   */
  const dirError = validateLocalesDir(config.localesDir, appRoot);
  if (dirError) {
    logger.error(`Invalid "localesDir" in your config:\n  ${dirError}`);
    process.exit(1);
  }

  /**
   * Build the output path string for display.
   * Shown in the header so the user knows exactly where files will go.
   */
  const outputPreview = config.localeFileName
    ? `${config.localesDir}/${config.defaultLanguage}/${config.localeFileName}.json`
    : `${config.localesDir}/${config.defaultLanguage}.json`;

  logger.section("eai — Scan");
  if (isDryRun) logger.warn("  Dry run — no files will be written.\n");
  if (prune) {
    logger.warn(
      "  --prune enabled: keys not found in this scan will be removed from the locale file.\n",
    );
  }

  logger.info(`  App root    : ${appRoot}`);
  logger.info(`  Language    : ${config.defaultLanguage}`);
  logger.info(`  Output      : ${outputPreview}`);
  logger.info(
    `  Alerts      : ${config.detectAlerts ? "detected" : "ignored"}`,
  );
  logger.info(
    `  Throws      : ${config.detectThrows ? "detected" : "ignored"}`,
  );
  logger.info(
    `  Merge mode  : ${prune ? "prune missing keys" : "add new keys only (keep existing)"}`,
  );

  if (config.customDetectCalls.length > 0) {
    logger.info(`  Custom calls: ${config.customDetectCalls.join(", ")}`);
  }

  // ── Step 3: Scan ──────────────────────────────────────────────────────────
  logger.section("Scanning source files...");
  const spinner = ora("Scanning...").start();

  let strings: ExtractedString[];
  try {
    strings = await scanProject(appRoot, config);
    spinner.succeed(`Scan complete.`);
  } catch (err) {
    spinner.fail("Scan failed.");
    logger.error(String(err));
    process.exit(1);
  }

  if (strings.length === 0) {
    logger.warn("\n  No translatable strings found.");
    logger.info(
      "  Things to check:\n" +
        "    • Is --path pointing to your Expo project root?\n" +
        "    • Does your app have <Text> components with content?\n" +
        "    • Are the relevant files excluded by your config or .gitignore?\n" +
        "    • After replace, most copy lives in the locale file — " +
        "scan only finds remaining hardcoded strings (existing keys are still kept unless --prune).",
    );
    process.exit(0);
  }

  // ── Step 4: Preview table ─────────────────────────────────────────────────
  logger.section("Strings found");
  printPreviewTable(strings);

  if (isDryRun) {
    logger.newline();
    logger.warn("Dry run complete — no files written.");
    logger.info("  Remove --dry-run to generate or update the locale file.");
    process.exit(0);
  }

  // ── Step 5: Confirm ───────────────────────────────────────────────────────
  logger.newline();
  /**
   * Confirm wording reflects merge behaviour so users do not think
   * the entire locale file will be replaced by only this scan's keys.
   */
  const shouldProceed = await confirm(
    prune
      ? `Update ${outputPreview} from ${strings.length} scanned string(s) (prune missing keys)?`
      : `Update ${outputPreview} from ${strings.length} scanned string(s) (add new keys, keep existing)?`,
  );

  if (!shouldProceed) {
    logger.info("Aborted. No files were written.");
    process.exit(0);
  }

  // ── Step 6: Write locale file ─────────────────────────────────────────────
  /**
   * generateLocaleFile merges into any existing locale JSON by default:
   *   - new keys from this scan are added
   *   - existing keys keep their current values
   *   - keys not found in this scan are kept unless prune is true
   *
   * That way re-running scan after replace (or after improving the scanner)
   * does not wipe translations that are no longer present as string literals.
   */
  logger.section("Generating locale file...");

  const { filePath, keyCount, added, removed, isNewFile } =
    await generateLocaleFile(
      strings,
      config.defaultLanguage,
      localesDir,
      config.localeFileName,
      { prune },
    );

  const relativeLocale = path.relative(appRoot, filePath);

  if (isNewFile) {
    logger.success(`Created ${relativeLocale} with ${keyCount} key(s)`);
  } else {
    logger.success(`Updated ${relativeLocale} — ${keyCount} key(s) total`);
    logger.info(`  Added   : ${added}`);
    if (prune) {
      logger.info(`  Removed : ${removed}`);
    } else {
      logger.dim(
        "  Existing keys not found in this scan were kept (pass --prune to remove them).",
      );
    }
  }

  // ── Step 7: Update i18n.ts ────────────────────────────────────────────────
  /**
   * Add the default locale import to i18n.ts now that the locale file exists.
   * If i18n.ts doesn't exist yet (user skipped init or moved the file),
   * addLocaleToI18nFile generates it fresh.
   *
   * This step is skipped silently if i18nFilePath is not set — but since
   * it always has a default value this should never happen.
   */
  if (config.i18nFilePath) {
    addLocaleToI18nFile(appRoot, config, config.defaultLanguage);
  }

  // ── Step 8: Next steps ────────────────────────────────────────────────────
  printNextSteps(appRoot, config);
}
// ─────────────────────────────────────────────────────────────────────────────
// Preview table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prints a summary table of extracted strings grouped by namespace.
 *
 * Example output:
 *
 *   auth.signin  (3 strings)
 *     auth.signin.welcome_back               "Welcome back"
 *     auth.signin.sign_in                    "Sign in"
 *     auth.signin.forgot_password            "Forgot password?"
 *
 *   home  (2 strings)
 *     home.total_transactions                "Total Transactions"
 *     home.loading                           "Loading..."
 *
 *   5 total strings across 2 namespaces
 */
function printPreviewTable(strings: ExtractedString[]): void {
  // Group by namespace
  const byNamespace = strings.reduce<Record<string, ExtractedString[]>>(
    (acc, s) => {
      if (!acc[s.namespace]) acc[s.namespace] = [];
      acc[s.namespace].push(s);
      return acc;
    },
    {},
  );

  const namespaces = Object.entries(byNamespace).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [namespace, items] of namespaces) {
    logger.newline();
    logger.info(
      `  ${chalk.bold(namespace)} ` +
        chalk.gray(`(${items.length} string${items.length === 1 ? "" : "s"})`),
    );

    for (const item of items) {
      const keyPart = chalk.cyan(item.fullKey.padEnd(50));
      const preview = item.translationValue.substring(0, 40);
      const ellipsis = item.translationValue.length > 40 ? "…" : "";
      const valuePart = chalk.gray(`"${preview}${ellipsis}"`);
      const paramsPart =
        item.params.length > 0
          ? chalk.yellow(` [params: ${item.params.join(", ")}]`)
          : "";

      logger.info(`    ${keyPart} ${valuePart}${paramsPart}`);
    }
  }

  logger.newline();
  logger.info(
    `  ${chalk.bold(String(strings.length))} total string(s) across ` +
      `${chalk.bold(String(namespaces.length))} namespace(s)`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Next steps guide
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prints setup instructions after locale generation.
 *
 * Detects the Expo entry point (app/_layout.tsx for Expo Router,
 * App.tsx for bare Expo) and shows the correct import path for i18n.ts.
 */
function printNextSteps(appRoot: string, config: EaiConfig): void {
  logger.section("Next steps");

  const localeOutputPath = config.localeFileName
    ? `${config.localesDir}/${config.defaultLanguage}/${config.localeFileName}.json`
    : `${config.localesDir}/${config.defaultLanguage}.json`;

  /**
   * Detect Expo entry point.
   * Priority: Expo Router (_layout.tsx) over bare Expo (App.tsx).
   */
  const entryPointCandidates = [
    "app/_layout.tsx",
    "app/_layout.ts",
    "src/app/_layout.tsx",
    "src/app/_layout.ts",
    "App.tsx",
    "App.ts",
  ];

  let entryPointFile = "your app entry point";
  let i18nImportPath = `./${config.i18nFilePath.replace(/\.ts$/, "")}`;

  const i18nAbsPath = path.join(appRoot, config.i18nFilePath);

  for (const candidate of entryPointCandidates) {
    const candidateAbsPath = path.join(appRoot, candidate);
    if (fs.existsSync(candidateAbsPath)) {
      entryPointFile = candidate;
      i18nImportPath = path
        .relative(path.dirname(candidateAbsPath), i18nAbsPath)
        .replace(/\\/g, "/")
        .replace(/\.ts$/, "")
        .replace(/^([^.])/, "./$1");
      break;
    }
  }

  let stepNum = 1;

  logger.info(`
  ${stepNum++}. Make sure ${config.i18nFilePath} is imported in ${entryPointFile}:
       ${chalk.cyan(`import '${i18nImportPath}'`)}
       ${chalk.gray("This must be the first import in the file.")}

  ${stepNum++}. Review ${localeOutputPath} to verify the extracted strings look correct.

  ${stepNum++}. Commit your changes:
       ${chalk.cyan("git add .")}
       ${chalk.cyan('git commit -m "chore: add i18n locale file"')}

  ${stepNum++}. Then run:
       ${chalk.cyan("eai replace")}
       ${chalk.gray("This rewrites your source files to use t() calls automatically.")}
  `);
}
