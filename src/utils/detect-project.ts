import fs from "fs";
import path from "path";

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
export function detectProjectProfile(appRoot: string): ProjectProfile {
  // ── Directory checks ──────────────────────────────────────────────────────
  const hasSrcDir = fs.existsSync(path.join(appRoot, "src"));
  const hasAppDir = fs.existsSync(path.join(appRoot, "app"));
  const hasSrcAppDir = fs.existsSync(path.join(appRoot, "src", "app"));

  // ── Package.json checks ───────────────────────────────────────────────────
  let isExpo = false;
  let isNext = false;
  let isReactNative = false;

  try {
    const pkgPath = path.join(appRoot, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    isExpo = "expo" in allDeps;
    isNext = "next" in allDeps;
    isReactNative = "react-native" in allDeps && !isExpo;
  } catch {
    // package.json missing or malformed — use defaults
  }

  // ── Derive recommendations ────────────────────────────────────────────────

  /**
   * localesDir recommendation:
   *   src/ exists → 'src/locales' (locales live alongside source)
   *   no src/     → 'locales'     (at project root)
   */
  const recommendedLocalesDir = hasSrcDir ? "src/locales" : "locales";

  /**
   * i18nFilePath recommendation:
   *   src/ exists                     → 'src/i18n.ts'
   *   no src/, but app/ exists        → 'app/i18n.ts'
   *   neither src/ nor app/           → 'i18n.ts'
   *
   * We don't put it inside app/ for Next.js App Router because i18n
   * setup files are typically not route files — they belong in src/
   * or at the root, not mixed with page routes.
   */
  const recommendedI18nFilePath = hasSrcDir
    ? "src/i18n.ts"
    : hasAppDir
      ? "i18n.ts"
      : "i18n.ts";

  /**
   * useClientDirective recommendation:
   * Next.js App Router requires 'use client' on any file using hooks.
   * We default to true for Next.js projects to prevent the common
   * "createContext only works in Client Components" error.
   */
  const recommendedUseClientDirective = isNext;

  return {
    hasSrcDir,
    hasAppDir,
    hasSrcAppDir,
    isExpo,
    isNext,
    isReactNative,
    recommendedLocalesDir,
    recommendedI18nFilePath,
    recommendedUseClientDirective,
  };
}
