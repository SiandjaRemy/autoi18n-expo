# @autoi18n/expo

> Automatic i18n scaffolding and code transformation for **Expo** and **React Native** apps.

`@autoi18n/expo` scans your app with AST parsing, extracts user-facing strings, generates locale JSON, and rewrites source to use `t()` / `i18n.t()` — **without modifying your code until you confirm**.

It does **not** machine-translate. It prepares structure, keys, and call sites so **i18next** + **react-i18next** are ready; you (or a TMS/API later) supply translations.

> **Scope:** Expo and React Native only. Next.js, Vite, and other stacks are planned as separate `@autoi18n/*` packages.

**CLI:** `eai`

[![npm version](https://img.shields.io/npm/v/@autoi18n/expo.svg)](https://www.npmjs.com/package/@autoi18n/expo)
[![license](https://img.shields.io/npm/l/@autoi18n/expo.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@autoi18n/expo.svg)](https://nodejs.org)

---

## Table of contents

- [How it works](#how-it-works)
- [Requirements](#requirements)
- [Install](#install)
- [Quick start](#quick-start)
- [Commands](#commands)
  - [`eai init`](#eai-init)
  - [`eai scan`](#eai-scan)
  - [`eai replace`](#eai-replace)
  - [`eai revert`](#eai-revert)
  - [`eai locales-generate`](#eai-locales-generate)
  - [`eai locales-sync`](#eai-locales-sync)
  - [`eai locales-delete`](#eai-locales-delete)
- [Configuration](#configuration)
- [Locale layout](#locale-layout)
- [Global flags](#global-flags)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## How it works

```text
eai init              → config + i18n.ts scaffold
        ↓
eai scan              → default locale JSON (e.g. en) + wire i18n import
        ↓
You                   → install peers (if needed), import i18n in entry, commit
        ↓
eai replace           → t() / i18n.t() in source (+ .i18nbak backups)
        ↓
You                   → verify the app
        ↓
eai revert --clean    → drop backups → commit
   or eai revert      → undo source changes
        ↓
eai locales-generate  → target language files (fr, es, …) + wire i18n
        ↓
You                   → translate values
        ↓
(as the app evolves)
eai scan              → new keys → default locale (merge)
eai locales-sync      → same keys → targets with [UNTRANSLATED] prefix
eai replace           → any remaining hard-coded strings
```

---

## Requirements

- **Node.js** 18+
- An **Expo** or **React Native** project
- **i18next** ≥ 23
- **react-i18next** ≥ 14

---

## Install

> **Install `i18next` and `react-i18next` first (or at the same time).**
> They are peer dependencies and must live in your app, not only inside this package.

```bash
# npm
npm install i18next react-i18next
npm install -D @autoi18n/expo

# yarn
yarn add i18next react-i18next
yarn add -D @autoi18n/expo

# pnpm
pnpm add i18next react-i18next
pnpm add -D @autoi18n/expo

# bun
bun add i18next react-i18next
bun add -d @autoi18n/expo
```

**Why peers?** Your app and the runtime must share a single `i18next` instance. Bundling a second copy inside the CLI can cause duplicate instances, language changes that don't apply, and context bugs. Peers tell every package manager to use the app's install.

Works with **npm**, **yarn**, **pnpm**, and **bun**.

You can also install the CLI globally (`npm install -g @autoi18n/expo`) — but peers still belong in the project.

---

## Quick start

### 1. Initialize

```bash
npx eai init
```

Detects your project layout and generates:

- `eai.config.ts` — typed config with IntelliSense
- `i18n.ts` (often `src/i18n.ts`) — i18next bootstrap with empty resources until `scan`

Review the config; confirm `defaultLanguage` matches the language of your current UI copy.

> Existing files are **not overwritten** unless you pass `--force`.

### 2. Scan

```bash
npx eai scan
```

Scans `.ts` / `.tsx` / `.js` / `.jsx`, extracts translatable strings, writes the default-language locale file, shows a preview by namespace, and asks for confirmation. Updates `i18n.ts` to import that locale.

### 3. Wire the app

```bash
npx expo install i18next react-i18next   # if not already installed
```

Import `i18n` as early as possible in the entry (before screens that call `t`):

```tsx
// app/_layout.tsx or App.tsx — first import
import "../src/i18n"; // use the path printed by init/scan
// the path suggested for the import might be incorrect
// always crosscheck
```

**Commit before `replace`.**

### 4. Replace

```bash
npx eai replace
```

Rewrites matched strings to `t()` / `i18n.t()`. Creates `.i18nbak` backups before writing.

### 5. Verify

```bash
npx expo start

# Something wrong → restore sources
npx eai revert

# Looks good → remove backups only
npx eai revert --clean
git add .
git commit -m "feat: add i18n"
```

### 6. Other languages

```bash
npx eai locales-generate --only fr,es,ar
# or set targetLanguages in eai.config.ts and run without --only
```

Creates target locale files from the default catalog (same keys; values start as default-language text). Imports are wired into `i18n.ts` by default (`--no-imports` to skip). Translate the values in each file.

### 7. Keep in sync (ongoing)

Whenever you add new UI strings:

```bash
npx eai scan           # merge new keys into the default locale
npx eai locales-sync   # add missing keys to fr/es/… with [UNTRANSLATED] prefix
npx eai replace        # rewrite any new hard-coded literals still in source
```

Then search locale files for `[UNTRANSLATED]` (or your `unsyncedPrefix`) and translate those values.

> **Order tip:** `scan` updates the default language; `locales-sync` only copies keys that already exist in the default file. Run `scan` **before** `locales-sync`. Run `replace` when source still contains raw strings for those keys.

---

## Commands

### `eai init`

```bash
eai init
eai init --path ./my-app
eai init --force    # overwrite existing setup files
```

**Detection (Expo-focused):**

| Detection              | Effect                              |
| ---------------------- | ----------------------------------- |
| `src/` exists          | Prefer `src/locales`, `src/i18n.ts` |
| `app/` exists          | Influences suggested paths          |
| `expo` in dependencies | Treated as Expo project             |

**Safe by default:** skips files that already exist.

---

### `eai scan`

```bash
eai scan
eai scan --dry-run
eai scan --fresh
```

**Merge (default)** when the locale file already exists:

| Situation                          | Behavior                       |
| ---------------------------------- | ------------------------------ |
| New key from scan                  | Added (value = source text)    |
| Existing key                       | Value kept (manual edits safe) |
| Key only in file, not in this scan | Kept (not deleted)             |

`--fresh` → Locale rebuilt from this scan only; keys not found are removed.

> Use `--fresh` for intentional cleanup only. After a full `replace`, most copy is no longer in source as literals — `--fresh` would wipe most of the default catalog.

Also wires the default language into `i18n.ts`.

**What gets detected**

| Source                      | Example                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| JSX text                    | `<Text>Hello world</Text>`                                                                               |
| JSX string expressions      | `<Text>{"Hello"}</Text>`                                                                                 |
| Template literals (simple)  | <code>&lt;Text&gt;{`Hello ${name}`}&lt;/Text&gt;</code>                                                  |
| Ternaries / logicals in JSX | `{loading ? "Wait" : "Go"}`, `{flag && "Visible"}`                                                       |
| Allowlisted JSX props       | `<Button title="Submit" />`, `accessibilityLabel`, `actionLabel`, …                                      |
| `Alert.alert`               | Title, message, button text (incl. ternaries)                                                            |
| Throws                      | `throw new Error('Failed to save')`                                                                      |
| Helper return strings       | With stricter UI heuristics                                                                              |
| State setters               | via detectStateSetters (true by default) `setError('…')`, `setMessage('…')` (`set*` + string arg) |
| Custom calls                | `customDetectCalls`, e.g. `toast.show`                                                                   |

**What is ignored**

- className
- Non-UI props (`testID`, `name`, `type`, `color`, …)
- Pure numbers, URLs, single characters, code-like identifiers
- Runtime / server data (`data.message`, `tx.description`)
- Fully dynamic concatenation / index access (see [limitations](#known-limitations))

Respects hard excludes (`node_modules`, `android`, `ios`, `.expo`, …), `config.exclude`, and `.gitignore`.

---

### `eai replace`

```bash
eai replace
eai replace --dry-run
```

Requires a prior successful `scan` (default locale file must exist).

**Strategy**

| Location                                       | Rewrite                                              |
| ---------------------------------------------- | ---------------------------------------------------- |
| React component (PascalCase / default export)  | `t('…')` + `useTranslation()`                        |
| Non-exported local JSX helper in the same file | `t('…')` + `t: TFunction`; same-file calls → `fn(t)` |
| Exported helpers, pure utils, API throws       | `i18n.t('…')` + `import i18n` (call sites unchanged) |

**Examples**

```tsx
// Before
<Text>Hello world</Text>
<Text>{`Welcome ${firstName}`}</Text>
Alert.alert("Delete", "Are you sure?");
throw new Error("Failed to save");

// After (in a component)
<Text>{t("home.hello_world")}</Text>
<Text>{t("home.welcome", { firstName })}</Text>
Alert.alert(t("home.delete"), t("home.are_you_sure"));

// After (module / exported util)
throw new Error(i18n.t("api.failed_to_save"));
```

```tsx
// Local non-exported helper
function getDevMenuHint(t: TFunction) {
  return <Text>{t("index.use_browser_devtools")}</Text>;
}
// same file: getDevMenuHint(t)
```

**Backups:** `.i18nbak` next to each modified file. Existing backups are **not overwritten** (first pre-replace snapshot wins).

> Prefer one successful `replace` path. If you need to re-run, `eai revert` first. Replacing already-replaced files is not guaranteed to be idempotent.

---

### `eai revert`

```bash
eai revert           # restore sources from .i18nbak, delete backups
eai revert --clean   # delete backups only (after you verified)
```

Add to `.gitignore`:

```gitignore
*.i18nbak
```

---

### `eai locales-generate`

Bootstrap non-default languages from the default locale.

```bash
eai locales-generate
eai locales-generate --only fr
eai locales-generate --only fr,es,ar
eai locales-generate --only fr --force
eai locales-generate --only fr --no-imports
eai locales-generate --only fr --dry-run
```

| Flag             | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `--only <langs>` | Comma-separated codes (or use `targetLanguages` in config) |
| `--force`        | Overwrite existing target files entirely                   |
| `--yes`          | Skip confirmation with `--force`                           |
| `--no-imports`   | Do not update `i18n.ts` (default is to wire imports)       |
| `--dry-run`      | Preview only                                               |

- Never regenerates the default language (owned by `scan`)
- Existing targets: add missing keys only (unless `--force`)
- New values = default-language text until you translate

---

### `eai locales-sync`

Run **after** `eai scan` when target locales already exist and the default catalog gained keys.

```bash
eai locales-sync
eai locales-sync --only fr,es
eai locales-sync --dry-run
```

| Change                            | Behavior                                 |
| --------------------------------- | ---------------------------------------- |
| Key in default, missing in target | Added as `unsyncedPrefix + defaultValue` |
| Key in target, not in default     | Reported in CLI output; not deleted      |
| Key already in target             | Untouched (translations preserved)       |

Default `unsyncedPrefix`: `[UNTRANSLATED]`

```json
{
  "home.welcome_back": "Bienvenue",
  "home.new_feature": "[UNTRANSLATED]New feature added",
  "home.loading": "Chargement..."
}
```

Find pending work with project search for `[UNTRANSLATED]` (or your prefix). When translating, replace the **entire value** with the final text (drop the prefix).

**`locales-generate` vs `locales-sync`**

|              | `locales-generate`       | `locales-sync`                 |
| ------------ | ------------------------ | ------------------------------ |
| Main use     | First-time target files  | Ongoing alignment              |
| Missing keys | Default text (bootstrap) | Prefixed with `unsyncedPrefix` |
| `i18n.ts`    | Wired by default         | Usually unchanged              |

---

### `eai locales-delete`

```bash
eai locales-delete --only fr,es
eai locales-delete
```

Removes non-default locale files and cleans `i18n.ts`. **Never deletes the default language.**

---

## Configuration

```ts
// eai.config.ts
import { defineEaiConfig } from "@autoi18n/expo";

export default defineEaiConfig({
  defaultLanguage: "en",
  localesDir: "src/locales",
  localeFileName: null,
  maxKeyLength: 60,
  detectAlerts: true,
  detectThrows: true,
  detectStateSetters: true,
  customDetectCalls: [],
  exclude: [],
  targetLanguages: ["fr", "es"],
  i18nFilePath: "src/i18n.ts",
  unsyncedPrefix: "[UNTRANSLATED]",
});
```


| Field                | Default                       | Description                                                 |
| -------------------- | ----------------------------- | ----------------------------------------------------------- |
| `defaultLanguage`    | `'en'`                        | ISO 639-1 (or regional) code of current UI copy             |
| `localesDir`         | `'locales'` / `'src/locales'` | Locale output directory                                     |
| `localeFileName`     | `null`                        | `null` → `en.json`; `'translation'` → `en/translation.json` |
| `maxKeyLength`       | `60`                          | Max key length (trim at word boundary)                      |
| `detectAlerts`       | `true`                        | `Alert.alert` title, message, buttons                       |
| `detectThrows`       | `true`                        | `throw new Error('…')`                                      |
| `detectStateSetters` | `true`                        | `setError('…')`-style setters                               |
| `customDetectCalls`  | `[]`                          | e.g. `['toast.show']`                                       |
| `exclude`            | `[]`                          | Extra ignore globs                                          |
| `targetLanguages`    | `[]`                          | Defaults for `generate` / `sync` / `delete`                 |
| `i18nFilePath`       | `'src/i18n.ts'`               | i18n bootstrap path                                         |
| `unsyncedPrefix`     | `'[UNTRANSLATED]'`            | Prefix for new values from `locales-sync`                   |

---

## Locale layout

**Flat file** (`localeFileName: null`):

```text
src/locales/en.json
```

```json
{
  "auth.signin.welcome_back": "Welcome back",
  "home.total_transactions": "Total Transactions"
}
```

**Nested** (`localeFileName: 'translation'`):

```text
src/locales/en/translation.json
```

Keys are `namespace.slug` from path + text. For flat dotted keys, `i18n.init` should use:

```ts
keySeparator: false,
nsSeparator: false,
```

so lookups don't treat `.` as object nesting (otherwise the UI may show keys instead of values). The generated `i18n.ts` should include this.

---

## Global flags

```bash
eai --debug          # verbose: files, namespaces, AST-oriented detail
eai <cmd> --path .   # project root (default: cwd)
```

---

## Known limitations

- **Component detection uses naming conventions.**
  PascalCase or default export. HOCs, render props, and factories may need a manual `useTranslation()`.

- **Cross-file call sites are not updated.**
  Exported helpers use `i18n.t` so other files don't need a new `t` argument. Local non-exported helpers only get same-file `fn(t)` patches.

- **`eai replace` is not fully idempotent.**
  Prefer `eai revert` before a second full `replace` on the same tree.

- **No string deduplication across files.**
  Same English in two screens → two keys. A shared `common` namespace is on the roadmap.

- **Computed / runtime strings are not detected.**

  ```tsx
  const msg = "Hello " + name;
  <Text>{data.message}</Text>
  <Text>{messages[index]}</Text>
  ```

- **Dates.** Prefer locale-aware libraries (`date-fns`, etc.) with `i18n.language`, not one key per formatted date.

---

## Troubleshooting

**No i18next instance / missing translations at runtime**
Import `i18n` first in the entry file. Confirm `resources` and language codes in `i18n.ts`.

**UI shows keys like `home.welcome` instead of text**
Flat keys + default i18next separators → set `keySeparator: false` and `nsSeparator: false`. Confirm the key exists in the loaded JSON.

**Alert body shows a key but JSX is fine**
Often `err.message` from an API throw that stored an unresolved key. Fix `i18n.t` at the throw site or translate from an error code in the UI.

**`Property 't' doesn't exist`**
Hook not injected (naming / HOC). Add `const { t } = useTranslation()` manually.

**Strings not detected**
`eai scan --debug`. Check `.gitignore` and `exclude`. For setters, ensure `detectStateSetters` is on; for toasts, use `customDetectCalls`.

**Wrong import path for `i18n`**
Use the path printed by `init` / `scan`.

---

## Roadmap

- Translation API helper (`eai translate …`)
- Shared `common` namespace for repeated strings
- Optional per-screen locale files
- Cross-file call-site patching
- Richer pluralization helpers
- `@autoi18n/next`, `@autoi18n/react` (Vite), etc.

---

## License

[MIT](./LICENSE)
