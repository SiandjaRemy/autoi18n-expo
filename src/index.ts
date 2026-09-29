/**
 * Public API of @autoi18n/expo.
 *
 * Types exported here are available to users who import from '@autoi18n/expo'
 * in their config file:
 *   import type { eaiConfig } from '@autoi18n/expo'
 *
 * Since dts is disabled in tsup, the type declarations won't be auto-generated
 * in dist/. We handle this with a manual declaration file (see Fix 2).
 */
export { defineEaiConfig } from "./utils/defineEaiConfig";
export type { EaiConfig, LanguageCode } from "./types/config";
export { SUPPORTED_LANGUAGE_CODES, SUPPORTED_LOCALES } from "./types/config";
