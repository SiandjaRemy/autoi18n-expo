/**
 * The result of inspecting a project's structure.
 * Used by `eai init` to generate smarter config defaults.
 */
export interface ProjectProfile {
    /**
     * Whether a src/ directory exists at the project root.
     * Most React Native and Next.js projects use src/.
     */
    hasSrcDir: boolean;
    /**
     * Whether an app/ directory exists at the project root.
     * Present in Expo Router and Next.js App Router projects.
     */
    hasAppDir: boolean;
    /**
     * Whether src/app/ exists — Expo Router or Next.js App Router
     * with source directory convention.
     */
    hasSrcAppDir: boolean;
    /**
     * Whether the project uses Expo.
     * Detected by presence of 'expo' in dependencies.
     */
    isExpo: boolean;
    /**
     * Whether the project uses Next.js.
     * Detected by presence of 'next' in dependencies.
     */
    isNext: boolean;
    /**
     * Whether the project uses React Native (non-Expo).
     * Detected by presence of 'react-native' but not 'expo'.
     */
    isReactNative: boolean;
    /**
     * The recommended localesDir based on project structure.
     *
     * 'src/locales' when src/ exists — keeps locales alongside source code.
     * 'locales'     when src/ does not exist.
     */
    recommendedLocalesDir: string;
    /**
     * The recommended i18nFilePath based on project structure.
     *
     * 'src/i18n.ts'  when src/ exists
     * 'i18n.ts'      when only app/ exists or neither exists
     */
    recommendedI18nFilePath: string;
    /**
     * Whether addUseClientDirective should default to true.
     * True for Next.js projects (App Router requires 'use client').
     */
    recommendedUseClientDirective: boolean;
}
/**
 * Inspects a project's directory structure and package.json to build
 * a profile that `eai init` uses for generating smart config defaults.
 *
 * This function never throws — all checks are safe and fall back to
 * conservative defaults if anything can't be read.
 *
 * @param appRoot - Absolute path to the project root
 */
export declare function detectProjectProfile(appRoot: string): ProjectProfile;
//# sourceMappingURL=detect-project.d.ts.map