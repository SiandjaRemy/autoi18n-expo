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

/**
 * Extended locale list including regional variants.
 *
 * Covers the base ISO 639-1 codes plus the most common regional
 * variants (e.g. fr-CA, pt-BR, zh-CN). Use these when your app
 * needs locale-specific formatting (dates, numbers, currency)
 * in addition to translated strings.
 */
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
 * Union type of all valid language and locale codes.
 *
 * Covers both base codes ('en', 'fr') and regional variants ('en-US', 'fr-CA').
 * Invalid values are highlighted immediately by TypeScript in the config file.
 *
 * @example 'en' | 'fr-CA' | 'pt-BR' | 'zh-CN'
 */
export type LanguageCode = (typeof SUPPORTED_LOCALES)[number];

/**
 * Full configuration for @autoi18n/expo.
 *
 * All fields are optional in your config file — any field you omit
 * falls back to its default value automatically.
 *
 * Press `Ctrl+Space` inside the config object to see all available options.
 * Hover any field for full documentation and examples.
 */
export interface EaiConfig {
  /**
   * The language your app is currently written in.
   *
   * All strings extracted by `eai scan` will be stored under this
   * language code. Must be a valid ISO 639-1 code or regional variant.
   *
   * @default 'en'
   * @example 'en' | 'fr' | 'fr-CA' | 'pt-BR' | 'ar' | 'zh-CN'
   */
  defaultLanguage: LanguageCode;

  /**
   * Directory where locale files will be generated.
   *
   * Relative to your project root. Created automatically if it does
   * not exist — but its parent directory must already exist.
   *
   * @default 'locales'
   * @example
   * 'locales'     // → locales/en.json        (at project root)
   * 'src/locales' // → src/locales/en.json    (inside src/)
   */
  localesDir: string;

  /**
   * Custom name for the locale file, without the `.json` extension.
   *
   * When `null`, files are named after the language code:
   * ```
   * locales/en.json
   * locales/fr.json
   * ```
   *
   * When set to a string, a subdirectory is created per language:
   * ```
   * locales/en/translation.json
   * locales/fr/translation.json
   * ```
   *
   * The second format is common in i18next projects that follow
   * the one-directory-per-language convention.
   *
   * @default null
   * @example
   * null           // → locales/en.json
   * 'translation'  // → locales/en/translation.json
   * 'messages'     // → locales/en/messages.json
   */
  localeFileName: string | null;

  /**
   * Maximum total length of a generated translation key.
   *
   * Keys are built from the source file path and the string content:
   * ```
   * auth.forgotpassword.enter_your_email_address
   * ```
   *
   * When a key would exceed this limit, the string portion is trimmed
   * at the last complete word boundary before the limit.
   *
   * @default 60
   * @minimum 10
   * @maximum 200
   */
  maxKeyLength: number;

  /**
   * Whether to extract strings passed to `Alert.alert()`.
   *
   * When `true`, both title and message arguments are extracted,
   * including when they are ternary expressions:
   * ```ts
   * Alert.alert(
   *   isEnabled ? 'Disable feature' : 'Enable feature',
   *   'Are you sure you want to continue?'
   * )
   * ```
   *
   * Set to `false` if your app does not use `Alert.alert()` or if
   * you prefer to handle alert strings manually.
   *
   * @default true
   */
  detectAlerts: boolean;

  /**
   * Whether to extract strings from `throw new Error()` statements.
   *
   * When `true`, the error message is extracted:
   * ```ts
   * throw new Error('Failed to save. Please try again.')
   * ```
   *
   * Useful for try/catch blocks where the error message surfaces
   * to the user via a toast, alert, or error state component.
   * Set to `false` if your thrown error messages are not user-facing.
   *
   * @default true
   */
  detectThrows: boolean;

  /**
   * Additional function call patterns to extract string arguments from.
   *
   * Use this for toast libraries, custom error handlers, snackbars, or
   * any function that receives user-visible strings as arguments.
   *
   * Format:
   * - `'functionName'` for top-level functions: `showMessage('Hello')`
   * - `'object.method'` for method calls: `toast.show('Saved')`
   *
   * @default []
   * @example ['toast.show', 'setError', 'showMessage', 'Snackbar.show']
   */
  customDetectCalls: string[];

  detectStateSetters: boolean;

  /**
   * Glob patterns for files and directories to exclude from scanning.
   *
   * The following are always excluded automatically:
   * `node_modules`, `dist`, `build`, `android`, `ios`, `.expo`
   *
   * Use this for mock data, test fixtures, generated files, or dev
   * utilities that contain strings you do not want in your locale files.
   *
   * Patterns are relative to your project root.
   *
   * @default []
   * @example ['src/mocks/**', 'src/fixtures/**', 'src/dev/**']
   */
  exclude: string[];

  /**
   * Languages to generate locale files for when running `eai locales-generate`.
   *
   * Each generated file starts as a copy of your default locale with
   * the same keys — ready to hand off for translation.
   * Can also be overridden at runtime with the `--only` flag.
   *
   * Must be valid ISO 639-1 codes or regional variants.
   *
   * @default []
   * @example ['fr', 'es', 'pt-BR', 'ar']
   */
  targetLanguages: LanguageCode[];

  /**
   * Path to your i18n setup file.
   *
   * This is the file that calls `i18n.use(initReactI18next).init(...)`.
   * Used by `eai scan` and `eai locales-generate` to automatically
   * add locale imports as new languages are generated.
   *
   * Relative to your project root.
   *
   * @default 'src/i18n.ts'
   */
  i18nFilePath: string;

  /**
   * Prefix added to unsynced values in target locale files.
   * Makes untranslated strings easy to find with Ctrl+F.
   * @default '[UNTRANSLATED]'
   */
  unsyncedPrefix: string;
}
