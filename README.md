<div align="center">

# @autoi18n/expo

**Find every string. Generate every locale. Rewrite every call site.**

Automatic i18n scaffolding and code transformation for **Expo** and **React Native**.

<div align="center">

[![npm version](https://img.shields.io/npm/v/@autoi18n/expo?color=blue&label=npm&style=flat-square)](https://www.npmjs.com/package/@autoi18n/expo) [![downloads](https://img.shields.io/npm/dm/@autoi18n/expo?color=green&style=flat-square)](https://www.npmjs.com/package/@autoi18n/expo) [![stars](https://img.shields.io/github/stars/SiandjaRemy/autoi18n-expo?style=flat-square&color=yellow)](https://github.com/SiandjaRemy/autoi18n-expo) [![license](https://img.shields.io/npm/l/@autoi18n/expo?color=lightgrey&style=flat-square)](./LICENSE)

</div>

</div>

`@autoi18n/expo` scans your app with AST parsing, extracts user-facing strings, generates locale JSON, and rewrites source to use `t()` or `i18n.t()`. It does not modify a single file until you confirm.

It does **not** handle translation (yet). It prepares the structure, the keys, and the call sites, so **i18next** and **react-i18next** are ready for whatever you or your translation pipeline supply.

**CLI:** `eai`

> **Scope:** Expo and React Native only. Next.js, Vite, and other stacks are planned as separate `@autoi18n/*` packages.

---

- [How it works](#how-it-works)
- [Scope](#scope)
- [Quick start](#quick-start)
- [Installation](#installation)
- [Commands](#commands)
- [Configuration](#configuration)
- [What gets detected](#what-gets-detected)
- [What `replace` does to your code](#what-replace-does-to-your-code)
- [Keys and locale files](#keys-and-locale-files)
- [Working with several languages](#working-with-several-languages)
- [Examples](#examples)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## How it works

```
 your source ──► eai scan ──► locale JSON (default language)
                                   │
                                   ├──► eai replace ──► source rewritten to t("...") / i18n.t("...")
                                   │                    (per-file .i18nbak backups, preview first)
                                   │
                                   └──► eai locales-generate ──► fr/translation.json, es/translation.json, ...
                                        eai locales-sync     ──► keep targets aligned with the default
```

1. **`scan`** parses your files with Babel, extracts user-facing strings, and writes them to the default-language locale file.
2. **`replace`** re-scans to find exact source positions, rewrites the literals in memory, shows you a preview, asks for confirmation, creates backups, then writes the files.
3. **`locales-*`** commands create and maintain files for your other languages and wire them into `i18n.ts` without overwriting your custom code.

The package does not claim 100% coverage of every string shape in a large app. It handles the common patterns well and tells you about the rest. See [Limitations](#limitations).

## Scope

`@autoi18n/expo` targets **Expo and React Native** only. Web frameworks such as Next.js and Vite are out of scope for this package. Separate packages may follow.

Right-to-left (RTL) _layout_ mirroring is not handled. RTL languages work as translation content; use React Native's `I18nManager` or your own app-level handling for layout.

---

## Quick start

```bash
# 1. Install the CLI and the i18n runtime
npm install --save-dev @autoi18n/expo
npm install i18next react-i18next

# 2. Create the config and an initial i18n.ts
npx eai init

# 3. Extract strings into the default-language locale file
npx eai scan

# 4. Rewrite your source to use t() / i18n.t()   (preview + confirmation + backups)
npx eai replace

# 5. Generate files for your other languages (set targetLanguages in eai.config.ts first)
npx eai locales-generate
```

Then make sure `i18n.ts` runs once at startup. With Expo Router, import it at the top of your root layout:

```tsx
// src/app/_layout.tsx
import "@/i18n";
```

Translate the generated files (see [Working with several languages](#working-with-several-languages)) and you're done.

> Tip: run `npx eai scan --only src/screens/auth` first to try the tool on a single folder before touching the whole app.

---

## Installation

```bash
npm install --save-dev @autoi18n/expo
npm install i18next react-i18next
```

- **Install `i18next` and `react-i18next` in your app.** They are peer dependencies, and installing them yourself avoids duplicate peer-resolution problems.
- The CLI binary is `eai`. Run it with `npx eai <command>` or from an npm script.

---

## Commands

| Command                                         | What it does                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| [`eai init`](#eai-init)                         | Create the config file and an initial `i18n.ts`.                               |
| [`eai scan`](#eai-scan)                         | Scan the AST and write keys to the default-language locale. Merges by default. |
| [`eai replace`](#eai-replace)                   | Rewrite extracted literals to `t()` / `i18n.t()`, with preview and backups.    |
| [`eai revert`](#eai-revert)                     | Restore files from their `.i18nbak` backups.                                   |
| [`eai locales-generate`](#eai-locales-generate) | Create target-language locale files from the default one.                      |
| [`eai locales-sync`](#eai-locales-sync)         | Add and remove keys on target locales so they match the default.               |
| [`eai locales-delete`](#eai-locales-delete)     | Delete locale files and clean `i18n.ts`.                                       |

### `eai init`

Creates `eai.config.ts` and an initial `i18n.ts`.

- Existing files are respected and not overwritten.
- `--force` overwrites existing files.

### `eai scan`

Parses your source and writes the default-language locale file (`<localesDir>/<defaultLanguage>/<localeFileName>.json`, or `<localesDir>/<defaultLanguage>.json` when `localeFileName` is `null`).

| Flag                      | Behavior                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------- |
| _(none)_                  | **Merge mode (default).** Adds newly found keys and keeps existing translations.   |
| `--fresh`                 | Rebuilds the locale from this scan. Keys no longer found in code can be removed.   |
| `--only <folder-or-glob>` | Limits the scan, for example `--only src/screens` or `--only "src/utils/**/*.ts"`. |

`--fresh` cannot be combined with `--only`, because a partial scan would delete keys that live outside the scanned paths.

**Rescan feedback.** When the locale already exists and you're in merge mode, the CLI reports how many keys are **new** and how many were **already present**. If nothing is new, it skips a pointless "refresh" confirmation. If hardcoded strings remain, it points you to `eai replace`.

**After `replace`**, a new scan may still list literals. That is expected until those places are rewritten or intentionally excluded (see [Limitations](#limitations)).

Files are discovered with `fast-glob` and filtered through built-in excludes (`node_modules`, `dist`, `build`, `android`, `ios`, `.expo`, `.git`, root config files), your `.gitignore`, and `exclude` in your config.

### `eai replace`

Rewrites your source files so literals become translation calls.

1. Re-scans to find the current source positions.
2. Transforms files **in memory**.
3. Shows a **preview**.
4. Asks for **confirmation**.
5. Creates **backups**.
6. Writes the files.

If the scan finds strings but replace applies **0** transformations, the CLI says so. That points to a mismatch between scan and replace (a visitor gap), not to a silent success. See [Troubleshooting](#troubleshooting).

### `eai revert`

Restores every file that has an `.i18nbak` backup.

- `eai revert --clean` removes the `.i18nbak` files instead of restoring them (use it once you're happy with the result).

### `eai locales-generate`

Creates locale files for the languages in `targetLanguages`, starting from the default locale.

| Flag             | Behavior                                                      |
| ---------------- | ------------------------------------------------------------- |
| `--only <langs>` | Comma-separated codes (overrides / filters `targetLanguages`) |
| `--force`        | Overwrite target files instead of merge                       |
| `--yes`          | Skip confirmation                                             |
| `--dry-run`      | Preview only                                                  |
| `--no-imports`   | Do not wire `i18n.ts`                                         |

- Existing target files are **merged**: missing keys are added, existing translations are left alone.
- New files start as a copy of the default language, which makes them easy to hand to a translator or an LLM.
- Imports and `resources` entries are **wired into `i18n.ts` by default**. Use `--no-imports` to skip that.

<!-- confirm: do --only, --force, --yes and --dry-run exist on locales-generate? If so, document them here. -->

### `eai locales-sync`

Aligns target locales with the default locale.

- Adds keys that exist in the default language but not in the target.
- Removes keys that no longer exist in the default language.
- New values are marked with `unsyncedPrefix` (for example `[UNTRANSLATED] Save`) so you can find what still needs translating.

### `eai locales-delete`

Deletes locale files and surgically removes their entries from `i18n.ts`.

- The **default language cannot be deleted** with this command.



---

## Configuration

`eai init` creates `eai.config.ts`. Everything is optional except where you want to change a default.

```ts
// eai.config.ts
import { defineEaiConfig } from "@autoi18n/expo"; 

export default defineEaiConfig({
  // ── Languages ─────────────────────────────────────────────
  defaultLanguage: "en",
  targetLanguages: ["fr", "es"],

  // ── Files ─────────────────────────────────────────────────
  localesDir: "src/locales",
  localeFileName: "translation", // → src/locales/en/translation.json
  i18nFilePath: "src/i18n.ts",

  // ── Detection ─────────────────────────────────────────────
  detectAlerts: true,
  detectThrows: true,
  detectStateSetters: true,
  detectObjectLiterals: true,
  objectLiteralIncludeKeys: ["label", "title", "details"],
  customDetectCalls: [
    { callee: "setError", args: "strings" },
    { callee: "Toast.show", args: "object", keys: ["text1", "text2", "text3"] },
  ],

  // ── Scanner ───────────────────────────────────────────────
  exclude: ["src/mocks/**", "src/fixtures/**"],
  maxKeyLength: 60,

  // ── Sync ──────────────────────────────────────────────────
  unsyncedPrefix: "[UNTRANSLATED]",
});
```

### Options

Values marked † are not documented in the original config comments; please verify them against your `defineEaiConfig` defaults.

| Option                                  | Type                   | Default              | Description                                                                                                                                |
| --------------------------------------- | ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `defaultLanguage`                       | `string`               | `"en"`               | The language your app is written in. Must be an ISO 639-1 code. Owned by `eai scan`.                                                       |
| `targetLanguages`                       | `string[]`             | `[]`                 | Languages generated by `eai locales-generate`.                                                                                             |
| `localesDir`                            | `string`               | `"src/locales"`      | Where locale files go. Created if missing (its parent must exist).                                                                         |
| `localeFileName`                        | `string \| null`       | `null` †             | `null` → `<localesDir>/en.json`. A name such as `"translation"` → `<localesDir>/en/translation.json`.                                      |
| `i18nFilePath`                          | `string`               | `"src/i18n.ts"`      | Your i18n setup file. Used by `replace` (to compute imports) and by the `locales-*` commands (to wire imports).                            |
| `maxKeyLength`                          | `number`               | `60`                 | Maximum generated key length (10–200). Long keys are trimmed at word boundaries.                                                           |
| `detectAlerts`                          | `boolean`              | `true`               | Extract `Alert.alert` titles, messages and button text.                                                                                    |
| `detectThrows`                          | `boolean`              | `true`               | Extract `throw new Error("...")` messages.                                                                                                 |
| `detectStateSetters`                    | `boolean`              | `true`               | Extract the first argument of `setX("...")` calls such as `setError("...")`.                                                               |
| `detectObjectLiterals`                  | `boolean`              | †                    | Extract strings from plain object and array literals (see [below](#object-literals)).                                                      |
| `objectLiteralIncludeKeys`              | `string[]`             | †                    | If set, **only** these object keys are extracted (allowlist). Also relaxes the single-word filter for those keys.                          |
| `objectLiteralExcludeKeys`              | `string[]`             | `[]` †               | Extra object keys to skip, on top of the built-in ones.                                                                                    |
| `additionalTranslatablePropNames`       | `string[]`             | `[]` †               | Extra JSX prop names to treat as user-facing, on top of the built-ins.                                                                     |
| `customDetectCalls`                     | `(string \| object)[]` | `[]`                 | Extra call patterns to extract from (see [below](#customdetectcalls)).                                                                     |
| `skipSnakeCase` / `skipCamelCase`       | `boolean`              | `true` †             | Skip single tokens that look like identifiers (`cash_in`, `myValue`).                                                                      |
| `allowSingleWords` / `blockSingleWords` | `string[]`             | `[]` †               | Allow or block specific single-word strings on top of the built-in lists.                                                                  |
| `exclude`                               | `string[]`             | `[]`                 | Extra glob patterns to skip. `node_modules`, `dist`, `build`, `android`, `ios`, `.expo`, `.git` and your `.gitignore` are always excluded. |
| `unsyncedPrefix`                        | `string`               | `"[UNTRANSLATED]"` † | Prefix applied by `eai locales-sync` to values added to a target locale.                                                                   |

### `customDetectCalls`

Use it for toast libraries and custom error handlers. Each entry says which function to watch and how to read its arguments.

```ts
customDetectCalls: [
  // positional string / template arguments
  { callee: "setError", args: "strings" },

  // object arguments: only the listed keys are extracted
  { callee: "Toast.show", args: "object", keys: ["text1", "text2", "text3"] },
];
```

| `args`      | Meaning                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `"strings"` | Extract positional string and template-literal arguments.                                                          |
| `"object"`  | Walk object arguments. Properties are filtered by the entry's `keys`, or by the global `objectLiteralIncludeKeys`. |

A plain string entry still works and means `{ callee, args: "strings" }`.

```ts
Toast.show({
  type: "success",
  text1: "Task saved",
  text2: "You can find it in Active",
});
//                                    ↑ extracted     ↑ extracted
```

Callee names are `name` or `object.method`.

### Object literals

With `detectObjectLiterals` on, strings in plain objects and arrays are extracted when their **key** is allowed:

```ts
export const FILTERS = [
  { id: "all", label: "All" },
  { id: "done", label: "Done" },
];

const STATUS_CONFIG = {
  done: { label: "Completed", details: ["Nice work", "Keep going"] },
};
```

- `id` is ignored (it is a built-in excluded key), `label` and `details` are extracted.
- Nested objects, arrays of strings, and ternaries under allowed keys are all followed.
- TypeScript wrappers such as `as const` and `satisfies` are handled.
- React Native style objects (`{ flex: 1, padding: 8 }`) are detected and skipped.

---

## What gets detected

| Where the text is       | Example                                                                      | Notes                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| JSX text                | `<Text>Hello world</Text>`                                                   | Multiline text is normalized the way React Native collapses it.                                           |
| JSX expression children | `<Text>{isLoading ? "Wait" : "Go"}</Text>`<br>`<Text>{ok && "Saved"}</Text>` | Ternaries, `&&`/`\|\|`, and templates.                                                                    |
| JSX props (allowlisted) | `<Input placeholder="Email" />`                                              | `title`, `placeholder`, `label`, `accessibilityLabel`, … Add more with `additionalTranslatablePropNames`. |
| Prop objects            | `<Stack.Screen options={{ title: "Profile" }} />`                            | Allowlisted keys inside the object.                                                                       |
| `Alert.alert`           | `Alert.alert("Delete?", "This cannot be undone", [{ text: "Cancel" }])`      | Title, message, button text, including ternaries.                                                         |
| `throw`                 | `throw new Error("Failed to save")`                                          | When `detectThrows` is on.                                                                                |
| State setters           | `setError("Invalid email")`                                                  | When `detectStateSetters` is on.                                                                          |
| `return`                | `return "Loading"`                                                           | Stricter heuristics: bare returns need to look like UI copy.                                              |
| Object literals         | `{ label: "All" }`                                                           | When `detectObjectLiterals` is on.                                                                        |
| Configured calls        | `Toast.show({ text1: "Saved" })`                                             | Via `customDetectCalls`.                                                                                  |
| Simple templates        | `` `Reactivate "${task.title}"?` ``                                          | See below.                                                                                                |

### Simple template literals

A template becomes **one key with `{{placeholders}}`** when every interpolation is either:

- an identifier: `${name}`, or
- a simple, non-computed member expression: `${task.title}`, `${SCHEDULER_CONFIG.DEFAULT_NOTIF_COUNT}` (the object is an identifier or `this`).

```ts
`Mark "${task.title}" as done?`;
```

```json
"tasks.detail.mark_as_done": "Mark \"{{title}}\" as done?"
```

The placeholder name is the **property name** (`title`), and the rewritten code passes the **original expression**:

```ts
t("tasks.detail.mark_as_done", { title: task.title });
```

Templates with calls, nested ternaries (for example plurals), or other complex expressions are **not** extracted as a single key. Strings nested inside them may still be picked up on their own.

### What is skipped on purpose

URLs, hex colors, numbers and values with units (`16px`, `50%`), CSS/Tailwind class strings, React Native style objects, package paths, `true`/`false`/`null`, single characters, and (by default) identifier-looking tokens such as `snake_case` and `camelCase`. Single-word strings go through a built-in blocklist and allowlist that you can extend.

---

## What `replace` does to your code

The rewrite depends on where the string lives:

| Context                                                                                     | Output                                                                                                          |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Inside a React component                                                                    | `t("key")`, plus `useTranslation()` and its import                                                              |
| Module level, or exported helpers                                                           | `i18n.t("key")`, plus a default import of your app's i18n instance (relative path resolved from `i18nFilePath`) |
| Non-exported local helper only called inside the same file                                  | May receive an extra `t: TFunction` parameter (limited, see [Limitations](#limitations))                        |
| Non-exported helper **only called** in the same file                                        | May receive `t: TFunction` and same-file call sites get `helper(t)`                                             |
| Helper referenced **as a value** (`action: handleExport`, passed as prop, stored in config) | Always `i18n.t(...)`; signature stays `() => void` — **no** `t` param                                           |

### Before / after

**Component:**

```tsx
// before
export default function SignIn() {
  return <Text>Welcome back</Text>;
}

// after
import { useTranslation } from "react-i18next";

export default function SignIn() {
  const { t } = useTranslation();
  return <Text>{t("auth.signin.welcome_back")}</Text>;
}
```

**Alert with an interpolated title:**

```tsx
// before
Alert.alert("Reactivate task", `Reactivate "${task.title}"?`, [
  { text: "Cancel", style: "cancel" },
  { text: "Reactivate", onPress: handleReactivate },
]);

// after
Alert.alert(
  t("tasks.detail.reactivate_task"),
  t("tasks.detail.reactivate_title", { title: task.title }),
  [
    { text: t("tasks.detail.cancel"), style: "cancel" },
    { text: t("tasks.detail.reactivate"), onPress: handleReactivate },
  ],
);
```

**Module-level data:**

```ts
// before
export const FILTERS = [{ id: "all", label: "All" }];

// after
import i18n from "../i18n";

export const FILTERS = [{ id: "all", label: i18n.t("constants.filters.all") }];
```

`replace` also handles ternaries and logical expressions, nested objects and arrays, `Alert` arguments and button text, call arguments (for example `QuickActions.setItems([{ title, subtitle }])` or `Toast.show({ text1 })`), and inline `[...].map(...)` data. JSX spacing around text is preserved, and imports for `useTranslation`, `i18n`, and `TFunction` are de-duplicated.

### `i18n.ts` is edited surgically

Adding or deleting a locale **injects or removes only the import and the `resources` entry**. Your own code in `i18n.ts` (a `languageChanged` handler, `expo-localization` detection, plugins) is preserved. The file is regenerated in full only when it doesn't exist, or when `eai init` creates it.

A typical file:

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import fr from "./locales/fr/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
```

### Backups

- Every modified file gets a sidecar backup: `Component.tsx.i18nbak`.
- An existing backup is **never overwritten**. The first pre-replace snapshot wins, so running `replace` repeatedly can't destroy your original.
- `eai revert` restores; `eai revert --clean` deletes the backups.
- Consider adding `*.i18nbak` to your `.gitignore`.

---

## Keys and locale files

### Key format

```
<namespace>.<text-slug>
```

- The **namespace** comes from the file path, relative to the app root. A leading `src/`, `app/` and `screens/` are dropped, each segment is lowercased, non-alphanumeric characters become `_`, and Expo Router route groups lose their parentheses.

  | File                           | Namespace              |
  | ------------------------------ | ---------------------- |
  | `src/screens/auth/SignIn.tsx`  | `auth.signin`          |
  | `src/components/ui/Button.tsx` | `components.ui.button` |
  | `src/app/(tabs)/index.tsx`     | `tabs.index`           |

- The **slug** is the text, lowercased, with `{{placeholders}}` removed and non-alphanumerics turned into `_`, trimmed at a word boundary to fit `maxKeyLength`.
- Strings that produce an empty slug (pure punctuation or emoji) are skipped instead of generating broken keys like `components.backbutton.`.
- The same string in two files gets two entries with different namespaces, so each site can be replaced independently.

### File layout

| `localeFileName` | Files                                                                |
| ---------------- | -------------------------------------------------------------------- |
| `null`           | `src/locales/en.json`, `src/locales/fr.json`                         |
| `"translation"`  | `src/locales/en/translation.json`, `src/locales/fr/translation.json` |

---

## Working with several languages

```bash
# 1. Declare targets in eai.config.ts:  targetLanguages: ["fr", "es"]

# 2. Create the files (copies of the default language, merged on re-runs)
npx eai locales-generate

# 3. Translate each file's values (translator, or paste into an LLM and paste back).
#    Keep the keys and {{placeholders}} unchanged.

# 4. Later, after adding code and re-scanning, align the targets
npx eai scan
npx eai locales-sync
```

- `locales-generate` never destroys translations you already made; it merges.
- `locales-sync` marks new values with `unsyncedPrefix`, so search your locale files for `[UNTRANSLATED]` to see what's pending.
- To drop a language: `npx eai locales-delete <lang>`. Its files and `i18n.ts` entries are removed.

---

## Examples

Two apps were used to dogfood the CLI. Use them as reference configs and rewrite results—not as templates you must copy.

### Insist (real app)

[SiandjaRemy/insist · branch `feature/add-eai`](https://github.com/SiandjaRemy/insist/tree/feature/add-eai-live)

Offline-first reminders app. Useful to inspect:

- Nested status maps and filter chips
- Alerts with `` `...${task.title}` ``
- Toast via `customDetectCalls` (`args: "object"`)
- Module data (About, settings actions) with `i18n.t` and callback handlers

Scan → replace → rescan was repeated until leftovers matched [Limitations](#limitations) or config gaps.

### default-expo-app (minimal)

[SiandjaRemy/default-expo-app](https://github.com/SiandjaRemy/default-expo-app)

Stock `create-expo-app` flow: small `eai.config.ts`, locale under `src/locales/`, `i18n.ts`, screens rewritten to `t()`. Best first read if you want the shortest path.

### default-expo-app:

> a fresh Expo template to which i added some more components/screens for more extensive tests

**Repository:** [SiandjaRemy/default-expo-app](https://github.com/SiandjaRemy/default-expo-app)

The stock `create-expo-app` template, run through the same flow. It's the smallest end-to-end example: a minimal config, a locale file such as `src/locales/en/translation.json`, an `i18n.ts`, and the template's screens rewritten to `t()`.

<!-- confirm: which commit/branch shows the "before" state, and whether to mention the string counts. -->

---

## Limitations

These are known and deliberate for now. Where there's a recommended workaround, it is listed.

**Plural logic and nested ternaries inside templates**

```ts
`You have ${n} task${n > 1 ? "s" : ""}.`;
```

This is not extracted as one key, especially inside `useMemo`. Use i18next plurals by hand: `t("tasks.count", { count: n })` with `_one` / `_other` keys.

**UI copy that only lives in an intermediate variable**

```ts
const scopeLabel =
  scope === "daily" ? "your daily schedule" : "your weekly schedule";
Toast.show({ text2: `... ${scopeLabel}` });
```

Strings assigned to the variable aren't recognized as Toast or Alert content. Put the final sentence in `t(...)` or in the Toast props, or use a separate key for each branch.

**Record maps without allowlisted keys**

```ts
const EVENT_LABELS = { reminder: "Reminder" };
```

Values are skipped unless their key is in `objectLiteralIncludeKeys` (or you extend detection via config).

**Dynamic and runtime-only strings**

Server messages, computed keys, and pure formatters can't be reliably found by static analysis.

**Module-level strings are translated when the module loads**

`i18n.t("...")` outside a component runs once, at import time. If the language changes later, those values don't update unless the data is built lazily (inside a function or component). Prefer component-level usage for text that must react to language changes.

**Cross-file callback signatures**

Turning `() => void` into `(t) => void` can break typed configs, for example `action: handleExport`. Use `i18n.t` inside such handlers. Automatic handling of helpers referenced _as values_ is not finished yet (see [Roadmap](#roadmap)).

**Leftover literals after `replace`**

A re-scan after `replace` can still list strings. Most are one of the cases above, or a config gap you can close with `objectLiteralIncludeKeys`, `customDetectCalls` or `additionalTranslatablePropNames`.

**RTL layout** is not mirrored by the package (see [Scope](#scope)).

**Framework scope.** This is not a Next.js or Vite solution.

---

## Troubleshooting

**"Scan found strings but replace changed nothing."**
Scan and replace use separate visitors, and a gap in one shows up as 0 replacements. Re-run `eai scan --only <the file>`, check whether the string falls under a [limitation](#limitations), and if not, open an issue with a minimal snippet.

**A string I wanted is not extracted.**
Check, in this order: is the prop name allowlisted (`additionalTranslatablePropNames`)? Is the object key in `objectLiteralIncludeKeys`? Is it a single word that the blocklist filters (`allowSingleWords`)? Is the call registered in `customDetectCalls`?

**A string I did _not_ want is extracted.**
Add the file or folder to `exclude`, or add the word to `blockSingleWords`. Identifier-like tokens are skipped by default.

**`--fresh` cannot be used with `--only`.**
By design. A partial scan would drop every key outside the scanned paths.

**My `i18n.ts` customizations are gone.**
They shouldn't be: locale commands edit it surgically. It's rewritten in full only if it didn't exist. Check the version you're running.

**`TypeError: ... .hook is not a function` (or other Commander errors).**
A host app hoisted an older `commander`. The package bundles/pins its own, so update to the latest version, then check `npm ls commander`.

**Duplicate or mismatched `i18next` / `react-i18next`.**
Install both directly in your app and dedupe with `npm ls i18next react-i18next`.

**Where are my originals?**
Next to each rewritten file as `*.i18nbak`. Run `eai revert` to restore them.

---

## Roadmap

Planned or under consideration, **not** part of the current release:

- Automatic plural-template extraction
- Opt-in aggressive extraction of `const x = a ? "…" : "…"`
- Scan strategies: conservative / balanced / aggressive
- A prune-only command to remove unused keys without the full `--fresh` rebuild
- Grouping backups into a dedicated directory instead of sidecar `.i18nbak` files
- `eai translate`: machine translation via an API key
- Common namespace / mirrored locale structure
- Separate packages for other frameworks (for example Next.js)

---

## Contributing

Issues and pull requests are welcome. When reporting a missed string, a minimal code snippet plus your `eai.config.ts` is the fastest way to get it fixed.

Issues and PRs: [autoi18n-expo](https://github.com/SiandjaRemy/autoi18n-expo).


## License

[MIT](./LICENSE)
