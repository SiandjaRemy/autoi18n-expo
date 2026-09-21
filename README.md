<div align="center">

# react-auto-i18n

</div>

<p align="center">
  <a href="https://www.npmjs.com/package/react-auto-i18n">
    <img src="https://badge.fury.io/js/react-auto-i18n.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/react-auto-i18n">
    <img src="https://img.shields.io/npm/dm/react-auto-i18n.svg" alt="npm downloads" />
  </a>
  <a href="https://www.npmjs.com/package/react-auto-i18n">
    <img src="https://img.shields.io/bundlephobia/minzip/react-auto-i18n" alt="bundle size" />
  </a>
  <a href="https://github.com/SiandjaRemy/react-auto-i18n">
    <img src="https://img.shields.io/github/stars/SiandjaRemy/react-auto-i18n" alt="GitHub stars" />
  </a>
  <a href="https://github.com/SiandjaRemy/react-auto-i18n/issues">
    <img src="https://img.shields.io/github/issues/SiandjaRemy/react-auto-i18n" alt="GitHub issues" />
  </a>
  <a href="https://github.com/SiandjaRemy/react-auto-i18n/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/SiandjaRemy/react-auto-i18n" alt="license" />
  </a>
  <a href="https://github.com/SiandjaRemy/react-auto-i18n/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  </a>
</p>

<p align="center">
  <em>Automatic i18n scaffolding and code transformation for React and React Native apps.</em>
</p>


`react-auto-i18n` scans your app's source code, extracts every translatable string, generates locale files, and rewrites your source files to use `t()` calls — all without touching your code until you say so.

---

## How it works

```
npx rai init                Create the config file
     ↓
npx rai scan                Scan the app → generate locales/en.json (or your locale file)
     ↓
You: set up react-i18next, commit
     ↓
npx rai replace             Rewrite source files with t() calls
     ↓
You: verify the app works
     ↓
npx rai revert --clean      Delete backups → commit
     ↓
npx rai locales-generate    Generate locale files for other languages
```

---

## Installation

```bash
npm install react-auto-i18n
```

Or install globally so the `rai` command is available anywhere:

```bash
npm install -g react-auto-i18n
```

---

## Requirements

- Node.js 18 or later
- A React or React Native / Expo project

---

## Quick start

### 1. Create the config file

Run this from your project root:

```bash
npx rai init
```

This creates `rai.config.ts` with typed defaults. Open it and check at minimum:

- `defaultLanguage` — the language your app is currently written in
- `localesDir` — where locale files should be generated (`locales` or `src/locales`)
- `localeFileName` — leave `null` for `en.json`, or set a name for the json file name, eg: `'translation'` for `en/translation.json`

A description of each config can be seen at its top (For v2, an update will be done so that details are displayed as JSDoc via hover instead).

### 2. Scan your app

```bash
npx rai scan
```

This scans every `.ts`, `.tsx`, `.js`, and `.jsx` file in your project, extracts all translatable strings, and writes a locale JSON file. A preview of everything found is shown before any files are written. You will be asked to confirm before writing.

After scanning, follow the printed instructions to set up a basic `react-i18next` in your project, then commit before continuing.

### 3. Replace strings

Make sure you have committed your current state first because the next step modifies source files.

```bash
npx rai replace
```

This rewrites your source files to use `t()` calls. For each modified file it:

- Replaces translatable strings with `t('namespace.key')`
- Injects `const { t } = useTranslation()` inside React components
- Adds `import { useTranslation } from 'react-i18next'` at the top of the file
- For helper functions defined at module level, adds `t: TFunction` as a parameter and updates call sites within the same file

A preview of affected files is shown before writing. You will be asked to confirm. Backup files (`.i18nbak`) are created before any source file is modified.

### 4. Verify and commit

Run your app and verify everything works. Then:

```bash
# If something looks wrong — restore original files
npx rai revert

# If everything looks good — clean up backups and commit
npx rai revert --clean
git add .
git commit -m "feat: replace strings with i18n t() calls"
```

### 5. Generate locale files for other languages

```bash
npx rai locales-generate --only fr,es,ar
```

This creates locale files for the specified languages, pre-populated with your default language values ready for translation.
Manual translation is needed for the files content after this point.

---

## Commands

### `npx rai init`

Generates `rai.config.ts` in your project root with typed defaults.

```bash
npx rai init
npx rai init --path ./my-app   # specify a different project root
```

Safe to run — exits with a warning if a config already exists.

---

### `npx rai scan`

Scans source files and generates the locale JSON file for your default language.

```bash
npx rai scan
npx rai scan --dry-run         # preview what would be found without writing
npx rai scan --path ./my-app
```

**What gets detected:**

| Source                 | Example                                  |
| ---------------------- | ---------------------------------------- |
| JSX text content       | `<Text>Hello world</Text>`               |
| JSX string expressions | `<Text>{"Hello"}</Text>`                 |
| Template literals      | ``<Text>{`Hello ${name}`}</Text>``       |
| Ternary expressions    | `<Text>{loading ? "Wait" : "Go"}</Text>` |
| Logical expressions    | `<Text>{flag && "Visible"}</Text>`       |
| Translatable JSX props | `<Button title="Submit" />`              |
| Alert calls            | `Alert.alert('Title', 'Are you sure?')`  |
| Throw statements       | `throw new Error('Failed to save')`      |
| Custom call patterns   | Configurable via `customDetectCalls`     |

**What is ignored:**

- CSS utility class strings (`className="flex-row items-center"`)
- Non-translatable props (`name`, `type`, `color`, `testID`, etc.)
- Pure numbers, URLs, single characters
- Code identifiers and slugs (`cash_in`, `MY_CONSTANT`)
- Runtime API response data

---

### `npx rai replace`

Rewrites source files to use `t()` calls based on the generated locale file.

```bash
npx rai replace
npx rai replace --dry-run      # preview affected files without writing
npx rai replace --path ./my-app
```

**Replacement examples:**

```tsx
// Before
<Text>Hello world</Text>
<Text>{`Welcome back ${firstName}`}</Text>
<Text>{isLoading ? "Loading..." : "Done"}</Text>
<Button title="Submit" />
Alert.alert('Delete', 'Are you sure?')
throw new Error('Failed to save')

// After
<Text>{t('home.hello_world')}</Text>
<Text>{t('home.welcome_back', { firstName })}</Text>
<Text>{isLoading ? t('home.loading') : t('home.done')}</Text>
<Button title={t('home.submit')} />
Alert.alert(t('home.delete'), t('home.are_you_sure'))
throw new Error(t('home.failed_to_save'))
```

**Hook injection:**

```tsx
// Before
export default function HomeScreen() {
  return <Text>Hello</Text>;
}

// After
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  return <Text>{t("home.hello")}</Text>;
}
```

**Helper functions at module level:**

If a helper function defined outside a component contains translatable strings, it receives `t` as a typed parameter and all call sites in the same file are updated:

```tsx
// Before
function getStatusLabel(status: string) {
  return status === "active" ? "Active" : "Inactive";
}

// After
import { TFunction } from "i18next";

function getStatusLabel(status: string, t: TFunction) {
  return status === "active" ? t("status.active") : t("status.inactive");
}

// Call site updated automatically
<Text>{getStatusLabel(status, t)}</Text>;
```

**Next.js App Router: `createContext only works in Client Components` error**
Components using `useTranslation()` must be Client Components in Next.js App Router.
Add `'use client'` as the first line of each file modified by `npx rai replace`,
or set `addUseClientDirective: true` in `rai.config.ts` to have the tool add it automatically.

---

### `npx rai revert`

Restores source files to their state before `npx rai replace` was run, using the `.i18nbak` backup files created during replacement.

```bash
npx rai revert                 # restore files from backups
npx rai revert --clean         # delete backups without restoring (after verifying)
npx rai revert --path ./my-app
```

---

### `npx rai locales-generate`

Generates locale files for one or more target languages based on your default locale file.

```bash
npx rai locales-generate                            # generates locales for languages set in targetLanguages in the config file
npx rai locales-generate --only fr
npx rai locales-generate --only fr,es,ar
npx rai locales-generate --only fr --force          # overwrite existing files
npx rai locales-generate --only fr --with-imports   # also wire imports into i18n file
npx rai locales-generate --only fr --dry-run        # preview without writing
```

Each generated file is a copy of your default locale with the same keys, ready to hand off for translation. If a file already exists, only missing keys are added — existing translations are preserved.

**Flags:**

| Flag             | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `--only <langs>` | Comma-separated language codes to generate                     |
| `--force`        | Overwrite existing locale files (discards manual translations) |
| `--yes`          | Skip confirmation when using `--force`                         |
| `--with-imports` | Automatically wire imports into your i18n config file          |
| `--dry-run`      | Preview what would be generated without writing                |

---

## Configuration

`npx rai init` generates a fully typed config file. All fields are optional — missing fields fall back to their defaults.

```ts
// rai.config.ts
import type { RaiConfig } from "react-auto-i18n";

export default {
  defaultLanguage: "en",
  localesDir: "locales",
  localeFileName: null,
  maxKeyLength: 60,
  detectAlerts: true,
  detectThrows: true,
  customDetectCalls: [],
  exclude: [],
  targetLanguages: [],
  i18nFilePath: "src/i18n.ts",
} satisfies Partial<RaiConfig>;
```


### Config fields

| Field               | Default         | Description                                                                        |
| ------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `defaultLanguage`   | `'en'`          | ISO 639-1 code of your app's current language                                      |
| `localesDir`        | `'locales'`     | Directory where locale files are generated                                         |
| `localeFileName`    | `null`          | Custom file name — `null` for `en.json`, `'translation'` for `en/translation.json` |
| `maxKeyLength`      | `60`            | Maximum length of a generated translation key                                      |
| `detectAlerts`      | `true`          | Extract strings from `Alert.alert()` calls                                         |
| `detectThrows`      | `true`          | Extract strings from `throw new Error()` statements                                |
| `customDetectCalls` | `[]`            | Additional function patterns to extract strings from                               |
| `exclude`           | `[]`            | Glob patterns to exclude from scanning                                             |
| `targetLanguages`   | `[]`            | Languages to generate with `npx rai locales-generate`                                  |
| `i18nFilePath`      | `'src/i18n.ts'` | Path to your i18n setup file (used by `--with-imports`)                            |

### Language codes

`defaultLanguage` and `targetLanguages` must be valid [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) two-letter codes. Your editor will highlight invalid values directly in the config file.

### Locale structure

**Default (`localeFileName: null`):**

```
locales/
└── en.json
```

Keys follow a `namespace.string_key` format where the namespace is derived from the source file path:

```json
{
  "auth.signin.welcome_back": "Welcome back",
  "auth.signin.sign_in_to_continue": "Sign in to continue",
  "home.total_transactions": "Total Transactions"
}
```

Keys from the same file share the same namespace prefix, so sorting the file groups them together naturally.

**Custom file name (`localeFileName: 'translation'`):**

```
locales/
└── en/
    └── translation.json
```

Same key format, different file structure. Matches the convention used by many i18next projects.

---

## Setting up react-i18next

After running `npx rai scan`, the tool prints setup instructions tailored to your config. Here is the general pattern:

### Install dependencies

```bash
npx expo install i18next react-i18next
# or
npm install i18next react-i18next
```

### Create `src/i18n.ts`

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
// adjust the import path based on your localesDir and localeFileName

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### Import in your entry point

For Expo Router (`app/_layout.tsx`):

```ts
import "../src/i18n"; // this import should be as high as possible
```

For standard React Native (`App.tsx`):

```ts
import "./src/i18n";
```

---

## Adding languages

Once your app is working with the default language, generate locale files for other languages:

```bash
npx rai locales-generate --only fr,es
```

Then translate the values in each generated file. The files contain your default language's text as placeholder values, ready to be replaced with translations.

Add each language to `src/i18n.ts`:

```ts
import en from "./locales/en.json";
import fr from "./locales/fr.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: "en",
  fallbackLng: "en",
  // ...
});
```

Switch the active language at runtime:

```ts
import i18n from "./src/i18n";
i18n.changeLanguage("fr");
```

---

## Global flags

These flags work with any command:

```bash
--debug     Show verbose output including file-by-file details and AST info
--path      Root path of the project (defaults to current directory)
```

---

## Known limitations

These are documented limitations of v1.

**Hook injection uses naming conventions.**
Components are identified by their function name starting with an uppercase letter, or by being a default export. Functions not matching these patterns (HOCs, render props, factory functions) may not receive the hook automatically and will need manual adjustment.

**Cross-file helper call sites are not updated.**
When a helper function in file A is called from file B, the call site in file B is not updated to pass `t`. Only call sites within the same file are patched. Cross-file call sites need to be updated manually.

**No string deduplication.**
The same string appearing in multiple files generates separate keys in each file's namespace. There is no "common" namespace for shared strings. This is intentional for v1 — it keeps locale files self-contained per screen.

**Computed strings are not detected.**
Strings built by concatenation or computed at runtime cannot be detected by static analysis:

```tsx
// These will NOT be detected
const msg = 'Hello ' + name         // concatenation
const key = condition ? keyA : keyB  // variable key
<Text>{messages[index]}</Text>       // array access
```

**`npx rai replace` is not idempotent.**
Running `npx rai replace` twice on an already-replaced file will produce incorrect output. Always use `npx rai revert` before re-running.

---

## Troubleshooting

**`No i18next instance` warning at runtime**
Your `src/i18n.ts` file is not being imported before components render. Make sure the import is the **first** import in your entry point file (`App.tsx` or `app/_layout.tsx`).

**`Property 't' doesn't exist` error**
The hook was not injected into a component. This happens when the component uses a naming pattern the tool does not recognize. Add `const { t } = useTranslation()` manually to the component.

**Strings not being detected**
Run `npx rai scan --debug` to see every file considered and which strings are found. Check that the file is not excluded by your `.gitignore` or `config.exclude`.

**Import path error in `i18n.ts`**
The `npx rai scan` output prints the exact import path to use for your configuration. Use that path rather than guessing.

**App still shows keys after replace**
The i18next `resources` object in `src/i18n.ts` is not including the locale file. Make sure the locale file is imported and listed under the correct language code.

---

## Future updates

- **Translation API integration:** `npx rai translate fr,es,ar` to generate translated locale files via Google Translate or DeepL
- **Sync command:** detect new or changed strings and update all locale files without re-running the full pipeline
- **Mirror locale structure:** one JSON file per screen/component mirroring the app's folder structure
- **Common namespace:** deduplicate strings used across multiple files into a shared `common.json`
- **Cross-file call site patching:** update helper call sites across files when the helper receives `t` as a parameter
- **Computed strings detection:** enable the detection of strings built by concatenation or computed at runtime
- **Cross-file helper call sites updates** enable the update of helper functions wherever they,re used

---

## License

MIT
