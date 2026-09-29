import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["cjs"],
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
  /**
   * shims: true adds CJS-compatible shims for __dirname and __filename
   * which are not available in ESM but are needed by some dependencies.
   */
  shims: true,
  banner: {
    /**
     * The shebang line MUST be the first line of the CLI output file.
     * Without it, the OS does not know to run the file with Node
     * and the command will fail with a cryptic error.
     */
    js: "#!/usr/bin/env node",
  },
});
