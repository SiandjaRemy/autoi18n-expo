import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["cjs"],
  platform: "node",
  target: "node18",
  dts: false,
  clean: true,
  sourcemap: true,
  splitting: false,
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  /**
   * Bundle packages that could conflict with host project versions.
   *
   * fast-glob — Expo tooling ships micromatch/glob internally; bundling
   *             fast-glob ensures we always use our pinned version.
   * chalk@4   — Expo ships chalk; v5 is ESM-only and would break CJS bundle.
   * commander — bundled so Expo's older commander hoist can't interfere.
   */
  noExternal: ["fast-glob", "chalk", "commander", "recast"],

  external: [
    "@babel/generator",
    "@babel/parser",
    "@babel/traverse",
    "@babel/types",
    "@inquirer/prompts",
    "ignore",
    "jiti",
    "ora",
  ],
});
