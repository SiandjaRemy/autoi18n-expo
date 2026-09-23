import { type eaiConfig } from "../types/config";
export declare const CONFIG_FILENAME = "eai.config.ts";
/**
 * Default values for every config field.
 *
 * These are merged with the user's config at load time, so any field
 * the user omits is automatically filled in with its default.
 *
 * If you add a new field to eaiConfig, add its default here too —
 * TypeScript will tell you if you forget (the type annotation enforces it).
 */
export declare const DEFAULT_CONFIG: eaiConfig;
/**
 * Returns the absolute path to the config file for a given app root.
 */
export declare function getConfigPath(appRoot: string): string;
/**
 * Loads and parses the user's eai.config.ts file using jiti.
 *
 * jiti executes TypeScript config files directly at runtime without
 * a separate compile step — the same approach used by Tailwind, Nuxt,
 * and Vite for their config files.
 *
 * Supports two config styles:
 *
 * Style A — defineEaiConfig (recommended):
 *   import { defineEaiConfig } from '@autoi18n/expo'
 *   export default defineEaiConfig({ defaultLanguage: 'en' })
 *
 * Style B — plain object with satisfies (legacy, still supported):
 *   import type { eaiConfig } from '@autoi18n/expo'
 *   export default { defaultLanguage: 'en' } satisfies Partial<eaiConfig>
 *
 * Both produce the same runtime shape: { default: Partial<eaiConfig> }.
 * defineEaiConfig() returns its argument unchanged, so mod.default is
 * always a plain Partial<eaiConfig> object in both cases.
 *
 * After loading, user values are merged on top of DEFAULT_CONFIG so
 * any omitted field is automatically filled in with its default.
 *
 * Returns null if the config file does not exist.
 *
 * @param appRoot - Absolute path to the user's project root
 */
export declare function loadConfig(appRoot: string): Promise<eaiConfig | null>;
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
export declare function validateConfig(config: eaiConfig): string[];
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
export declare function requireConfig(appRoot: string): Promise<eaiConfig>;
/**
 * Validates that the localesDir config value is usable.
 *
 * Checks performed:
 *   1. Not an absolute path — must be relative to the app root
 *   2. No teailing slashes — cosmetic but causes confusing paths
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
export declare function validateLocalesDir(localesDir: string, appRoot: string): string | null;
//# sourceMappingURL=config.d.ts.map