import path from "path";
import { ColoredStrings, logger } from "../utils/logger";
import fs from "fs";

import { detectProjectProfile } from "../utils/detect-project";
import {
  CONFIG_FILENAME,
  DEFAULT_CONFIG,
  getConfigPath,
  loadConfig,
} from "../utils/config";
import { generateInitialI18nFile } from "../utils/i18n-file";

export interface InitOptions {
  path: string;
  force?: boolean;
}

/**
 * `eai init`
 *
 * 1. Detect project structure
 * 2. Write eai.config.ts (skip if exists, unless --force)
 * 3. Write i18n.ts (skip if exists, unless --force)
 */
export async function init(options: InitOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const configPath = getConfigPath(appRoot);
  const force = Boolean(options.force);

  logger.section("eai — Init");

  // ── Step 1: Detect project structure ──────────────────────────────────────
  const profile = detectProjectProfile(appRoot);

  logger.section("Detected project profile");

  const projectType = profile.isExpo
    ? "Expo"
    : "Unknown (no expo dependency detected)";

  if (!profile.isExpo) {
    logger.warn(
      "  This package targets Expo apps. Continue only if you know you need it.",
    );
  }

  logger.info(`  Project type : ${projectType}`);
  logger.info(`  src/ exists  : ${profile.hasSrcDir ? "yes" : "no"}`);
  logger.info(`  app/ exists  : ${profile.hasAppDir ? "yes" : "no"}`);
  logger.info(`  Locales dir  : ${profile.recommendedLocalesDir}`);
  logger.info(`  i18n file    : ${profile.recommendedI18nFilePath}`);

  if (force) {
    logger.warn("  --force enabled: existing setup files will be overwritten.");
  }

  // ── Step 2: eai.config.ts ─────────────────────────────────────────────────
  logger.section("Generating config file...");

  let configCreated = false;
  let configSkipped = false;

  if (fs.existsSync(configPath) && !force) {
    configSkipped = true;
    logger.warn(
      `${CONFIG_FILENAME} already exists — skipping.\n` +
        `  Delete it and re-run "eai init", or use "eai init --force" to overwrite.`,
    );
  } else {
    const configContent = buildConfigContent(profile);
    fs.writeFileSync(configPath, configContent, "utf-8");
    configCreated = true;
    logger.success(
      force && configSkipped === false
        ? `Wrote ${CONFIG_FILENAME}`
        : `Created ${CONFIG_FILENAME}`,
    );
  }

  // ── Step 3: i18n.ts ───────────────────────────────────────────────────────
  logger.section("Generating i18n config file...");

  const config = (await loadConfig(appRoot)) ?? {
    ...DEFAULT_CONFIG,
    localesDir: profile.recommendedLocalesDir,
    i18nFilePath: profile.recommendedI18nFilePath,
  };

  const i18nResult = generateInitialI18nFile(appRoot, config, force);

  // ── Summary ───────────────────────────────────────────────────────────────
  const i18nFilePath = config.i18nFilePath ?? profile.recommendedI18nFilePath;
  const entryImportPath = resolveEntryImportPath(appRoot, i18nFilePath);

  const bothAlreadyPresent = configSkipped && i18nResult.skipped && !force;

  if (bothAlreadyPresent) {
    logger.section("Already initialized");
    logger.info(`
  Both setup files already exist (left unchanged):

    ${ColoredStrings.cyan(CONFIG_FILENAME)}
    ${ColoredStrings.cyan(i18nFilePath)}

  Next:
    ${ColoredStrings.cyan("eai scan")}

  To regenerate defaults:
    delete those files and run ${ColoredStrings.cyan("eai init")}
    or run ${ColoredStrings.cyan("eai init --force")} ${ColoredStrings.gray("(overwrites both)")}
`);
    return;
  }

  logger.section("Setup complete");
  logger.info(`
  ${configCreated ? "Created" : "Kept"} ${ColoredStrings.cyan(CONFIG_FILENAME)}
  ${i18nResult.created ? "Created" : "Kept"} ${ColoredStrings.cyan(i18nFilePath)}

  Import i18n in your app entry point before any component renders:
    ${ColoredStrings.gray("// as high as possible in the entry file")}
    ${ColoredStrings.cyan(`import '${entryImportPath}'`)}

  Next steps:
    1. Review ${CONFIG_FILENAME} and adjust settings if needed
       ${ColoredStrings.gray("(defaultLanguage is 'en' — change if your app uses another language)")}
    2. Commit the generated files
    3. Run:
         ${ColoredStrings.cyan("eai scan")}
`);
}
// ─────────────────────────────────────────────────────────────────────────────
// Config content builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the eai.config.ts file content using values from the detected
 * project profile.
 *
 * Fields that vary:
 *   localesDir            — detected from src/ presence
 *   i18nFilePath          — detected from src/ and app/ presence
 *
 * Fields that are always the same:
 *   defaultLanguage, maxKeyLength, detectAlerts, detectThrows,
 *   customDetectCalls, exclude, targetLanguages
 *   (these can't be reliably detected from project structure)
 */
function buildConfigContent(
  profile: ReturnType<typeof detectProjectProfile>,
): string {
  return `import { defineEaiConfig } from '@autoi18n/expo'

export default defineEaiConfig({
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
  unsyncedPrefix: '[UNTRANSLATED]',
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
