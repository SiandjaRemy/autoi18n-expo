import chalk from "chalk";

/**
 * Whether debug mode is active.
 * Set to true by passing --debug to any command.
 * When true, logger.debug() calls print to the terminal.
 * When false (default), they are silently ignored.
 */
let debugMode = false;

export function setDebugMode(val: boolean): void {
  debugMode = val;
}

export function isDebugMode(): boolean {
  return debugMode;
}

/**
 * Central logging utility for all terminal output.
 *
 * Why a custom logger instead of console.log directly?
 *   - Consistent formatting and color across all commands
 *   - Easy to silence or redirect in tests
 *   - Single place to change output style globally
 *
 * Color conventions:
 *   cyan bold  → section headers (major steps)
 *   green      → success (something was created or completed)
 *   yellow     → warnings (something is off but not fatal)
 *   red        → errors (something failed)
 *   gray       → secondary info (file paths, counts, details)
 *   white      → primary info (main messages)
 *   magenta    → debug (internal state, only shown with --debug)
 */
export const logger = {
  info: (msg: string): void => {
    console.log(chalk.white(msg));
  },

  success: (msg: string): void => {
    console.log(chalk.green(`✔ ${msg}`));
  },

  warn: (msg: string): void => {
    console.log(chalk.yellow(`⚠ ${msg}`));
  },

  error: (msg: string): void => {
    console.log(chalk.red(`✖ ${msg}`));
  },

  /**
   * Muted text for secondary information.
   * Use for file paths, counts, and details that are helpful
   * but shouldn't dominate the output.
   */
  dim: (msg: string): void => {
    console.log(chalk.gray(msg));
  },

  /**
   * Bold cyan header that visually separates major steps.
   * Use at the start of each logical phase within a command.
   */
  section: (msg: string): void => {
    console.log(chalk.bold.cyan(`\n▶ ${msg}`));
  },

  /**
   * Only prints when --debug flag is active.
   * Use for internal state that helps diagnose problems:
   * AST node types, file paths being considered, config values, etc.
   */
  debug: (msg: string): void => {
    if (debugMode) {
      console.log(chalk.magenta(`[debug] ${msg}`));
    }
  },

  /**
   * Prints a blank line.
   * Use to add breathing room between sections in the output.
   */
  newline: (): void => {
    console.log("");
  },
};
export const ColoredStrings = {
  cyan: (msg: string): string => chalk.cyan(msg),
  gray: (msg: string): string => chalk.gray(msg),
};