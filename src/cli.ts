import { program } from "commander";
import packageJson from "../package.json";

export const APP_VERSION = packageJson.version;

program
  .name("eai")
  .description(
    "Automatic i18n scanner and code transformer for React Native apps",
  )
  .version(APP_VERSION)
  /**
   * enablePositionalOptions prevents Commander from confusing
   * root-level flags (like --debug) with subcommand flags.
   */
  .enablePositionalOptions()
  .option("--debug", "Show verbose debug output")
  .hook("preAction", () => {
    if (program.opts().debug) {
      const { setDebugMode } = require("./utils/logger");
      setDebugMode(true);
    }
  });

// ─── init ─────────────────────────────────────────────────────────────────────
program
  .command("init")
  .description("Generate eai.config.ts with default settings")
  .option("-p, --path <path>", "Root path of the project", ".")
  .action(async (options) => {
    const { init } = await import("./commands/init");
    await init(options);
  });

// ─── scan ─────────────────────────────────────────────────────────────────────
program
  .command("scan")
  .description("Scan the app and generate locale files")
  .option("-p, --path <path>", "Root path of the project", ".")
  .option("--dry-run", "Preview without writing files")
  .action(async (options) => {
    const { scan } = await import("./commands/scan");
    await scan(options);
  });

// ─── replace ──────────────────────────────────────────────────────────────────
program
  .command("replace")
  .description("Replace raw strings in source files with t() calls")
  .option("-p, --path <path>", "Root path of the project", ".")
  .option("--dry-run", "Preview without writing files")
  .action(async (options) => {
    const { replace } = await import("./commands/replace");
    await replace(options);
  });

// ─── revert ───────────────────────────────────────────────────────────────────
program
  .command("revert")
  .description("Restore source files to their pre-replace state")
  .option("-p, --path <path>", "Root path of the project", ".")
  .option(
    "--clean",
    "Delete backup files without restoring (use after verifying replace output)",
  )
  .action(async (options) => {
    const { revert } = await import("./commands/revert");
    await revert(options);
  });

// ─── locales ──────────────────────────────────────────────────────────────────
// locales generate
program
  .command("locales-generate")
  .description("Generate locale files for target languages")
  .option("-p, --path <path>", "Root path of the project", ".")
  .option(
    "--only <languages>",
    "Comma-separated list of language codes to generate",
  )
  .option(
    "--force",
    "Overwrite existing locale files (discards manual translations)",
  )
  .option("--yes", "Skip confirmation prompt when using --force")
  .option("--with-imports", "Automatically wire imports into i18n file")
  .option("--dry-run", "Preview without writing files")
  .action(async (options) => {
    const { runLocalesGenerate } = await import("./commands/locales-generate");
    await runLocalesGenerate(options);
  });

program.parse(process.argv);
