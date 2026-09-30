import fs from "fs";
import path from "path";
import { isExpoProject } from "./prompt";

/**
 * The result of inspecting a project's structure.
 * Used by `eai init` to generate smarter config defaults.
 */
export interface ProjectProfile {
  /**
   * Whether a src/ directory exists at the project root.
   */
  hasSrcDir: boolean;

  /**
   * Whether an app/ directory exists at the project root.
   * Present in Expo Router projects.
   */
  hasAppDir: boolean;

  /**
   * Whether src/app/ exists — Expo Router with the src directory convention.
   */
  hasSrcAppDir: boolean;

  /**
   * Whether the project uses Expo.
   * Detected by presence of 'expo' in dependencies.
   */
  isExpo: boolean;

  /**
   * Recommended localesDir based on project structure.
   *
   * 'src/locales' when src/ exists — keeps locales alongside source code.
   * 'locales'     when src/ does not exist.
   */
  recommendedLocalesDir: string;

  /**
   * Recommended i18nFilePath based on project structure.
   *
   * 'src/i18n.ts' when src/ exists
   * 'i18n.ts'     otherwise
   */
  recommendedI18nFilePath: string;
}

/**
 * Inspects a project's directory structure and package.json to build
 * a profile that `eai init` uses for generating smart config defaults.
 *
 * Never throws — falls back to conservative defaults if anything can't be read.
 *
 * @param appRoot - Absolute path to the project root
 */
export function detectProjectProfile(appRoot: string): ProjectProfile {
  const hasSrcDir = fs.existsSync(path.join(appRoot, "src"));
  const hasAppDir = fs.existsSync(path.join(appRoot, "app"));
  const hasSrcAppDir = fs.existsSync(path.join(appRoot, "src", "app"));

  let isExpo = false;

  try {
    isExpo = isExpoProject(appRoot);
  } catch {
    // package.json missing or malformed — use defaults
  }

  const recommendedLocalesDir = hasSrcDir ? "src/locales" : "locales";
  const recommendedI18nFilePath = hasSrcDir ? "src/i18n.ts" : "i18n.ts";

  return {
    hasSrcDir,
    hasAppDir,
    hasSrcAppDir,
    isExpo,
    recommendedLocalesDir,
    recommendedI18nFilePath,
  };
}
