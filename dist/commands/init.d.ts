interface InitOptions {
    path: string;
}
/**
 * `eai init`
 *
 * Bootstraps a project for i18n in three steps:
 *   1. Detects project structure to generate smart defaults
 *   2. Generates eai.config.ts with detected defaults
 *   3. Generates the initial i18n.ts at the detected i18nFilePath
 *
 * The i18n.ts file is generated with empty resources since no locales
 * exist yet. Running `eai scan` populates it.
 *
 * If eai.config.ts already exists, step 2 is skipped and the existing
 * config's i18nFilePath is respected for step 3.
 */
export declare function init(options: InitOptions): Promise<void>;
export {};
//# sourceMappingURL=init.d.ts.map