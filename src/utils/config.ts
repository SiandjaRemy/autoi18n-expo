import path from "path";
import fs from "fs";
import { logger } from "./logger";
import {
  SUPPORTED_LOCALES,
  type RaiConfig,
  type LanguageCode,
} from "../types/config";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIG_FILENAME = "rai.config.ts";

/**
 * Default values for every config field.
 *
 * These are merged with the user's config at load time, so any field
 * the user omits is automatically filled in with its default.
 *
 * If you add a new field to RaiConfig, add its default here too —
 * TypeScript will tell you if you forget (the type annotation enforces it).
 */
export const DEFAULT_CONFIG: RaiConfig = {
  defaultLanguage: "en",
  localesDir: "locales",
  localeFileName: null,
  maxKeyLength: 60,
  addUseClientDirective: false,
  detectAlerts: true,
  detectThrows: true,
  customDetectCalls: [],
  exclude: [],
  targetLanguages: [],
  i18nFilePath: "src/i18n.ts",
};

// ─────────────────────────────────────────────────────────────────────────────
// Path helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the absolute path to the config file for a given app root.
 */
export function getConfigPath(appRoot: string): string {
  return path.join(appRoot, CONFIG_FILENAME);
}

// ─────────────────────────────────────────────────────────────────────────────
// Load
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads and parses the user's rai.config.ts file using jiti.
 *
 * jiti executes TypeScript config files directly at runtime without
 * a separate compile step — the same approach used by Tailwind, Nuxt,
 * and Vite for their config files.
 *
 * Supports two config styles:
 *
 * Style A — defineRaiConfig (recommended):
 *   import { defineRaiConfig } from 'react-auto-i18n'
 *   export default defineRaiConfig({ defaultLanguage: 'en' })
 *
 * Style B — plain object with satisfies (legacy, still supported):
 *   import type { RaiConfig } from 'react-auto-i18n'
 *   export default { defaultLanguage: 'en' } satisfies Partial<RaiConfig>
 *
 * Both produce the same runtime shape: { default: Partial<RaiConfig> }.
 * defineRaiConfig() returns its argument unchanged, so mod.default is
 * always a plain Partial<RaiConfig> object in both cases.
 *
 * After loading, user values are merged on top of DEFAULT_CONFIG so
 * any omitted field is automatically filled in with its default.
 *
 * Returns null if the config file does not exist.
 *
 * @param appRoot - Absolute path to the user's project root
 */
export async function loadConfig(appRoot: string): Promise<RaiConfig | null> {
  const configPath = getConfigPath(appRoot);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(configPath);
    const mod = (await jiti.import(configPath)) as {
      default?: Partial<RaiConfig>;
    };

    /**
     * Handle both ESM (export default) and CJS (module.exports =) shapes.
     * jiti normalises most cases but we guard both for safety.
     *
     * With defineRaiConfig:
     *   mod.default = defineRaiConfig({ ... }) = { ... }  (plain object)
     *
     * With satisfies:
     *   mod.default = { ... } satisfies Partial<RaiConfig> = { ... }
     *
     * Both resolve to the same plain object — no special handling needed.
     */
    const userConfig = mod.default ?? (mod as unknown as Partial<RaiConfig>);

    // Merge user values on top of defaults
    // Any field the user omits is filled in from DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch (err) {
    logger.error(`Failed to load ${CONFIG_FILENAME}:`);
    logger.error(String(err));
    logger.debug(err instanceof Error ? (err.stack ?? "") : "");
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a loaded config object and returns a list of error messages.
 * An empty array means the config is valid.
 *
 * We validate at runtime in addition to TypeScript because:
 *   - The user might write a .js config that bypasses TypeScript
 *   - We want clear CLI error messages, not cryptic runtime crashes
 *   - Type errors in the config file won't stop jiti from loading it
 *
 * @param config - The merged config object to validate
 */
export function validateConfig(config: RaiConfig): string[] {
  const errors: string[] = [];

  // Validate defaultLanguage
  if (!SUPPORTED_LOCALES.includes(config.defaultLanguage as LanguageCode)) {
    errors.push(
      `"defaultLanguage" value "${config.defaultLanguage}" is not a valid ISO 639-1 language code.\n` +
        `  Valid examples: 'en', 'fr', 'es', 'ar', 'zh', 'de'`,
    );
  }

  // Validate maxKeyLength is a positive number
  if (
    typeof config.maxKeyLength !== "number" ||
    config.maxKeyLength < 10 ||
    config.maxKeyLength > 200
  ) {
    errors.push(
      `"maxKeyLength" must be a number between 10 and 200, got "${config.maxKeyLength}".`,
    );
  }

  // Validate localesDir is a non-empty string
  if (!config.localesDir || typeof config.localesDir !== "string") {
    errors.push(`"localesDir" must be a non-empty string.`);
  }

  // Validate customDetectCalls is an array of strings
  if (!Array.isArray(config.customDetectCalls)) {
    errors.push(`"customDetectCalls" must be an array of strings.`);
  }

  // Validate exclude is an array of strings
  if (!Array.isArray(config.exclude)) {
    errors.push(`"exclude" must be an array of glob pattern strings.`);
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Require (used by scan and replace commands)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loads and validates the config, exiting with a clear message if anything
 * is wrong. This is the function every command calls at its start.
 *
 * Why exit instead of throwing?
 * These are user-facing CLI errors, not programming errors.
 * A stack trace would be confusing. A clear message with a fix is better.
 *
 * @param appRoot - Absolute path to the user's project root
 */
export async function requireConfig(appRoot: string): Promise<RaiConfig> {
  const config = await loadConfig(appRoot);

  if (!config) {
    logger.error(
      `No ${CONFIG_FILENAME} found in ${appRoot}\n` +
        `  Run "rai init" first to create your config file.`,
    );
    process.exit(1);
  }

  const errors = validateConfig(config);

  if (errors.length > 0) {
    logger.error(`Your ${CONFIG_FILENAME} has the following issues:\n`);
    errors.forEach((e) => logger.error(`  • ${e}`));
    logger.newline();
    logger.info(`  Fix these and re-run the command.`);
    process.exit(1);
  }

  return config;
}

/**
 * Validates that the localesDir config value is usable.
 *
 * Checks performed:
 *   1. Not an absolute path — must be relative to the app root
 *   2. No trailing slashes — cosmetic but causes confusing paths
 *   3. Parent directory exists — e.g. if localesDir is 'src/locales',
 *      the 'src' directory must already exist
 *
 * We do NOT require that localesDir itself exists — we create it
 * during scan. But its parent must exist, otherwise the user has
 * almost certainly made a typo.
 *
 * Returns an error message string if invalid, null if valid.
 *
 * @param localesDir - The localesDir value from config (e.g. 'src/locales')
 * @param appRoot    - Absolute path to the project root
 */
export function validateLocalesDir(
  localesDir: string,
  appRoot: string,
): string | null {
  // Must be a relative path
  if (path.isAbsolute(localesDir)) {
    return (
      `"localesDir" must be a relative path, got "${localesDir}".\n` +
      `  Use a path relative to your project root, e.g. 'locales' or 'src/locales'.`
    );
  }

  // Strip trailing slashes — they cause double-slash in joined paths
  if (localesDir.endsWith("/") || localesDir.endsWith("\\")) {
    return (
      `"localesDir" must not have a trailing slash, got "${localesDir}".\n` +
      `  Remove the trailing slash: '${localesDir.replace(/[/\\]+$/, "")}'`
    );
  }

  /**
   * Check that the parent directory exists.
   *
   * For 'locales'      → parent is appRoot itself → always exists
   * For 'src/locales'  → parent is appRoot/src    → must exist
   * For 'a/b/locales'  → parent is appRoot/a/b    → must exist
   *
   * We use path.dirname on the resolved absolute path to get the parent.
   */
  const resolvedDir = path.join(appRoot, localesDir);
  const parentDir = path.dirname(resolvedDir);

  if (!fs.existsSync(parentDir)) {
    /**
     * Build a helpful message that tells the user exactly which
     * directory is missing and what they can do about it.
     */
    const relativeParent = path.relative(appRoot, parentDir);
    return (
      `The parent directory "${relativeParent}" does not exist.\n` +
      `  Either:\n` +
      `    • Create it first: mkdir ${relativeParent}\n` +
      `    • Or change "localesDir" to an existing location, e.g. 'locales'`
    );
  }

  return null; // valid
}
