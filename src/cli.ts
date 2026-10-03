import { program } from "commander";
import packageJson from "../package.json";

export const APP_VERSION = packageJson.version;
export const APP_DESCRIPTION = packageJson.description;

program
  .name("eai")
  .description(APP_DESCRIPTION)
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
  .description("Generate eai.config.ts and i18n.ts with default settings")
  .option("-p, --path <path>", "Root path of the project", ".")
  .option("-f, --force", "Overwrite existing eai.config.ts and i18n.ts")
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
  .option(
    "-f, --fresh",
    "Remove locale keys not found in this scan (destructive after replace)",
  )
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
  .description("Restore source files from .i18nbak backups created by replace")
  .option("-p, --path <path>", "Root path of the project", ".")
  .option(
    "--clean",
    "Delete backup files without restoring source files (use after verifying replace output)",
  )
  .action(async (options) => {
    const { revert } = await import("./commands/revert");
    await revert(options);
  });

program.parse(process.argv);
