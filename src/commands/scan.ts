import path from "path";
import chalk from "chalk";
import ora from "ora";
import { logger } from "../utils/logger";
import { requireConfig, validateLocalesDir } from "../utils/config";
import { scanProject, type ExtractedString } from "../core/scanner";
import { generateLocaleFile } from "../core/scaffolder";
import { confirm } from "../utils/prompt";
import fs from "fs";

interface ScanOptions {
  path: string;
  dryRun?: boolean;
}

/**
 * `rai scan`
 *
 * Scans the entire React Native project for translatable strings
 * and generates a locale JSON file for the default language.
 *
 * Steps:
 *   1. Load and validate config
 *   2. Validate localesDir (parent must exist)
 *   3. Scan all source files using AST
 *   4. Show a preview table of what was found
 *   5. Ask for confirmation before writing
 *   6. Write the locale JSON file
 *   7. Print next steps (how to configure react-i18next)
 */
export async function scan(options: ScanOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isDryRun = options.dryRun ?? false;

  // ── Step 1: Load config ───────────────────────────────────────────────────
  const config = await requireConfig(appRoot);
  const localesDir = path.join(appRoot, config.localesDir);

  // ── Step 2: Validate localesDir ───────────────────────────────────────────
  /**
   * We validate before scanning so we don't do expensive AST work
   * only to fail at the file-write step with a confusing error.
   */
  const dirError = validateLocalesDir(config.localesDir, appRoot);
  if (dirError) {
    logger.error(`Invalid "localesDir" in your config:\n  ${dirError}`);
    process.exit(1);
  }

  /**
   * Build the output path string for display purposes.
   * Shown in the header so the user knows exactly where files will go.
   */
  const outputPreview = config.localeFileName
    ? `${config.localesDir}/${config.defaultLanguage}/${config.localeFileName}.json`
    : `${config.localesDir}/${config.defaultLanguage}.json`;

  logger.section("rai — Scan");
  if (isDryRun) logger.warn("  Dry run — no files will be written.\n");

  logger.info(`  App root    : ${appRoot}`);
  logger.info(`  Language    : ${config.defaultLanguage}`);
  logger.info(`  Output      : ${outputPreview}`);
  logger.info(
    `  Alerts      : ${config.detectAlerts ? "detected" : "ignored"}`,
  );
  logger.info(
    `  Throws      : ${config.detectThrows ? "detected" : "ignored"}`,
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
        "    • Is the --path pointing to your app root?\n" +
        "    • Does your app have <Text> components with content?\n" +
        "    • Are the relevant files excluded by your config or .gitignore?",
    );
    process.exit(0);
  }

  // ── Step 4: Preview table ─────────────────────────────────────────────────
  logger.section("Strings found");
  printPreviewTable(strings);

  if (isDryRun) {
    logger.newline();
    logger.warn("Dry run complete — no files written.");
    logger.info("  Remove --dry-run to generate the locale file.");
    process.exit(0);
  }

  // ── Step 5: Confirm ───────────────────────────────────────────────────────
  logger.newline();
  const shouldProceed = await confirm(
    `Write ${strings.length} keys to ${outputPreview}?`,
  );

  if (!shouldProceed) {
    logger.info("Aborted. No files were written.");
    process.exit(0);
  }

  // ── Step 6: Write locale file ─────────────────────────────────────────────
  logger.section("Generating locale file...");

  const { filePath, keyCount } = await generateLocaleFile(
    strings,
    config.defaultLanguage,
    localesDir,
    config.localeFileName,
  );

  logger.success(
    `Generated ${path.relative(appRoot, filePath)} with ${keyCount} keys`,
  );

  // ── Step 6b: Update i18n.ts ───────────────────────────────────────────────
  /**
   * Add the default locale import to i18n.ts now that the locale file exists.
   * If i18n.ts doesn't exist yet (user skipped init), it is generated fresh.
   */
  const { addLocaleToI18nFile } = await import("../utils/i18n-file");
  addLocaleToI18nFile(appRoot, config, config.defaultLanguage);

  // ── Step 7: Next steps ────────────────────────────────────────────────────
  printNextSteps(
    appRoot,
    config.localesDir,
    config.defaultLanguage,
    config.localeFileName,
    config.i18nFilePath ?? "src/i18n.ts",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prints a summary table grouped by namespace (source file).
 *
 * Example output:
 *
 *   auth.signin  (3 strings)
 *     auth.signin.welcome_back              "Welcome back"
 *     auth.signin.sign_in                   "Sign in"
 *     auth.signin.forgot_password           "Forgot password?"
 *
 *   home  (2 strings)
 *     home.total_transactions               "Total Transactions"
 *     home.loading                          "Loading..."
 *
 *   5 total strings across 2 namespaces
 */
function printPreviewTable(strings: ExtractedString[]): void {
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
 * Prints setup instructions for react-i18next after locale generation.
 *
 * The import path shown for the i18n file is computed relative to the
 * most likely entry point location, not hardcoded. This prevents the
 * common confusion where `import './src/i18n'` is wrong because the
 * entry point is inside app/ or src/.
 *
 * Entry point detection priority:
 *   1. app/_layout.tsx  (Expo Router)
 *   2. src/app/_layout.tsx
 *   3. App.tsx
 *   4. src/App.tsx
 *
 * The i18n file is assumed to live at src/i18n.ts relative to appRoot.
 * The import path is then computed as the relative path from the entry
 * point's directory to the i18n file.
 */
function printNextSteps(
  appRoot: string,
  localesDir: string,
  defaultLang: string,
  localeFileName: string | null,
  i18nFilePath: string,
): void {
  logger.section("Next steps");

  const localeOutputPath = localeFileName
    ? `${localesDir}/${defaultLang}/${localeFileName}.json`
    : `${localesDir}/${defaultLang}.json`;

  /**
   * Detect the entry point to show the correct import path.
   * i18n.ts has already been generated/updated at this point.
   */
  const entryPointCandidates = [
    "app/_layout.tsx",
    "app/_layout.ts",
    "src/app/_layout.tsx",
    "src/app/_layout.ts",
    "App.tsx",
    "App.ts",
    "src/App.tsx",
    "src/App.ts",
  ];

  let entryPointFile = "your app entry point";
  let i18nImportPath = `./${i18nFilePath.replace(/\.ts$/, "")}`;

  const i18nAbsPath = path.join(appRoot, i18nFilePath);

  for (const candidate of entryPointCandidates) {
    const candidateAbsPath = path.join(appRoot, candidate);
    if (fs.existsSync(candidateAbsPath)) {
      entryPointFile = candidate;
      const entryDir = path.dirname(candidateAbsPath);
      i18nImportPath = path
        .relative(entryDir, i18nAbsPath)
        .replace(/\\/g, "/")
        .replace(/\.ts$/, "")
        .replace(/^([^.])/, "./$1");
      break;
    }
  }

  logger.info(`
  Your locale file has been generated and ${i18nFilePath} has been updated.

  1. Make sure ${i18nFilePath} is imported in your entry point (${entryPointFile}):
       ${chalk.cyan(`import '${i18nImportPath}'`)}
       ${chalk.gray("This import should be as high as possible in the file.")}

  2. Review ${localeOutputPath}, then commit:
       ${chalk.cyan(`git add .`)}
       ${chalk.cyan(`git commit -m "chore: add i18n locale file"`)}

  3. Then run:
       ${chalk.cyan("rai replace")}
  `);
}
