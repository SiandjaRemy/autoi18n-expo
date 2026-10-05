# Changelog

All notable changes to this project will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-10-04

### Initial release

First public release of `@autoi18n/expo` — a CLI tool for automating i18n
setup in Expo and React Native projects.

---

### Commands

**`eai init`**
- Detects project structure (presence of `src/`, `app/`, Expo, Next.js) and
  generates smart defaults for `localesDir`, `i18nFilePath`
- Generates `eai.config.ts` with full TypeScript IntelliSense via `defineConfig()`
  — hover any field for documentation, `Ctrl+Space` for all available options
- Generates `src/i18n.ts` with an empty resources object, ready to be populated
  by subsequent commands

**`eai scan`**
- AST-based scanning of `.ts`, `.tsx`, `.js`, `.jsx` files using Babel parser
- Detects: JSX text, JSX string expressions, template literals, ternary expressions,
  logical expressions, translatable JSX props, `Alert.alert()` calls (including
  ternary arguments), `throw new Error()` statements, configurable custom call patterns
- Ignores: NativeWind/Tailwind class strings, non-translatable props, pure numbers,
  URLs, code identifiers, runtime API response data
- Normalizes JSXText whitespace the same way React does — prevents layout-breaking
  literal newlines in locale files
- Expo Router route group parentheses stripped from namespace: (tabs) → tabs
- Smart merge: when a locale file already exists, new keys are added and existing
  translations are never overwritten
- --fresh flag to regenerate from scratch
- --dry-run flag for safe previewing
- Updates src/i18n.ts with the default locale import after generating
- Prints the correct import path for the detected entry point

**`eai replace`**
- Rewrites source files using recast — only changed lines appear in git diff
- Replaces all detected string types with t() calls
- Injects useTranslation import and hook into React components
- Adds t: TFunction parameter to module-level helper functions
- Updates call sites of patched helpers within the same file
- Preserves meaningful whitespace around inline JSX sibling elements
- Creates .eaibak backup files before modifying any source file
- --dry-run flag for safe previewing

**`eai revert`**
- Restores source files from .eaibak backup files created by eai replace
- --clean flag deletes backups without restoring

**`eai locales-generate`**
- Generates locale files for target languages from the default locale
- Diff-merges into existing files — only adds missing keys, preserves translations
- --only <langs> with ISO 639-1 validation
- --force to overwrite existing files
- --with-imports to wire new locale imports into src/i18n.ts
- --dry-run for previewing

**`eai locales-sync`**
- Syncs new keys from the default locale into all target locale files
- New keys added with configurable unsyncedPrefix (default: [UNTRANSLATED])
- Removed keys flagged in output but never deleted automatically
- Existing translations always preserved
- Auto-detects existing locale files when targetLanguages is not configured
- --only <langs> for specific languages
- --dry-run for previewing

---

### Configuration

- defineConfig() helper for full TypeScript IntelliSense
- All fields documented with JSDoc visible in editor
- unsyncedPrefix field for locales-sync marker
- ISO 639-1 codes and regional variants supported

---

### Known limitations

- Hook injection relies on naming conventions (uppercase name = component)
- Cross-file helper call sites are not updated automatically
- eai replace is not idempotent — always eai revert before re-running
- No string deduplication across files
- No translation API integration (planned)