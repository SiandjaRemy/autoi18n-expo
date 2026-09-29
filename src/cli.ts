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

program.parse(process.argv);
