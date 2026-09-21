import type { RaiConfig } from "../types/config";

/**
 * Defines the configuration for react-auto-i18n.
 *
 * Wrap your config object in this function to get full TypeScript
 * IntelliSense, hover documentation, and validation without needing
 * a type annotation or `satisfies`.
 *
 * This function does nothing at runtime — it returns its argument
 * unchanged. Its only purpose is to provide type inference.
 *
 * @example
 * ```ts
 * // rai.config.ts
 * import { defineRaiConfig } from 'react-auto-i18n'
 *
 * export default defineRaiConfig({
 *   defaultLanguage: 'en',
 *   localesDir: 'src/locales',
 * })
 * ```
 */
export function defineRaiConfig(config: Partial<RaiConfig>): Partial<RaiConfig> {
  return config;
}
