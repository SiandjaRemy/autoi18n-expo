# Changelog

All notable changes to this project will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-09-23

### Changed
- Package renamed from `react-auto-i18n` to `@autoi18n/expo`
- Scope reduced to Expo / React Native projects
- No breaking changes to commands, config file format, or locale output

### Migration from react-auto-i18n

```bash
npm uninstall react-auto-i18n
npm install @autoi18n/expo
```

Update the import in your config file:

```ts
// Before
import { defineConfig } from 'react-auto-i18n'

// After  
import { defineConfig } from '@autoi18n/expo'
```

Everything else (eai.config.ts fields, locale file format, commands) stays identical.

## [1.0.1] — 2026-08-18

### Fixed

- Added a config to enable the addition of `"use client"` at the top of client components for Next.js apps with app router

---

## [1.0.0] — 2026-08-17

### New

- `eai locales-generate` — generates locale files for target languages based on the default locale
  - `--only <langs>` specifies which languages to generate
  - Diff-merges into existing files by default (only adds missing keys, preserves existing translations)
  - `--force` overwrites existing files entirely
  - `--with-imports` wires new locale imports into the i18n config file
  - `--dry-run` previews without writing

### Fixed

- **JSX whitespace normalization** — multiline JSXText nodes (text spanning multiple lines with indentation) were stored in locale files with literal `\n` characters, causing React Native to render actual line breaks and broken layouts. Both the scanner and transformer now normalize JSXText whitespace the same way React does at render time: split on newlines, trim each line, drop blank lines, join with a single space.
- **Transformer lookup mismatch** — strings extracted from multiline JSXText nodes were not being replaced by `eai replace` because the transformer used `.trim()` to look up the key while the scanner used full whitespace normalization. Both now use identical normalization so lookups always succeed.

---

## [0.1.1] — 2026-08-06

### Fixed

- Updated package name references in README from `rn-auto-i18n` to `react-auto-i18n`

---

## [0.1.0] — 2026-08-05

### Initial release

- `eai init` — generates a typed `eai.config.ts` with defaults and inline JSDoc documentation surfaced as editor hover tooltips and `Ctrl+Space` suggestions
- `eai scan` — AST-based scanner that extracts translatable strings from `.ts`, `.tsx`, `.js`, `.jsx` files
  - Detects JSX text content, string expressions, template literals, ternaries, and logical expressions
  - Detects translatable JSX props (`title`, `placeholder`, `label`, etc.)
  - Detects `Alert.alert()` calls and `throw new Error()` statements
  - Configurable custom call patterns via `customDetectCalls`
  - Respects `.gitignore` and `config.exclude`
  - Generates flat locale JSON with dot-namespaced keys (`auth.signin.welcome_back`)
  - Keys trimmed at word boundaries to fit within `maxKeyLength`
  - Supports custom locale file names via `localeFileName` config (`en.json` or `en/translation.json`)
  - Validates `localesDir` parent directory exists before scanning
  - Prints tailored `react-i18next` setup instructions with correct import paths after generation
- `eai replace` — rewrites source files with `t()` calls using recast (produces minimal git diffs — only changed lines appear in `git diff`)
  - Injects `import { useTranslation } from 'react-i18next'` at the top of modified files
  - Injects `const { t } = useTranslation()` inside React components (detected by uppercase name or default export)
  - Adds `import { TFunction } from 'i18next'` and `t: TFunction` parameter to module-level helper functions that contain translatable strings
  - Updates call sites of patched helper functions within the same file
  - Handles ternary expressions, logical expressions, template literals with interpolation params
  - Preserves meaningful whitespace around inline JSX elements (e.g. spaces between text and `<Code>` tags)
  - Creates `.i18nbak` backup files before modifying any source file
  - `--dry-run` flag previews all changes without writing
- `eai revert` — restores source files from `.i18nbak` backups
  - `--clean` flag deletes backups without restoring (use after verifying the app works)
- `--debug` flag on all commands — verbose output including per-file AST details
- `--dry-run` flag on `scan` and `replace`
