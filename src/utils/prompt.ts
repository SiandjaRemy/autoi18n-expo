import { confirm as inquirerConfirm } from "@inquirer/prompts";
import { logger } from "./logger";
import fs from "fs";
import path from "path";

/**
 * Asks the user a yes/no question in the terminal.
 *
 * Returns true if the user answers yes, false if no.
 * Exits cleanly if the user presses Ctrl+C.
 *
 * Why @inquirer/prompts instead of readline?
 *   - Handles Ctrl+C gracefully without crashing
 *   - Renders a proper interactive prompt with y/N default indicator
 *   - Is the modern successor to the widely used `inquirer` package
 *
 * @param message     - The question to display
 * @param defaultVal  - Whether the default answer is yes (true) or no (false)
 */
export async function confirm(
  message: string,
  defaultVal = true,
): Promise<boolean> {
  try {
    return await inquirerConfirm({ message, default: defaultVal });
  } catch {
    /**
     * @inquirer/prompts throws an ExitPromptError when the user
     * presses Ctrl+C. We catch it here and exit cleanly instead
     * of showing a stack trace.
     */
    logger.newline();
    logger.info("Aborted.");
    process.exit(0);
  }
}

/**
 * Detects which package manager the project uses by checking for lockfiles.
 *
 * Why lockfiles and not package.json?
 * Lockfiles are always created when a package manager runs and are
 * the most reliable signal. package.json has no field for this.
 *
 * Priority: pnpm > yarn > npm
 * pnpm and yarn are checked first because npm is the fallback —
 * a project using pnpm will also have a node_modules folder but
 * only pnpm creates pnpm-lock.yaml.
 *
 * @param appRoot - Absolute path to the project root
 */
export function detectPackageManager(appRoot: string): "npm" | "yarn" | "pnpm" {
  if (fs.existsSync(path.join(appRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(appRoot, "yarn.lock"))) return "yarn";
  return "npm";
}

/**
 * Returns true if the project is an Expo project.
 *
 * We check for 'expo' in both dependencies and devDependencies because
 * some setups install expo as a dev dependency.
 *
 * Why does this matter?
 * Expo projects should use `npx expo install` instead of the raw package
 * manager when installing React Native compatible packages, because
 * expo install pins to versions compatible with the current Expo SDK.
 *
 * @param appRoot - Absolute path to the project root
 */
export function isExpoProject(appRoot: string): boolean {
  try {
    const pkgPath = path.join(appRoot, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return !!(pkg.dependencies?.expo || pkg.devDependencies?.expo);
  } catch {
    return false;
  }
}

/**
 * Checks whether a package is already listed in the project's
 * dependencies or devDependencies.
 *
 * Used to avoid suggesting installs for packages already present.
 *
 * @param packageName - npm package name to check e.g. 'react-i18next'
 * @param appRoot     - Absolute path to the project root
 */
export function isPackageInstalled(
  packageName: string,
  appRoot: string,
): boolean {
  try {
    const pkgPath = path.join(appRoot, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return !!(
      pkg.dependencies?.[packageName] || pkg.devDependencies?.[packageName]
    );
  } catch {
    return false;
  }
}

/**
 * Builds the correct install command for the given packages,
 * package manager, and whether the project uses Expo.
 *
 * @param packages       - List of package names to install
 * @param packageManager - 'npm' | 'yarn' | 'pnpm'
 * @param expo           - Whether to use npx expo install
 */
export function buildInstallCommand(
  packages: string[],
  packageManager: "npm" | "yarn" | "pnpm",
  expo: boolean,
): string {
  if (expo) {
    return `npx expo install ${packages.join(" ")}`;
  }

  const commands = {
    npm: `npm install ${packages.join(" ")}`,
    yarn: `yarn add ${packages.join(" ")}`,
    pnpm: `pnpm add ${packages.join(" ")}`,
  };

  return commands[packageManager];
}
