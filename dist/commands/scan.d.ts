interface ScanOptions {
    path: string;
    dryRun?: boolean;
}
/**
 * `eai scan`
 *
 * Scans the entire React Native project for translatable strings
 * and generates a locale JSON file for the default language.
 *
 * Steps:
 *   1. Load and validate config
 *   2. Validate localesDir (parent must exist)
 *   3. Scan all source files using AST
 *   4. Show a preview table of what was found
 *   5. Ask for confirmation before writing
 *   6. Write the locale JSON file
 *   7. Print next steps (how to configure react-i18next)
 */
export declare function scan(options: ScanOptions): Promise<void>;
export {};
//# sourceMappingURL=scan.d.ts.map