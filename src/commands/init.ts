import path from "path";
import fs from "fs";
import chalk from "chalk";
import { logger } from "../utils/logger";
import {
  getConfigPath,
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
  loadConfig,
} from "../utils/config";
import { generateInitialI18nFile } from "../utils/i18n-file";
import { detectProjectProfile } from "../utils/detect-project";

interface InitOptions {
  path: string;
}

/**
 * `rai init`
 *
 * Bootstraps a project for i18n in three steps:
 *   1. Detects project structure to generate smart defaults
 *   2. Generates rai.config.ts with detected defaults
 *   3. Generates the initial i18n.ts at the detected i18nFilePath
 *
 * The i18n.ts file is generated with empty resources since no locales
 * exist yet. Running `rai scan` populates it.
 *
 * If rai.config.ts already exists, step 2 is skipped and the existing
 * config's i18nFilePath is respected for step 3.
 */
export async function init(options: InitOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const configPath = getConfigPath(appRoot);

  logger.section("rai — Init");

  // ── Step 1: Detect project structure ──────────────────────────────────────
  /**
   * Inspect the project before generating anything.
   * The profile drives which defaults we write into the config file.
   *
   * We log what we detected so users understand why the defaults
   * look the way they do.
   */
  const profile = detectProjectProfile(appRoot);

  logger.section("Detected project profile");

  const projectType = profile.isExpo
    ? "Expo"
    : profile.isNext
      ? "Next.js"
      : profile.isReactNative
        ? "React Native"
        : "React";

  logger.info(`  Project type : ${projectType}`);
  logger.info(`  src/ exists  : ${profile.hasSrcDir ? "yes" : "no"}`);
  logger.info(`  app/ exists  : ${profile.hasAppDir ? "yes" : "no"}`);
  logger.info(`  Locales dir  : ${profile.recommendedLocalesDir}`);
  logger.info(`  i18n file    : ${profile.recommendedI18nFilePath}`);

  if (profile.recommendedUseClientDirective) {
    logger.info(`  use client   : enabled (Next.js detected)`);
  }

  // ── Step 2: Generate rai.config.ts ────────────────────────────────────────
  logger.section("Generating config file...");

  if (fs.existsSync(configPath)) {
    logger.warn(
      `${CONFIG_FILENAME} already exists — skipping.\n` +
        `  Delete it and re-run "rai init" to regenerate with detected defaults.`,
    );
  } else {
    /**
     * Use detected values for the fields that vary by project structure.
     * Everything else uses the same safe defaults as before.
     */
    const configContent = buildConfigContent(profile);
    fs.writeFileSync(configPath, configContent, "utf-8");
    logger.success(`Created ${CONFIG_FILENAME}`);
  }

  // ── Step 3: Generate i18n.ts ──────────────────────────────────────────────
  /**
   * Load the config we just wrote (or the pre-existing one) so that
   * generateInitialI18nFile uses the correct i18nFilePath and localesDir.
   *
   * Falls back to DEFAULT_CONFIG merged with detected values if loading
   * fails for any reason — init should never fail completely.
   */
  logger.section("Generating i18n config file...");

  const config = (await loadConfig(appRoot)) ?? {
    ...DEFAULT_CONFIG,
    localesDir: profile.recommendedLocalesDir,
    i18nFilePath: profile.recommendedI18nFilePath,
    addUseClientDirective: profile.recommendedUseClientDirective,
  };

  generateInitialI18nFile(appRoot, config);

  // ── Next steps ─────────────────────────────────────────────────────────────
  const i18nFilePath = config.i18nFilePath ?? profile.recommendedI18nFilePath;
  const entryImportPath = resolveEntryImportPath(appRoot, i18nFilePath);

  logger.section("Setup complete");
  logger.info(`
  Two files were created:

    ${chalk.cyan(CONFIG_FILENAME)}
      Hover any field for documentation.
      Press Ctrl+Space to see all available options.

    ${chalk.cyan(i18nFilePath)}
      Import this in your app entry point before any component renders:
      ${chalk.gray("// the import should be as high as possible")}
      ${chalk.cyan(`import '${entryImportPath}'`)}

  Next steps:
    1. Review ${CONFIG_FILENAME} and adjust settings if needed
       ${chalk.gray(`(defaultLanguage is always 'en' — update if your app uses a different language)`)}
    2. Commit the generated files
    3. Run:
         ${chalk.cyan("rai scan")}
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// Config content builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the rai.config.ts file content using values from the detected
 * project profile.
 *
 * Fields that vary:
 *   localesDir            — detected from src/ presence
 *   i18nFilePath          — detected from src/ and app/ presence
 *   addUseClientDirective — detected from Next.js presence
 *
 * Fields that are always the same:
 *   defaultLanguage, maxKeyLength, detectAlerts, detectThrows,
 *   customDetectCalls, exclude, targetLanguages
 *   (these can't be reliably detected from project structure)
 */
function buildConfigContent(
  profile: ReturnType<typeof detectProjectProfile>,
): string {
  return `import { defineRaiConfig } from 'react-auto-i18n'

export default defineRaiConfig({
  defaultLanguage: 'en',
  localesDir: '${profile.recommendedLocalesDir}',
  localeFileName: null,
  maxKeyLength: 60,
  detectAlerts: true,
  detectThrows: true,
  customDetectCalls: [],
  exclude: [],
  targetLanguages: [],
  i18nFilePath: '${profile.recommendedI18nFilePath}',
  addUseClientDirective: ${profile.recommendedUseClientDirective},
})
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point import path resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the correct relative import path from the detected entry point
 * file to the i18n.ts file.
 *
 * Checks common entry point locations in priority order and returns the
 * relative path from the first one found.
 *
 * Falls back to a safe generic path if no entry point is detected.
 *
 * @param appRoot      - Absolute path to the project root
 * @param i18nFilePath - Project-relative path to the i18n file
 */
function resolveEntryImportPath(appRoot: string, i18nFilePath: string): string {
  const candidates = [
    "app/_layout.tsx",
    "app/_layout.ts",
    "src/app/_layout.tsx",
    "src/app/_layout.ts",
    "App.tsx",
    "App.ts",
    "src/App.tsx",
    "src/App.ts",
  ];

  const i18nAbs = path.join(appRoot, i18nFilePath);

  for (const candidate of candidates) {
    const candidateAbs = path.join(appRoot, candidate);
    if (fs.existsSync(candidateAbs)) {
      return path
        .relative(path.dirname(candidateAbs), i18nAbs)
        .replace(/\\/g, "/")
        .replace(/\.ts$/, "")
        .replace(/^([^.])/, "./$1");
    }
  }

  return `./${i18nFilePath.replace(/\.ts$/, "")}`;
}
