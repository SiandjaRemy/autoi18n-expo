interface ReplaceOptions {
    path: string;
    dryRun?: boolean;
}
/**
 * `eai replace`
 *
 * Reads the existing locale file, re-scans the project to get string
 * locations, then rewrites every source file replacing raw strings
 * with t() calls and injecting useTranslation.
 *
 * Steps:
 *   1. Load config
 *   2. Check locale file exists (scan must have been run first)
 *   3. Re-scan project to get ExtractedString locations
 *   4. Transform all files (compute changes without writing)
 *   5. Show a preview of what will change
 *   6. Confirm before writing
 *   7. Write all modified files
 *   8. Print next steps
 *
 * Why re-scan instead of saving scan results to disk?
 *   Saving scan results would require a cache file that could go stale.
 *   Re-scanning is fast (pure AST parsing, no I/O except file reads)
 *   and guarantees the locations are current.
 */
export declare function replace(options: ReplaceOptions): Promise<void>;
export {};
//# sourceMappingURL=replace.d.ts.map