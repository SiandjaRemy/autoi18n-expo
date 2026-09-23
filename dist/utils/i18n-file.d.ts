import type { eaiConfig } from "../types/config";
/**
 * Resolves the absolute path to the i18n config file.
 *
 * Uses config.i18nFilePath which is relative to the app root.
 * Falls back to 'src/i18n.ts' if not set.
 */
export declare function resolveI18nFilePath(appRoot: string, config: eaiConfig): string;
/**
 * Generates the initial i18n.ts file with no locale imports.
 *
 * Called by `eai init`. At init time no locales exist yet, so
 * the resources object is empty. Subsequent commands (scan,
 * locales-generate) add locale imports via updateI18nFile().
 *
 * The generated file is intentionally minimal — just enough to
 * initialize i18next so the app doesn't crash before locales are added.
 *
 * @param appRoot - Absolute path to the project root
 * @param config  - The loaded eai config
 */
export declare function generateInitialI18nFile(appRoot: string, config: eaiConfig): void;
/**
 * Adds a locale import to the i18n.ts file.
 *
 * Called after:
 *   - `eai scan` (adds the default language)
 *   - `eai locales-generate` (adds target languages)
 *
 * Strategy: rather than trying to surgically patch the file with AST,
 * we rewrite it entirely from scratch using the known locale structure.
 * This is simpler and more reliable than trying to inject into an
 * arbitrary user-edited file.
 *
 * We read the existing file to extract which languages are already
 * imported, then regenerate with all languages including the new one.
 *
 * @param appRoot     - Absolute path to the project root
 * @param config      - The loaded eai config
 * @param newLanguage - The language code to add e.g. 'fr'
 */
export declare function addLocaleToI18nFile(appRoot: string, config: eaiConfig, newLanguage: string): void;
//# sourceMappingURL=i18n-file.d.ts.map