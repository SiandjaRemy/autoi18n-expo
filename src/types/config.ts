/**
 * All valid ISO 639-1 language codes.
 *
 * Defined as a const array so it serves two purposes:
 *   1. Runtime validation — we can check user input against this list
 *   2. Type inference — TypeScript narrows the type to a literal union
 *
 * `as const` tells TypeScript to infer the narrow type
 * ('en' | 'fr' | 'es' | ...) instead of just string[].
 */
export const SUPPORTED_LANGUAGE_CODES = [
  "af",
  "sq",
  "am",
  "ar",
  "hy",
  "az",
  "eu",
  "be",
  "bn",
  "bs",
  "bg",
  "ca",
  "zh",
  "hr",
  "cs",
  "da",
  "nl",
  "en",
  "et",
  "fi",
  "fr",
  "gl",
  "ka",
  "de",
  "el",
  "gu",
  "ht",
  "ha",
  "he",
  "hi",
  "hu",
  "is",
  "ig",
  "id",
  "ga",
  "it",
  "ja",
  "kn",
  "kk",
  "km",
  "ko",
  "ku",
  "ky",
  "lo",
  "lv",
  "lt",
  "lb",
  "mk",
  "mg",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "mn",
  "my",
  "ne",
  "nb",
  "ps",
  "fa",
  "pl",
  "pt",
  "pa",
  "ro",
  "ru",
  "sm",
  "sr",
  "sn",
  "sd",
  "si",
  "sk",
  "sl",
  "so",
  "es",
  "su",
  "sw",
  "sv",
  "tl",
  "tg",
  "ta",
  "tt",
  "te",
  "th",
  "tr",
  "tk",
  "uk",
  "ur",
  "ug",
  "uz",
  "vi",
  "cy",
  "xh",
  "yi",
  "yo",
  "zu",
] as const;

// Extended with regional variants
export const SUPPORTED_LOCALES = [
  // Base languages
  ...SUPPORTED_LANGUAGE_CODES,

  // French variants
  "fr-CA",
  "fr-BE",
  "fr-CH",
  "fr-LU",
  "fr-MC",

  // English variants
  "en-US",
  "en-GB",
  "en-AU",
  "en-CA",
  "en-IN",
  "en-NZ",

  // Spanish variants
  "es-AR",
  "es-BO",
  "es-CL",
  "es-CO",
  "es-CR",
  "es-CU",
  "es-DO",
  "es-EC",
  "es-ES",
  "es-GT",
  "es-HN",
  "es-MX",
  "es-NI",
  "es-PA",
  "es-PE",
  "es-PR",
  "es-PY",
  "es-SV",
  "es-US",
  "es-UY",
  "es-VE",

  // Portuguese variants
  "pt-BR",
  "pt-PT",

  // Chinese variants
  "zh-CN",
  "zh-TW",
  "zh-HK",
  "zh-MO",

  // German variants
  "de-AT",
  "de-CH",
  "de-DE",
  "de-LI",
  "de-LU",

  // Italian variants
  "it-CH",
  "it-IT",
  "it-SM",

  // Dutch variants
  "nl-BE",
  "nl-NL",

  // Arabic variants
  "ar-AE",
  "ar-BH",
  "ar-DZ",
  "ar-EG",
  "ar-IQ",
  "ar-JO",
  "ar-KW",
  "ar-LB",
  "ar-LY",
  "ar-MA",
  "ar-OM",
  "ar-QA",
  "ar-SA",
  "ar-SD",
  "ar-SY",
  "ar-TN",
  "ar-YE",
] as const;

/**
 * Union type of all valid language codes.
 * e.g. 'en' | 'fr' | 'es' | 'ar' | ...
 *
 * When a user types `defaultLanguage: 'xx'` in their config,
 * TypeScript will immediately show an error in their editor.
 */
export type LanguageCode = (typeof SUPPORTED_LOCALES)[number];

/**
 * Full configuration shape for react-auto-i18n.
 *
 * This is what the user exports from eai.config.ts.
 * Every field is optional via Partial<eaiConfig> in the config file
 * because missing fields are filled in from DEFAULT_CONFIG at runtime.
 */
export interface eaiConfig {
  /**
   * The language your app is currently written in.
   * All strings found during scan will be stored under this language code.
   * Must be a valid ISO 639-1 code.
   *
   * @default 'en'
   */
  defaultLanguage: LanguageCode;

  /**
   * Directory where locale files will be generated.
   * Relative to your app root.
   *
   * @default 'locales'
   */
  localesDir: string;

  /**
   * Custom name for the locale file, without extension.
   *
   * When null (default), locale files are named after the language code:
   *   locales/en.json
   *   locales/fr.json
   *
   * When set, a subdirectory is created for each language and the file
   * is placed inside it with the given name:
   *   locales/en/localeFileName.json
   *   locales/fr/localeFileName.json
   *
   * This matches the convention used by many i18next projects where
   * each language has its own directory containing named namespace files.
   *
   * @default null
   * @example 'translation'  →  locales/en/translation.json
   * @example 'messages'     →  locales/en/messages.json
   */
  localeFileName: string | null;

  /**
   * Maximum total length of a generated translation key.
   *
   * Keys are built from the file path + the string content:
   *   auth.forgotpassword.enter_your_email_address
   *
   * Long strings produce long keys. This cap keeps them manageable.
   * The string portion is trimmed first to fit within this limit.
   *
   * @default 60
   */
  maxKeyLength: number;

  /**
   * When true, adds 'use client' directive to files modified by eai replace.
   * Required for Next.js App Router since useTranslation() uses React context.
   * Leave false for React Native, Expo, or Next.js Pages Router projects.
   *
   * @default false
   */
  addUseClientDirective: boolean;

  /**
   * Whether to detect and extract strings passed to Alert.alert().
   *
   * Alert.alert('Title', 'This message needs translation')
   *                        ↑ extracted when true
   *
   * @default true
   */
  detectAlerts: boolean;

  /**
   * Whether to detect and extract strings inside throw statements.
   *
   * throw new Error('Failed to save item')
   *                  ↑ extracted when true
   *
   * @default true
   */
  detectThrows: boolean;

  /**
   * Additional function call patterns to detect string arguments from.
   *
   * Use this for custom toast libraries, error handlers, or any function
   * that receives user-visible strings.
   *
   * Format: 'functionName' or 'object.method'
   *
   * @default []
   * @example ['toast.show', 'setError', 'showMessage', 'Snackbar.show']
   */
  customDetectCalls: string[];

  /**
   * Glob patterns to exclude from scanning, in addition to the built-in
   * exclusions (node_modules, dist, build, android, ios, .expo).
   *
   * Patterns are relative to your app root.
   *
   * @default []
   * @example ['src/mocks/**', 'src/fixtures/**', 'src/dev/**']
   */
  exclude: string[];

  /**
   * Languages to generate translation files for, in addition to defaultLanguage.
   *
   * Run `eai locales generate` after `eai scan` to create these files.
   * Each file starts as a copy of the default language file, ready to
   * hand off for manual translation (or to paste into an LLM/translator).
   *
   * Must be valid ISO 639-1 codes.
   *
   * @default []
   * @example ['fr', 'es', 'de']
   */
  targetLanguages: LanguageCode[];

  /**
   * Path to your i18n setup file (the one with `i18n.use(initReactI18next).init(...)`).
   *
   * `eai locales generate --with-imports` edits this file to import and
   * register newly generated locale files. If the file doesn't exist yet,
   * import wiring is skipped with a warning.
   *
   * @default 'src/i18n.ts'
   */
  i18nFilePath: string | null;
}
