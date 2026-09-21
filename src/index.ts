/**
 * Public API of react-auto-i18n.
 *
 * Types exported here are available to users who import from 'react-auto-i18n'
 * in their config file:
 *   import type { RaiConfig } from 'react-auto-i18n'
 *
 * Since dts is disabled in tsup, the type declarations won't be auto-generated
 * in dist/. We handle this with a manual declaration file (see Fix 2).
 */
export { defineRaiConfig } from "./utils/defineRaiConfig";
export type { RaiConfig, LanguageCode } from "./types/config";
export { SUPPORTED_LANGUAGE_CODES, SUPPORTED_LOCALES } from "./types/config";
