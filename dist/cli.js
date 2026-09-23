#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
  }
});

// src/utils/logger.ts
var logger_exports = {};
__export(logger_exports, {
  isDebugMode: () => isDebugMode,
  logger: () => logger,
  setDebugMode: () => setDebugMode
});
function setDebugMode(val) {
  debugMode = val;
}
function isDebugMode() {
  return debugMode;
}
var import_chalk, debugMode, logger;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    "use strict";
    init_cjs_shims();
    import_chalk = __toESM(require("chalk"));
    debugMode = false;
    logger = {
      info: (msg) => {
        console.log(import_chalk.default.white(msg));
      },
      success: (msg) => {
        console.log(import_chalk.default.green(`\u2714 ${msg}`));
      },
      warn: (msg) => {
        console.log(import_chalk.default.yellow(`\u26A0 ${msg}`));
      },
      error: (msg) => {
        console.log(import_chalk.default.red(`\u2716 ${msg}`));
      },
      /**
       * Muted text for secondary information.
       * Use for file paths, counts, and details that are helpful
       * but shouldn't dominate the output.
       */
      dim: (msg) => {
        console.log(import_chalk.default.gray(msg));
      },
      /**
       * Bold cyan header that visually separates major steps.
       * Use at the start of each logical phase within a command.
       */
      section: (msg) => {
        console.log(import_chalk.default.bold.cyan(`
\u25B6 ${msg}`));
      },
      /**
       * Only prints when --debug flag is active.
       * Use for internal state that helps diagnose problems:
       * AST node types, file paths being considered, config values, etc.
       */
      debug: (msg) => {
        if (debugMode) {
          console.log(import_chalk.default.magenta(`[debug] ${msg}`));
        }
      },
      /**
       * Prints a blank line.
       * Use to add breathing room between sections in the output.
       */
      newline: () => {
        console.log("");
      }
    };
  }
});

// src/types/config.ts
var SUPPORTED_LANGUAGE_CODES, SUPPORTED_LOCALES;
var init_config = __esm({
  "src/types/config.ts"() {
    "use strict";
    init_cjs_shims();
    SUPPORTED_LANGUAGE_CODES = [
      "af",
      "sq",
      "am",
      "ar",
      "hy",
      "az",
      "eu",
      "be",
      "bn",
      "bs",
      "bg",
      "ca",
      "zh",
      "hr",
      "cs",
      "da",
      "nl",
      "en",
      "et",
      "fi",
      "fr",
      "gl",
      "ka",
      "de",
      "el",
      "gu",
      "ht",
      "ha",
      "he",
      "hi",
      "hu",
      "is",
      "ig",
      "id",
      "ga",
      "it",
      "ja",
      "kn",
      "kk",
      "km",
      "ko",
      "ku",
      "ky",
      "lo",
      "lv",
      "lt",
      "lb",
      "mk",
      "mg",
      "ms",
      "ml",
      "mt",
      "mi",
      "mr",
      "mn",
      "my",
      "ne",
      "nb",
      "ps",
      "fa",
      "pl",
      "pt",
      "pa",
      "ro",
      "ru",
      "sm",
      "sr",
      "sn",
      "sd",
      "si",
      "sk",
      "sl",
      "so",
      "es",
      "su",
      "sw",
      "sv",
      "tl",
      "tg",
      "ta",
      "tt",
      "te",
      "th",
      "tr",
      "tk",
      "uk",
      "ur",
      "ug",
      "uz",
      "vi",
      "cy",
      "xh",
      "yi",
      "yo",
      "zu"
    ];
    SUPPORTED_LOCALES = [
      // Base languages
      ...SUPPORTED_LANGUAGE_CODES,
      // French variants
      "fr-CA",
      "fr-BE",
      "fr-CH",
      "fr-LU",
      "fr-MC",
      // English variants
      "en-US",
      "en-GB",
      "en-AU",
      "en-CA",
      "en-IN",
      "en-NZ",
      // Spanish variants
      "es-AR",
      "es-BO",
      "es-CL",
      "es-CO",
      "es-CR",
      "es-CU",
      "es-DO",
      "es-EC",
      "es-ES",
      "es-GT",
      "es-HN",
      "es-MX",
      "es-NI",
      "es-PA",
      "es-PE",
      "es-PR",
      "es-PY",
      "es-SV",
      "es-US",
      "es-UY",
      "es-VE",
      // Portuguese variants
      "pt-BR",
      "pt-PT",
      // Chinese variants
      "zh-CN",
      "zh-TW",
      "zh-HK",
      "zh-MO",
      // German variants
      "de-AT",
      "de-CH",
      "de-DE",
      "de-LI",
      "de-LU",
      // Italian variants
      "it-CH",
      "it-IT",
      "it-SM",
      // Dutch variants
      "nl-BE",
      "nl-NL",
      // Arabic variants
      "ar-AE",
      "ar-BH",
      "ar-DZ",
      "ar-EG",
      "ar-IQ",
      "ar-JO",
      "ar-KW",
      "ar-LB",
      "ar-LY",
      "ar-MA",
      "ar-OM",
      "ar-QA",
      "ar-SA",
      "ar-SD",
      "ar-SY",
      "ar-TN",
      "ar-YE"
    ];
  }
});

// src/utils/config.ts
function getConfigPath(appRoot) {
  return import_path.default.join(appRoot, CONFIG_FILENAME);
}
async function loadConfig(appRoot) {
  const configPath = getConfigPath(appRoot);
  if (!import_fs.default.existsSync(configPath)) {
    return null;
  }
  try {
    const { createJiti } = await import("jiti");
    const jiti = createJiti(configPath);
    const mod = await jiti.import(configPath);
    const userConfig = mod.default ?? mod;
    return { ...DEFAULT_CONFIG, ...userConfig };
  } catch (err) {
    logger.error(`Failed to load ${CONFIG_FILENAME}:`);
    logger.error(String(err));
    logger.debug(err instanceof Error ? err.stack ?? "" : "");
    return null;
  }
}
function validateConfig(config) {
  const errors = [];
  if (!SUPPORTED_LOCALES.includes(config.defaultLanguage)) {
    errors.push(
      `"defaultLanguage" value "${config.defaultLanguage}" is not a valid ISO 639-1 language code.
  Valid examples: 'en', 'fr', 'es', 'ar', 'zh', 'de'`
    );
  }
  if (typeof config.maxKeyLength !== "number" || config.maxKeyLength < 10 || config.maxKeyLength > 200) {
    errors.push(
      `"maxKeyLength" must be a number between 10 and 200, got "${config.maxKeyLength}".`
    );
  }
  if (!config.localesDir || typeof config.localesDir !== "string") {
    errors.push(`"localesDir" must be a non-empty string.`);
  }
  if (!Array.isArray(config.customDetectCalls)) {
    errors.push(`"customDetectCalls" must be an array of strings.`);
  }
  if (!Array.isArray(config.exclude)) {
    errors.push(`"exclude" must be an array of glob pattern strings.`);
  }
  return errors;
}
async function requireConfig(appRoot) {
  const config = await loadConfig(appRoot);
  if (!config) {
    logger.error(
      `No ${CONFIG_FILENAME} found in ${appRoot}
  Run "eai init" first to create your config file.`
    );
    process.exit(1);
  }
  const errors = validateConfig(config);
  if (errors.length > 0) {
    logger.error(`Your ${CONFIG_FILENAME} has the following issues:
`);
    errors.forEach((e) => logger.error(`  \u2022 ${e}`));
    logger.newline();
    logger.info(`  Fix these and re-run the command.`);
    process.exit(1);
  }
  return config;
}
function validateLocalesDir(localesDir, appRoot) {
  if (import_path.default.isAbsolute(localesDir)) {
    return `"localesDir" must be a relative path, got "${localesDir}".
  Use a path relative to your project root, e.g. 'locales' or 'src/locales'.`;
  }
  if (localesDir.endsWith("/") || localesDir.endsWith("\\")) {
    return `"localesDir" must not have a teailing slash, got "${localesDir}".
  Remove the teailing slash: '${localesDir.replace(/[/\\]+$/, "")}'`;
  }
  const resolvedDir = import_path.default.join(appRoot, localesDir);
  const parentDir = import_path.default.dirname(resolvedDir);
  if (!import_fs.default.existsSync(parentDir)) {
    const relativeParent = import_path.default.relative(appRoot, parentDir);
    return `The parent directory "${relativeParent}" does not exist.
  Either:
    \u2022 Create it first: mkdir ${relativeParent}
    \u2022 Or change "localesDir" to an existing location, e.g. 'locales'`;
  }
  return null;
}
var import_path, import_fs, CONFIG_FILENAME, DEFAULT_CONFIG;
var init_config2 = __esm({
  "src/utils/config.ts"() {
    "use strict";
    init_cjs_shims();
    import_path = __toESM(require("path"));
    import_fs = __toESM(require("fs"));
    init_logger();
    init_config();
    CONFIG_FILENAME = "eai.config.ts";
    DEFAULT_CONFIG = {
      defaultLanguage: "en",
      localesDir: "locales",
      localeFileName: null,
      maxKeyLength: 60,
      addUseClientDirective: false,
      detectAlerts: true,
      detectThrows: true,
      customDetectCalls: [],
      exclude: [],
      targetLanguages: [],
      i18nFilePath: "src/i18n.ts"
    };
  }
});

// src/utils/fs.ts
function readFileSafe(filePath) {
  try {
    return import_fs2.default.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}
function writeFile(filePath, content) {
  const dir = import_path2.default.dirname(filePath);
  import_fs2.default.mkdirSync(dir, { recursive: true });
  import_fs2.default.writeFileSync(filePath, content, "utf-8");
}
function exists(filePath) {
  return import_fs2.default.existsSync(filePath);
}
function ensureDir(dirPath) {
  import_fs2.default.mkdirSync(dirPath, { recursive: true });
}
function writeJson(filePath, data) {
  writeFile(filePath, JSON.stringify(data, null, 2));
}
var import_fs2, import_path2;
var init_fs = __esm({
  "src/utils/fs.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs2 = __toESM(require("fs"));
    import_path2 = __toESM(require("path"));
  }
});

// src/utils/i18n-file.ts
var i18n_file_exports = {};
__export(i18n_file_exports, {
  addLocaleToI18nFile: () => addLocaleToI18nFile,
  generateInitialI18nFile: () => generateInitialI18nFile,
  resolveI18nFilePath: () => resolveI18nFilePath
});
function resolveI18nFilePath(appRoot, config) {
  return import_path3.default.join(appRoot, config.i18nFilePath ?? "src/i18n.ts");
}
function generateInitialI18nFile(appRoot, config) {
  const filePath = resolveI18nFilePath(appRoot, config);
  if (import_fs3.default.existsSync(filePath)) {
    logger.warn(
      `  ${config.i18nFilePath} already exists \u2014 skipping generation.
  Delete it and re-run "eai init" if you want a fresh one.`
    );
    return;
  }
  const content = buildI18nFileContent("", [], config);
  writeFile(filePath, content);
  logger.success(`Generated ${config.i18nFilePath}`);
}
function addLocaleToI18nFile(appRoot, config, newLanguage) {
  const filePath = resolveI18nFilePath(appRoot, config);
  if (!import_fs3.default.existsSync(filePath)) {
    const content2 = buildI18nFileContent(
      config.defaultLanguage,
      [newLanguage].filter((l) => l !== config.defaultLanguage),
      config
    );
    writeFile(filePath, content2);
    logger.success(`Generated ${config.i18nFilePath} with "${newLanguage}"`);
    return;
  }
  const existingContent = import_fs3.default.readFileSync(filePath, "utf-8");
  const existingLanguages = extractLanguagesFromI18nFile(existingContent);
  if (existingLanguages.includes(newLanguage)) {
    logger.dim(
      `  ${config.i18nFilePath} already imports "${newLanguage}" \u2014 skipping`
    );
    return;
  }
  const allLanguages = [...existingLanguages, newLanguage];
  const targetLanguages = allLanguages.filter(
    (l) => l !== config.defaultLanguage
  );
  const content = buildI18nFileContent(
    config.defaultLanguage,
    targetLanguages,
    config
  );
  writeFile(filePath, content);
  logger.success(`Updated ${config.i18nFilePath} \u2014 added "${newLanguage}"`);
}
function extractLanguagesFromI18nFile(content) {
  const importPattern = /^import\s+([a-z]{2})\s+from\s+['"][^'"]+['"]/gm;
  const languages = [];
  let match;
  while ((match = importPattern.exec(content)) !== null) {
    languages.push(match[1]);
  }
  return [...new Set(languages)];
}
function buildI18nFileContent(defaultLang, targetLanguages, config) {
  const allLanguages = defaultLang ? [defaultLang, ...targetLanguages] : [];
  const hasLocales = allLanguages.length > 0;
  const i18nDir = import_path3.default.dirname(
    import_path3.default.join("/", config.i18nFilePath ?? "src/i18n.ts")
  );
  function localeImportPath(lang) {
    const localeFile = config.localeFileName ? `${config.localesDir}/${lang}/${config.localeFileName}.json` : `${config.localesDir}/${lang}.json`;
    const localeAbsolute = import_path3.default.join("/", localeFile);
    const relative = import_path3.default.relative(i18nDir, localeAbsolute).replace(/\\/g, "/");
    return relative.startsWith(".") ? relative : `./${relative}`;
  }
  const localeImports = hasLocales ? allLanguages.map((lang) => `import ${lang} from '${localeImportPath(lang)}'`).join("\n") : "";
  const resourcesEntries = hasLocales ? allLanguages.map((lang) => `    ${lang}: { translation: ${lang} },`).join("\n") : "";
  const useClientDirective = config.addUseClientDirective ? `'use client'

` : "";
  const activeLang = defaultLang || "en";
  return `${useClientDirective}import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
${hasLocales ? `
${localeImports}
` : ""}
i18n.use(initReactI18next).init({
  resources: {
${resourcesEntries}
  },
  lng: '${activeLang}',
  fallbackLng: '${activeLang}',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
`;
}
var import_fs3, import_path3;
var init_i18n_file = __esm({
  "src/utils/i18n-file.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs3 = __toESM(require("fs"));
    import_path3 = __toESM(require("path"));
    init_logger();
    init_fs();
  }
});

// src/utils/detect-project.ts
function detectProjectProfile(appRoot) {
  const hasSrcDir = import_fs5.default.existsSync(import_path4.default.join(appRoot, "src"));
  const hasAppDir = import_fs5.default.existsSync(import_path4.default.join(appRoot, "app"));
  const hasSrcAppDir = import_fs5.default.existsSync(import_path4.default.join(appRoot, "src", "app"));
  let isExpo = false;
  let isNext = false;
  let isReactNative = false;
  try {
    const pkgPath = import_path4.default.join(appRoot, "package.json");
    const pkg = JSON.parse(import_fs5.default.readFileSync(pkgPath, "utf-8"));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };
    isExpo = "expo" in allDeps;
    isNext = "next" in allDeps;
    isReactNative = "react-native" in allDeps && !isExpo;
  } catch {
  }
  const recommendedLocalesDir = hasSrcDir ? "src/locales" : "locales";
  const recommendedI18nFilePath = hasSrcDir ? "src/i18n.ts" : hasAppDir ? "i18n.ts" : "i18n.ts";
  const recommendedUseClientDirective = isNext;
  return {
    hasSrcDir,
    hasAppDir,
    hasSrcAppDir,
    isExpo,
    isNext,
    isReactNative,
    recommendedLocalesDir,
    recommendedI18nFilePath,
    recommendedUseClientDirective
  };
}
var import_fs5, import_path4;
var init_detect_project = __esm({
  "src/utils/detect-project.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs5 = __toESM(require("fs"));
    import_path4 = __toESM(require("path"));
  }
});

// src/commands/init.ts
var init_exports = {};
__export(init_exports, {
  init: () => init
});
async function init(options) {
  const appRoot = import_path5.default.resolve(options.path);
  const configPath = getConfigPath(appRoot);
  logger.section("eai \u2014 Init");
  const profile = detectProjectProfile(appRoot);
  logger.section("Detected project profile");
  const projectType = profile.isExpo ? "Expo" : profile.isNext ? "Next.js" : profile.isReactNative ? "React Native" : "React";
  logger.info(`  Project type : ${projectType}`);
  logger.info(`  src/ exists  : ${profile.hasSrcDir ? "yes" : "no"}`);
  logger.info(`  app/ exists  : ${profile.hasAppDir ? "yes" : "no"}`);
  logger.info(`  Locales dir  : ${profile.recommendedLocalesDir}`);
  logger.info(`  i18n file    : ${profile.recommendedI18nFilePath}`);
  if (profile.recommendedUseClientDirective) {
    logger.info(`  use client   : enabled (Next.js detected)`);
  }
  logger.section("Generating config file...");
  if (import_fs6.default.existsSync(configPath)) {
    logger.warn(
      `${CONFIG_FILENAME} already exists \u2014 skipping.
  Delete it and re-run "eai init" to regenerate with detected defaults.`
    );
  } else {
    const configContent = buildConfigContent(profile);
    import_fs6.default.writeFileSync(configPath, configContent, "utf-8");
    logger.success(`Created ${CONFIG_FILENAME}`);
  }
  logger.section("Generating i18n config file...");
  const config = await loadConfig(appRoot) ?? {
    ...DEFAULT_CONFIG,
    localesDir: profile.recommendedLocalesDir,
    i18nFilePath: profile.recommendedI18nFilePath,
    addUseClientDirective: profile.recommendedUseClientDirective
  };
  generateInitialI18nFile(appRoot, config);
  const i18nFilePath = config.i18nFilePath ?? profile.recommendedI18nFilePath;
  const entryImportPath = resolveEntryImportPath(appRoot, i18nFilePath);
  logger.section("Setup complete");
  logger.info(`
  Two files were created:

    ${import_chalk2.default.cyan(CONFIG_FILENAME)}
      Hover any field for documentation.
      Press Ctrl+Space to see all available options.

    ${import_chalk2.default.cyan(i18nFilePath)}
      Import this in your app entry point before any component renders:
      ${import_chalk2.default.gray("// the import should be as high as possible")}
      ${import_chalk2.default.cyan(`import '${entryImportPath}'`)}

  Next steps:
    1. Review ${CONFIG_FILENAME} and adjust settings if needed
       ${import_chalk2.default.gray(`(defaultLanguage is always 'en' \u2014 update if your app uses a different language)`)}
    2. Commit the generated files
    3. Run:
         ${import_chalk2.default.cyan("eai scan")}
  `);
}
function buildConfigContent(profile) {
  return `import { defineEaiConfig } from '@autoi18n/expo'

export default defineEaiConfig({
  defaultLanguage: 'en',
  localesDir: '${profile.recommendedLocalesDir}',
  localeFileName: null,
  maxKeyLength: 60,
  detectAlerts: true,
  detectThrows: true,
  customDetectCalls: [],
  exclude: [],
  targetLanguages: [],
  i18nFilePath: '${profile.recommendedI18nFilePath}',
  addUseClientDirective: ${profile.recommendedUseClientDirective},
})
`;
}
function resolveEntryImportPath(appRoot, i18nFilePath) {
  const candidates = [
    "app/_layout.tsx",
    "app/_layout.ts",
    "src/app/_layout.tsx",
    "src/app/_layout.ts",
    "App.tsx",
    "App.ts",
    "src/App.tsx",
    "src/App.ts"
  ];
  const i18nAbs = import_path5.default.join(appRoot, i18nFilePath);
  for (const candidate of candidates) {
    const candidateAbs = import_path5.default.join(appRoot, candidate);
    if (import_fs6.default.existsSync(candidateAbs)) {
      return import_path5.default.relative(import_path5.default.dirname(candidateAbs), i18nAbs).replace(/\\/g, "/").replace(/\.ts$/, "").replace(/^([^.])/, "./$1");
    }
  }
  return `./${i18nFilePath.replace(/\.ts$/, "")}`;
}
var import_path5, import_fs6, import_chalk2;
var init_init = __esm({
  "src/commands/init.ts"() {
    "use strict";
    init_cjs_shims();
    import_path5 = __toESM(require("path"));
    import_fs6 = __toESM(require("fs"));
    import_chalk2 = __toESM(require("chalk"));
    init_logger();
    init_config2();
    init_i18n_file();
    init_detect_project();
  }
});

// src/utils/normalize.ts
function normalizeJSXWhitespace(value) {
  return value.split("\n").map((line) => line.trim()).filter((line) => line.length > 0).join(" ");
}
var init_normalize = __esm({
  "src/utils/normalize.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/core/scanner.ts
function buildNamespace(relativePathWithoutExt) {
  return relativePathWithoutExt.replace(/\\/g, "/").replace(/^src\//, "").replace(/^app\//, "").replace(/^screens\//, "").split("/").map(
    (segment) => segment.replace(/^\((.+)\)$/, "$1").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
  ).filter(Boolean).join(".");
}
function toKeySegment(text) {
  return text.toLowerCase().replace(/\{\{.*?\}\}/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function buildFullKey(namespace, text, maxKeyLength) {
  const rawSegment = toKeySegment(text);
  const available = maxKeyLength - namespace.length - 1;
  let trimmedSegment;
  if (rawSegment.length <= available) {
    trimmedSegment = rawSegment;
  } else {
    const substring = rawSegment.substring(0, available);
    const lastUnderscore = substring.lastIndexOf("_");
    if (lastUnderscore > 5) {
      trimmedSegment = substring.substring(0, lastUnderscore);
    } else {
      trimmedSegment = substring;
    }
  }
  const fullKey = `${namespace}.${trimmedSegment}`;
  return { key: trimmedSegment, fullKey };
}
function isExtractable(value) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;
  if (/^https?:\/\//.test(trimmed)) return false;
  if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(trimmed) && !trimmed.includes(" ")) {
    if (trimmed.includes("_") || trimmed.includes("-")) return false;
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) return false;
  }
  if (isCssClassString(trimmed)) return false;
  return true;
}
function isLikelyUiCopy(value) {
  const trimmed = value.trim();
  if (!isExtractable(trimmed)) return false;
  if (!/\s/.test(trimmed)) {
    const UI_SINGLE_WORDS = /* @__PURE__ */ new Set([
      "submit",
      "cancel",
      "confirm",
      "delete",
      "save",
      "close",
      "continue",
      "back",
      "next",
      "done",
      "ok",
      "yes",
      "no",
      "loading",
      "error",
      "success",
      "retry",
      "search"
    ]);
    if (!UI_SINGLE_WORDS.has(trimmed.toLowerCase())) {
      return false;
    }
  }
  const TECHNICAL = /* @__PURE__ */ new Set([
    "light",
    "dark",
    "system",
    "auto",
    "pending",
    "completed",
    "failed",
    "active",
    "inactive",
    "credit",
    "debit",
    "row",
    "column",
    "center",
    "left",
    "right"
  ]);
  if (TECHNICAL.has(trimmed.toLowerCase())) return false;
  return true;
}
function templateHasOnlyIdentifierExpressions(node) {
  return node.expressions.every((expr) => t.isIdentifier(expr));
}
function isCssClassString(value) {
  const tokens = value.trim().split(/\s+/);
  if (tokens.length < 2) return false;
  const cssPattern = /^[a-z]{1,4}(-[a-z0-9.[\]/]+)+$|^(flex|hidden|block|grid|p|m|w|h|gap|text|font|bg|border|rounded|shadow|items|justify|overflow|absolute|relative|fixed|inset|z|opacity|ring|cursor|pointer|animate|transition|duration|ease|scale|rotate|translate|aspect|container|sr)(-.*)?$/;
  const cssLikeCount = tokens.filter((tk) => cssPattern.test(tk)).length;
  return cssLikeCount / tokens.length > 0.5;
}
function isInsideJSXContent(nodePath) {
  const parent = nodePath.parent;
  return t.isJSXElement(parent) || t.isJSXFragment(parent);
}
function processTemplateLiteral(node) {
  let text = "";
  const params = [];
  let argIndex = 0;
  node.quasis.forEach((quasi, i) => {
    text += quasi.value.cooked ?? quasi.value.raw;
    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      let paramName;
      if (t.isIdentifier(expr)) {
        paramName = expr.name;
      } else if (t.isMemberExpression(expr) && t.isIdentifier(expr.property)) {
        paramName = expr.property.name;
      } else {
        paramName = `arg${argIndex++}`;
      }
      params.push(paramName);
      text += `{{${paramName}}}`;
    }
  });
  return { text, params };
}
function extractFromExpression(expr, results, namespace, filePath, maxKeyLen, sourceType, strictUiCopy = false) {
  if (!expr || t.isJSXEmptyExpression(expr)) return;
  const passes = (value) => strictUiCopy ? isLikelyUiCopy(value) : isExtractable(value);
  if (t.isStringLiteral(expr)) {
    if (!passes(expr.value)) return;
    const { key, fullKey } = buildFullKey(namespace, expr.value, maxKeyLen);
    results.push({
      filePath,
      namespace,
      key,
      fullKey,
      originalText: expr.value,
      translationValue: expr.value,
      params: [],
      sourceType
    });
    return;
  }
  if (t.isTemplateLiteral(expr)) {
    if (templateHasOnlyIdentifierExpressions(expr)) {
      const { text, params } = processTemplateLiteral(expr);
      if (!isExtractable(text)) return;
      const { key, fullKey } = buildFullKey(namespace, text, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: text,
        translationValue: text,
        params,
        sourceType
      });
      return;
    }
    for (const subExpr of expr.expressions) {
      extractFromExpression(
        subExpr,
        results,
        namespace,
        filePath,
        maxKeyLen,
        sourceType
      );
    }
    return;
  }
  if (t.isConditionalExpression(expr)) {
    extractFromExpression(
      expr.consequent,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy
    );
    extractFromExpression(
      expr.alternate,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy
    );
    return;
  }
  if (t.isLogicalExpression(expr)) {
    extractFromExpression(
      expr.left,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy
    );
    extractFromExpression(
      expr.right,
      results,
      namespace,
      filePath,
      maxKeyLen,
      sourceType,
      strictUiCopy
    );
    return;
  }
}
function extractAlertButtonTexts(buttonsArg, results, namespace, filePath, maxKeyLen) {
  if (!t.isArrayExpression(buttonsArg)) return;
  for (const element of buttonsArg.elements) {
    if (!element || !t.isObjectExpression(element)) continue;
    for (const prop of element.properties) {
      if (!t.isObjectProperty(prop) && !t.isProperty(prop)) continue;
      const key = prop.key;
      const propName = t.isIdentifier(key) ? key.name : t.isStringLiteral(key) ? key.value : null;
      if (propName !== "text") continue;
      if (prop.computed) continue;
      extractFromExpression(
        prop.value,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "alert"
      );
    }
  }
}
function getCalleeName(node) {
  const { callee } = node;
  if (t.isIdentifier(callee)) {
    return callee.name;
  }
  if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && t.isIdentifier(callee.property)) {
    return `${callee.object.name}.${callee.property.name}`;
  }
  return null;
}
function extractStringArgs(args, results, namespace, filePath, maxKeyLen, sourceType) {
  for (const arg of args) {
    if (t.isStringLiteral(arg) && isExtractable(arg.value)) {
      const { key, fullKey } = buildFullKey(namespace, arg.value, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: arg.value,
        translationValue: arg.value,
        params: [],
        sourceType
      });
    }
  }
}
function extractStringsFromFile(filePath, appRoot, config) {
  const code = readFileSafe(filePath);
  if (!code) return [];
  const relativeWithoutExt = import_path6.default.relative(appRoot, filePath).replace(/\\/g, "/").replace(/\.[^/.]+$/, "");
  const namespace = buildNamespace(relativeWithoutExt);
  logger.debug(
    `Parsing: ${import_path6.default.relative(appRoot, filePath)} \u2192 namespace: "${namespace}"`
  );
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"]
    });
  } catch (err) {
    logger.warn(
      `  Could not parse ${import_path6.default.relative(appRoot, filePath)} \u2014 skipping`
    );
    logger.debug(String(err));
    return [];
  }
  const results = [];
  const maxKeyLen = config.maxKeyLength;
  const customCallPatterns = new Set(config.customDetectCalls);
  (0, import_traverse.default)(ast, {
    // ── 1. Plain text between JSX tags ──────────────────────────────────────
    //
    //    <Text>Hello world</Text>
    //          ↑ this is a JSXText node
    //
    //    JSXText includes all whitespace and newlines between tags,
    //    so we trim and check extractability carefully.
    JSXText(nodePath) {
      const normalized = normalizeJSXWhitespace(nodePath.node.value);
      if (!isExtractable(normalized)) return;
      const { key, fullKey } = buildFullKey(namespace, normalized, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: normalized,
        translationValue: normalized,
        params: [],
        sourceType: "jsx-text"
      });
    },
    // ── 2. Expressions inside JSX content ───────────────────────────────────
    //
    //    <Text>{"Hello"}</Text>
    //    <Text>{`Hello ${name}`}</Text>
    //    <Text>{isLoading ? "Loading" : "Done"}</Text>
    //
    //    The isInsideJSXContent guard is critical — it prevents
    //    className={`flex-row`} from matching here.
    JSXExpressionContainer(nodePath) {
      if (!isInsideJSXContent(nodePath)) return;
      extractFromExpression(
        nodePath.node.expression,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "jsx-expression"
      );
    },
    // ── 3. String props on JSX elements ─────────────────────────────────────
    //
    //    <Button title="Submit" />
    //    <Input placeholder="Enter your email" />
    //    <ErrorState message="Something went wrong" />
    //
    //    We only extract props in TRANSLATABLE_PROP_NAMES and skip
    //    anything in NON_TRANSLATABLE_PROP_NAMES.
    JSXAttribute(nodePath) {
      const { name, value } = nodePath.node;
      const propName = t.isJSXIdentifier(name) ? name.name : null;
      if (!propName) return;
      if (NON_TRANSLATABLE_PROP_NAMES.has(propName)) return;
      if (!TRANSLATABLE_PROP_NAMES.has(propName)) return;
      if (!t.isStringLiteral(value)) return;
      if (!isExtractable(value.value)) return;
      const { key, fullKey } = buildFullKey(namespace, value.value, maxKeyLen);
      results.push({
        filePath,
        namespace,
        key,
        fullKey,
        originalText: value.value,
        translationValue: value.value,
        params: [],
        sourceType: "jsx-attribute",
        propName
      });
    },
    // ── 4. Alert.alert() calls ───────────────────────────────────────────────
    //
    //    Alert.alert('Delete Item', 'Are you sure you want to delete this?')
    //                 ↑ title        ↑ message — both extracted
    //
    //    Only active when config.detectAlerts is true.
    //    We specifically match Alert.alert (capital A) as that is the
    //    React Native API. alert() (lowercase) is the browser API
    //    which is rarely used in RN and often for debugging.
    CallExpression(nodePath) {
      const calleeName = getCalleeName(nodePath.node);
      if (!calleeName) return;
      if (config.detectAlerts && calleeName === "Alert.alert") {
        const args = nodePath.node.arguments;
        for (let i = 0; i < Math.min(args.length, 2); i++) {
          const arg = args[i];
          if (!arg || arg.type === "SpreadElement") continue;
          extractFromExpression(
            arg,
            results,
            namespace,
            filePath,
            maxKeyLen,
            "alert"
          );
        }
        if (args.length >= 3) {
          extractAlertButtonTexts(
            args[2],
            results,
            namespace,
            filePath,
            maxKeyLen
          );
        }
        return;
      }
      if (customCallPatterns.has(calleeName)) {
        extractStringArgs(
          nodePath.node.arguments,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "call"
        );
        return;
      }
    },
    // ── 5. Throw statements ──────────────────────────────────────────────────
    //
    //    throw new Error('Failed to save item. Please try again.')
    //                     ↑ extracted when config.detectThrows is true
    //
    //    We look specifically for `throw new Error(string)` pattern.
    //    Plain `throw 'string'` is also handled.
    ThrowStatement(nodePath) {
      if (!config.detectThrows) return;
      const { argument } = nodePath.node;
      if (t.isNewExpression(argument) && t.isIdentifier(argument.callee) && argument.callee.name === "Error") {
        extractStringArgs(
          argument.arguments,
          results,
          namespace,
          filePath,
          maxKeyLen,
          "throw"
        );
        return;
      }
      if (t.isStringLiteral(argument) && isExtractable(argument.value)) {
        const { key, fullKey } = buildFullKey(
          namespace,
          argument.value,
          maxKeyLen
        );
        results.push({
          filePath,
          namespace,
          key,
          fullKey,
          originalText: argument.value,
          translationValue: argument.value,
          params: [],
          sourceType: "throw"
        });
      }
    },
    ReturnStatement(nodePath) {
      extractFromExpression(
        nodePath.node.argument,
        results,
        namespace,
        filePath,
        maxKeyLen,
        "return",
        // or a new sourceType e.g. "return"
        true
        // ← strictUiCopy
      );
    }
  });
  logger.debug(
    `  Found ${results.length} string(s) in ${import_path6.default.relative(appRoot, filePath)}`
  );
  return results;
}
async function scanProject(appRoot, config) {
  const files = await (0, import_glob.glob)("**/*.{ts,tsx,js,jsx}", {
    cwd: appRoot,
    absolute: true,
    ignore: [...HARD_EXCLUDED_DIRS, ...config.exclude]
  });
  const ig = (0, import_ignore.default)();
  const gitignorePath = import_path6.default.join(appRoot, ".gitignore");
  if (import_fs7.default.existsSync(gitignorePath)) {
    ig.add(import_fs7.default.readFileSync(gitignorePath, "utf-8"));
    logger.debug("Loaded .gitignore rules");
  }
  const filteredFiles = files.filter((file) => {
    const rel = import_path6.default.relative(appRoot, file).replace(/\\/g, "/");
    return !ig.ignores(rel);
  });
  logger.debug(
    `Files after .gitignore filter: ${filteredFiles.length} / ${files.length}`
  );
  logger.dim(`  Found ${filteredFiles.length} source files to scan.`);
  const allStrings = [];
  let filesWithStrings = 0;
  for (const file of filteredFiles) {
    const found = extractStringsFromFile(file, appRoot, config);
    if (found.length > 0) {
      filesWithStrings++;
      logger.dim(
        `  \u2713 ${import_path6.default.relative(appRoot, file)} \u2192 ${found.length} string(s)`
      );
      allStrings.push(...found);
    }
  }
  logger.dim(
    `
  Scanned: ${filteredFiles.length} files | With strings: ${filesWithStrings} | Empty: ${filteredFiles.length - filesWithStrings}`
  );
  return allStrings;
}
var parser, import_traverse, t, import_glob, import_ignore, import_fs7, import_path6, TRANSLATABLE_PROP_NAMES, NON_TRANSLATABLE_PROP_NAMES, HARD_EXCLUDED_DIRS;
var init_scanner = __esm({
  "src/core/scanner.ts"() {
    "use strict";
    init_cjs_shims();
    parser = __toESM(require("@babel/parser"));
    import_traverse = __toESM(require("@babel/traverse"));
    t = __toESM(require("@babel/types"));
    import_glob = require("glob");
    import_ignore = __toESM(require("ignore"));
    import_fs7 = __toESM(require("fs"));
    import_path6 = __toESM(require("path"));
    init_fs();
    init_logger();
    init_normalize();
    TRANSLATABLE_PROP_NAMES = /* @__PURE__ */ new Set([
      "title",
      "message",
      "placeholder",
      "label",
      "hint",
      "subtitle",
      "description",
      "caption",
      "errorMessage",
      "helperText",
      "emptyText",
      "confirmText",
      "cancelText",
      "buttonText",
      "header",
      "footer",
      "tooltip",
      "accessibilityLabel",
      "accessibilityHint"
    ]);
    NON_TRANSLATABLE_PROP_NAMES = /* @__PURE__ */ new Set([
      "className",
      "style",
      "testID",
      "name",
      "key",
      "id",
      "type",
      "variant",
      "size",
      "color",
      "icon",
      "source",
      "href",
      "to",
      "from",
      "currency",
      "format"
    ]);
    HARD_EXCLUDED_DIRS = [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/android/**",
      "**/ios/**",
      "**/.git/**"
    ];
  }
});

// src/core/scaffolder.ts
function resolveLocaleFilePath(localesDir, lang, localeFileName) {
  if (localeFileName) {
    return import_path7.default.join(localesDir, lang, `${localeFileName}.json`);
  }
  return import_path7.default.join(localesDir, `${lang}.json`);
}
async function generateLocaleFile(strings, lang, localesDir, localeFileName) {
  ensureDir(localesDir);
  const content = {};
  for (const s of strings) {
    content[s.fullKey] = s.translationValue;
  }
  const sortedContent = Object.fromEntries(
    Object.entries(content).sort(([a], [b2]) => a.localeCompare(b2))
  );
  const filePath = resolveLocaleFilePath(localesDir, lang, localeFileName);
  writeJson(filePath, sortedContent);
  return { filePath, keyCount: Object.keys(sortedContent).length };
}
function readLocaleFile(lang, localesDir, localeFileName) {
  const filePath = resolveLocaleFilePath(localesDir, lang, localeFileName);
  try {
    const fs11 = require("fs");
    if (!fs11.existsSync(filePath)) return {};
    return JSON.parse(fs11.readFileSync(filePath, "utf-8"));
  } catch {
    logger.warn(`Could not read locale file: ${filePath}`);
    return {};
  }
}
var import_path7;
var init_scaffolder = __esm({
  "src/core/scaffolder.ts"() {
    "use strict";
    init_cjs_shims();
    import_path7 = __toESM(require("path"));
    init_fs();
    init_logger();
  }
});

// src/utils/prompt.ts
async function confirm(message, defaultVal = true) {
  try {
    return await (0, import_prompts.confirm)({ message, default: defaultVal });
  } catch {
    logger.newline();
    logger.info("Aborted.");
    process.exit(0);
  }
}
var import_prompts;
var init_prompt = __esm({
  "src/utils/prompt.ts"() {
    "use strict";
    init_cjs_shims();
    import_prompts = require("@inquirer/prompts");
    init_logger();
  }
});

// src/commands/scan.ts
var scan_exports = {};
__export(scan_exports, {
  scan: () => scan
});
async function scan(options) {
  const appRoot = import_path8.default.resolve(options.path);
  const isDryRun = options.dryRun ?? false;
  const config = await requireConfig(appRoot);
  const localesDir = import_path8.default.join(appRoot, config.localesDir);
  const dirError = validateLocalesDir(config.localesDir, appRoot);
  if (dirError) {
    logger.error(`Invalid "localesDir" in your config:
  ${dirError}`);
    process.exit(1);
  }
  const outputPreview = config.localeFileName ? `${config.localesDir}/${config.defaultLanguage}/${config.localeFileName}.json` : `${config.localesDir}/${config.defaultLanguage}.json`;
  logger.section("eai \u2014 Scan");
  if (isDryRun) logger.warn("  Dry run \u2014 no files will be written.\n");
  logger.info(`  App root    : ${appRoot}`);
  logger.info(`  Language    : ${config.defaultLanguage}`);
  logger.info(`  Output      : ${outputPreview}`);
  logger.info(
    `  Alerts      : ${config.detectAlerts ? "detected" : "ignored"}`
  );
  logger.info(
    `  Throws      : ${config.detectThrows ? "detected" : "ignored"}`
  );
  if (config.customDetectCalls.length > 0) {
    logger.info(`  Custom calls: ${config.customDetectCalls.join(", ")}`);
  }
  logger.section("Scanning source files...");
  const spinner = (0, import_ora.default)("Scanning...").start();
  let strings;
  try {
    strings = await scanProject(appRoot, config);
    spinner.succeed(`Scan complete.`);
  } catch (err) {
    spinner.fail("Scan failed.");
    logger.error(String(err));
    process.exit(1);
  }
  if (strings.length === 0) {
    logger.warn("\n  No translatable strings found.");
    logger.info(
      "  Things to check:\n    \u2022 Is the --path pointing to your app root?\n    \u2022 Does your app have <Text> components with content?\n    \u2022 Are the relevant files excluded by your config or .gitignore?"
    );
    process.exit(0);
  }
  logger.section("Strings found");
  printPreviewTable(strings);
  if (isDryRun) {
    logger.newline();
    logger.warn("Dry run complete \u2014 no files written.");
    logger.info("  Remove --dry-run to generate the locale file.");
    process.exit(0);
  }
  logger.newline();
  const shouldProceed = await confirm(
    `Write ${strings.length} keys to ${outputPreview}?`
  );
  if (!shouldProceed) {
    logger.info("Aborted. No files were written.");
    process.exit(0);
  }
  logger.section("Generating locale file...");
  const { filePath, keyCount } = await generateLocaleFile(
    strings,
    config.defaultLanguage,
    localesDir,
    config.localeFileName
  );
  logger.success(
    `Generated ${import_path8.default.relative(appRoot, filePath)} with ${keyCount} keys`
  );
  const { addLocaleToI18nFile: addLocaleToI18nFile2 } = await Promise.resolve().then(() => (init_i18n_file(), i18n_file_exports));
  addLocaleToI18nFile2(appRoot, config, config.defaultLanguage);
  printNextSteps(
    appRoot,
    config.localesDir,
    config.defaultLanguage,
    config.localeFileName,
    config.i18nFilePath ?? "src/i18n.ts"
  );
}
function printPreviewTable(strings) {
  const byNamespace = strings.reduce(
    (acc, s) => {
      if (!acc[s.namespace]) acc[s.namespace] = [];
      acc[s.namespace].push(s);
      return acc;
    },
    {}
  );
  const namespaces = Object.entries(byNamespace).sort(
    ([a], [b2]) => a.localeCompare(b2)
  );
  for (const [namespace, items] of namespaces) {
    logger.newline();
    logger.info(
      `  ${import_chalk3.default.bold(namespace)} ` + import_chalk3.default.gray(`(${items.length} string${items.length === 1 ? "" : "s"})`)
    );
    for (const item of items) {
      const keyPart = import_chalk3.default.cyan(item.fullKey.padEnd(50));
      const preview = item.translationValue.substring(0, 40);
      const ellipsis = item.translationValue.length > 40 ? "\u2026" : "";
      const valuePart = import_chalk3.default.gray(`"${preview}${ellipsis}"`);
      const paramsPart = item.params.length > 0 ? import_chalk3.default.yellow(` [params: ${item.params.join(", ")}]`) : "";
      logger.info(`    ${keyPart} ${valuePart}${paramsPart}`);
    }
  }
  logger.newline();
  logger.info(
    `  ${import_chalk3.default.bold(String(strings.length))} total string(s) across ${import_chalk3.default.bold(String(namespaces.length))} namespace(s)`
  );
}
function printNextSteps(appRoot, localesDir, defaultLang, localeFileName, i18nFilePath) {
  logger.section("Next steps");
  const localeOutputPath = localeFileName ? `${localesDir}/${defaultLang}/${localeFileName}.json` : `${localesDir}/${defaultLang}.json`;
  const entryPointCandidates = [
    "app/_layout.tsx",
    "app/_layout.ts",
    "src/app/_layout.tsx",
    "src/app/_layout.ts",
    "App.tsx",
    "App.ts",
    "src/App.tsx",
    "src/App.ts"
  ];
  let entryPointFile = "your app entry point";
  let i18nImportPath = `./${i18nFilePath.replace(/\.ts$/, "")}`;
  const i18nAbsPath = import_path8.default.join(appRoot, i18nFilePath);
  for (const candidate of entryPointCandidates) {
    const candidateAbsPath = import_path8.default.join(appRoot, candidate);
    if (import_fs10.default.existsSync(candidateAbsPath)) {
      entryPointFile = candidate;
      const entryDir = import_path8.default.dirname(candidateAbsPath);
      i18nImportPath = import_path8.default.relative(entryDir, i18nAbsPath).replace(/\\/g, "/").replace(/\.ts$/, "").replace(/^([^.])/, "./$1");
      break;
    }
  }
  logger.info(`
  Your locale file has been generated and ${i18nFilePath} has been updated.

  1. Make sure ${i18nFilePath} is imported in your entry point (${entryPointFile}):
       ${import_chalk3.default.cyan(`import '${i18nImportPath}'`)}
       ${import_chalk3.default.gray("This import should be as high as possible in the file.")}

  2. Review ${localeOutputPath}, then commit:
       ${import_chalk3.default.cyan(`git add .`)}
       ${import_chalk3.default.cyan(`git commit -m "chore: add i18n locale file"`)}

  3. Then run:
       ${import_chalk3.default.cyan("eai replace")}
  `);
}
var import_path8, import_chalk3, import_ora, import_fs10;
var init_scan = __esm({
  "src/commands/scan.ts"() {
    "use strict";
    init_cjs_shims();
    import_path8 = __toESM(require("path"));
    import_chalk3 = __toESM(require("chalk"));
    import_ora = __toESM(require("ora"));
    init_logger();
    init_config2();
    init_scanner();
    init_scaffolder();
    init_prompt();
    import_fs10 = __toESM(require("fs"));
  }
});

// node_modules/tslib/tslib.es6.mjs
var tslib_es6_exports = {};
__export(tslib_es6_exports, {
  __addDisposableResource: () => __addDisposableResource,
  __assign: () => __assign,
  __asyncDelegator: () => __asyncDelegator,
  __asyncGenerator: () => __asyncGenerator,
  __asyncValues: () => __asyncValues,
  __await: () => __await,
  __awaiter: () => __awaiter,
  __classPrivateFieldGet: () => __classPrivateFieldGet,
  __classPrivateFieldIn: () => __classPrivateFieldIn,
  __classPrivateFieldSet: () => __classPrivateFieldSet,
  __createBinding: () => __createBinding,
  __decorate: () => __decorate,
  __disposeResources: () => __disposeResources,
  __esDecorate: () => __esDecorate,
  __exportStar: () => __exportStar,
  __extends: () => __extends,
  __generator: () => __generator,
  __importDefault: () => __importDefault,
  __importStar: () => __importStar,
  __makeTemplateObject: () => __makeTemplateObject,
  __metadata: () => __metadata,
  __param: () => __param,
  __propKey: () => __propKey,
  __read: () => __read,
  __rest: () => __rest,
  __rewriteRelativeImportExtension: () => __rewriteRelativeImportExtension,
  __runInitializers: () => __runInitializers,
  __setFunctionName: () => __setFunctionName,
  __spread: () => __spread,
  __spreadArray: () => __spreadArray,
  __spreadArrays: () => __spreadArrays,
  __values: () => __values,
  default: () => tslib_es6_default
});
function __extends(d, b2) {
  if (typeof b2 !== "function" && b2 !== null)
    throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
  extendStatics(d, b2);
  function __() {
    this.constructor = d;
  }
  d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
}
function __rest(s, e) {
  var t2 = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t2[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t2[p[i]] = s[p[i]];
    }
  return t2;
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, exteainitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      exteainitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
}
function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
}
function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
}
function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t2[0] & 1) throw t2[1];
    return t2[1];
  }, trys: [], ops: [] }, f, y, t2, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t2 = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t2 = y["return"]) && t2.call(y), 0) : y.next) && !(t2 = t2.call(y, op[1])).done) return t2;
      if (y = 0, t2) op = [op[0] & 2, t2.value];
      switch (op[0]) {
        case 0:
        case 1:
          t2 = op;
          break;
        case 4:
          _.label++;
          return { value: op[1], done: false };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t2 = _.trys, t2 = t2.length > 0 && t2[t2.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t2 || op[1] > t2[0] && op[1] < t2[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t2[1]) {
            _.label = t2[1];
            t2 = op;
            break;
          }
          if (t2 && _.label < t2[2]) {
            _.label = t2[2];
            _.ops.push(op);
            break;
          }
          if (t2[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t2 = 0;
    }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(__read(arguments[i]));
  return ar;
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b2) {
          q.push([n, v, a, b2]) > 1 || resume(n, v);
        });
      };
      if (f) i[n] = f(i[n]);
    }
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function(e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function() {
    return this;
  }, i;
  function verb(n, f) {
    i[n] = o[n] ? function(v) {
      return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
    } : f;
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", { value: raw });
  } else {
    cooked.raw = raw;
  }
  return cooked;
}
function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  }
  __setModuleDefault(result, mod);
  return result;
}
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : { default: mod };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}
function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
            fail(e);
            return next();
          });
        } else s |= 1;
      } catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}
function __rewriteRelativeImportExtension(path16, preserveJsx) {
  if (typeof path16 === "string" && /^\.\.?\//.test(path16)) {
    return path16.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
      return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
    });
  }
  return path16;
}
var extendStatics, __assign, __createBinding, __setModuleDefault, ownKeys, _SuppressedError, tslib_es6_default;
var init_tslib_es6 = __esm({
  "node_modules/tslib/tslib.es6.mjs"() {
    "use strict";
    init_cjs_shims();
    extendStatics = function(d, b2) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
        d2.__proto__ = b3;
      } || function(d2, b3) {
        for (var p in b3) if (Object.prototype.hasOwnProperty.call(b3, p)) d2[p] = b3[p];
      };
      return extendStatics(d, b2);
    };
    __assign = function() {
      __assign = Object.assign || function __assign2(t2) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t2[p] = s[p];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    ownKeys = function(o) {
      ownKeys = Object.getOwnPropertyNames || function(o2) {
        var ar = [];
        for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
        return ar;
      };
      return ownKeys(o);
    };
    _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    tslib_es6_default = {
      __extends,
      __assign,
      __rest,
      __decorate,
      __param,
      __esDecorate,
      __runInitializers,
      __propKey,
      __setFunctionName,
      __metadata,
      __awaiter,
      __generator,
      __createBinding,
      __exportStar,
      __values,
      __read,
      __spread,
      __spreadArrays,
      __spreadArray,
      __await,
      __asyncGenerator,
      __asyncDelegator,
      __asyncValues,
      __makeTemplateObject,
      __importStar,
      __importDefault,
      __classPrivateFieldGet,
      __classPrivateFieldSet,
      __classPrivateFieldIn,
      __addDisposableResource,
      __disposeResources,
      __rewriteRelativeImportExtension
    };
  }
});

// node_modules/ast-types/lib/shared.js
var require_shared = __commonJS({
  "node_modules/ast-types/lib/shared.js"(exports2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.maybeSetModuleExports = void 0;
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    function default_1(fork) {
      var types2 = fork.use(types_1.default);
      var Type = types2.Type;
      var builtin = types2.builtInTypes;
      var isNumber = builtin.number;
      function geq(than) {
        return Type.from(function(value) {
          return isNumber.check(value) && value >= than;
        }, isNumber + " >= " + than);
      }
      ;
      var defaults = {
        // Functions were used because (among other reasons) that's the most
        // elegant way to allow for the emptyArray one always to give a new
        // array instance.
        "null": function() {
          return null;
        },
        "emptyArray": function() {
          return [];
        },
        "false": function() {
          return false;
        },
        "true": function() {
          return true;
        },
        "undefined": function() {
        },
        "use strict": function() {
          return "use strict";
        }
      };
      var naiveIsPrimitive = Type.or(builtin.string, builtin.number, builtin.boolean, builtin.null, builtin.undefined);
      var isPrimitive = Type.from(function(value) {
        if (value === null)
          return true;
        var type = typeof value;
        if (type === "object" || type === "function") {
          return false;
        }
        return true;
      }, naiveIsPrimitive.toString());
      return {
        geq,
        defaults,
        isPrimitive
      };
    }
    exports2.default = default_1;
    function maybeSetModuleExports(moduleGetter) {
      try {
        var nodeModule = moduleGetter();
        var originalExports = nodeModule.exports;
        var defaultExport = originalExports["default"];
      } catch (_a) {
        return;
      }
      if (defaultExport && defaultExport !== originalExports && typeof originalExports === "object") {
        Object.assign(defaultExport, originalExports, { "default": defaultExport });
        if (originalExports.__esModule) {
          Object.defineProperty(defaultExport, "__esModule", { value: true });
        }
        nodeModule.exports = defaultExport;
      }
    }
    exports2.maybeSetModuleExports = maybeSetModuleExports;
  }
});

// node_modules/ast-types/lib/types.js
var require_types = __commonJS({
  "node_modules/ast-types/lib/types.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Def = void 0;
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var Op = Object.prototype;
    var objToStr = Op.toString;
    var hasOwn = Op.hasOwnProperty;
    var BaseType = (
      /** @class */
      (function() {
        function BaseType2() {
        }
        BaseType2.prototype.assert = function(value, deep) {
          if (!this.check(value, deep)) {
            var str = shallowStringify(value);
            throw new Error(str + " does not match type " + this);
          }
          return true;
        };
        BaseType2.prototype.arrayOf = function() {
          var elemType = this;
          return new ArrayType(elemType);
        };
        return BaseType2;
      })()
    );
    var ArrayType = (
      /** @class */
      (function(_super) {
        tslib_1.__extends(ArrayType2, _super);
        function ArrayType2(elemType) {
          var _this = _super.call(this) || this;
          _this.elemType = elemType;
          _this.kind = "ArrayType";
          return _this;
        }
        ArrayType2.prototype.toString = function() {
          return "[" + this.elemType + "]";
        };
        ArrayType2.prototype.check = function(value, deep) {
          var _this = this;
          return Array.isArray(value) && value.every(function(elem) {
            return _this.elemType.check(elem, deep);
          });
        };
        return ArrayType2;
      })(BaseType)
    );
    var IdentityType = (
      /** @class */
      (function(_super) {
        tslib_1.__extends(IdentityType2, _super);
        function IdentityType2(value) {
          var _this = _super.call(this) || this;
          _this.value = value;
          _this.kind = "IdentityType";
          return _this;
        }
        IdentityType2.prototype.toString = function() {
          return String(this.value);
        };
        IdentityType2.prototype.check = function(value, deep) {
          var result = value === this.value;
          if (!result && typeof deep === "function") {
            deep(this, value);
          }
          return result;
        };
        return IdentityType2;
      })(BaseType)
    );
    var ObjectType = (
      /** @class */
      (function(_super) {
        tslib_1.__extends(ObjectType2, _super);
        function ObjectType2(fields) {
          var _this = _super.call(this) || this;
          _this.fields = fields;
          _this.kind = "ObjectType";
          return _this;
        }
        ObjectType2.prototype.toString = function() {
          return "{ " + this.fields.join(", ") + " }";
        };
        ObjectType2.prototype.check = function(value, deep) {
          return objToStr.call(value) === objToStr.call({}) && this.fields.every(function(field) {
            return field.type.check(value[field.name], deep);
          });
        };
        return ObjectType2;
      })(BaseType)
    );
    var OrType = (
      /** @class */
      (function(_super) {
        tslib_1.__extends(OrType2, _super);
        function OrType2(types2) {
          var _this = _super.call(this) || this;
          _this.types = types2;
          _this.kind = "OrType";
          return _this;
        }
        OrType2.prototype.toString = function() {
          return this.types.join(" | ");
        };
        OrType2.prototype.check = function(value, deep) {
          if (this.types.some(function(type) {
            return type.check(value, !!deep);
          })) {
            return true;
          }
          if (typeof deep === "function") {
            deep(this, value);
          }
          return false;
        };
        return OrType2;
      })(BaseType)
    );
    var PredicateType = (
      /** @class */
      (function(_super) {
        tslib_1.__extends(PredicateType2, _super);
        function PredicateType2(name, predicate) {
          var _this = _super.call(this) || this;
          _this.name = name;
          _this.predicate = predicate;
          _this.kind = "PredicateType";
          return _this;
        }
        PredicateType2.prototype.toString = function() {
          return this.name;
        };
        PredicateType2.prototype.check = function(value, deep) {
          var result = this.predicate(value, deep);
          if (!result && typeof deep === "function") {
            deep(this, value);
          }
          return result;
        };
        return PredicateType2;
      })(BaseType)
    );
    var Def = (
      /** @class */
      (function() {
        function Def2(type, typeName) {
          this.type = type;
          this.typeName = typeName;
          this.baseNames = [];
          this.ownFields = /* @__PURE__ */ Object.create(null);
          this.allSupertypes = /* @__PURE__ */ Object.create(null);
          this.supertypeList = [];
          this.allFields = /* @__PURE__ */ Object.create(null);
          this.fieldNames = [];
          this.finalized = false;
          this.buildable = false;
          this.buildParams = [];
        }
        Def2.prototype.isSupertypeOf = function(that) {
          if (that instanceof Def2) {
            if (this.finalized !== true || that.finalized !== true) {
              throw new Error("");
            }
            return hasOwn.call(that.allSupertypes, this.typeName);
          } else {
            throw new Error(that + " is not a Def");
          }
        };
        Def2.prototype.checkAllFields = function(value, deep) {
          var allFields = this.allFields;
          if (this.finalized !== true) {
            throw new Error("" + this.typeName);
          }
          function checkFieldByName(name) {
            var field = allFields[name];
            var type = field.type;
            var child = field.getValue(value);
            return type.check(child, deep);
          }
          return value !== null && typeof value === "object" && Object.keys(allFields).every(checkFieldByName);
        };
        Def2.prototype.bases = function() {
          var supertypeNames = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            supertypeNames[_i] = arguments[_i];
          }
          var bases = this.baseNames;
          if (this.finalized) {
            if (supertypeNames.length !== bases.length) {
              throw new Error("");
            }
            for (var i = 0; i < supertypeNames.length; i++) {
              if (supertypeNames[i] !== bases[i]) {
                throw new Error("");
              }
            }
            return this;
          }
          supertypeNames.forEach(function(baseName) {
            if (bases.indexOf(baseName) < 0) {
              bases.push(baseName);
            }
          });
          return this;
        };
        return Def2;
      })()
    );
    exports2.Def = Def;
    var Field = (
      /** @class */
      (function() {
        function Field2(name, type, defaultFn, hidden) {
          this.name = name;
          this.type = type;
          this.defaultFn = defaultFn;
          this.hidden = !!hidden;
        }
        Field2.prototype.toString = function() {
          return JSON.stringify(this.name) + ": " + this.type;
        };
        Field2.prototype.getValue = function(obj) {
          var value = obj[this.name];
          if (typeof value !== "undefined") {
            return value;
          }
          if (typeof this.defaultFn === "function") {
            value = this.defaultFn.call(obj);
          }
          return value;
        };
        return Field2;
      })()
    );
    function shallowStringify(value) {
      if (Array.isArray(value)) {
        return "[" + value.map(shallowStringify).join(", ") + "]";
      }
      if (value && typeof value === "object") {
        return "{ " + Object.keys(value).map(function(key) {
          return key + ": " + value[key];
        }).join(", ") + " }";
      }
      return JSON.stringify(value);
    }
    function typesPlugin(_fork) {
      var Type = {
        or: function() {
          var types2 = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            types2[_i] = arguments[_i];
          }
          return new OrType(types2.map(function(type) {
            return Type.from(type);
          }));
        },
        from: function(value, name) {
          if (value instanceof ArrayType || value instanceof IdentityType || value instanceof ObjectType || value instanceof OrType || value instanceof PredicateType) {
            return value;
          }
          if (value instanceof Def) {
            return value.type;
          }
          if (isArray.check(value)) {
            if (value.length !== 1) {
              throw new Error("only one element type is permitted for typed arrays");
            }
            return new ArrayType(Type.from(value[0]));
          }
          if (isObject.check(value)) {
            return new ObjectType(Object.keys(value).map(function(name2) {
              return new Field(name2, Type.from(value[name2], name2));
            }));
          }
          if (typeof value === "function") {
            var bicfIndex = builtInCtorFns.indexOf(value);
            if (bicfIndex >= 0) {
              return builtInCtorTypes[bicfIndex];
            }
            if (typeof name !== "string") {
              throw new Error("missing name");
            }
            return new PredicateType(name, value);
          }
          return new IdentityType(value);
        },
        // Define a type whose name is registered in a namespace (the defCache) so
        // that future definitions will return the same type given the same name.
        // In particular, this system allows for circular and forward definitions.
        // The Def object d returned from Type.def may be used to configure the
        // type d.type by calling methods such as d.bases, d.build, and d.field.
        def: function(typeName) {
          return hasOwn.call(defCache, typeName) ? defCache[typeName] : defCache[typeName] = new DefImpl(typeName);
        },
        hasDef: function(typeName) {
          return hasOwn.call(defCache, typeName);
        }
      };
      var builtInCtorFns = [];
      var builtInCtorTypes = [];
      function defBuiltInType(name, example) {
        var objStr = objToStr.call(example);
        var type = new PredicateType(name, function(value) {
          return objToStr.call(value) === objStr;
        });
        if (example && typeof example.constructor === "function") {
          builtInCtorFns.push(example.constructor);
          builtInCtorTypes.push(type);
        }
        return type;
      }
      var isString = defBuiltInType("string", "truthy");
      var isFunction = defBuiltInType("function", function() {
      });
      var isArray = defBuiltInType("array", []);
      var isObject = defBuiltInType("object", {});
      var isRegExp = defBuiltInType("RegExp", /./);
      var isDate = defBuiltInType("Date", /* @__PURE__ */ new Date());
      var isNumber = defBuiltInType("number", 3);
      var isBoolean = defBuiltInType("boolean", true);
      var isNull = defBuiltInType("null", null);
      var isUndefined = defBuiltInType("undefined", void 0);
      var isBigInt = typeof BigInt === "function" ? defBuiltInType("BigInt", BigInt(1234)) : new PredicateType("BigInt", function() {
        return false;
      });
      var builtInTypes = {
        string: isString,
        function: isFunction,
        array: isArray,
        object: isObject,
        RegExp: isRegExp,
        Date: isDate,
        number: isNumber,
        boolean: isBoolean,
        null: isNull,
        undefined: isUndefined,
        BigInt: isBigInt
      };
      var defCache = /* @__PURE__ */ Object.create(null);
      function defFromValue(value) {
        if (value && typeof value === "object") {
          var type = value.type;
          if (typeof type === "string" && hasOwn.call(defCache, type)) {
            var d = defCache[type];
            if (d.finalized) {
              return d;
            }
          }
        }
        return null;
      }
      var DefImpl = (
        /** @class */
        (function(_super) {
          tslib_1.__extends(DefImpl2, _super);
          function DefImpl2(typeName) {
            var _this = _super.call(this, new PredicateType(typeName, function(value, deep) {
              return _this.check(value, deep);
            }), typeName) || this;
            return _this;
          }
          DefImpl2.prototype.check = function(value, deep) {
            if (this.finalized !== true) {
              throw new Error("prematurely checking unfinalized type " + this.typeName);
            }
            if (value === null || typeof value !== "object") {
              return false;
            }
            var vDef = defFromValue(value);
            if (!vDef) {
              if (this.typeName === "SourceLocation" || this.typeName === "Position") {
                return this.checkAllFields(value, deep);
              }
              return false;
            }
            if (deep && vDef === this) {
              return this.checkAllFields(value, deep);
            }
            if (!this.isSupertypeOf(vDef)) {
              return false;
            }
            if (!deep) {
              return true;
            }
            return vDef.checkAllFields(value, deep) && this.checkAllFields(value, false);
          };
          DefImpl2.prototype.build = function() {
            var _this = this;
            var buildParams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              buildParams[_i] = arguments[_i];
            }
            this.buildParams = buildParams;
            if (this.buildable) {
              return this;
            }
            this.field("type", String, function() {
              return _this.typeName;
            });
            this.buildable = true;
            var addParam = function(built, param, arg, isArgAvailable) {
              if (hasOwn.call(built, param))
                return;
              var all = _this.allFields;
              if (!hasOwn.call(all, param)) {
                throw new Error("" + param);
              }
              var field = all[param];
              var type = field.type;
              var value;
              if (isArgAvailable) {
                value = arg;
              } else if (field.defaultFn) {
                value = field.defaultFn.call(built);
              } else {
                var message = "no value or default function given for field " + JSON.stringify(param) + " of " + _this.typeName + "(" + _this.buildParams.map(function(name) {
                  return all[name];
                }).join(", ") + ")";
                throw new Error(message);
              }
              if (!type.check(value)) {
                throw new Error(shallowStringify(value) + " does not match field " + field + " of type " + _this.typeName);
              }
              built[param] = value;
            };
            var builder = function() {
              var args = [];
              for (var _i2 = 0; _i2 < arguments.length; _i2++) {
                args[_i2] = arguments[_i2];
              }
              var argc = args.length;
              if (!_this.finalized) {
                throw new Error("attempting to instantiate unfinalized type " + _this.typeName);
              }
              var built = Object.create(nodePrototype);
              _this.buildParams.forEach(function(param, i) {
                if (i < argc) {
                  addParam(built, param, args[i], true);
                } else {
                  addParam(built, param, null, false);
                }
              });
              Object.keys(_this.allFields).forEach(function(param) {
                addParam(built, param, null, false);
              });
              if (built.type !== _this.typeName) {
                throw new Error("");
              }
              return built;
            };
            builder.from = function(obj) {
              if (!_this.finalized) {
                throw new Error("attempting to instantiate unfinalized type " + _this.typeName);
              }
              var built = Object.create(nodePrototype);
              Object.keys(_this.allFields).forEach(function(param) {
                if (hasOwn.call(obj, param)) {
                  addParam(built, param, obj[param], true);
                } else {
                  addParam(built, param, null, false);
                }
              });
              if (built.type !== _this.typeName) {
                throw new Error("");
              }
              return built;
            };
            Object.defineProperty(builders, getBuilderName(this.typeName), {
              enumerable: true,
              value: builder
            });
            return this;
          };
          DefImpl2.prototype.field = function(name, type, defaultFn, hidden) {
            if (this.finalized) {
              console.error("Ignoring attempt to redefine field " + JSON.stringify(name) + " of finalized type " + JSON.stringify(this.typeName));
              return this;
            }
            this.ownFields[name] = new Field(name, Type.from(type), defaultFn, hidden);
            return this;
          };
          DefImpl2.prototype.finalize = function() {
            var _this = this;
            if (!this.finalized) {
              var allFields = this.allFields;
              var allSupertypes = this.allSupertypes;
              this.baseNames.forEach(function(name) {
                var def = defCache[name];
                if (def instanceof Def) {
                  def.finalize();
                  extend(allFields, def.allFields);
                  extend(allSupertypes, def.allSupertypes);
                } else {
                  var message = "unknown supertype name " + JSON.stringify(name) + " for subtype " + JSON.stringify(_this.typeName);
                  throw new Error(message);
                }
              });
              extend(allFields, this.ownFields);
              allSupertypes[this.typeName] = this;
              this.fieldNames.length = 0;
              for (var fieldName in allFields) {
                if (hasOwn.call(allFields, fieldName) && !allFields[fieldName].hidden) {
                  this.fieldNames.push(fieldName);
                }
              }
              Object.defineProperty(namedTypes, this.typeName, {
                enumerable: true,
                value: this.type
              });
              this.finalized = true;
              populateSupertypeList(this.typeName, this.supertypeList);
              if (this.buildable && this.supertypeList.lastIndexOf("Expression") >= 0) {
                wrapExpressionBuilderWithStatement(this.typeName);
              }
            }
          };
          return DefImpl2;
        })(Def)
      );
      function getSupertypeNames(typeName) {
        if (!hasOwn.call(defCache, typeName)) {
          throw new Error("");
        }
        var d = defCache[typeName];
        if (d.finalized !== true) {
          throw new Error("");
        }
        return d.supertypeList.slice(1);
      }
      function computeSupertypeLookupTable(candidates) {
        var table = {};
        var typeNames = Object.keys(defCache);
        var typeNameCount = typeNames.length;
        for (var i = 0; i < typeNameCount; ++i) {
          var typeName = typeNames[i];
          var d = defCache[typeName];
          if (d.finalized !== true) {
            throw new Error("" + typeName);
          }
          for (var j = 0; j < d.supertypeList.length; ++j) {
            var superTypeName = d.supertypeList[j];
            if (hasOwn.call(candidates, superTypeName)) {
              table[typeName] = superTypeName;
              break;
            }
          }
        }
        return table;
      }
      var builders = /* @__PURE__ */ Object.create(null);
      var nodePrototype = {};
      function defineMethod(name, func) {
        var old = nodePrototype[name];
        if (isUndefined.check(func)) {
          delete nodePrototype[name];
        } else {
          isFunction.assert(func);
          Object.defineProperty(nodePrototype, name, {
            enumerable: true,
            configurable: true,
            value: func
          });
        }
        return old;
      }
      function getBuilderName(typeName) {
        return typeName.replace(/^[A-Z]+/, function(upperCasePrefix) {
          var len = upperCasePrefix.length;
          switch (len) {
            case 0:
              return "";
            // If there's only one initial capital letter, just lower-case it.
            case 1:
              return upperCasePrefix.toLowerCase();
            default:
              return upperCasePrefix.slice(0, len - 1).toLowerCase() + upperCasePrefix.charAt(len - 1);
          }
        });
      }
      function getStatementBuilderName(typeName) {
        typeName = getBuilderName(typeName);
        return typeName.replace(/(Expression)?$/, "Statement");
      }
      var namedTypes = {};
      function getFieldNames(object) {
        var d = defFromValue(object);
        if (d) {
          return d.fieldNames.slice(0);
        }
        if ("type" in object) {
          throw new Error("did not recognize object of type " + JSON.stringify(object.type));
        }
        return Object.keys(object);
      }
      function getFieldValue(object, fieldName) {
        var d = defFromValue(object);
        if (d) {
          var field = d.allFields[fieldName];
          if (field) {
            return field.getValue(object);
          }
        }
        return object && object[fieldName];
      }
      function eachField(object, callback, context) {
        getFieldNames(object).forEach(function(name) {
          callback.call(this, name, getFieldValue(object, name));
        }, context);
      }
      function someField(object, callback, context) {
        return getFieldNames(object).some(function(name) {
          return callback.call(this, name, getFieldValue(object, name));
        }, context);
      }
      function wrapExpressionBuilderWithStatement(typeName) {
        var wrapperName = getStatementBuilderName(typeName);
        if (builders[wrapperName])
          return;
        var wrapped = builders[getBuilderName(typeName)];
        if (!wrapped)
          return;
        var builder = function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return builders.expressionStatement(wrapped.apply(builders, args));
        };
        builder.from = function() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return builders.expressionStatement(wrapped.from.apply(builders, args));
        };
        builders[wrapperName] = builder;
      }
      function populateSupertypeList(typeName, list) {
        list.length = 0;
        list.push(typeName);
        var lastSeen = /* @__PURE__ */ Object.create(null);
        for (var pos = 0; pos < list.length; ++pos) {
          typeName = list[pos];
          var d = defCache[typeName];
          if (d.finalized !== true) {
            throw new Error("");
          }
          if (hasOwn.call(lastSeen, typeName)) {
            delete list[lastSeen[typeName]];
          }
          lastSeen[typeName] = pos;
          list.push.apply(list, d.baseNames);
        }
        for (var to = 0, from = to, len = list.length; from < len; ++from) {
          if (hasOwn.call(list, from)) {
            list[to++] = list[from];
          }
        }
        list.length = to;
      }
      function extend(into, from) {
        Object.keys(from).forEach(function(name) {
          into[name] = from[name];
        });
        return into;
      }
      function finalize() {
        Object.keys(defCache).forEach(function(name) {
          defCache[name].finalize();
        });
      }
      return {
        Type,
        builtInTypes,
        getSupertypeNames,
        computeSupertypeLookupTable,
        builders,
        defineMethod,
        getBuilderName,
        getStatementBuilderName,
        namedTypes,
        getFieldNames,
        getFieldValue,
        eachField,
        someField,
        finalize
      };
    }
    exports2.default = typesPlugin;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/path.js
var require_path = __commonJS({
  "node_modules/ast-types/lib/path.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var types_1 = tslib_1.__importDefault(require_types());
    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    function pathPlugin(fork) {
      var types2 = fork.use(types_1.default);
      var isArray = types2.builtInTypes.array;
      var isNumber = types2.builtInTypes.number;
      var Path = function Path2(value, parentPath, name) {
        if (!(this instanceof Path2)) {
          throw new Error("Path constructor cannot be invoked without 'new'");
        }
        if (parentPath) {
          if (!(parentPath instanceof Path2)) {
            throw new Error("");
          }
        } else {
          parentPath = null;
          name = null;
        }
        this.value = value;
        this.parentPath = parentPath;
        this.name = name;
        this.__childCache = null;
      };
      var Pp = Path.prototype;
      function getChildCache(path16) {
        return path16.__childCache || (path16.__childCache = /* @__PURE__ */ Object.create(null));
      }
      function getChildPath(path16, name) {
        var cache = getChildCache(path16);
        var actualChildValue = path16.getValueProperty(name);
        var childPath = cache[name];
        if (!hasOwn.call(cache, name) || // Ensure consistency between cache and reality.
        childPath.value !== actualChildValue) {
          childPath = cache[name] = new path16.constructor(actualChildValue, path16, name);
        }
        return childPath;
      }
      Pp.getValueProperty = function getValueProperty(name) {
        return this.value[name];
      };
      Pp.get = function get() {
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          names[_i] = arguments[_i];
        }
        var path16 = this;
        var count = names.length;
        for (var i = 0; i < count; ++i) {
          path16 = getChildPath(path16, names[i]);
        }
        return path16;
      };
      Pp.each = function each(callback, context) {
        var childPaths = [];
        var len = this.value.length;
        var i = 0;
        for (var i = 0; i < len; ++i) {
          if (hasOwn.call(this.value, i)) {
            childPaths[i] = this.get(i);
          }
        }
        context = context || this;
        for (i = 0; i < len; ++i) {
          if (hasOwn.call(childPaths, i)) {
            callback.call(context, childPaths[i]);
          }
        }
      };
      Pp.map = function map(callback, context) {
        var result = [];
        this.each(function(childPath) {
          result.push(callback.call(this, childPath));
        }, context);
        return result;
      };
      Pp.filter = function filter(callback, context) {
        var result = [];
        this.each(function(childPath) {
          if (callback.call(this, childPath)) {
            result.push(childPath);
          }
        }, context);
        return result;
      };
      function emptyMoves() {
      }
      function getMoves(path16, offset, start, end) {
        isArray.assert(path16.value);
        if (offset === 0) {
          return emptyMoves;
        }
        var length = path16.value.length;
        if (length < 1) {
          return emptyMoves;
        }
        var argc = arguments.length;
        if (argc === 2) {
          start = 0;
          end = length;
        } else if (argc === 3) {
          start = Math.max(start, 0);
          end = length;
        } else {
          start = Math.max(start, 0);
          end = Math.min(end, length);
        }
        isNumber.assert(start);
        isNumber.assert(end);
        var moves = /* @__PURE__ */ Object.create(null);
        var cache = getChildCache(path16);
        for (var i = start; i < end; ++i) {
          if (hasOwn.call(path16.value, i)) {
            var childPath = path16.get(i);
            if (childPath.name !== i) {
              throw new Error("");
            }
            var newIndex = i + offset;
            childPath.name = newIndex;
            moves[newIndex] = childPath;
            delete cache[i];
          }
        }
        delete cache.length;
        return function() {
          for (var newIndex2 in moves) {
            var childPath2 = moves[newIndex2];
            if (childPath2.name !== +newIndex2) {
              throw new Error("");
            }
            cache[newIndex2] = childPath2;
            path16.value[newIndex2] = childPath2.value;
          }
        };
      }
      Pp.shift = function shift() {
        var move = getMoves(this, -1);
        var result = this.value.shift();
        move();
        return result;
      };
      Pp.unshift = function unshift() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var move = getMoves(this, args.length);
        var result = this.value.unshift.apply(this.value, args);
        move();
        return result;
      };
      Pp.push = function push() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        isArray.assert(this.value);
        delete getChildCache(this).length;
        return this.value.push.apply(this.value, args);
      };
      Pp.pop = function pop() {
        isArray.assert(this.value);
        var cache = getChildCache(this);
        delete cache[this.value.length - 1];
        delete cache.length;
        return this.value.pop();
      };
      Pp.insertAt = function insertAt(index) {
        var argc = arguments.length;
        var move = getMoves(this, argc - 1, index);
        if (move === emptyMoves && argc <= 1) {
          return this;
        }
        index = Math.max(index, 0);
        for (var i = 1; i < argc; ++i) {
          this.value[index + i - 1] = arguments[i];
        }
        move();
        return this;
      };
      Pp.insertBefore = function insertBefore() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var pp = this.parentPath;
        var argc = args.length;
        var insertAtArgs = [this.name];
        for (var i = 0; i < argc; ++i) {
          insertAtArgs.push(args[i]);
        }
        return pp.insertAt.apply(pp, insertAtArgs);
      };
      Pp.insertAfter = function insertAfter() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var pp = this.parentPath;
        var argc = args.length;
        var insertAtArgs = [this.name + 1];
        for (var i = 0; i < argc; ++i) {
          insertAtArgs.push(args[i]);
        }
        return pp.insertAt.apply(pp, insertAtArgs);
      };
      function repairRelationshipWithParent(path16) {
        if (!(path16 instanceof Path)) {
          throw new Error("");
        }
        var pp = path16.parentPath;
        if (!pp) {
          return path16;
        }
        var parentValue = pp.value;
        var parentCache = getChildCache(pp);
        if (parentValue[path16.name] === path16.value) {
          parentCache[path16.name] = path16;
        } else if (isArray.check(parentValue)) {
          var i = parentValue.indexOf(path16.value);
          if (i >= 0) {
            parentCache[path16.name = i] = path16;
          }
        } else {
          parentValue[path16.name] = path16.value;
          parentCache[path16.name] = path16;
        }
        if (parentValue[path16.name] !== path16.value) {
          throw new Error("");
        }
        if (path16.parentPath.get(path16.name) !== path16) {
          throw new Error("");
        }
        return path16;
      }
      Pp.replace = function replace2(replacement) {
        var results = [];
        var parentValue = this.parentPath.value;
        var parentCache = getChildCache(this.parentPath);
        var count = arguments.length;
        repairRelationshipWithParent(this);
        if (isArray.check(parentValue)) {
          var originalLength = parentValue.length;
          var move = getMoves(this.parentPath, count - 1, this.name + 1);
          var spliceArgs = [this.name, 1];
          for (var i = 0; i < count; ++i) {
            spliceArgs.push(arguments[i]);
          }
          var splicedOut = parentValue.splice.apply(parentValue, spliceArgs);
          if (splicedOut[0] !== this.value) {
            throw new Error("");
          }
          if (parentValue.length !== originalLength - 1 + count) {
            throw new Error("");
          }
          move();
          if (count === 0) {
            delete this.value;
            delete parentCache[this.name];
            this.__childCache = null;
          } else {
            if (parentValue[this.name] !== replacement) {
              throw new Error("");
            }
            if (this.value !== replacement) {
              this.value = replacement;
              this.__childCache = null;
            }
            for (i = 0; i < count; ++i) {
              results.push(this.parentPath.get(this.name + i));
            }
            if (results[0] !== this) {
              throw new Error("");
            }
          }
        } else if (count === 1) {
          if (this.value !== replacement) {
            this.__childCache = null;
          }
          this.value = parentValue[this.name] = replacement;
          results.push(this);
        } else if (count === 0) {
          delete parentValue[this.name];
          delete this.value;
          this.__childCache = null;
        } else {
          throw new Error("Could not replace path");
        }
        return results;
      };
      return Path;
    }
    exports2.default = pathPlugin;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/scope.js
var require_scope = __commonJS({
  "node_modules/ast-types/lib/scope.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var types_1 = tslib_1.__importDefault(require_types());
    var hasOwn = Object.prototype.hasOwnProperty;
    function scopePlugin(fork) {
      var types2 = fork.use(types_1.default);
      var Type = types2.Type;
      var namedTypes = types2.namedTypes;
      var Node = namedTypes.Node;
      var Expression = namedTypes.Expression;
      var isArray = types2.builtInTypes.array;
      var b2 = types2.builders;
      var Scope = function Scope2(path16, parentScope) {
        if (!(this instanceof Scope2)) {
          throw new Error("Scope constructor cannot be invoked without 'new'");
        }
        if (!TypeParameterScopeType.check(path16.value)) {
          ScopeType.assert(path16.value);
        }
        var depth;
        if (parentScope) {
          if (!(parentScope instanceof Scope2)) {
            throw new Error("");
          }
          depth = parentScope.depth + 1;
        } else {
          parentScope = null;
          depth = 0;
        }
        Object.defineProperties(this, {
          path: { value: path16 },
          node: { value: path16.value },
          isGlobal: { value: !parentScope, enumerable: true },
          depth: { value: depth },
          parent: { value: parentScope },
          bindings: { value: {} },
          types: { value: {} }
        });
      };
      var ScopeType = Type.or(
        // Program nodes introduce global scopes.
        namedTypes.Program,
        // Function is the supertype of FunctionExpression,
        // FunctionDeclaration, ArrowExpression, etc.
        namedTypes.Function,
        // In case you didn't know, the caught parameter shadows any variable
        // of the same name in an outer scope.
        namedTypes.CatchClause
      );
      var TypeParameterScopeType = Type.or(namedTypes.Function, namedTypes.ClassDeclaration, namedTypes.ClassExpression, namedTypes.InterfaceDeclaration, namedTypes.TSInterfaceDeclaration, namedTypes.TypeAlias, namedTypes.TSTypeAliasDeclaration);
      var FlowOrTSTypeParameterType = Type.or(namedTypes.TypeParameter, namedTypes.TSTypeParameter);
      Scope.isEstablishedBy = function(node) {
        return ScopeType.check(node) || TypeParameterScopeType.check(node);
      };
      var Sp = Scope.prototype;
      Sp.didScan = false;
      Sp.declares = function(name) {
        this.scan();
        return hasOwn.call(this.bindings, name);
      };
      Sp.declaresType = function(name) {
        this.scan();
        return hasOwn.call(this.types, name);
      };
      Sp.declareTemporary = function(prefix) {
        if (prefix) {
          if (!/^[a-z$_]/i.test(prefix)) {
            throw new Error("");
          }
        } else {
          prefix = "t$";
        }
        prefix += this.depth.toString(36) + "$";
        this.scan();
        var index = 0;
        while (this.declares(prefix + index)) {
          ++index;
        }
        var name = prefix + index;
        return this.bindings[name] = types2.builders.identifier(name);
      };
      Sp.injectTemporary = function(identifier, init2) {
        identifier || (identifier = this.declareTemporary());
        var bodyPath = this.path.get("body");
        if (namedTypes.BlockStatement.check(bodyPath.value)) {
          bodyPath = bodyPath.get("body");
        }
        bodyPath.unshift(b2.variableDeclaration("var", [b2.variableDeclarator(identifier, init2 || null)]));
        return identifier;
      };
      Sp.scan = function(force) {
        if (force || !this.didScan) {
          for (var name in this.bindings) {
            delete this.bindings[name];
          }
          for (var name in this.types) {
            delete this.types[name];
          }
          scanScope(this.path, this.bindings, this.types);
          this.didScan = true;
        }
      };
      Sp.getBindings = function() {
        this.scan();
        return this.bindings;
      };
      Sp.getTypes = function() {
        this.scan();
        return this.types;
      };
      function scanScope(path16, bindings, scopeTypes) {
        var node = path16.value;
        if (TypeParameterScopeType.check(node)) {
          var params = path16.get("typeParameters", "params");
          if (isArray.check(params.value)) {
            params.each(function(childPath) {
              addTypeParameter(childPath, scopeTypes);
            });
          }
        }
        if (ScopeType.check(node)) {
          if (namedTypes.CatchClause.check(node)) {
            addPattern(path16.get("param"), bindings);
          } else {
            recursiveScanScope(path16, bindings, scopeTypes);
          }
        }
      }
      function recursiveScanScope(path16, bindings, scopeTypes) {
        var node = path16.value;
        if (path16.parent && namedTypes.FunctionExpression.check(path16.parent.node) && path16.parent.node.id) {
          addPattern(path16.parent.get("id"), bindings);
        }
        if (!node) {
        } else if (isArray.check(node)) {
          path16.each(function(childPath) {
            recursiveScanChild(childPath, bindings, scopeTypes);
          });
        } else if (namedTypes.Function.check(node)) {
          path16.get("params").each(function(paramPath) {
            addPattern(paramPath, bindings);
          });
          recursiveScanChild(path16.get("body"), bindings, scopeTypes);
          recursiveScanScope(path16.get("typeParameters"), bindings, scopeTypes);
        } else if (namedTypes.TypeAlias && namedTypes.TypeAlias.check(node) || namedTypes.InterfaceDeclaration && namedTypes.InterfaceDeclaration.check(node) || namedTypes.TSTypeAliasDeclaration && namedTypes.TSTypeAliasDeclaration.check(node) || namedTypes.TSInterfaceDeclaration && namedTypes.TSInterfaceDeclaration.check(node)) {
          addTypePattern(path16.get("id"), scopeTypes);
        } else if (namedTypes.VariableDeclarator.check(node)) {
          addPattern(path16.get("id"), bindings);
          recursiveScanChild(path16.get("init"), bindings, scopeTypes);
        } else if (node.type === "ImportSpecifier" || node.type === "ImportNamespaceSpecifier" || node.type === "ImportDefaultSpecifier") {
          addPattern(
            // Esprima used to use the .name field to refer to the local
            // binding identifier for ImportSpecifier nodes, but .id for
            // ImportNamespaceSpecifier and ImportDefaultSpecifier nodes.
            // ESTree/Acorn/ESpree use .local for all three node types.
            path16.get(node.local ? "local" : node.name ? "name" : "id"),
            bindings
          );
        } else if (Node.check(node) && !Expression.check(node)) {
          types2.eachField(node, function(name, child) {
            var childPath = path16.get(name);
            if (!pathHasValue(childPath, child)) {
              throw new Error("");
            }
            recursiveScanChild(childPath, bindings, scopeTypes);
          });
        }
      }
      function pathHasValue(path16, value) {
        if (path16.value === value) {
          return true;
        }
        if (Array.isArray(path16.value) && path16.value.length === 0 && Array.isArray(value) && value.length === 0) {
          return true;
        }
        return false;
      }
      function recursiveScanChild(path16, bindings, scopeTypes) {
        var node = path16.value;
        if (!node || Expression.check(node)) {
        } else if (namedTypes.FunctionDeclaration.check(node) && node.id !== null) {
          addPattern(path16.get("id"), bindings);
        } else if (namedTypes.ClassDeclaration && namedTypes.ClassDeclaration.check(node) && node.id !== null) {
          addPattern(path16.get("id"), bindings);
          recursiveScanScope(path16.get("typeParameters"), bindings, scopeTypes);
        } else if (namedTypes.InterfaceDeclaration && namedTypes.InterfaceDeclaration.check(node) || namedTypes.TSInterfaceDeclaration && namedTypes.TSInterfaceDeclaration.check(node)) {
          addTypePattern(path16.get("id"), scopeTypes);
        } else if (ScopeType.check(node)) {
          if (namedTypes.CatchClause.check(node) && // TODO Broaden this to accept any pattern.
          namedTypes.Identifier.check(node.param)) {
            var catchParamName = node.param.name;
            var hadBinding = hasOwn.call(bindings, catchParamName);
            recursiveScanScope(path16.get("body"), bindings, scopeTypes);
            if (!hadBinding) {
              delete bindings[catchParamName];
            }
          }
        } else {
          recursiveScanScope(path16, bindings, scopeTypes);
        }
      }
      function addPattern(patternPath, bindings) {
        var pattern = patternPath.value;
        namedTypes.Pattern.assert(pattern);
        if (namedTypes.Identifier.check(pattern)) {
          if (hasOwn.call(bindings, pattern.name)) {
            bindings[pattern.name].push(patternPath);
          } else {
            bindings[pattern.name] = [patternPath];
          }
        } else if (namedTypes.AssignmentPattern && namedTypes.AssignmentPattern.check(pattern)) {
          addPattern(patternPath.get("left"), bindings);
        } else if (namedTypes.ObjectPattern && namedTypes.ObjectPattern.check(pattern)) {
          patternPath.get("properties").each(function(propertyPath) {
            var property = propertyPath.value;
            if (namedTypes.Pattern.check(property)) {
              addPattern(propertyPath, bindings);
            } else if (namedTypes.Property.check(property) || namedTypes.ObjectProperty && namedTypes.ObjectProperty.check(property)) {
              addPattern(propertyPath.get("value"), bindings);
            } else if (namedTypes.SpreadProperty && namedTypes.SpreadProperty.check(property)) {
              addPattern(propertyPath.get("argument"), bindings);
            }
          });
        } else if (namedTypes.ArrayPattern && namedTypes.ArrayPattern.check(pattern)) {
          patternPath.get("elements").each(function(elementPath) {
            var element = elementPath.value;
            if (namedTypes.Pattern.check(element)) {
              addPattern(elementPath, bindings);
            } else if (namedTypes.SpreadElement && namedTypes.SpreadElement.check(element)) {
              addPattern(elementPath.get("argument"), bindings);
            }
          });
        } else if (namedTypes.PropertyPattern && namedTypes.PropertyPattern.check(pattern)) {
          addPattern(patternPath.get("pattern"), bindings);
        } else if (namedTypes.SpreadElementPattern && namedTypes.SpreadElementPattern.check(pattern) || namedTypes.RestElement && namedTypes.RestElement.check(pattern) || namedTypes.SpreadPropertyPattern && namedTypes.SpreadPropertyPattern.check(pattern)) {
          addPattern(patternPath.get("argument"), bindings);
        }
      }
      function addTypePattern(patternPath, types3) {
        var pattern = patternPath.value;
        namedTypes.Pattern.assert(pattern);
        if (namedTypes.Identifier.check(pattern)) {
          if (hasOwn.call(types3, pattern.name)) {
            types3[pattern.name].push(patternPath);
          } else {
            types3[pattern.name] = [patternPath];
          }
        }
      }
      function addTypeParameter(parameterPath, types3) {
        var parameter = parameterPath.value;
        FlowOrTSTypeParameterType.assert(parameter);
        if (hasOwn.call(types3, parameter.name)) {
          types3[parameter.name].push(parameterPath);
        } else {
          types3[parameter.name] = [parameterPath];
        }
      }
      Sp.lookup = function(name) {
        for (var scope = this; scope; scope = scope.parent)
          if (scope.declares(name))
            break;
        return scope;
      };
      Sp.lookupType = function(name) {
        for (var scope = this; scope; scope = scope.parent)
          if (scope.declaresType(name))
            break;
        return scope;
      };
      Sp.getGlobalScope = function() {
        var scope = this;
        while (!scope.isGlobal)
          scope = scope.parent;
        return scope;
      };
      return Scope;
    }
    exports2.default = scopePlugin;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/node-path.js
var require_node_path = __commonJS({
  "node_modules/ast-types/lib/node-path.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    var path_1 = tslib_1.__importDefault(require_path());
    var scope_1 = tslib_1.__importDefault(require_scope());
    var shared_1 = require_shared();
    function nodePathPlugin(fork) {
      var types2 = fork.use(types_1.default);
      var n = types2.namedTypes;
      var b2 = types2.builders;
      var isNumber = types2.builtInTypes.number;
      var isArray = types2.builtInTypes.array;
      var Path = fork.use(path_1.default);
      var Scope = fork.use(scope_1.default);
      var NodePath = function NodePath2(value, parentPath, name) {
        if (!(this instanceof NodePath2)) {
          throw new Error("NodePath constructor cannot be invoked without 'new'");
        }
        Path.call(this, value, parentPath, name);
      };
      var NPp = NodePath.prototype = Object.create(Path.prototype, {
        constructor: {
          value: NodePath,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      Object.defineProperties(NPp, {
        node: {
          get: function() {
            Object.defineProperty(this, "node", {
              configurable: true,
              value: this._computeNode()
            });
            return this.node;
          }
        },
        parent: {
          get: function() {
            Object.defineProperty(this, "parent", {
              configurable: true,
              value: this._computeParent()
            });
            return this.parent;
          }
        },
        scope: {
          get: function() {
            Object.defineProperty(this, "scope", {
              configurable: true,
              value: this._computeScope()
            });
            return this.scope;
          }
        }
      });
      NPp.replace = function() {
        delete this.node;
        delete this.parent;
        delete this.scope;
        return Path.prototype.replace.apply(this, arguments);
      };
      NPp.prune = function() {
        var remainingNodePath = this.parent;
        this.replace();
        return cleanUpNodesAfterPrune(remainingNodePath);
      };
      NPp._computeNode = function() {
        var value = this.value;
        if (n.Node.check(value)) {
          return value;
        }
        var pp = this.parentPath;
        return pp && pp.node || null;
      };
      NPp._computeParent = function() {
        var value = this.value;
        var pp = this.parentPath;
        if (!n.Node.check(value)) {
          while (pp && !n.Node.check(pp.value)) {
            pp = pp.parentPath;
          }
          if (pp) {
            pp = pp.parentPath;
          }
        }
        while (pp && !n.Node.check(pp.value)) {
          pp = pp.parentPath;
        }
        return pp || null;
      };
      NPp._computeScope = function() {
        var value = this.value;
        var pp = this.parentPath;
        var scope = pp && pp.scope;
        if (n.Node.check(value) && Scope.isEstablishedBy(value)) {
          scope = new Scope(this, scope);
        }
        return scope || null;
      };
      NPp.getValueProperty = function(name) {
        return types2.getFieldValue(this.value, name);
      };
      NPp.needsParens = function(assumeExpressionContext) {
        var pp = this.parentPath;
        if (!pp) {
          return false;
        }
        var node = this.value;
        if (!n.Expression.check(node)) {
          return false;
        }
        if (node.type === "Identifier") {
          return false;
        }
        while (!n.Node.check(pp.value)) {
          pp = pp.parentPath;
          if (!pp) {
            return false;
          }
        }
        var parent = pp.value;
        switch (node.type) {
          case "UnaryExpression":
          case "SpreadElement":
          case "SpreadProperty":
            return parent.type === "MemberExpression" && this.name === "object" && parent.object === node;
          case "BinaryExpression":
          case "LogicalExpression":
            switch (parent.type) {
              case "CallExpression":
                return this.name === "callee" && parent.callee === node;
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
                return true;
              case "MemberExpression":
                return this.name === "object" && parent.object === node;
              case "BinaryExpression":
              case "LogicalExpression": {
                var n_1 = node;
                var po = parent.operator;
                var pp_1 = PRECEDENCE[po];
                var no = n_1.operator;
                var np = PRECEDENCE[no];
                if (pp_1 > np) {
                  return true;
                }
                if (pp_1 === np && this.name === "right") {
                  if (parent.right !== n_1) {
                    throw new Error("Nodes must be equal");
                  }
                  return true;
                }
              }
              default:
                return false;
            }
          case "SequenceExpression":
            switch (parent.type) {
              case "ForStatement":
                return false;
              case "ExpressionStatement":
                return this.name !== "expression";
              default:
                return true;
            }
          case "YieldExpression":
            switch (parent.type) {
              case "BinaryExpression":
              case "LogicalExpression":
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
              case "CallExpression":
              case "MemberExpression":
              case "NewExpression":
              case "ConditionalExpression":
              case "YieldExpression":
                return true;
              default:
                return false;
            }
          case "Literal":
            return parent.type === "MemberExpression" && isNumber.check(node.value) && this.name === "object" && parent.object === node;
          case "AssignmentExpression":
          case "ConditionalExpression":
            switch (parent.type) {
              case "UnaryExpression":
              case "SpreadElement":
              case "SpreadProperty":
              case "BinaryExpression":
              case "LogicalExpression":
                return true;
              case "CallExpression":
                return this.name === "callee" && parent.callee === node;
              case "ConditionalExpression":
                return this.name === "test" && parent.test === node;
              case "MemberExpression":
                return this.name === "object" && parent.object === node;
              default:
                return false;
            }
          default:
            if (parent.type === "NewExpression" && this.name === "callee" && parent.callee === node) {
              return containsCallExpression(node);
            }
        }
        if (assumeExpressionContext !== true && !this.canBeFirstInStatement() && this.firstInStatement())
          return true;
        return false;
      };
      function isBinary(node) {
        return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
      }
      function isUnaryLike(node) {
        return n.UnaryExpression.check(node) || n.SpreadElement && n.SpreadElement.check(node) || n.SpreadProperty && n.SpreadProperty.check(node);
      }
      var PRECEDENCE = {};
      [
        ["||"],
        ["&&"],
        ["|"],
        ["^"],
        ["&"],
        ["==", "===", "!=", "!=="],
        ["<", ">", "<=", ">=", "in", "instanceof"],
        [">>", "<<", ">>>"],
        ["+", "-"],
        ["*", "/", "%"]
      ].forEach(function(tier, i) {
        tier.forEach(function(op) {
          PRECEDENCE[op] = i;
        });
      });
      function containsCallExpression(node) {
        if (n.CallExpression.check(node)) {
          return true;
        }
        if (isArray.check(node)) {
          return node.some(containsCallExpression);
        }
        if (n.Node.check(node)) {
          return types2.someField(node, function(_name, child) {
            return containsCallExpression(child);
          });
        }
        return false;
      }
      NPp.canBeFirstInStatement = function() {
        var node = this.node;
        return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
      };
      NPp.firstInStatement = function() {
        return firstInStatement(this);
      };
      function firstInStatement(path16) {
        for (var node, parent; path16.parent; path16 = path16.parent) {
          node = path16.node;
          parent = path16.parent.node;
          if (n.BlockStatement.check(parent) && path16.parent.name === "body" && path16.name === 0) {
            if (parent.body[0] !== node) {
              throw new Error("Nodes must be equal");
            }
            return true;
          }
          if (n.ExpressionStatement.check(parent) && path16.name === "expression") {
            if (parent.expression !== node) {
              throw new Error("Nodes must be equal");
            }
            return true;
          }
          if (n.SequenceExpression.check(parent) && path16.parent.name === "expressions" && path16.name === 0) {
            if (parent.expressions[0] !== node) {
              throw new Error("Nodes must be equal");
            }
            continue;
          }
          if (n.CallExpression.check(parent) && path16.name === "callee") {
            if (parent.callee !== node) {
              throw new Error("Nodes must be equal");
            }
            continue;
          }
          if (n.MemberExpression.check(parent) && path16.name === "object") {
            if (parent.object !== node) {
              throw new Error("Nodes must be equal");
            }
            continue;
          }
          if (n.ConditionalExpression.check(parent) && path16.name === "test") {
            if (parent.test !== node) {
              throw new Error("Nodes must be equal");
            }
            continue;
          }
          if (isBinary(parent) && path16.name === "left") {
            if (parent.left !== node) {
              throw new Error("Nodes must be equal");
            }
            continue;
          }
          if (n.UnaryExpression.check(parent) && !parent.prefix && path16.name === "argument") {
            if (parent.argument !== node) {
              throw new Error("Nodes must be equal");
            }
            continue;
          }
          return false;
        }
        return true;
      }
      function cleanUpNodesAfterPrune(remainingNodePath) {
        if (n.VariableDeclaration.check(remainingNodePath.node)) {
          var declarations = remainingNodePath.get("declarations").value;
          if (!declarations || declarations.length === 0) {
            return remainingNodePath.prune();
          }
        } else if (n.ExpressionStatement.check(remainingNodePath.node)) {
          if (!remainingNodePath.get("expression").value) {
            return remainingNodePath.prune();
          }
        } else if (n.IfStatement.check(remainingNodePath.node)) {
          cleanUpIfStatementAfterPrune(remainingNodePath);
        }
        return remainingNodePath;
      }
      function cleanUpIfStatementAfterPrune(ifStatement) {
        var testExpression = ifStatement.get("test").value;
        var alternate = ifStatement.get("alternate").value;
        var consequent = ifStatement.get("consequent").value;
        if (!consequent && !alternate) {
          var testExpressionStatement = b2.expressionStatement(testExpression);
          ifStatement.replace(testExpressionStatement);
        } else if (!consequent && alternate) {
          var negatedTestExpression = b2.unaryExpression("!", testExpression, true);
          if (n.UnaryExpression.check(testExpression) && testExpression.operator === "!") {
            negatedTestExpression = testExpression.argument;
          }
          ifStatement.get("test").replace(negatedTestExpression);
          ifStatement.get("consequent").replace(alternate);
          ifStatement.get("alternate").replace();
        }
      }
      return NodePath;
    }
    exports2.default = nodePathPlugin;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/path-visitor.js
var require_path_visitor = __commonJS({
  "node_modules/ast-types/lib/path-visitor.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    var node_path_1 = tslib_1.__importDefault(require_node_path());
    var shared_1 = require_shared();
    var hasOwn = Object.prototype.hasOwnProperty;
    function pathVisitorPlugin(fork) {
      var types2 = fork.use(types_1.default);
      var NodePath = fork.use(node_path_1.default);
      var isArray = types2.builtInTypes.array;
      var isObject = types2.builtInTypes.object;
      var isFunction = types2.builtInTypes.function;
      var undefined2;
      var PathVisitor = function PathVisitor2() {
        if (!(this instanceof PathVisitor2)) {
          throw new Error("PathVisitor constructor cannot be invoked without 'new'");
        }
        this._reusableContextStack = [];
        this._methodNameTable = computeMethodNameTable(this);
        this._shouldVisitComments = hasOwn.call(this._methodNameTable, "Block") || hasOwn.call(this._methodNameTable, "Line");
        this.Context = makeContextConstructor(this);
        this._visiting = false;
        this._changeReported = false;
      };
      function computeMethodNameTable(visitor) {
        var typeNames = /* @__PURE__ */ Object.create(null);
        for (var methodName in visitor) {
          if (/^visit[A-Z]/.test(methodName)) {
            typeNames[methodName.slice("visit".length)] = true;
          }
        }
        var supertypeTable = types2.computeSupertypeLookupTable(typeNames);
        var methodNameTable = /* @__PURE__ */ Object.create(null);
        var typeNameKeys = Object.keys(supertypeTable);
        var typeNameCount = typeNameKeys.length;
        for (var i = 0; i < typeNameCount; ++i) {
          var typeName = typeNameKeys[i];
          methodName = "visit" + supertypeTable[typeName];
          if (isFunction.check(visitor[methodName])) {
            methodNameTable[typeName] = methodName;
          }
        }
        return methodNameTable;
      }
      PathVisitor.fromMethodsObject = function fromMethodsObject(methods) {
        if (methods instanceof PathVisitor) {
          return methods;
        }
        if (!isObject.check(methods)) {
          return new PathVisitor();
        }
        var Visitor = function Visitor2() {
          if (!(this instanceof Visitor2)) {
            throw new Error("Visitor constructor cannot be invoked without 'new'");
          }
          PathVisitor.call(this);
        };
        var Vp = Visitor.prototype = Object.create(PVp);
        Vp.constructor = Visitor;
        extend(Vp, methods);
        extend(Visitor, PathVisitor);
        isFunction.assert(Visitor.fromMethodsObject);
        isFunction.assert(Visitor.visit);
        return new Visitor();
      };
      function extend(target, source) {
        for (var property in source) {
          if (hasOwn.call(source, property)) {
            target[property] = source[property];
          }
        }
        return target;
      }
      PathVisitor.visit = function visit3(node, methods) {
        return PathVisitor.fromMethodsObject(methods).visit(node);
      };
      var PVp = PathVisitor.prototype;
      PVp.visit = function() {
        if (this._visiting) {
          throw new Error("Recursively calling visitor.visit(path) resets visitor state. Try this.visit(path) or this.traverse(path) instead.");
        }
        this._visiting = true;
        this._changeReported = false;
        this._abortRequested = false;
        var argc = arguments.length;
        var args = new Array(argc);
        for (var i = 0; i < argc; ++i) {
          args[i] = arguments[i];
        }
        if (!(args[0] instanceof NodePath)) {
          args[0] = new NodePath({ root: args[0] }).get("root");
        }
        this.reset.apply(this, args);
        var didNotThrow;
        try {
          var root = this.visitWithoutReset(args[0]);
          didNotThrow = true;
        } finally {
          this._visiting = false;
          if (!didNotThrow && this._abortRequested) {
            return args[0].value;
          }
        }
        return root;
      };
      PVp.AbortRequest = function AbortRequest() {
      };
      PVp.abort = function() {
        var visitor = this;
        visitor._abortRequested = true;
        var request = new visitor.AbortRequest();
        request.cancel = function() {
          visitor._abortRequested = false;
        };
        throw request;
      };
      PVp.reset = function(_path) {
      };
      PVp.visitWithoutReset = function(path16) {
        if (this instanceof this.Context) {
          return this.visitor.visitWithoutReset(path16);
        }
        if (!(path16 instanceof NodePath)) {
          throw new Error("");
        }
        var value = path16.value;
        var methodName = value && typeof value === "object" && typeof value.type === "string" && this._methodNameTable[value.type];
        if (methodName) {
          var context = this.acquireContext(path16);
          try {
            return context.invokeVisitorMethod(methodName);
          } finally {
            this.releaseContext(context);
          }
        } else {
          return visitChildren(path16, this);
        }
      };
      function visitChildren(path16, visitor) {
        if (!(path16 instanceof NodePath)) {
          throw new Error("");
        }
        if (!(visitor instanceof PathVisitor)) {
          throw new Error("");
        }
        var value = path16.value;
        if (isArray.check(value)) {
          path16.each(visitor.visitWithoutReset, visitor);
        } else if (!isObject.check(value)) {
        } else {
          var childNames = types2.getFieldNames(value);
          if (visitor._shouldVisitComments && value.comments && childNames.indexOf("comments") < 0) {
            childNames.push("comments");
          }
          var childCount = childNames.length;
          var childPaths = [];
          for (var i = 0; i < childCount; ++i) {
            var childName = childNames[i];
            if (!hasOwn.call(value, childName)) {
              value[childName] = types2.getFieldValue(value, childName);
            }
            childPaths.push(path16.get(childName));
          }
          for (var i = 0; i < childCount; ++i) {
            visitor.visitWithoutReset(childPaths[i]);
          }
        }
        return path16.value;
      }
      PVp.acquireContext = function(path16) {
        if (this._reusableContextStack.length === 0) {
          return new this.Context(path16);
        }
        return this._reusableContextStack.pop().reset(path16);
      };
      PVp.releaseContext = function(context) {
        if (!(context instanceof this.Context)) {
          throw new Error("");
        }
        this._reusableContextStack.push(context);
        context.currentPath = null;
      };
      PVp.reportChanged = function() {
        this._changeReported = true;
      };
      PVp.wasChangeReported = function() {
        return this._changeReported;
      };
      function makeContextConstructor(visitor) {
        function Context(path16) {
          if (!(this instanceof Context)) {
            throw new Error("");
          }
          if (!(this instanceof PathVisitor)) {
            throw new Error("");
          }
          if (!(path16 instanceof NodePath)) {
            throw new Error("");
          }
          Object.defineProperty(this, "visitor", {
            value: visitor,
            writable: false,
            enumerable: true,
            configurable: false
          });
          this.currentPath = path16;
          this.needToCallTraverse = true;
          Object.seal(this);
        }
        if (!(visitor instanceof PathVisitor)) {
          throw new Error("");
        }
        var Cp = Context.prototype = Object.create(visitor);
        Cp.constructor = Context;
        extend(Cp, sharedContextProtoMethods);
        return Context;
      }
      var sharedContextProtoMethods = /* @__PURE__ */ Object.create(null);
      sharedContextProtoMethods.reset = function reset(path16) {
        if (!(this instanceof this.Context)) {
          throw new Error("");
        }
        if (!(path16 instanceof NodePath)) {
          throw new Error("");
        }
        this.currentPath = path16;
        this.needToCallTraverse = true;
        return this;
      };
      sharedContextProtoMethods.invokeVisitorMethod = function invokeVisitorMethod(methodName) {
        if (!(this instanceof this.Context)) {
          throw new Error("");
        }
        if (!(this.currentPath instanceof NodePath)) {
          throw new Error("");
        }
        var result = this.visitor[methodName].call(this, this.currentPath);
        if (result === false) {
          this.needToCallTraverse = false;
        } else if (result !== undefined2) {
          this.currentPath = this.currentPath.replace(result)[0];
          if (this.needToCallTraverse) {
            this.traverse(this.currentPath);
          }
        }
        if (this.needToCallTraverse !== false) {
          throw new Error("Must either call this.traverse or return false in " + methodName);
        }
        var path16 = this.currentPath;
        return path16 && path16.value;
      };
      sharedContextProtoMethods.traverse = function traverse2(path16, newVisitor) {
        if (!(this instanceof this.Context)) {
          throw new Error("");
        }
        if (!(path16 instanceof NodePath)) {
          throw new Error("");
        }
        if (!(this.currentPath instanceof NodePath)) {
          throw new Error("");
        }
        this.needToCallTraverse = false;
        return visitChildren(path16, PathVisitor.fromMethodsObject(newVisitor || this.visitor));
      };
      sharedContextProtoMethods.visit = function visit3(path16, newVisitor) {
        if (!(this instanceof this.Context)) {
          throw new Error("");
        }
        if (!(path16 instanceof NodePath)) {
          throw new Error("");
        }
        if (!(this.currentPath instanceof NodePath)) {
          throw new Error("");
        }
        this.needToCallTraverse = false;
        return PathVisitor.fromMethodsObject(newVisitor || this.visitor).visitWithoutReset(path16);
      };
      sharedContextProtoMethods.reportChanged = function reportChanged() {
        this.visitor.reportChanged();
      };
      sharedContextProtoMethods.abort = function abort() {
        this.needToCallTraverse = false;
        this.visitor.abort();
      };
      return PathVisitor;
    }
    exports2.default = pathVisitorPlugin;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/equiv.js
var require_equiv = __commonJS({
  "node_modules/ast-types/lib/equiv.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var types_1 = tslib_1.__importDefault(require_types());
    function default_1(fork) {
      var types2 = fork.use(types_1.default);
      var getFieldNames = types2.getFieldNames;
      var getFieldValue = types2.getFieldValue;
      var isArray = types2.builtInTypes.array;
      var isObject = types2.builtInTypes.object;
      var isDate = types2.builtInTypes.Date;
      var isRegExp = types2.builtInTypes.RegExp;
      var hasOwn = Object.prototype.hasOwnProperty;
      function astNodesAreEquivalent(a, b2, problemPath) {
        if (isArray.check(problemPath)) {
          problemPath.length = 0;
        } else {
          problemPath = null;
        }
        return areEquivalent(a, b2, problemPath);
      }
      astNodesAreEquivalent.assert = function(a, b2) {
        var problemPath = [];
        if (!astNodesAreEquivalent(a, b2, problemPath)) {
          if (problemPath.length === 0) {
            if (a !== b2) {
              throw new Error("Nodes must be equal");
            }
          } else {
            throw new Error("Nodes differ in the following path: " + problemPath.map(subscriptForProperty).join(""));
          }
        }
      };
      function subscriptForProperty(property) {
        if (/[_$a-z][_$a-z0-9]*/i.test(property)) {
          return "." + property;
        }
        return "[" + JSON.stringify(property) + "]";
      }
      function areEquivalent(a, b2, problemPath) {
        if (a === b2) {
          return true;
        }
        if (isArray.check(a)) {
          return arraysAreEquivalent(a, b2, problemPath);
        }
        if (isObject.check(a)) {
          return objectsAreEquivalent(a, b2, problemPath);
        }
        if (isDate.check(a)) {
          return isDate.check(b2) && +a === +b2;
        }
        if (isRegExp.check(a)) {
          return isRegExp.check(b2) && (a.source === b2.source && a.global === b2.global && a.multiline === b2.multiline && a.ignoreCase === b2.ignoreCase);
        }
        return a == b2;
      }
      function arraysAreEquivalent(a, b2, problemPath) {
        isArray.assert(a);
        var aLength = a.length;
        if (!isArray.check(b2) || b2.length !== aLength) {
          if (problemPath) {
            problemPath.push("length");
          }
          return false;
        }
        for (var i = 0; i < aLength; ++i) {
          if (problemPath) {
            problemPath.push(i);
          }
          if (i in a !== i in b2) {
            return false;
          }
          if (!areEquivalent(a[i], b2[i], problemPath)) {
            return false;
          }
          if (problemPath) {
            var problemPathTail = problemPath.pop();
            if (problemPathTail !== i) {
              throw new Error("" + problemPathTail);
            }
          }
        }
        return true;
      }
      function objectsAreEquivalent(a, b2, problemPath) {
        isObject.assert(a);
        if (!isObject.check(b2)) {
          return false;
        }
        if (a.type !== b2.type) {
          if (problemPath) {
            problemPath.push("type");
          }
          return false;
        }
        var aNames = getFieldNames(a);
        var aNameCount = aNames.length;
        var bNames = getFieldNames(b2);
        var bNameCount = bNames.length;
        if (aNameCount === bNameCount) {
          for (var i = 0; i < aNameCount; ++i) {
            var name = aNames[i];
            var aChild = getFieldValue(a, name);
            var bChild = getFieldValue(b2, name);
            if (problemPath) {
              problemPath.push(name);
            }
            if (!areEquivalent(aChild, bChild, problemPath)) {
              return false;
            }
            if (problemPath) {
              var problemPathTail = problemPath.pop();
              if (problemPathTail !== name) {
                throw new Error("" + problemPathTail);
              }
            }
          }
          return true;
        }
        if (!problemPath) {
          return false;
        }
        var seenNames = /* @__PURE__ */ Object.create(null);
        for (i = 0; i < aNameCount; ++i) {
          seenNames[aNames[i]] = true;
        }
        for (i = 0; i < bNameCount; ++i) {
          name = bNames[i];
          if (!hasOwn.call(seenNames, name)) {
            problemPath.push(name);
            return false;
          }
          delete seenNames[name];
        }
        for (name in seenNames) {
          problemPath.push(name);
          break;
        }
        return false;
      }
      return astNodesAreEquivalent;
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/fork.js
var require_fork = __commonJS({
  "node_modules/ast-types/lib/fork.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    var path_visitor_1 = tslib_1.__importDefault(require_path_visitor());
    var equiv_1 = tslib_1.__importDefault(require_equiv());
    var path_1 = tslib_1.__importDefault(require_path());
    var node_path_1 = tslib_1.__importDefault(require_node_path());
    var shared_1 = require_shared();
    function default_1(plugins) {
      var fork = createFork();
      var types2 = fork.use(types_1.default);
      plugins.forEach(fork.use);
      types2.finalize();
      var PathVisitor = fork.use(path_visitor_1.default);
      return {
        Type: types2.Type,
        builtInTypes: types2.builtInTypes,
        namedTypes: types2.namedTypes,
        builders: types2.builders,
        defineMethod: types2.defineMethod,
        getFieldNames: types2.getFieldNames,
        getFieldValue: types2.getFieldValue,
        eachField: types2.eachField,
        someField: types2.someField,
        getSupertypeNames: types2.getSupertypeNames,
        getBuilderName: types2.getBuilderName,
        astNodesAreEquivalent: fork.use(equiv_1.default),
        finalize: types2.finalize,
        Path: fork.use(path_1.default),
        NodePath: fork.use(node_path_1.default),
        PathVisitor,
        use: fork.use,
        visit: PathVisitor.visit
      };
    }
    exports2.default = default_1;
    function createFork() {
      var used = [];
      var usedResult = [];
      function use(plugin) {
        var idx = used.indexOf(plugin);
        if (idx === -1) {
          idx = used.length;
          used.push(plugin);
          usedResult[idx] = plugin(fork);
        }
        return usedResult[idx];
      }
      var fork = { use };
      return fork;
    }
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/operators/core.js
var require_core = __commonJS({
  "node_modules/ast-types/lib/def/operators/core.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var shared_1 = require_shared();
    function default_1() {
      return {
        BinaryOperators: [
          "==",
          "!=",
          "===",
          "!==",
          "<",
          "<=",
          ">",
          ">=",
          "<<",
          ">>",
          ">>>",
          "+",
          "-",
          "*",
          "/",
          "%",
          "&",
          "|",
          "^",
          "in",
          "instanceof"
        ],
        AssignmentOperators: [
          "=",
          "+=",
          "-=",
          "*=",
          "/=",
          "%=",
          "<<=",
          ">>=",
          ">>>=",
          "|=",
          "^=",
          "&="
        ],
        LogicalOperators: [
          "||",
          "&&"
        ]
      };
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/operators/es2016.js
var require_es2016 = __commonJS({
  "node_modules/ast-types/lib/def/operators/es2016.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var core_1 = tslib_1.__importDefault(require_core());
    function default_1(fork) {
      var result = fork.use(core_1.default);
      if (result.BinaryOperators.indexOf("**") < 0) {
        result.BinaryOperators.push("**");
      }
      if (result.AssignmentOperators.indexOf("**=") < 0) {
        result.AssignmentOperators.push("**=");
      }
      return result;
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/operators/es2020.js
var require_es2020 = __commonJS({
  "node_modules/ast-types/lib/def/operators/es2020.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var es2016_1 = tslib_1.__importDefault(require_es2016());
    function default_1(fork) {
      var result = fork.use(es2016_1.default);
      if (result.LogicalOperators.indexOf("??") < 0) {
        result.LogicalOperators.push("??");
      }
      return result;
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/operators/es2021.js
var require_es2021 = __commonJS({
  "node_modules/ast-types/lib/def/operators/es2021.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var shared_1 = require_shared();
    var es2020_1 = tslib_1.__importDefault(require_es2020());
    function default_1(fork) {
      var result = fork.use(es2020_1.default);
      result.LogicalOperators.forEach(function(op) {
        var assignOp = op + "=";
        if (result.AssignmentOperators.indexOf(assignOp) < 0) {
          result.AssignmentOperators.push(assignOp);
        }
      });
      return result;
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/core.js
var require_core2 = __commonJS({
  "node_modules/ast-types/lib/def/core.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var core_1 = tslib_1.__importDefault(require_core());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      var types2 = fork.use(types_1.default);
      var Type = types2.Type;
      var def = Type.def;
      var or = Type.or;
      var shared = fork.use(shared_1.default);
      var defaults = shared.defaults;
      var geq = shared.geq;
      var _a = fork.use(core_1.default), BinaryOperators = _a.BinaryOperators, AssignmentOperators = _a.AssignmentOperators, LogicalOperators = _a.LogicalOperators;
      def("Printable").field("loc", or(def("SourceLocation"), null), defaults["null"], true);
      def("Node").bases("Printable").field("type", String).field("comments", or([def("Comment")], null), defaults["null"], true);
      def("SourceLocation").field("start", def("Position")).field("end", def("Position")).field("source", or(String, null), defaults["null"]);
      def("Position").field("line", geq(1)).field("column", geq(0));
      def("File").bases("Node").build("program", "name").field("program", def("Program")).field("name", or(String, null), defaults["null"]);
      def("Program").bases("Node").build("body").field("body", [def("Statement")]);
      def("Function").bases("Node").field("id", or(def("Identifier"), null), defaults["null"]).field("params", [def("Pattern")]).field("body", def("BlockStatement")).field("generator", Boolean, defaults["false"]).field("async", Boolean, defaults["false"]);
      def("Statement").bases("Node");
      def("EmptyStatement").bases("Statement").build();
      def("BlockStatement").bases("Statement").build("body").field("body", [def("Statement")]);
      def("ExpressionStatement").bases("Statement").build("expression").field("expression", def("Expression"));
      def("IfStatement").bases("Statement").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Statement")).field("alternate", or(def("Statement"), null), defaults["null"]);
      def("LabeledStatement").bases("Statement").build("label", "body").field("label", def("Identifier")).field("body", def("Statement"));
      def("BreakStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults["null"]);
      def("ContinueStatement").bases("Statement").build("label").field("label", or(def("Identifier"), null), defaults["null"]);
      def("WithStatement").bases("Statement").build("object", "body").field("object", def("Expression")).field("body", def("Statement"));
      def("SwitchStatement").bases("Statement").build("discriminant", "cases", "lexical").field("discriminant", def("Expression")).field("cases", [def("SwitchCase")]).field("lexical", Boolean, defaults["false"]);
      def("ReturnStatement").bases("Statement").build("argument").field("argument", or(def("Expression"), null));
      def("ThrowStatement").bases("Statement").build("argument").field("argument", def("Expression"));
      def("TryStatement").bases("Statement").build("block", "handler", "finalizer").field("block", def("BlockStatement")).field("handler", or(def("CatchClause"), null), function() {
        return this.handlers && this.handlers[0] || null;
      }).field("handlers", [def("CatchClause")], function() {
        return this.handler ? [this.handler] : [];
      }, true).field("guardedHandlers", [def("CatchClause")], defaults.emptyArray).field("finalizer", or(def("BlockStatement"), null), defaults["null"]);
      def("CatchClause").bases("Node").build("param", "guard", "body").field("param", def("Pattern")).field("guard", or(def("Expression"), null), defaults["null"]).field("body", def("BlockStatement"));
      def("WhileStatement").bases("Statement").build("test", "body").field("test", def("Expression")).field("body", def("Statement"));
      def("DoWhileStatement").bases("Statement").build("body", "test").field("body", def("Statement")).field("test", def("Expression"));
      def("ForStatement").bases("Statement").build("init", "test", "update", "body").field("init", or(def("VariableDeclaration"), def("Expression"), null)).field("test", or(def("Expression"), null)).field("update", or(def("Expression"), null)).field("body", def("Statement"));
      def("ForInStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement"));
      def("DebuggerStatement").bases("Statement").build();
      def("Declaration").bases("Statement");
      def("FunctionDeclaration").bases("Function", "Declaration").build("id", "params", "body").field("id", def("Identifier"));
      def("FunctionExpression").bases("Function", "Expression").build("id", "params", "body");
      def("VariableDeclaration").bases("Declaration").build("kind", "declarations").field("kind", or("var", "let", "const")).field("declarations", [def("VariableDeclarator")]);
      def("VariableDeclarator").bases("Node").build("id", "init").field("id", def("Pattern")).field("init", or(def("Expression"), null), defaults["null"]);
      def("Expression").bases("Node");
      def("ThisExpression").bases("Expression").build();
      def("ArrayExpression").bases("Expression").build("elements").field("elements", [or(def("Expression"), null)]);
      def("ObjectExpression").bases("Expression").build("properties").field("properties", [def("Property")]);
      def("Property").bases("Node").build("kind", "key", "value").field("kind", or("init", "get", "set")).field("key", or(def("Literal"), def("Identifier"))).field("value", def("Expression"));
      def("SequenceExpression").bases("Expression").build("expressions").field("expressions", [def("Expression")]);
      var UnaryOperator = or("-", "+", "!", "~", "typeof", "void", "delete");
      def("UnaryExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UnaryOperator).field("argument", def("Expression")).field("prefix", Boolean, defaults["true"]);
      var BinaryOperator = or.apply(void 0, BinaryOperators);
      def("BinaryExpression").bases("Expression").build("operator", "left", "right").field("operator", BinaryOperator).field("left", def("Expression")).field("right", def("Expression"));
      var AssignmentOperator = or.apply(void 0, AssignmentOperators);
      def("AssignmentExpression").bases("Expression").build("operator", "left", "right").field("operator", AssignmentOperator).field("left", or(def("Pattern"), def("MemberExpression"))).field("right", def("Expression"));
      var UpdateOperator = or("++", "--");
      def("UpdateExpression").bases("Expression").build("operator", "argument", "prefix").field("operator", UpdateOperator).field("argument", def("Expression")).field("prefix", Boolean);
      var LogicalOperator = or.apply(void 0, LogicalOperators);
      def("LogicalExpression").bases("Expression").build("operator", "left", "right").field("operator", LogicalOperator).field("left", def("Expression")).field("right", def("Expression"));
      def("ConditionalExpression").bases("Expression").build("test", "consequent", "alternate").field("test", def("Expression")).field("consequent", def("Expression")).field("alternate", def("Expression"));
      def("NewExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression")).field("arguments", [def("Expression")]);
      def("CallExpression").bases("Expression").build("callee", "arguments").field("callee", def("Expression")).field("arguments", [def("Expression")]);
      def("MemberExpression").bases("Expression").build("object", "property", "computed").field("object", def("Expression")).field("property", or(def("Identifier"), def("Expression"))).field("computed", Boolean, function() {
        var type = this.property.type;
        if (type === "Literal" || type === "MemberExpression" || type === "BinaryExpression") {
          return true;
        }
        return false;
      });
      def("Pattern").bases("Node");
      def("SwitchCase").bases("Node").build("test", "consequent").field("test", or(def("Expression"), null)).field("consequent", [def("Statement")]);
      def("Identifier").bases("Expression", "Pattern").build("name").field("name", String).field("optional", Boolean, defaults["false"]);
      def("Literal").bases("Expression").build("value").field("value", or(String, Boolean, null, Number, RegExp, BigInt));
      def("Comment").bases("Printable").field("value", String).field("leading", Boolean, defaults["true"]).field("teailing", Boolean, defaults["false"]);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es6.js
var require_es6 = __commonJS({
  "node_modules/ast-types/lib/def/es6.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var core_1 = tslib_1.__importDefault(require_core2());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(core_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      def("Function").field("generator", Boolean, defaults["false"]).field("expression", Boolean, defaults["false"]).field("defaults", [or(def("Expression"), null)], defaults.emptyArray).field("rest", or(def("Identifier"), null), defaults["null"]);
      def("RestElement").bases("Pattern").build("argument").field("argument", def("Pattern")).field(
        "typeAnnotation",
        // for Babylon. Flow parser puts it on the identifier
        or(def("TypeAnnotation"), def("TSTypeAnnotation"), null),
        defaults["null"]
      );
      def("SpreadElementPattern").bases("Pattern").build("argument").field("argument", def("Pattern"));
      def("FunctionDeclaration").build("id", "params", "body", "generator", "expression").field("id", or(def("Identifier"), null));
      def("FunctionExpression").build("id", "params", "body", "generator", "expression");
      def("ArrowFunctionExpression").bases("Function", "Expression").build("params", "body", "expression").field("id", null, defaults["null"]).field("body", or(def("BlockStatement"), def("Expression"))).field("generator", false, defaults["false"]);
      def("ForOfStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Pattern"))).field("right", def("Expression")).field("body", def("Statement"));
      def("YieldExpression").bases("Expression").build("argument", "delegate").field("argument", or(def("Expression"), null)).field("delegate", Boolean, defaults["false"]);
      def("GeneratorExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [def("ComprehensionBlock")]).field("filter", or(def("Expression"), null));
      def("ComprehensionExpression").bases("Expression").build("body", "blocks", "filter").field("body", def("Expression")).field("blocks", [def("ComprehensionBlock")]).field("filter", or(def("Expression"), null));
      def("ComprehensionBlock").bases("Node").build("left", "right", "each").field("left", def("Pattern")).field("right", def("Expression")).field("each", Boolean);
      def("Property").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field("method", Boolean, defaults["false"]).field("shorthand", Boolean, defaults["false"]).field("computed", Boolean, defaults["false"]);
      def("ObjectProperty").field("shorthand", Boolean, defaults["false"]);
      def("PropertyPattern").bases("Pattern").build("key", "pattern").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("pattern", def("Pattern")).field("computed", Boolean, defaults["false"]);
      def("ObjectPattern").bases("Pattern").build("properties").field("properties", [or(def("PropertyPattern"), def("Property"))]);
      def("ArrayPattern").bases("Pattern").build("elements").field("elements", [or(def("Pattern"), null)]);
      def("SpreadElement").bases("Node").build("argument").field("argument", def("Expression"));
      def("ArrayExpression").field("elements", [or(def("Expression"), def("SpreadElement"), def("RestElement"), null)]);
      def("NewExpression").field("arguments", [or(def("Expression"), def("SpreadElement"))]);
      def("CallExpression").field("arguments", [or(def("Expression"), def("SpreadElement"))]);
      def("AssignmentPattern").bases("Pattern").build("left", "right").field("left", def("Pattern")).field("right", def("Expression"));
      def("MethodDefinition").bases("Declaration").build("kind", "key", "value", "static").field("kind", or("constructor", "method", "get", "set")).field("key", def("Expression")).field("value", def("Function")).field("computed", Boolean, defaults["false"]).field("static", Boolean, defaults["false"]);
      var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("StaticBlock"));
      def("ClassProperty").bases("Declaration").build("key").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("computed", Boolean, defaults["false"]);
      def("ClassPropertyDefinition").bases("Declaration").build("definition").field("definition", ClassBodyElement);
      def("ClassBody").bases("Declaration").build("body").field("body", [ClassBodyElement]);
      def("ClassDeclaration").bases("Declaration").build("id", "body", "superClass").field("id", or(def("Identifier"), null)).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults["null"]);
      def("ClassExpression").bases("Expression").build("id", "body", "superClass").field("id", or(def("Identifier"), null), defaults["null"]).field("body", def("ClassBody")).field("superClass", or(def("Expression"), null), defaults["null"]);
      def("Super").bases("Expression").build();
      def("Specifier").bases("Node");
      def("ModuleSpecifier").bases("Specifier").field("local", or(def("Identifier"), null), defaults["null"]).field("id", or(def("Identifier"), null), defaults["null"]).field("name", or(def("Identifier"), null), defaults["null"]);
      def("ImportSpecifier").bases("ModuleSpecifier").build("imported", "local").field("imported", def("Identifier"));
      def("ImportDefaultSpecifier").bases("ModuleSpecifier").build("local");
      def("ImportNamespaceSpecifier").bases("ModuleSpecifier").build("local");
      def("ImportDeclaration").bases("Declaration").build("specifiers", "source", "importKind").field("specifiers", [or(def("ImportSpecifier"), def("ImportNamespaceSpecifier"), def("ImportDefaultSpecifier"))], defaults.emptyArray).field("source", def("Literal")).field("importKind", or("value", "type"), function() {
        return "value";
      });
      def("ExportNamedDeclaration").bases("Declaration").build("declaration", "specifiers", "source").field("declaration", or(def("Declaration"), null)).field("specifiers", [def("ExportSpecifier")], defaults.emptyArray).field("source", or(def("Literal"), null), defaults["null"]);
      def("ExportSpecifier").bases("ModuleSpecifier").build("local", "exported").field("exported", def("Identifier"));
      def("ExportDefaultDeclaration").bases("Declaration").build("declaration").field("declaration", or(def("Declaration"), def("Expression")));
      def("ExportAllDeclaration").bases("Declaration").build("source").field("source", def("Literal"));
      def("TaggedTemplateExpression").bases("Expression").build("tag", "quasi").field("tag", def("Expression")).field("quasi", def("TemplateLiteral"));
      def("TemplateLiteral").bases("Expression").build("quasis", "expressions").field("quasis", [def("TemplateElement")]).field("expressions", [def("Expression")]);
      def("TemplateElement").bases("Node").build("value", "tail").field("value", { "cooked": String, "raw": String }).field("tail", Boolean);
      def("MetaProperty").bases("Expression").build("meta", "property").field("meta", def("Identifier")).field("property", def("Identifier"));
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2016.js
var require_es20162 = __commonJS({
  "node_modules/ast-types/lib/def/es2016.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2016_1 = tslib_1.__importDefault(require_es2016());
    var es6_1 = tslib_1.__importDefault(require_es6());
    var shared_1 = require_shared();
    function default_1(fork) {
      fork.use(es2016_1.default);
      fork.use(es6_1.default);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2017.js
var require_es2017 = __commonJS({
  "node_modules/ast-types/lib/def/es2017.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2016_1 = tslib_1.__importDefault(require_es20162());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es2016_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var defaults = fork.use(shared_1.default).defaults;
      def("Function").field("async", Boolean, defaults["false"]);
      def("AwaitExpression").bases("Expression").build("argument").field("argument", def("Expression"));
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2018.js
var require_es2018 = __commonJS({
  "node_modules/ast-types/lib/def/es2018.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2017_1 = tslib_1.__importDefault(require_es2017());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es2017_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      def("ForOfStatement").field("await", Boolean, defaults["false"]);
      def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression"));
      def("ObjectExpression").field("properties", [or(
        def("Property"),
        def("SpreadProperty"),
        // Legacy
        def("SpreadElement")
      )]);
      def("TemplateElement").field("value", { "cooked": or(String, null), "raw": String });
      def("SpreadPropertyPattern").bases("Pattern").build("argument").field("argument", def("Pattern"));
      def("ObjectPattern").field("properties", [or(def("PropertyPattern"), def("Property"), def("RestElement"), def("SpreadPropertyPattern"))]);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2019.js
var require_es2019 = __commonJS({
  "node_modules/ast-types/lib/def/es2019.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2018_1 = tslib_1.__importDefault(require_es2018());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es2018_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      def("CatchClause").field("param", or(def("Pattern"), null), defaults["null"]);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2020.js
var require_es20202 = __commonJS({
  "node_modules/ast-types/lib/def/es2020.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2020_1 = tslib_1.__importDefault(require_es2020());
    var es2019_1 = tslib_1.__importDefault(require_es2019());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es2020_1.default);
      fork.use(es2019_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var shared = fork.use(shared_1.default);
      var defaults = shared.defaults;
      def("ImportExpression").bases("Expression").build("source").field("source", def("Expression"));
      def("ExportAllDeclaration").bases("Declaration").build("source", "exported").field("source", def("Literal")).field("exported", or(def("Identifier"), null, void 0), defaults["null"]);
      def("ChainElement").bases("Node").field("optional", Boolean, defaults["false"]);
      def("CallExpression").bases("Expression", "ChainElement");
      def("MemberExpression").bases("Expression", "ChainElement");
      def("ChainExpression").bases("Expression").build("expression").field("expression", def("ChainElement"));
      def("OptionalCallExpression").bases("CallExpression").build("callee", "arguments", "optional").field("optional", Boolean, defaults["true"]);
      def("OptionalMemberExpression").bases("MemberExpression").build("object", "property", "computed", "optional").field("optional", Boolean, defaults["true"]);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2021.js
var require_es20212 = __commonJS({
  "node_modules/ast-types/lib/def/es2021.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2021_1 = tslib_1.__importDefault(require_es2021());
    var es2020_1 = tslib_1.__importDefault(require_es20202());
    var shared_1 = require_shared();
    function default_1(fork) {
      fork.use(es2021_1.default);
      fork.use(es2020_1.default);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es2022.js
var require_es2022 = __commonJS({
  "node_modules/ast-types/lib/def/es2022.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es2021_1 = tslib_1.__importDefault(require_es20212());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = require_shared();
    function default_1(fork) {
      fork.use(es2021_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      def("StaticBlock").bases("Declaration").build("body").field("body", [def("Statement")]);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/es-proposals.js
var require_es_proposals = __commonJS({
  "node_modules/ast-types/lib/def/es-proposals.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    var es2022_1 = tslib_1.__importDefault(require_es2022());
    function default_1(fork) {
      fork.use(es2022_1.default);
      var types2 = fork.use(types_1.default);
      var Type = types2.Type;
      var def = types2.Type.def;
      var or = Type.or;
      var shared = fork.use(shared_1.default);
      var defaults = shared.defaults;
      def("AwaitExpression").build("argument", "all").field("argument", or(def("Expression"), null)).field("all", Boolean, defaults["false"]);
      def("Decorator").bases("Node").build("expression").field("expression", def("Expression"));
      def("Property").field("decorators", or([def("Decorator")], null), defaults["null"]);
      def("MethodDefinition").field("decorators", or([def("Decorator")], null), defaults["null"]);
      def("PrivateName").bases("Expression", "Pattern").build("id").field("id", def("Identifier"));
      def("ClassPrivateProperty").bases("ClassProperty").build("key", "value").field("key", def("PrivateName")).field("value", or(def("Expression"), null), defaults["null"]);
      def("ImportAttribute").bases("Node").build("key", "value").field("key", or(def("Identifier"), def("Literal"))).field("value", def("Expression"));
      [
        "ImportDeclaration",
        "ExportAllDeclaration",
        "ExportNamedDeclaration"
      ].forEach(function(decl) {
        def(decl).field("assertions", [def("ImportAttribute")], defaults.emptyArray);
      });
      def("RecordExpression").bases("Expression").build("properties").field("properties", [or(def("ObjectProperty"), def("ObjectMethod"), def("SpreadElement"))]);
      def("TupleExpression").bases("Expression").build("elements").field("elements", [or(def("Expression"), def("SpreadElement"), null)]);
      def("ModuleExpression").bases("Node").build("body").field("body", def("Program"));
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/jsx.js
var require_jsx = __commonJS({
  "node_modules/ast-types/lib/def/jsx.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es_proposals_1 = tslib_1.__importDefault(require_es_proposals());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es_proposals_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      def("JSXAttribute").bases("Node").build("name", "value").field("name", or(def("JSXIdentifier"), def("JSXNamespacedName"))).field("value", or(
        def("Literal"),
        // attr="value"
        def("JSXExpressionContainer"),
        // attr={value}
        def("JSXElement"),
        // attr=<div />
        def("JSXFragment"),
        // attr=<></>
        null
        // attr= or just attr
      ), defaults["null"]);
      def("JSXIdentifier").bases("Identifier").build("name").field("name", String);
      def("JSXNamespacedName").bases("Node").build("namespace", "name").field("namespace", def("JSXIdentifier")).field("name", def("JSXIdentifier"));
      def("JSXMemberExpression").bases("MemberExpression").build("object", "property").field("object", or(def("JSXIdentifier"), def("JSXMemberExpression"))).field("property", def("JSXIdentifier")).field("computed", Boolean, defaults.false);
      var JSXElementName = or(def("JSXIdentifier"), def("JSXNamespacedName"), def("JSXMemberExpression"));
      def("JSXSpreadAttribute").bases("Node").build("argument").field("argument", def("Expression"));
      var JSXAttributes = [or(def("JSXAttribute"), def("JSXSpreadAttribute"))];
      def("JSXExpressionContainer").bases("Expression").build("expression").field("expression", or(def("Expression"), def("JSXEmptyExpression")));
      var JSXChildren = [or(
        def("JSXText"),
        def("JSXExpressionContainer"),
        def("JSXSpreadChild"),
        def("JSXElement"),
        def("JSXFragment"),
        def("Literal")
        // Legacy: Esprima should return JSXText instead.
      )];
      def("JSXElement").bases("Expression").build("openingElement", "closingElement", "children").field("openingElement", def("JSXOpeningElement")).field("closingElement", or(def("JSXClosingElement"), null), defaults["null"]).field("children", JSXChildren, defaults.emptyArray).field("name", JSXElementName, function() {
        return this.openingElement.name;
      }, true).field("selfClosing", Boolean, function() {
        return this.openingElement.selfClosing;
      }, true).field("attributes", JSXAttributes, function() {
        return this.openingElement.attributes;
      }, true);
      def("JSXOpeningElement").bases("Node").build("name", "attributes", "selfClosing").field("name", JSXElementName).field("attributes", JSXAttributes, defaults.emptyArray).field("selfClosing", Boolean, defaults["false"]);
      def("JSXClosingElement").bases("Node").build("name").field("name", JSXElementName);
      def("JSXFragment").bases("Expression").build("openingFragment", "closingFragment", "children").field("openingFragment", def("JSXOpeningFragment")).field("closingFragment", def("JSXClosingFragment")).field("children", JSXChildren, defaults.emptyArray);
      def("JSXOpeningFragment").bases("Node").build();
      def("JSXClosingFragment").bases("Node").build();
      def("JSXText").bases("Literal").build("value", "raw").field("value", String).field("raw", String, function() {
        return this.value;
      });
      def("JSXEmptyExpression").bases("Node").build();
      def("JSXSpreadChild").bases("Node").build("expression").field("expression", def("Expression"));
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/type-annotations.js
var require_type_annotations = __commonJS({
  "node_modules/ast-types/lib/def/type-annotations.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      var TypeAnnotation = or(def("TypeAnnotation"), def("TSTypeAnnotation"), null);
      var TypeParamDecl = or(def("TypeParameterDeclaration"), def("TSTypeParameterDeclaration"), null);
      def("Identifier").field("typeAnnotation", TypeAnnotation, defaults["null"]);
      def("ObjectPattern").field("typeAnnotation", TypeAnnotation, defaults["null"]);
      def("Function").field("returnType", TypeAnnotation, defaults["null"]).field("typeParameters", TypeParamDecl, defaults["null"]);
      def("ClassProperty").build("key", "value", "typeAnnotation", "static").field("value", or(def("Expression"), null)).field("static", Boolean, defaults["false"]).field("typeAnnotation", TypeAnnotation, defaults["null"]);
      [
        "ClassDeclaration",
        "ClassExpression"
      ].forEach(function(typeName) {
        def(typeName).field("typeParameters", TypeParamDecl, defaults["null"]).field("superTypeParameters", or(def("TypeParameterInstantiation"), def("TSTypeParameterInstantiation"), null), defaults["null"]).field("implements", or([def("ClassImplements")], [def("TSExpressionWithTypeArguments")]), defaults.emptyArray);
      });
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/flow.js
var require_flow = __commonJS({
  "node_modules/ast-types/lib/def/flow.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es_proposals_1 = tslib_1.__importDefault(require_es_proposals());
    var type_annotations_1 = tslib_1.__importDefault(require_type_annotations());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es_proposals_1.default);
      fork.use(type_annotations_1.default);
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      def("Flow").bases("Node");
      def("FlowType").bases("Flow");
      def("AnyTypeAnnotation").bases("FlowType").build();
      def("EmptyTypeAnnotation").bases("FlowType").build();
      def("MixedTypeAnnotation").bases("FlowType").build();
      def("VoidTypeAnnotation").bases("FlowType").build();
      def("SymbolTypeAnnotation").bases("FlowType").build();
      def("NumberTypeAnnotation").bases("FlowType").build();
      def("BigIntTypeAnnotation").bases("FlowType").build();
      def("NumberLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", Number).field("raw", String);
      def("NumericLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", Number).field("raw", String);
      def("BigIntLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", null).field("raw", String);
      def("StringTypeAnnotation").bases("FlowType").build();
      def("StringLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", String).field("raw", String);
      def("BooleanTypeAnnotation").bases("FlowType").build();
      def("BooleanLiteralTypeAnnotation").bases("FlowType").build("value", "raw").field("value", Boolean).field("raw", String);
      def("TypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation", def("FlowType"));
      def("NullableTypeAnnotation").bases("FlowType").build("typeAnnotation").field("typeAnnotation", def("FlowType"));
      def("NullLiteralTypeAnnotation").bases("FlowType").build();
      def("NullTypeAnnotation").bases("FlowType").build();
      def("ThisTypeAnnotation").bases("FlowType").build();
      def("ExistsTypeAnnotation").bases("FlowType").build();
      def("ExistentialTypeParam").bases("FlowType").build();
      def("FunctionTypeAnnotation").bases("FlowType").build("params", "returnType", "rest", "typeParameters").field("params", [def("FunctionTypeParam")]).field("returnType", def("FlowType")).field("rest", or(def("FunctionTypeParam"), null)).field("typeParameters", or(def("TypeParameterDeclaration"), null));
      def("FunctionTypeParam").bases("Node").build("name", "typeAnnotation", "optional").field("name", or(def("Identifier"), null)).field("typeAnnotation", def("FlowType")).field("optional", Boolean);
      def("ArrayTypeAnnotation").bases("FlowType").build("elementType").field("elementType", def("FlowType"));
      def("ObjectTypeAnnotation").bases("FlowType").build("properties", "indexers", "callProperties").field("properties", [
        or(def("ObjectTypeProperty"), def("ObjectTypeSpreadProperty"))
      ]).field("indexers", [def("ObjectTypeIndexer")], defaults.emptyArray).field("callProperties", [def("ObjectTypeCallProperty")], defaults.emptyArray).field("inexact", or(Boolean, void 0), defaults["undefined"]).field("exact", Boolean, defaults["false"]).field("internalSlots", [def("ObjectTypeInternalSlot")], defaults.emptyArray);
      def("Variance").bases("Node").build("kind").field("kind", or("plus", "minus"));
      var LegacyVariance = or(def("Variance"), "plus", "minus", null);
      def("ObjectTypeProperty").bases("Node").build("key", "value", "optional").field("key", or(def("Literal"), def("Identifier"))).field("value", def("FlowType")).field("optional", Boolean).field("variance", LegacyVariance, defaults["null"]);
      def("ObjectTypeIndexer").bases("Node").build("id", "key", "value").field("id", def("Identifier")).field("key", def("FlowType")).field("value", def("FlowType")).field("variance", LegacyVariance, defaults["null"]).field("static", Boolean, defaults["false"]);
      def("ObjectTypeCallProperty").bases("Node").build("value").field("value", def("FunctionTypeAnnotation")).field("static", Boolean, defaults["false"]);
      def("QualifiedTypeIdentifier").bases("Node").build("qualification", "id").field("qualification", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("id", def("Identifier"));
      def("GenericTypeAnnotation").bases("FlowType").build("id", "typeParameters").field("id", or(def("Identifier"), def("QualifiedTypeIdentifier"))).field("typeParameters", or(def("TypeParameterInstantiation"), null));
      def("MemberTypeAnnotation").bases("FlowType").build("object", "property").field("object", def("Identifier")).field("property", or(def("MemberTypeAnnotation"), def("GenericTypeAnnotation")));
      def("IndexedAccessType").bases("FlowType").build("objectType", "indexType").field("objectType", def("FlowType")).field("indexType", def("FlowType"));
      def("OptionalIndexedAccessType").bases("FlowType").build("objectType", "indexType", "optional").field("objectType", def("FlowType")).field("indexType", def("FlowType")).field("optional", Boolean);
      def("UnionTypeAnnotation").bases("FlowType").build("types").field("types", [def("FlowType")]);
      def("IntersectionTypeAnnotation").bases("FlowType").build("types").field("types", [def("FlowType")]);
      def("TypeofTypeAnnotation").bases("FlowType").build("argument").field("argument", def("FlowType"));
      def("ObjectTypeSpreadProperty").bases("Node").build("argument").field("argument", def("FlowType"));
      def("ObjectTypeInternalSlot").bases("Node").build("id", "value", "optional", "static", "method").field("id", def("Identifier")).field("value", def("FlowType")).field("optional", Boolean).field("static", Boolean).field("method", Boolean);
      def("TypeParameterDeclaration").bases("Node").build("params").field("params", [def("TypeParameter")]);
      def("TypeParameterInstantiation").bases("Node").build("params").field("params", [def("FlowType")]);
      def("TypeParameter").bases("FlowType").build("name", "variance", "bound", "default").field("name", String).field("variance", LegacyVariance, defaults["null"]).field("bound", or(def("TypeAnnotation"), null), defaults["null"]).field("default", or(def("FlowType"), null), defaults["null"]);
      def("ClassProperty").field("variance", LegacyVariance, defaults["null"]);
      def("ClassImplements").bases("Node").build("id").field("id", def("Identifier")).field("superClass", or(def("Expression"), null), defaults["null"]).field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults["null"]);
      def("InterfaceTypeAnnotation").bases("FlowType").build("body", "extends").field("body", def("ObjectTypeAnnotation")).field("extends", or([def("InterfaceExtends")], null), defaults["null"]);
      def("InterfaceDeclaration").bases("Declaration").build("id", "body", "extends").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null), defaults["null"]).field("body", def("ObjectTypeAnnotation")).field("extends", [def("InterfaceExtends")]);
      def("DeclareInterface").bases("InterfaceDeclaration").build("id", "body", "extends");
      def("InterfaceExtends").bases("Node").build("id").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterInstantiation"), null), defaults["null"]);
      def("TypeAlias").bases("Declaration").build("id", "typeParameters", "right").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null)).field("right", def("FlowType"));
      def("DeclareTypeAlias").bases("TypeAlias").build("id", "typeParameters", "right");
      def("OpaqueType").bases("Declaration").build("id", "typeParameters", "impltype", "supertype").field("id", def("Identifier")).field("typeParameters", or(def("TypeParameterDeclaration"), null)).field("impltype", def("FlowType")).field("supertype", or(def("FlowType"), null));
      def("DeclareOpaqueType").bases("OpaqueType").build("id", "typeParameters", "supertype").field("impltype", or(def("FlowType"), null));
      def("TypeCastExpression").bases("Expression").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TypeAnnotation"));
      def("TupleTypeAnnotation").bases("FlowType").build("types").field("types", [def("FlowType")]);
      def("DeclareVariable").bases("Statement").build("id").field("id", def("Identifier"));
      def("DeclareFunction").bases("Statement").build("id").field("id", def("Identifier")).field("predicate", or(def("FlowPredicate"), null), defaults["null"]);
      def("DeclareClass").bases("InterfaceDeclaration").build("id");
      def("DeclareModule").bases("Statement").build("id", "body").field("id", or(def("Identifier"), def("Literal"))).field("body", def("BlockStatement"));
      def("DeclareModuleExports").bases("Statement").build("typeAnnotation").field("typeAnnotation", def("TypeAnnotation"));
      def("DeclareExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(
        def("DeclareVariable"),
        def("DeclareFunction"),
        def("DeclareClass"),
        def("FlowType"),
        // Implies default.
        def("TypeAlias"),
        // Implies named type
        def("DeclareOpaqueType"),
        // Implies named opaque type
        def("InterfaceDeclaration"),
        null
      )).field("specifiers", [or(def("ExportSpecifier"), def("ExportBatchSpecifier"))], defaults.emptyArray).field("source", or(def("Literal"), null), defaults["null"]);
      def("DeclareExportAllDeclaration").bases("Declaration").build("source").field("source", or(def("Literal"), null), defaults["null"]);
      def("ImportDeclaration").field("importKind", or("value", "type", "typeof"), function() {
        return "value";
      });
      def("FlowPredicate").bases("Flow");
      def("InferredPredicate").bases("FlowPredicate").build();
      def("DeclaredPredicate").bases("FlowPredicate").build("value").field("value", def("Expression"));
      def("Function").field("predicate", or(def("FlowPredicate"), null), defaults["null"]);
      def("CallExpression").field("typeArguments", or(null, def("TypeParameterInstantiation")), defaults["null"]);
      def("NewExpression").field("typeArguments", or(null, def("TypeParameterInstantiation")), defaults["null"]);
      def("EnumDeclaration").bases("Declaration").build("id", "body").field("id", def("Identifier")).field("body", or(def("EnumBooleanBody"), def("EnumNumberBody"), def("EnumStringBody"), def("EnumSymbolBody")));
      def("EnumBooleanBody").build("members", "explicitType").field("members", [def("EnumBooleanMember")]).field("explicitType", Boolean);
      def("EnumNumberBody").build("members", "explicitType").field("members", [def("EnumNumberMember")]).field("explicitType", Boolean);
      def("EnumStringBody").build("members", "explicitType").field("members", or([def("EnumStringMember")], [def("EnumDefaultedMember")])).field("explicitType", Boolean);
      def("EnumSymbolBody").build("members").field("members", [def("EnumDefaultedMember")]);
      def("EnumBooleanMember").build("id", "init").field("id", def("Identifier")).field("init", or(def("Literal"), Boolean));
      def("EnumNumberMember").build("id", "init").field("id", def("Identifier")).field("init", def("Literal"));
      def("EnumStringMember").build("id", "init").field("id", def("Identifier")).field("init", def("Literal"));
      def("EnumDefaultedMember").build("id").field("id", def("Identifier"));
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/esprima.js
var require_esprima = __commonJS({
  "node_modules/ast-types/lib/def/esprima.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es_proposals_1 = tslib_1.__importDefault(require_es_proposals());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(es_proposals_1.default);
      var types2 = fork.use(types_1.default);
      var defaults = fork.use(shared_1.default).defaults;
      var def = types2.Type.def;
      var or = types2.Type.or;
      def("VariableDeclaration").field("declarations", [or(
        def("VariableDeclarator"),
        def("Identifier")
        // Esprima deviation.
      )]);
      def("Property").field("value", or(
        def("Expression"),
        def("Pattern")
        // Esprima deviation.
      ));
      def("ArrayPattern").field("elements", [or(def("Pattern"), def("SpreadElement"), null)]);
      def("ObjectPattern").field("properties", [or(
        def("Property"),
        def("PropertyPattern"),
        def("SpreadPropertyPattern"),
        def("SpreadProperty")
        // Used by Esprima.
      )]);
      def("ExportSpecifier").bases("ModuleSpecifier").build("id", "name");
      def("ExportBatchSpecifier").bases("Specifier").build();
      def("ExportDeclaration").bases("Declaration").build("default", "declaration", "specifiers", "source").field("default", Boolean).field("declaration", or(
        def("Declaration"),
        def("Expression"),
        // Implies default.
        null
      )).field("specifiers", [or(def("ExportSpecifier"), def("ExportBatchSpecifier"))], defaults.emptyArray).field("source", or(def("Literal"), null), defaults["null"]);
      def("Block").bases("Comment").build(
        "value",
        /*optional:*/
        "leading",
        "teailing"
      );
      def("Line").bases("Comment").build(
        "value",
        /*optional:*/
        "leading",
        "teailing"
      );
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/babel-core.js
var require_babel_core = __commonJS({
  "node_modules/ast-types/lib/def/babel-core.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var es_proposals_1 = tslib_1.__importDefault(require_es_proposals());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      var _a, _b, _c, _d, _e;
      fork.use(es_proposals_1.default);
      var types2 = fork.use(types_1.default);
      var defaults = fork.use(shared_1.default).defaults;
      var def = types2.Type.def;
      var or = types2.Type.or;
      var isUndefined = types2.builtInTypes.undefined;
      def("Noop").bases("Statement").build();
      def("DoExpression").bases("Expression").build("body").field("body", [def("Statement")]);
      def("BindExpression").bases("Expression").build("object", "callee").field("object", or(def("Expression"), null)).field("callee", def("Expression"));
      def("ParenthesizedExpression").bases("Expression").build("expression").field("expression", def("Expression"));
      def("ExportNamespaceSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier"));
      def("ExportDefaultSpecifier").bases("Specifier").build("exported").field("exported", def("Identifier"));
      def("CommentBlock").bases("Comment").build(
        "value",
        /*optional:*/
        "leading",
        "teailing"
      );
      def("CommentLine").bases("Comment").build(
        "value",
        /*optional:*/
        "leading",
        "teailing"
      );
      def("Directive").bases("Node").build("value").field("value", def("DirectiveLiteral"));
      def("DirectiveLiteral").bases("Node", "Expression").build("value").field("value", String, defaults["use strict"]);
      def("InterpreterDirective").bases("Node").build("value").field("value", String);
      def("BlockStatement").bases("Statement").build("body").field("body", [def("Statement")]).field("directives", [def("Directive")], defaults.emptyArray);
      def("Program").bases("Node").build("body").field("body", [def("Statement")]).field("directives", [def("Directive")], defaults.emptyArray).field("interpreter", or(def("InterpreterDirective"), null), defaults["null"]);
      function makeLiteralExtra(rawValueType, toRaw) {
        if (rawValueType === void 0) {
          rawValueType = String;
        }
        return [
          "extra",
          {
            rawValue: rawValueType,
            raw: String
          },
          function getDefault() {
            var value = types2.getFieldValue(this, "value");
            return {
              rawValue: value,
              raw: toRaw ? toRaw(value) : String(value)
            };
          }
        ];
      }
      (_a = def("StringLiteral").bases("Literal").build("value").field("value", String)).field.apply(_a, makeLiteralExtra(String, function(val) {
        return JSON.stringify(val);
      }));
      (_b = def("NumericLiteral").bases("Literal").build("value").field("value", Number).field("raw", or(String, null), defaults["null"])).field.apply(_b, makeLiteralExtra(Number));
      (_c = def("BigIntLiteral").bases("Literal").build("value").field("value", or(String, Number))).field.apply(_c, makeLiteralExtra(String, function(val) {
        return val + "n";
      }));
      (_d = def("DecimalLiteral").bases("Literal").build("value").field("value", String)).field.apply(_d, makeLiteralExtra(String, function(val) {
        return val + "m";
      }));
      def("NullLiteral").bases("Literal").build().field("value", null, defaults["null"]);
      def("BooleanLiteral").bases("Literal").build("value").field("value", Boolean);
      (_e = def("RegExpLiteral").bases("Literal").build("pattern", "flags").field("pattern", String).field("flags", String).field("value", RegExp, function() {
        return new RegExp(this.pattern, this.flags);
      })).field.apply(_e, makeLiteralExtra(or(RegExp, isUndefined), function(exp) {
        return "/".concat(exp.pattern, "/").concat(exp.flags || "");
      })).field("regex", {
        pattern: String,
        flags: String
      }, function() {
        return {
          pattern: this.pattern,
          flags: this.flags
        };
      });
      var ObjectExpressionProperty = or(def("Property"), def("ObjectMethod"), def("ObjectProperty"), def("SpreadProperty"), def("SpreadElement"));
      def("ObjectExpression").bases("Expression").build("properties").field("properties", [ObjectExpressionProperty]);
      def("ObjectMethod").bases("Node", "Function").build("kind", "key", "params", "body", "computed").field("kind", or("method", "get", "set")).field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("params", [def("Pattern")]).field("body", def("BlockStatement")).field("computed", Boolean, defaults["false"]).field("generator", Boolean, defaults["false"]).field("async", Boolean, defaults["false"]).field(
        "accessibility",
        // TypeScript
        or(def("Literal"), null),
        defaults["null"]
      ).field("decorators", or([def("Decorator")], null), defaults["null"]);
      def("ObjectProperty").bases("Node").build("key", "value").field("key", or(def("Literal"), def("Identifier"), def("Expression"))).field("value", or(def("Expression"), def("Pattern"))).field(
        "accessibility",
        // TypeScript
        or(def("Literal"), null),
        defaults["null"]
      ).field("computed", Boolean, defaults["false"]);
      var ClassBodyElement = or(def("MethodDefinition"), def("VariableDeclarator"), def("ClassPropertyDefinition"), def("ClassProperty"), def("ClassPrivateProperty"), def("ClassMethod"), def("ClassPrivateMethod"), def("ClassAccessorProperty"), def("StaticBlock"));
      def("ClassBody").bases("Declaration").build("body").field("body", [ClassBodyElement]);
      def("ClassMethod").bases("Declaration", "Function").build("kind", "key", "params", "body", "computed", "static").field("key", or(def("Literal"), def("Identifier"), def("Expression")));
      def("ClassPrivateMethod").bases("Declaration", "Function").build("key", "params", "body", "kind", "computed", "static").field("key", def("PrivateName"));
      def("ClassAccessorProperty").bases("Declaration").build("key", "value", "decorators", "computed", "static").field("key", or(
        def("Literal"),
        def("Identifier"),
        def("PrivateName"),
        // Only when .computed is true (TODO enforce this)
        def("Expression")
      )).field("value", or(def("Expression"), null), defaults["null"]);
      [
        "ClassMethod",
        "ClassPrivateMethod"
      ].forEach(function(typeName) {
        def(typeName).field("kind", or("get", "set", "method", "constructor"), function() {
          return "method";
        }).field("body", def("BlockStatement")).field("access", or("public", "private", "protected", null), defaults["null"]);
      });
      [
        "ClassMethod",
        "ClassPrivateMethod",
        "ClassAccessorProperty"
      ].forEach(function(typeName) {
        def(typeName).field("computed", Boolean, defaults["false"]).field("static", Boolean, defaults["false"]).field("abstract", Boolean, defaults["false"]).field("accessibility", or("public", "private", "protected", null), defaults["null"]).field("decorators", or([def("Decorator")], null), defaults["null"]).field("definite", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("override", Boolean, defaults["false"]).field("readonly", Boolean, defaults["false"]);
      });
      var ObjectPatternProperty = or(
        def("Property"),
        def("PropertyPattern"),
        def("SpreadPropertyPattern"),
        def("SpreadProperty"),
        // Used by Esprima
        def("ObjectProperty"),
        // Babel 6
        def("RestProperty"),
        // Babel 6
        def("RestElement")
      );
      def("ObjectPattern").bases("Pattern").build("properties").field("properties", [ObjectPatternProperty]).field("decorators", or([def("Decorator")], null), defaults["null"]);
      def("SpreadProperty").bases("Node").build("argument").field("argument", def("Expression"));
      def("RestProperty").bases("Node").build("argument").field("argument", def("Expression"));
      def("ForAwaitStatement").bases("Statement").build("left", "right", "body").field("left", or(def("VariableDeclaration"), def("Expression"))).field("right", def("Expression")).field("body", def("Statement"));
      def("Import").bases("Expression").build();
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/babel.js
var require_babel = __commonJS({
  "node_modules/ast-types/lib/def/babel.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var types_1 = tslib_1.__importDefault(require_types());
    var babel_core_1 = tslib_1.__importDefault(require_babel_core());
    var flow_1 = tslib_1.__importDefault(require_flow());
    var shared_1 = require_shared();
    function default_1(fork) {
      var types2 = fork.use(types_1.default);
      var def = types2.Type.def;
      fork.use(babel_core_1.default);
      fork.use(flow_1.default);
      def("V8IntrinsicIdentifier").bases("Expression").build("name").field("name", String);
      def("TopicReference").bases("Expression").build();
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/def/typescript.js
var require_typescript = __commonJS({
  "node_modules/ast-types/lib/def/typescript.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var babel_core_1 = tslib_1.__importDefault(require_babel_core());
    var type_annotations_1 = tslib_1.__importDefault(require_type_annotations());
    var types_1 = tslib_1.__importDefault(require_types());
    var shared_1 = tslib_1.__importStar(require_shared());
    function default_1(fork) {
      fork.use(babel_core_1.default);
      fork.use(type_annotations_1.default);
      var types2 = fork.use(types_1.default);
      var n = types2.namedTypes;
      var def = types2.Type.def;
      var or = types2.Type.or;
      var defaults = fork.use(shared_1.default).defaults;
      var StringLiteral = types2.Type.from(function(value, deep) {
        if (n.StringLiteral && n.StringLiteral.check(value, deep)) {
          return true;
        }
        if (n.Literal && n.Literal.check(value, deep) && typeof value.value === "string") {
          return true;
        }
        return false;
      }, "StringLiteral");
      def("TSType").bases("Node");
      var TSEntityName = or(def("Identifier"), def("TSQualifiedName"));
      def("TSTypeReference").bases("TSType", "TSHasOptionalTypeParameterInstantiation").build("typeName", "typeParameters").field("typeName", TSEntityName);
      def("TSHasOptionalTypeParameterInstantiation").field("typeParameters", or(def("TSTypeParameterInstantiation"), null), defaults["null"]);
      def("TSHasOptionalTypeParameters").field("typeParameters", or(def("TSTypeParameterDeclaration"), null, void 0), defaults["null"]);
      def("TSHasOptionalTypeAnnotation").field("typeAnnotation", or(def("TSTypeAnnotation"), null), defaults["null"]);
      def("TSQualifiedName").bases("Node").build("left", "right").field("left", TSEntityName).field("right", TSEntityName);
      def("TSAsExpression").bases("Expression", "Pattern").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TSType")).field("extra", or({ parenthesized: Boolean }, null), defaults["null"]);
      def("TSTypeCastExpression").bases("Expression").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TSType"));
      def("TSSatisfiesExpression").bases("Expression", "Pattern").build("expression", "typeAnnotation").field("expression", def("Expression")).field("typeAnnotation", def("TSType"));
      def("TSNonNullExpression").bases("Expression", "Pattern").build("expression").field("expression", def("Expression"));
      [
        "TSAnyKeyword",
        "TSBigIntKeyword",
        "TSBooleanKeyword",
        "TSNeverKeyword",
        "TSNullKeyword",
        "TSNumberKeyword",
        "TSObjectKeyword",
        "TSStringKeyword",
        "TSSymbolKeyword",
        "TSUndefinedKeyword",
        "TSUnknownKeyword",
        "TSVoidKeyword",
        "TSIntrinsicKeyword",
        "TSThisType"
      ].forEach(function(keywordType) {
        def(keywordType).bases("TSType").build();
      });
      def("TSArrayType").bases("TSType").build("elementType").field("elementType", def("TSType"));
      def("TSLiteralType").bases("TSType").build("literal").field("literal", or(def("NumericLiteral"), def("StringLiteral"), def("BooleanLiteral"), def("TemplateLiteral"), def("UnaryExpression"), def("BigIntLiteral")));
      def("TemplateLiteral").field("expressions", or([def("Expression")], [def("TSType")]));
      [
        "TSUnionType",
        "TSIntersectionType"
      ].forEach(function(typeName) {
        def(typeName).bases("TSType").build("types").field("types", [def("TSType")]);
      });
      def("TSConditionalType").bases("TSType").build("checkType", "extendsType", "trueType", "falseType").field("checkType", def("TSType")).field("extendsType", def("TSType")).field("trueType", def("TSType")).field("falseType", def("TSType"));
      def("TSInferType").bases("TSType").build("typeParameter").field("typeParameter", def("TSTypeParameter"));
      def("TSParenthesizedType").bases("TSType").build("typeAnnotation").field("typeAnnotation", def("TSType"));
      var ParametersType = [or(def("Identifier"), def("RestElement"), def("ArrayPattern"), def("ObjectPattern"))];
      [
        "TSFunctionType",
        "TSConstructorType"
      ].forEach(function(typeName) {
        def(typeName).bases("TSType", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation").build("parameters").field("parameters", ParametersType);
      });
      def("TSDeclareFunction").bases("Declaration", "TSHasOptionalTypeParameters").build("id", "params", "returnType").field("declare", Boolean, defaults["false"]).field("async", Boolean, defaults["false"]).field("generator", Boolean, defaults["false"]).field("id", or(def("Identifier"), null), defaults["null"]).field("params", [def("Pattern")]).field("returnType", or(
        def("TSTypeAnnotation"),
        def("Noop"),
        // Still used?
        null
      ), defaults["null"]);
      def("TSDeclareMethod").bases("Declaration", "TSHasOptionalTypeParameters").build("key", "params", "returnType").field("async", Boolean, defaults["false"]).field("generator", Boolean, defaults["false"]).field("params", [def("Pattern")]).field("abstract", Boolean, defaults["false"]).field("accessibility", or("public", "private", "protected", void 0), defaults["undefined"]).field("static", Boolean, defaults["false"]).field("computed", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("key", or(
        def("Identifier"),
        def("StringLiteral"),
        def("NumericLiteral"),
        // Only allowed if .computed is true.
        def("Expression")
      )).field("kind", or("get", "set", "method", "constructor"), function getDefault() {
        return "method";
      }).field(
        "access",
        // Not "accessibility"?
        or("public", "private", "protected", void 0),
        defaults["undefined"]
      ).field("decorators", or([def("Decorator")], null), defaults["null"]).field("returnType", or(
        def("TSTypeAnnotation"),
        def("Noop"),
        // Still used?
        null
      ), defaults["null"]);
      def("TSMappedType").bases("TSType").build("typeParameter", "typeAnnotation").field("readonly", or(Boolean, "+", "-"), defaults["false"]).field("typeParameter", def("TSTypeParameter")).field("optional", or(Boolean, "+", "-"), defaults["false"]).field("typeAnnotation", or(def("TSType"), null), defaults["null"]);
      def("TSTupleType").bases("TSType").build("elementTypes").field("elementTypes", [or(def("TSType"), def("TSNamedTupleMember"))]);
      def("TSNamedTupleMember").bases("TSType").build("label", "elementType", "optional").field("label", def("Identifier")).field("optional", Boolean, defaults["false"]).field("elementType", def("TSType"));
      def("TSRestType").bases("TSType").build("typeAnnotation").field("typeAnnotation", def("TSType"));
      def("TSOptionalType").bases("TSType").build("typeAnnotation").field("typeAnnotation", def("TSType"));
      def("TSIndexedAccessType").bases("TSType").build("objectType", "indexType").field("objectType", def("TSType")).field("indexType", def("TSType"));
      def("TSTypeOperator").bases("TSType").build("operator").field("operator", String).field("typeAnnotation", def("TSType"));
      def("TSTypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation", or(def("TSType"), def("TSTypeAnnotation")));
      def("TSIndexSignature").bases("Declaration", "TSHasOptionalTypeAnnotation").build("parameters", "typeAnnotation").field("parameters", [def("Identifier")]).field("readonly", Boolean, defaults["false"]);
      def("TSPropertySignature").bases("Declaration", "TSHasOptionalTypeAnnotation").build("key", "typeAnnotation", "optional").field("key", def("Expression")).field("computed", Boolean, defaults["false"]).field("readonly", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("initializer", or(def("Expression"), null), defaults["null"]);
      def("TSMethodSignature").bases("Declaration", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation").build("key", "parameters", "typeAnnotation").field("key", def("Expression")).field("computed", Boolean, defaults["false"]).field("optional", Boolean, defaults["false"]).field("parameters", ParametersType);
      def("TSTypePredicate").bases("TSTypeAnnotation", "TSType").build("parameterName", "typeAnnotation", "asserts").field("parameterName", or(def("Identifier"), def("TSThisType"))).field("typeAnnotation", or(def("TSTypeAnnotation"), null), defaults["null"]).field("asserts", Boolean, defaults["false"]);
      [
        "TSCallSignatureDeclaration",
        "TSConstructSignatureDeclaration"
      ].forEach(function(typeName) {
        def(typeName).bases("Declaration", "TSHasOptionalTypeParameters", "TSHasOptionalTypeAnnotation").build("parameters", "typeAnnotation").field("parameters", ParametersType);
      });
      def("TSEnumMember").bases("Node").build("id", "initializer").field("id", or(def("Identifier"), StringLiteral)).field("initializer", or(def("Expression"), null), defaults["null"]);
      def("TSTypeQuery").bases("TSType").build("exprName").field("exprName", or(TSEntityName, def("TSImportType")));
      var TSTypeMember = or(def("TSCallSignatureDeclaration"), def("TSConstructSignatureDeclaration"), def("TSIndexSignature"), def("TSMethodSignature"), def("TSPropertySignature"));
      def("TSTypeLiteral").bases("TSType").build("members").field("members", [TSTypeMember]);
      def("TSTypeParameter").bases("Identifier").build("name", "consteaint", "default").field("name", or(def("Identifier"), String)).field("consteaint", or(def("TSType"), void 0), defaults["undefined"]).field("default", or(def("TSType"), void 0), defaults["undefined"]);
      def("TSTypeAssertion").bases("Expression", "Pattern").build("typeAnnotation", "expression").field("typeAnnotation", def("TSType")).field("expression", def("Expression")).field("extra", or({ parenthesized: Boolean }, null), defaults["null"]);
      def("TSTypeParameterDeclaration").bases("Declaration").build("params").field("params", [def("TSTypeParameter")]);
      def("TSInstantiationExpression").bases("Expression", "TSHasOptionalTypeParameterInstantiation").build("expression", "typeParameters").field("expression", def("Expression"));
      def("TSTypeParameterInstantiation").bases("Node").build("params").field("params", [def("TSType")]);
      def("TSEnumDeclaration").bases("Declaration").build("id", "members").field("id", def("Identifier")).field("const", Boolean, defaults["false"]).field("declare", Boolean, defaults["false"]).field("members", [def("TSEnumMember")]).field("initializer", or(def("Expression"), null), defaults["null"]);
      def("TSTypeAliasDeclaration").bases("Declaration", "TSHasOptionalTypeParameters").build("id", "typeAnnotation").field("id", def("Identifier")).field("declare", Boolean, defaults["false"]).field("typeAnnotation", def("TSType"));
      def("TSModuleBlock").bases("Node").build("body").field("body", [def("Statement")]);
      def("TSModuleDeclaration").bases("Declaration").build("id", "body").field("id", or(StringLiteral, TSEntityName)).field("declare", Boolean, defaults["false"]).field("global", Boolean, defaults["false"]).field("body", or(def("TSModuleBlock"), def("TSModuleDeclaration"), null), defaults["null"]);
      def("TSImportType").bases("TSType", "TSHasOptionalTypeParameterInstantiation").build("argument", "qualifier", "typeParameters").field("argument", StringLiteral).field("qualifier", or(TSEntityName, void 0), defaults["undefined"]);
      def("TSImportEqualsDeclaration").bases("Declaration").build("id", "moduleReference").field("id", def("Identifier")).field("isExport", Boolean, defaults["false"]).field("moduleReference", or(TSEntityName, def("TSExternalModuleReference")));
      def("TSExternalModuleReference").bases("Declaration").build("expression").field("expression", StringLiteral);
      def("TSExportAssignment").bases("Statement").build("expression").field("expression", def("Expression"));
      def("TSNamespaceExportDeclaration").bases("Declaration").build("id").field("id", def("Identifier"));
      def("TSInterfaceBody").bases("Node").build("body").field("body", [TSTypeMember]);
      def("TSExpressionWithTypeArguments").bases("TSType", "TSHasOptionalTypeParameterInstantiation").build("expression", "typeParameters").field("expression", TSEntityName);
      def("TSInterfaceDeclaration").bases("Declaration", "TSHasOptionalTypeParameters").build("id", "body").field("id", TSEntityName).field("declare", Boolean, defaults["false"]).field("extends", or([def("TSExpressionWithTypeArguments")], null), defaults["null"]).field("body", def("TSInterfaceBody"));
      def("TSParameterProperty").bases("Pattern").build("parameter").field("accessibility", or("public", "private", "protected", void 0), defaults["undefined"]).field("readonly", Boolean, defaults["false"]).field("parameter", or(def("Identifier"), def("AssignmentPattern")));
      def("ClassProperty").field(
        "access",
        // Not "accessibility"?
        or("public", "private", "protected", void 0),
        defaults["undefined"]
      );
      def("ClassAccessorProperty").bases("Declaration", "TSHasOptionalTypeAnnotation");
      def("ClassBody").field("body", [or(
        def("MethodDefinition"),
        def("VariableDeclarator"),
        def("ClassPropertyDefinition"),
        def("ClassProperty"),
        def("ClassPrivateProperty"),
        def("ClassAccessorProperty"),
        def("ClassMethod"),
        def("ClassPrivateMethod"),
        def("StaticBlock"),
        // Just need to add these types:
        def("TSDeclareMethod"),
        TSTypeMember
      )]);
    }
    exports2.default = default_1;
    (0, shared_1.maybeSetModuleExports)(function() {
      return module2;
    });
  }
});

// node_modules/ast-types/lib/gen/namedTypes.js
var require_namedTypes = __commonJS({
  "node_modules/ast-types/lib/gen/namedTypes.js"(exports2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.namedTypes = void 0;
    var namedTypes;
    /* @__PURE__ */ (function(namedTypes2) {
    })(namedTypes = exports2.namedTypes || (exports2.namedTypes = {}));
  }
});

// node_modules/ast-types/lib/main.js
var require_main = __commonJS({
  "node_modules/ast-types/lib/main.js"(exports2) {
    "use strict";
    init_cjs_shims();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.visit = exports2.use = exports2.Type = exports2.someField = exports2.PathVisitor = exports2.Path = exports2.NodePath = exports2.namedTypes = exports2.getSupertypeNames = exports2.getFieldValue = exports2.getFieldNames = exports2.getBuilderName = exports2.finalize = exports2.eachField = exports2.defineMethod = exports2.builtInTypes = exports2.builders = exports2.astNodesAreEquivalent = void 0;
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
    var fork_1 = tslib_1.__importDefault(require_fork());
    var es_proposals_1 = tslib_1.__importDefault(require_es_proposals());
    var jsx_1 = tslib_1.__importDefault(require_jsx());
    var flow_1 = tslib_1.__importDefault(require_flow());
    var esprima_1 = tslib_1.__importDefault(require_esprima());
    var babel_1 = tslib_1.__importDefault(require_babel());
    var typescript_1 = tslib_1.__importDefault(require_typescript());
    var namedTypes_1 = require_namedTypes();
    Object.defineProperty(exports2, "namedTypes", { enumerable: true, get: function() {
      return namedTypes_1.namedTypes;
    } });
    var _a = (0, fork_1.default)([
      // Feel free to add to or remove from this list of extension modules to
      // configure the precise type hierarchy that you need.
      es_proposals_1.default,
      jsx_1.default,
      flow_1.default,
      esprima_1.default,
      babel_1.default,
      typescript_1.default
    ]);
    var astNodesAreEquivalent = _a.astNodesAreEquivalent;
    var builders = _a.builders;
    var builtInTypes = _a.builtInTypes;
    var defineMethod = _a.defineMethod;
    var eachField = _a.eachField;
    var finalize = _a.finalize;
    var getBuilderName = _a.getBuilderName;
    var getFieldNames = _a.getFieldNames;
    var getFieldValue = _a.getFieldValue;
    var getSupertypeNames = _a.getSupertypeNames;
    var n = _a.namedTypes;
    var NodePath = _a.NodePath;
    var Path = _a.Path;
    var PathVisitor = _a.PathVisitor;
    var someField = _a.someField;
    var Type = _a.Type;
    var use = _a.use;
    var visit3 = _a.visit;
    exports2.astNodesAreEquivalent = astNodesAreEquivalent;
    exports2.builders = builders;
    exports2.builtInTypes = builtInTypes;
    exports2.defineMethod = defineMethod;
    exports2.eachField = eachField;
    exports2.finalize = finalize;
    exports2.getBuilderName = getBuilderName;
    exports2.getFieldNames = getFieldNames;
    exports2.getFieldValue = getFieldValue;
    exports2.getSupertypeNames = getSupertypeNames;
    exports2.NodePath = NodePath;
    exports2.Path = Path;
    exports2.PathVisitor = PathVisitor;
    exports2.someField = someField;
    exports2.Type = Type;
    exports2.use = use;
    exports2.visit = visit3;
    Object.assign(namedTypes_1.namedTypes, n);
  }
});

// src/core/transformer.ts
function isNestedInsideComponent(nodePath) {
  let current = nodePath.parent;
  while (current) {
    const node = current.node;
    const parent = current.parent?.node;
    const isFn = node?.type === "FunctionDeclaration" || node?.type === "FunctionExpression" || node?.type === "ArrowFunctionExpression";
    if (isFn && isComponentFunction(node, parent)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}
function hasUseClientDirective(programBody) {
  const firstStatement = programBody[0];
  return firstStatement?.type === "ExpressionStatement" && firstStatement?.expression?.type === "StringLiteral" && firstStatement?.expression?.value === "use client";
}
function addUseClientDirective(programBody) {
  if (hasUseClientDirective(programBody)) return;
  programBody.unshift({
    type: "ExpressionStatement",
    expression: import_ast_types.builders.literal("use client"),
    directive: "use client"
  });
}
function buildTCall(key) {
  return import_ast_types.builders.callExpression(import_ast_types.builders.identifier("t"), [import_ast_types.builders.literal(key)]);
}
function buildTCallWithParams(key, params) {
  const props = params.map((param) => {
    const prop = import_ast_types.builders.property("init", import_ast_types.builders.identifier(param), import_ast_types.builders.identifier(param));
    prop.shorthand = true;
    return prop;
  });
  return import_ast_types.builders.callExpression(import_ast_types.builders.identifier("t"), [
    import_ast_types.builders.literal(key),
    import_ast_types.builders.objectExpression(props)
  ]);
}
function buildI18nTCall(key) {
  return import_ast_types.builders.callExpression(
    import_ast_types.builders.memberExpression(import_ast_types.builders.identifier("i18n"), import_ast_types.builders.identifier("t")),
    [import_ast_types.builders.literal(key)]
  );
}
function buildI18nTCallWithParams(key, params) {
  const props = params.map((param) => {
    const prop = import_ast_types.builders.property("init", import_ast_types.builders.identifier(param), import_ast_types.builders.identifier(param));
    prop.shorthand = true;
    return prop;
  });
  return import_ast_types.builders.callExpression(
    import_ast_types.builders.memberExpression(import_ast_types.builders.identifier("i18n"), import_ast_types.builders.identifier("t")),
    [import_ast_types.builders.literal(key), import_ast_types.builders.objectExpression(props)]
  );
}
function buildJSXExpression(call) {
  return import_ast_types.builders.jsxExpressionContainer(call);
}
function buildUseTranslationImport() {
  return import_ast_types.builders.importDeclaration(
    [
      import_ast_types.builders.importSpecifier(
        import_ast_types.builders.identifier("useTranslation"),
        import_ast_types.builders.identifier("useTranslation")
      )
    ],
    import_ast_types.builders.literal("react-i18next")
  );
}
function buildUseTranslationCall() {
  const prop = import_ast_types.builders.property("init", import_ast_types.builders.identifier("t"), import_ast_types.builders.identifier("t"));
  prop.shorthand = true;
  return import_ast_types.builders.variableDeclaration("const", [
    import_ast_types.builders.variableDeclarator(
      import_ast_types.builders.objectPattern([prop]),
      import_ast_types.builders.callExpression(import_ast_types.builders.identifier("useTranslation"), [])
    )
  ]);
}
function buildTFunctionImport() {
  return import_ast_types.builders.importDeclaration(
    [import_ast_types.builders.importSpecifier(import_ast_types.builders.identifier("TFunction"), import_ast_types.builders.identifier("TFunction"))],
    import_ast_types.builders.literal("i18next")
  );
}
function buildTFunctionParam() {
  const param = import_ast_types.builders.identifier("t");
  param.typeAnnotation = {
    type: "TSTypeAnnotation",
    typeAnnotation: {
      type: "TSTypeReference",
      typeName: {
        type: "Identifier",
        name: "TFunction"
      }
    }
  };
  return param;
}
function findExtracted(value, filePath, fileStrings, sourceType) {
  return fileStrings.find(
    (s) => s.filePath === filePath && s.originalText === value.trim() && (sourceType ? s.sourceType === sourceType : true)
  );
}
function findExtractedTemplate(node, filePath, fileStrings) {
  let text = "";
  let argIndex = 0;
  node.quasis.forEach((quasi, i) => {
    text += quasi.value.cooked ?? quasi.value.raw;
    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      let paramName;
      if (expr.type === "Identifier") {
        paramName = expr.name;
      } else if (expr.type === "MemberExpression" && expr.property.type === "Identifier") {
        paramName = expr.property.name;
      } else {
        paramName = `arg${argIndex++}`;
      }
      text += `{{${paramName}}}`;
    }
  });
  return fileStrings.find(
    (s) => s.filePath === filePath && s.originalText === text.trim()
  );
}
function resolveI18nImportPath(filePath, appRoot, config) {
  const i18nAbs = import_path9.default.join(appRoot, config.i18nFilePath ?? "src/i18n.ts");
  let rel = import_path9.default.relative(import_path9.default.dirname(filePath), i18nAbs).replace(/\\/g, "/");
  rel = rel.replace(/\.(ts|tsx|js|jsx)$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}
function hasDefaultImport(programBody, source, localName) {
  return programBody.some(
    (node) => node.type === "ImportDeclaration" && node.source.value === source && node.specifiers?.some(
      (spec) => spec.type === "ImportDefaultSpecifier" && spec.local?.name === localName
    )
  );
}
function addDefaultImport(programBody, source, localName, buildFn) {
  if (hasDefaultImport(programBody, source, localName)) return;
  let lastImportIndex = -1;
  for (let i = 0; i < programBody.length; i++) {
    if (programBody[i].type === "ImportDeclaration") lastImportIndex = i;
  }
  const node = buildFn();
  if (lastImportIndex >= 0) {
    programBody.splice(lastImportIndex + 1, 0, node);
  } else {
    if (hasUseClientDirective(programBody)) {
      programBody.splice(1, 0, node);
    } else {
      programBody.unshift(node);
    }
  }
}
function hasTDeclaration(statements) {
  return statements.some((stmt) => {
    if (stmt.type !== "VariableDeclaration") return false;
    return stmt.declarations.some((decl) => {
      if (decl.id?.type !== "ObjectPattern") return false;
      if (decl.init?.type !== "CallExpression") return false;
      if (decl.init?.callee?.name !== "useTranslation") return false;
      return decl.id.properties?.some(
        (prop) => prop.key?.name === "t" || prop.value?.name === "t"
      );
    });
  });
}
function injectTDeclaration(blockBody) {
  if (hasTDeclaration(blockBody)) return;
  blockBody.unshift(buildUseTranslationCall());
}
function isComponentFunction(node, parent) {
  if (node.body?.type !== "BlockStatement") return false;
  if (node.type === "FunctionDeclaration" && node.id?.name) {
    return /^[A-Z]/.test(node.id.name);
  }
  if (parent?.type === "VariableDeclarator" && parent.id?.type === "Identifier" && /^[A-Z]/.test(parent.id.name)) {
    return true;
  }
  if (parent?.type === "ExportDefaultDeclaration") return true;
  return false;
}
function isHelperFunction(node, parent) {
  if (node.body?.type !== "BlockStatement") return false;
  if (node.type === "FunctionDeclaration" && node.id?.name) {
    return /^[a-z]/.test(node.id.name);
  }
  if (parent?.type === "VariableDeclarator" && parent.id?.type === "Identifier" && /^[a-z]/.test(parent.id.name)) {
    return true;
  }
  return false;
}
function getHelperName(node, parent) {
  if (node.type === "FunctionDeclaration" && node.id?.name) {
    return node.id.name;
  }
  if (parent?.type === "VariableDeclarator" && parent.id?.type === "Identifier") {
    return parent.id.name;
  }
  return null;
}
function alreadyHasTParam(node) {
  return node.params?.some(
    (p) => p.type === "Identifier" && p.name === "t"
  );
}
function buildCallForExtracted(extracted, useI18nInstance) {
  if (useI18nInstance) {
    return extracted.params.length > 0 ? buildI18nTCallWithParams(extracted.fullKey, extracted.params) : buildI18nTCall(extracted.fullKey);
  }
  return extracted.params.length > 0 ? buildTCallWithParams(extracted.fullKey, extracted.params) : buildTCall(extracted.fullKey);
}
function replaceStringNode(node, filePath, fileStrings, sourceType, options = {}) {
  if (!node) return [node, 0];
  const useI18n = options.useI18nInstance === true;
  if (node.type === "StringLiteral" || node.type === "Literal") {
    const value = node.value;
    if (typeof value !== "string") return [node, 0];
    const extracted = findExtracted(value, filePath, fileStrings, sourceType);
    if (!extracted) return [node, 0];
    return [buildCallForExtracted(extracted, useI18n), 1];
  }
  if (node.type === "TemplateLiteral") {
    const onlyIds = (node.expressions ?? []).every(
      (expr) => expr.type === "Identifier"
    );
    if (onlyIds) {
      const extracted = findExtractedTemplate(node, filePath, fileStrings);
      if (!extracted) return [node, 0];
      return [buildCallForExtracted(extracted, useI18n), 1];
    }
    let count = 0;
    for (let i = 0; i < node.expressions.length; i++) {
      const [newExpr, c] = replaceStringNode(
        node.expressions[i],
        filePath,
        fileStrings,
        sourceType,
        options
      );
      if (c > 0) {
        node.expressions[i] = newExpr;
        count += c;
      }
    }
    return [node, count];
  }
  if (node.type === "ConditionalExpression") {
    let count = 0;
    const [newConsequent, c1] = replaceStringNode(
      node.consequent,
      filePath,
      fileStrings,
      sourceType,
      options
    );
    if (c1 > 0) {
      node.consequent = newConsequent;
      count += c1;
    }
    const [newAlternate, c2] = replaceStringNode(
      node.alternate,
      filePath,
      fileStrings,
      sourceType,
      options
    );
    if (c2 > 0) {
      node.alternate = newAlternate;
      count += c2;
    }
    return [node, count];
  }
  if (node.type === "LogicalExpression") {
    let count = 0;
    const [newLeft, c1] = replaceStringNode(
      node.left,
      filePath,
      fileStrings,
      sourceType,
      options
    );
    if (c1 > 0) {
      node.left = newLeft;
      count += c1;
    }
    const [newRight, c2] = replaceStringNode(
      node.right,
      filePath,
      fileStrings,
      sourceType,
      options
    );
    if (c2 > 0) {
      node.right = newRight;
      count += c2;
    }
    return [node, count];
  }
  return [node, 0];
}
function replaceAlertButtonObject(obj, filePath, fileStrings) {
  if (obj?.type !== "ObjectExpression") return 0;
  let count = 0;
  for (const prop of obj.properties ?? []) {
    if (prop.type !== "ObjectProperty" && prop.type !== "Property") continue;
    if (prop.computed) continue;
    const keyName = prop.key?.type === "Identifier" ? prop.key.name : prop.key?.type === "StringLiteral" || prop.key?.type === "Literal" ? prop.key.value : null;
    if (keyName !== "text") continue;
    const [newValue, c] = replaceStringNode(
      prop.value,
      filePath,
      fileStrings,
      "alert",
      { useI18nInstance: false }
    );
    if (c > 0) {
      prop.value = newValue;
      count += c;
    }
  }
  return count;
}
function replaceAlertButtonsArg(arg, filePath, fileStrings) {
  if (arg?.type !== "ArrayExpression") return 0;
  let count = 0;
  for (const el of arg.elements ?? []) {
    if (!el) continue;
    if (el.type === "ObjectExpression") {
      count += replaceAlertButtonObject(el, filePath, fileStrings);
    }
  }
  return count;
}
function transformFile(filePath, appRoot, strings, localeData, config) {
  const code = readFileSafe(filePath);
  if (!code) return { filePath, modified: false, replacements: 0 };
  const fileStrings = strings.filter(
    (s) => s.filePath === filePath && localeData[s.fullKey] !== void 0
  );
  if (fileStrings.length === 0) {
    logger.debug(`  No matching strings: ${import_path9.default.relative(appRoot, filePath)}`);
    return { filePath, modified: false, replacements: 0 };
  }
  let ast;
  try {
    ast = recast.parse(code, {
      parser: {
        parse(source) {
          const babelParser = require("@babel/parser");
          return babelParser.parse(source, {
            sourceType: "module",
            tokens: true,
            plugins: [
              "jsx",
              "typescript",
              "decorators-legacy",
              "classProperties",
              "optionalChaining",
              "nullishCoalescingOperator"
            ]
          });
        }
      }
    });
  } catch (err) {
    logger.warn(
      `  Could not parse ${import_path9.default.relative(appRoot, filePath)} \u2014 skipping`
    );
    logger.debug(String(err));
    return { filePath, modified: false, replacements: 0 };
  }
  let totalReplacements = 0;
  const componentBlocks = /* @__PURE__ */ new Set();
  const helpersNeedingT = /* @__PURE__ */ new Map();
  const helperNamesWithT = /* @__PURE__ */ new Set();
  (0, import_ast_types.visit)(ast, {
    visitJSXText(nodePath) {
      const originalValue = nodePath.node.value;
      const normalized = normalizeJSXWhitespace(originalValue);
      if (!normalized) return this.traverse(nodePath);
      const extracted = findExtracted(
        normalized,
        filePath,
        fileStrings,
        "jsx-text"
      );
      if (!extracted) return this.traverse(nodePath);
      const leadingChar = originalValue[0];
      const teailingChar = originalValue[originalValue.length - 1];
      const hasLeadingSpace = (() => {
        if (leadingChar !== " ") return false;
        const contentStart = originalValue.indexOf(normalized[0]);
        if (contentStart === 0) return false;
        const beforeContent = originalValue.slice(0, contentStart);
        return !beforeContent.includes("\n");
      })();
      const hasTeailingSpace = (() => {
        if (teailingChar !== " ") return false;
        const contentEnd = originalValue.lastIndexOf(
          normalized[normalized.length - 1]
        );
        const afterContent = originalValue.slice(contentEnd + 1);
        return !afterContent.includes("\n");
      })();
      const call = buildTCall(extracted.fullKey);
      if (!hasLeadingSpace && !hasTeailingSpace) {
        nodePath.replace(buildJSXExpression(call));
        totalReplacements++;
        return false;
      }
      const nodes = [];
      if (hasLeadingSpace) nodes.push(import_ast_types.builders.jsxText(" "));
      nodes.push(buildJSXExpression(call));
      if (hasTeailingSpace) nodes.push(import_ast_types.builders.jsxText(" "));
      nodePath.replace(nodes[0]);
      for (let i = nodes.length - 1; i >= 1; i--) {
        nodePath.insertAfter(nodes[i]);
      }
      totalReplacements++;
      return false;
    },
    visitJSXExpressionContainer(nodePath) {
      const parent = nodePath.parent?.node;
      const isChild = parent?.type === "JSXElement" || parent?.type === "JSXFragment";
      if (!isChild) return this.traverse(nodePath);
      const expr = nodePath.node.expression;
      if (!expr || expr.type === "JSXEmptyExpression") {
        return this.traverse(nodePath);
      }
      const [newExpr, count] = replaceStringNode(
        expr,
        filePath,
        fileStrings,
        "jsx-expression"
      );
      if (count > 0) {
        nodePath.node.expression = newExpr;
        totalReplacements += count;
      }
      this.traverse(nodePath);
    },
    visitJSXAttribute(nodePath) {
      const { value } = nodePath.node;
      if (value?.type === "StringLiteral" || value?.type === "Literal") {
        const strValue = value.value;
        if (typeof strValue === "string") {
          const extracted = findExtracted(
            strValue,
            filePath,
            fileStrings,
            "jsx-attribute"
          );
          if (extracted) {
            nodePath.node.value = buildJSXExpression(
              buildTCall(extracted.fullKey)
            );
            totalReplacements++;
          }
        }
      }
      this.traverse(nodePath);
    },
    visitCallExpression(nodePath) {
      const { callee, arguments: args } = nodePath.node;
      let calleeName = null;
      if (callee.type === "Identifier") {
        calleeName = callee.name;
      } else if (callee.type === "MemberExpression" && callee.object?.type === "Identifier" && callee.property?.type === "Identifier") {
        calleeName = `${callee.object.name}.${callee.property.name}`;
      }
      if (calleeName === "Alert.alert") {
        args.forEach((arg, index) => {
          if (!arg || arg.type === "SpreadElement") return;
          if (index === 0 || index === 1) {
            const [newArg, count] = replaceStringNode(
              arg,
              filePath,
              fileStrings,
              "alert",
              { useI18nInstance: false }
            );
            if (count > 0) {
              nodePath.node.arguments[index] = newArg;
              totalReplacements += count;
            }
            return;
          }
          if (index === 2) {
            totalReplacements += replaceAlertButtonsArg(
              arg,
              filePath,
              fileStrings
            );
          }
        });
      } else if (calleeName && fileStrings.some((s) => s.sourceType === "call")) {
        args.forEach((arg, index) => {
          if (!arg || arg.type === "SpreadElement") return;
          const [newArg, count] = replaceStringNode(
            arg,
            filePath,
            fileStrings,
            "call",
            { useI18nInstance: false }
          );
          if (count > 0) {
            nodePath.node.arguments[index] = newArg;
            totalReplacements += count;
          }
        });
      }
      this.traverse(nodePath);
    },
    visitThrowStatement(nodePath) {
      const { argument } = nodePath.node;
      if (argument?.type === "NewExpression" && argument.callee?.type === "Identifier" && argument.callee.name === "Error") {
        argument.arguments.forEach((arg, index) => {
          const isStr = arg.type === "StringLiteral" || arg.type === "Literal";
          if (!isStr || typeof arg.value !== "string") return;
          const extracted = findExtracted(
            arg.value,
            filePath,
            fileStrings,
            "throw"
          );
          if (!extracted) return;
          argument.arguments[index] = buildTCall(extracted.fullKey);
          totalReplacements++;
        });
      }
      this.traverse(nodePath);
    },
    // ── Return statements (utils / helpers) ───────────────────────────────────
    visitReturnStatement(nodePath) {
      const arg = nodePath.node.argument;
      if (!arg) return this.traverse(nodePath);
      const insideComponent = isNestedInsideComponent(nodePath);
      const useI18nInstance = !insideComponent;
      const [newArg, count] = replaceStringNode(
        arg,
        filePath,
        fileStrings,
        "return",
        // must match scanner sourceType for returns
        { useI18nInstance }
      );
      if (count > 0) {
        nodePath.node.argument = newArg;
        totalReplacements += count;
        if (useI18nInstance) {
          fileNeedsI18nImport = true;
        }
      }
      this.traverse(nodePath);
    },
    // ── Component visitors — collect blocks for hook injection ────────────────
    visitFunctionDeclaration(nodePath) {
      const node = nodePath.node;
      const parent = nodePath.parent?.node;
      if (isComponentFunction(node, parent)) {
        componentBlocks.add(node.body);
      } else if (isHelperFunction(node, parent)) {
        if (!isNestedInsideComponent(nodePath)) {
          const name = getHelperName(node, parent);
          if (name) helpersNeedingT.set(name, node);
        }
      }
      this.traverse(nodePath);
    },
    visitFunctionExpression(nodePath) {
      const node = nodePath.node;
      const parent = nodePath.parent?.node;
      if (isComponentFunction(node, parent)) {
        componentBlocks.add(node.body);
      } else if (isHelperFunction(node, parent)) {
        if (!isNestedInsideComponent(nodePath)) {
          const name = getHelperName(node, parent);
          if (name) helpersNeedingT.set(name, node);
        }
      }
      this.traverse(nodePath);
    },
    visitArrowFunctionExpression(nodePath) {
      const node = nodePath.node;
      const parent = nodePath.parent?.node;
      if (isComponentFunction(node, parent)) {
        componentBlocks.add(node.body);
      } else if (isHelperFunction(node, parent)) {
        if (!isNestedInsideComponent(nodePath)) {
          const name = getHelperName(node, parent);
          if (name) helpersNeedingT.set(name, node);
        }
      }
      this.traverse(nodePath);
    }
  });
  if (totalReplacements === 0) {
    return { filePath, modified: false, replacements: 0 };
  }
  for (const [name, funcNode] of helpersNeedingT.entries()) {
    if (functionBodyContainsTCall(funcNode.body)) {
      helperNamesWithT.add(name);
    }
  }
  for (const name of helperNamesWithT) {
    const funcNode = helpersNeedingT.get(name);
    if (!funcNode) continue;
    if (alreadyHasTParam(funcNode)) continue;
    funcNode.params.push(buildTFunctionParam());
    logger.debug(`  Injected t: TFunction param into helper: ${name}`);
  }
  if (helperNamesWithT.size > 0) {
    (0, import_ast_types.visit)(ast, {
      visitCallExpression(nodePath) {
        const { callee, arguments: args } = nodePath.node;
        if (callee.type !== "Identifier") return this.traverse(nodePath);
        const calleeName = callee.name;
        if (!helperNamesWithT.has(calleeName)) return this.traverse(nodePath);
        const lastArg = args[args.length - 1];
        const alreadyHasT = lastArg?.type === "Identifier" && lastArg.name === "t";
        if (!alreadyHasT) {
          nodePath.node.arguments.push(import_ast_types.builders.identifier("t"));
          logger.debug(`  Added t argument to call site: ${calleeName}()`);
        }
        this.traverse(nodePath);
      }
    });
  }
  for (const block of componentBlocks) {
    if (block?.type === "BlockStatement") {
      injectTDeclaration(block.body);
    }
  }
  if (componentBlocks.size > 0) {
    addDefaultImport(
      ast.program.body,
      "react-i18next",
      "useTranslation",
      buildUseTranslationImport
    );
    if (config.addUseClientDirective) {
      addUseClientDirective(ast.program.body);
    }
  }
  if (helperNamesWithT.size > 0) {
    addDefaultImport(
      ast.program.body,
      "i18next",
      "TFunction",
      buildTFunctionImport
    );
  }
  if (fileNeedsI18nImport) {
    const importPath = resolveI18nImportPath(filePath, appRoot, config);
    addDefaultImport(
      ast.program.body,
      importPath,
      "i18n",
      () => import_ast_types.builders.importDeclaration(
        [import_ast_types.builders.importDefaultSpecifier(import_ast_types.builders.identifier("i18n"))],
        import_ast_types.builders.literal(importPath)
      )
    );
  }
  const newCode = recast.print(ast).code;
  return {
    filePath,
    modified: true,
    replacements: totalReplacements,
    newCode
  };
}
function functionBodyContainsTCall(block) {
  if (!block || block.type !== "BlockStatement") {
    return false;
  }
  let found = false;
  (0, import_ast_types.visit)(block, {
    visitCallExpression(path16) {
      const node = path16.node;
      if (node.callee?.type === "Identifier" && node.callee.name === "t") {
        found = true;
        return false;
      }
      this.traverse(path16);
    }
  });
  return found;
}
async function transformProject(appRoot, strings, localeData) {
  const config = await requireConfig(appRoot);
  const uniqueFiles = [...new Set(strings.map((s) => s.filePath))];
  logger.dim(`  Processing ${uniqueFiles.length} file(s)...`);
  const results = [];
  for (const filePath of uniqueFiles) {
    const result = transformFile(
      filePath,
      appRoot,
      strings,
      localeData,
      config
    );
    results.push(result);
    if (result.modified) {
      logger.dim(
        `  \u2713 ${import_path9.default.relative(appRoot, filePath)} \u2014 ${result.replacements} replacement(s)`
      );
    } else {
      logger.debug(`  \u25CB ${import_path9.default.relative(appRoot, filePath)} \u2014 no changes`);
    }
  }
  return results;
}
var recast, import_ast_types, import_path9, fileNeedsI18nImport;
var init_transformer = __esm({
  "src/core/transformer.ts"() {
    "use strict";
    init_cjs_shims();
    recast = __toESM(require("recast"));
    import_ast_types = __toESM(require_main());
    import_path9 = __toESM(require("path"));
    init_fs();
    init_logger();
    init_normalize();
    init_config2();
    fileNeedsI18nImport = false;
  }
});

// src/utils/backup.ts
function backupFile(filePath) {
  const backupPath = `${filePath}${BAK_EXT}`;
  if (!import_fs12.default.existsSync(backupPath)) {
    import_fs12.default.copyFileSync(filePath, backupPath);
    logger.debug(`  Backed up: ${import_path10.default.basename(filePath)}`);
  }
}
async function findBackupFiles(appRoot) {
  return (0, import_glob2.glob)(`**/*${BAK_EXT}`, {
    cwd: appRoot,
    absolute: true,
    ignore: ["**/node_modules/**"]
  });
}
async function restoreAllBackups(appRoot) {
  const backupFiles = await findBackupFiles(appRoot);
  if (backupFiles.length === 0) return 0;
  let restored = 0;
  for (const backupPath of backupFiles) {
    const originalPath = backupPath.slice(0, -BAK_EXT.length);
    try {
      import_fs12.default.copyFileSync(backupPath, originalPath);
      import_fs12.default.unlinkSync(backupPath);
      restored++;
      logger.success(`Restored: ${import_path10.default.relative(appRoot, originalPath)}`);
    } catch (err) {
      logger.error(
        `Failed to restore ${import_path10.default.relative(appRoot, originalPath)}: ${String(err)}`
      );
    }
  }
  return restored;
}
async function deleteAllBackups(appRoot) {
  const backupFiles = await findBackupFiles(appRoot);
  let deleted = 0;
  for (const backupPath of backupFiles) {
    try {
      import_fs12.default.unlinkSync(backupPath);
      deleted++;
    } catch (err) {
      logger.error(`Failed to delete backup: ${backupPath}: ${String(err)}`);
    }
  }
  return deleted;
}
var import_fs12, import_path10, import_glob2, BAK_EXT;
var init_backup = __esm({
  "src/utils/backup.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs12 = __toESM(require("fs"));
    import_path10 = __toESM(require("path"));
    import_glob2 = require("glob");
    init_logger();
    BAK_EXT = ".i18nbak";
  }
});

// src/commands/replace.ts
var replace_exports = {};
__export(replace_exports, {
  replace: () => replace
});
async function replace(options) {
  const appRoot = import_path11.default.resolve(options.path);
  const isDryRun = options.dryRun ?? false;
  const config = await requireConfig(appRoot);
  const localesDir = import_path11.default.join(appRoot, config.localesDir);
  const dirError = validateLocalesDir(config.localesDir, appRoot);
  if (dirError) {
    logger.error(`Invalid "localesDir" in your config:
  ${dirError}`);
    process.exit(1);
  }
  logger.section("eai \u2014 Replace");
  if (isDryRun) logger.warn("  Dry run \u2014 no files will be written.\n");
  const localeFilePath = resolveLocaleFilePath(
    localesDir,
    config.defaultLanguage,
    config.localeFileName
  );
  if (!exists(localeFilePath)) {
    logger.error(
      `Locale file not found: ${import_path11.default.relative(appRoot, localeFilePath)}
  Run "eai scan" first to generate the locale file.`
    );
    process.exit(1);
  }
  const localeData = readLocaleFile(
    config.defaultLanguage,
    localesDir,
    config.localeFileName
  );
  const keyCount = Object.keys(localeData).length;
  logger.info(`  Locale file : ${import_path11.default.relative(appRoot, localeFilePath)}`);
  logger.info(`  Keys loaded : ${keyCount}`);
  if (keyCount === 0) {
    logger.error(`The locale file is empty. Run "eai scan" to populate it.`);
    process.exit(1);
  }
  logger.section("Scanning for string locations...");
  const spinner = (0, import_ora2.default)("Scanning...").start();
  let strings;
  try {
    strings = await scanProject(appRoot, config);
    spinner.succeed(`Found ${strings.length} string(s) across the project.`);
  } catch (err) {
    spinner.fail("Scan failed.");
    logger.error(String(err));
    process.exit(1);
  }
  if (strings.length === 0) {
    logger.warn("No strings found. Nothing to replace.");
    process.exit(0);
  }
  logger.section("Computing replacements...");
  const results = await transformProject(appRoot, strings, localeData);
  const modifiedResults = results.filter((r) => r.modified);
  const totalReplacements = modifiedResults.reduce(
    (sum, r) => sum + r.replacements,
    0
  );
  if (modifiedResults.length === 0) {
    logger.warn(
      "No replacements needed. Your source files may already use t() calls."
    );
    process.exit(0);
  }
  logger.section("Preview \u2014 files to be modified");
  logger.newline();
  modifiedResults.forEach((result) => {
    logger.info(
      `  ${import_chalk4.default.cyan(import_path11.default.relative(appRoot, result.filePath))}` + import_chalk4.default.gray(` \u2014 ${result.replacements} replacement(s)`)
    );
  });
  logger.newline();
  logger.info(
    `  ${import_chalk4.default.bold(String(modifiedResults.length))} file(s) will be modified with ${import_chalk4.default.bold(String(totalReplacements))} total replacement(s)`
  );
  if (isDryRun) {
    logger.newline();
    logger.warn("Dry run complete \u2014 no files written.");
    logger.info("  Remove --dry-run to apply changes.");
    process.exit(0);
  }
  logger.newline();
  logger.warn(
    "This will modify your source files directly.\n  Make sure your changes are committed before proceeding."
  );
  logger.newline();
  const shouldProceed = await confirm(
    `Modify ${modifiedResults.length} file(s) with t() replacements?`,
    false
    // default to NO for a destructive operation
  );
  if (!shouldProceed) {
    logger.info("Aborted. No files were modified.");
    process.exit(0);
  }
  logger.section("Applying replacements...");
  let written = 0;
  for (const result of modifiedResults) {
    if (!result.newCode) continue;
    try {
      backupFile(result.filePath);
      writeFile(result.filePath, result.newCode);
      written++;
      logger.success(
        `${import_path11.default.relative(appRoot, result.filePath)} \u2014 ${result.replacements} replacement(s)`
      );
    } catch (err) {
      logger.error(
        `Failed to write ${import_path11.default.relative(appRoot, result.filePath)}: ${String(err)}`
      );
    }
  }
  logger.newline();
  logger.success(`Done \u2014 ${written} file(s) updated.`);
  logger.section("Next steps");
  logger.info(`
  1. Run your app and verify everything works:
       npx expo start

  2. If something looks wrong, revert your changes:
       ${import_chalk4.default.cyan("eai revert")}
       Restores all files to their state before replace was run.

       Or using git:
       ${import_chalk4.default.cyan("git checkout .")}
       Discards all uncommitted changes. This is why we asked you to commit before running replace.

  3. If everything looks good, clean up backups and commit:
       ${import_chalk4.default.cyan("eai revert --clean")}
       ${import_chalk4.default.cyan("git add .")}
       ${import_chalk4.default.cyan('git commit -m "feat: replace strings with i18n t() calls"')}

  4. To add translations for other languages:
       ${import_chalk4.default.cyan(`eai locales-generate --only fr,es`)}
       Generates locale files for the specified languages based on your default locale.

       Options:
         ${import_chalk4.default.gray("--only <langs>")}     Comma-separated language codes to generate (e.g. fr,es,ar)
         ${import_chalk4.default.gray("--force")}            Overwrite existing locale files
         ${import_chalk4.default.gray("--with-imports")}     Automatically wire imports into your i18n config file
         ${import_chalk4.default.gray("--dry-run")}          Preview what would be generated without writing files

       Then translate the values in the generated files, or wire up a translation API.
       Add each new language to your i18n.ts resources object:

       ${import_chalk4.default.cyan(`import fr from './${import_path11.default.relative(appRoot, localeFilePath).replace("en", "fr").replace(/\\/g, "/")}'

  i18n.init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },  // \u2190 add this
    },
    ...
  })`)}

  5. Copy ${import_path11.default.relative(appRoot, localeFilePath)} as a reference for manual translations.
`);
}
var import_path11, import_chalk4, import_ora2;
var init_replace = __esm({
  "src/commands/replace.ts"() {
    "use strict";
    init_cjs_shims();
    import_path11 = __toESM(require("path"));
    import_chalk4 = __toESM(require("chalk"));
    import_ora2 = __toESM(require("ora"));
    init_logger();
    init_config2();
    init_scanner();
    init_scaffolder();
    init_transformer();
    init_fs();
    init_prompt();
    init_backup();
  }
});

// src/commands/revert.ts
var revert_exports = {};
__export(revert_exports, {
  revert: () => revert
});
async function revert(options) {
  const appRoot = import_path12.default.resolve(options.path);
  const isClean = options.clean ?? false;
  logger.section(`eai \u2014 ${isClean ? "Clean backups" : "Revert"}`);
  const backupFiles = await findBackupFiles(appRoot);
  if (backupFiles.length === 0) {
    logger.warn("No backup files found.");
    logger.info(
      '  Backup files (.i18nbak) are created when you run "eai replace".\n  If you already ran "eai revert --clean", they have been deleted.\n  You can also use git to revert: git checkout .'
    );
    process.exit(0);
  }
  logger.newline();
  logger.info(`  Found ${backupFiles.length} backup file(s):`);
  backupFiles.forEach((f) => {
    const originalPath = f.slice(0, -".i18nbak".length);
    logger.dim(`    ${import_path12.default.relative(appRoot, originalPath)}`);
  });
  logger.newline();
  if (isClean) {
    const shouldClean = await confirm(
      `Delete ${backupFiles.length} backup file(s) without restoring source files?`,
      false
    );
    if (!shouldClean) {
      logger.info("Aborted. No files were changed.");
      process.exit(0);
    }
    const deleted = await deleteAllBackups(appRoot);
    logger.newline();
    logger.success(`Deleted ${deleted} backup file(s).`);
    logger.info(`
  Your source files were not changed.
  Ready to commit:
    ${import_chalk5.default.cyan("git add .")}
    ${import_chalk5.default.cyan('git commit -m "feat: replace strings with i18n t() calls"')}
    `);
  } else {
    logger.warn(
      "  This will restore your source files to their pre-replace state.\n  Your current i18n changes will be lost."
    );
    logger.newline();
    const shouldRestore = await confirm(
      `Restore ${backupFiles.length} file(s) to their pre-replace state?`,
      false
      // default to No — this is destructive
    );
    if (!shouldRestore) {
      logger.info("Aborted. No files were changed.");
      process.exit(0);
    }
    const restored = await restoreAllBackups(appRoot);
    logger.newline();
    logger.success(`Restored ${restored} file(s) to their original state.`);
    logger.info(
      '\n  Your source files have been reverted.\n  The locale file was not changed.\n  Run "eai replace" again when ready.'
    );
  }
}
var import_path12, import_chalk5;
var init_revert = __esm({
  "src/commands/revert.ts"() {
    "use strict";
    init_cjs_shims();
    import_path12 = __toESM(require("path"));
    import_chalk5 = __toESM(require("chalk"));
    init_logger();
    init_backup();
    init_prompt();
  }
});

// src/utils/locale-path.ts
function resolveLocaleFilePath2(config, langCode) {
  return config.localeFileName ? import_path13.default.join(config.localesDir, langCode, `${config.localeFileName}.json`) : import_path13.default.join(config.localesDir, `${langCode}.json`);
}
var import_path13;
var init_locale_path = __esm({
  "src/utils/locale-path.ts"() {
    "use strict";
    init_cjs_shims();
    import_path13 = __toESM(require("path"));
  }
});

// src/utils/flatten-keys.ts
function flattenKeys(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      Object.assign(out, flattenKeys(value, fullKey));
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}
function setNestedKey(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof cursor[part] !== "object" || cursor[part] === null) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}
var init_flatten_keys = __esm({
  "src/utils/flatten-keys.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/commands/wire-i18n-imports.ts
function wireLocaleImports(i18nFilePath, localesDir, localeFileName, languages) {
  if (!import_fs14.default.existsSync(i18nFilePath)) {
    console.warn(
      `\u26A0 ${i18nFilePath} not found \u2014 skipping import wiring.
  Create it first (see \`eai scan\` output for the template), then re-run with --with-imports.`
    );
    return [];
  }
  const source = import_fs14.default.readFileSync(i18nFilePath, "utf-8");
  const ast = recast2.parse(source, {
    parser: {
      parse: (src) => (0, import_parser.parse)(src, { sourceType: "module", plugins: ["typescript"] })
    }
  });
  const b2 = recast2.types.builders;
  const existingImportSources = /* @__PURE__ */ new Set();
  (0, import_ast_types2.visit)(ast, {
    visitImportDeclaration(path16) {
      existingImportSources.add(path16.node.source.value);
      this.traverse(path16);
    }
  });
  const i18nDir = import_path14.default.dirname(i18nFilePath);
  const addedLangs = [];
  const newImportNodes = [];
  for (const lang of languages) {
    const localeFilePath = resolveLocaleFilePath2(
      { localesDir, localeFileName },
      lang
    );
    let importPath = "./" + import_path14.default.relative(i18nDir, localeFilePath).replace(/\\/g, "/");
    if (!importPath.startsWith(".")) importPath = "./" + importPath;
    if (existingImportSources.has(importPath)) continue;
    newImportNodes.push(
      b2.importDeclaration(
        [b2.importDefaultSpecifier(b2.identifier(lang))],
        b2.stringLiteral(importPath)
      )
    );
    addedLangs.push(lang);
  }
  if (newImportNodes.length === 0) {
    return [];
  }
  const programBody = ast.program.body;
  let lastImportIndex = -1;
  programBody.forEach((node, i) => {
    if (node.type === "ImportDeclaration") lastImportIndex = i;
  });
  programBody.splice(lastImportIndex + 1, 0, ...newImportNodes);
  (0, import_ast_types2.visit)(ast, {
    visitObjectProperty(path16) {
      const key = path16.node.key;
      const keyName = key.type === "Identifier" ? key.name : key.value;
      if (keyName === "resources" && path16.node.value.type === "ObjectExpression") {
        for (const lang of addedLangs) {
          path16.node.value.properties.push(
            b2.objectProperty(
              b2.identifier(lang),
              b2.objectExpression([
                b2.objectProperty(
                  b2.identifier("translation"),
                  b2.identifier(lang)
                )
              ])
            )
          );
        }
      }
      this.traverse(path16);
    }
  });
  const output = recast2.print(ast).code;
  import_fs14.default.writeFileSync(i18nFilePath, output);
  return addedLangs;
}
var import_fs14, import_path14, import_parser, import_ast_types2, recast2;
var init_wire_i18n_imports = __esm({
  "src/commands/wire-i18n-imports.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs14 = __toESM(require("fs"));
    import_path14 = __toESM(require("path"));
    import_parser = require("@babel/parser");
    import_ast_types2 = __toESM(require_main());
    recast2 = __toESM(require("recast"));
    init_locale_path();
  }
});

// src/utils/validation.ts
function validateLanguageCodes(codes) {
  const valid = [];
  const invalid = [];
  for (const code of codes) {
    const trimmed = code.trim().toLowerCase();
    if (SUPPORTED_LANGUAGE_CODES.includes(trimmed)) {
      valid.push(trimmed);
    } else {
      invalid.push(trimmed);
    }
  }
  return { valid, invalid };
}
var init_validation = __esm({
  "src/utils/validation.ts"() {
    "use strict";
    init_cjs_shims();
    init_config();
  }
});

// src/commands/locales-generate.ts
var locales_generate_exports = {};
__export(locales_generate_exports, {
  runLocalesGenerate: () => runLocalesGenerate
});
function generateLocaleFile2(defaultContent, targetFilePath, locale, force, dryRun) {
  const fileExists = import_fs15.default.existsSync(targetFilePath);
  const isNew = !fileExists || force;
  if (isNew) {
    if (!dryRun) {
      import_fs15.default.mkdirSync(import_path15.default.dirname(targetFilePath), { recursive: true });
      import_fs15.default.writeFileSync(
        targetFilePath,
        JSON.stringify(defaultContent, null, 2) + "\n"
      );
    }
    return {
      locale,
      filePath: targetFilePath,
      isNew: !fileExists,
      keysAdded: Object.keys(flattenKeys(defaultContent))
    };
  }
  const existingContent = JSON.parse(import_fs15.default.readFileSync(targetFilePath, "utf-8"));
  const defaultFlat = flattenKeys(defaultContent);
  const existingFlat = flattenKeys(existingContent);
  const keysAdded = [];
  for (const [key, value] of Object.entries(defaultFlat)) {
    if (!(key in existingFlat)) {
      setNestedKey(existingContent, key, value);
      keysAdded.push(key);
    }
  }
  if (keysAdded.length > 0 && !dryRun) {
    import_fs15.default.writeFileSync(
      targetFilePath,
      JSON.stringify(existingContent, null, 2) + "\n"
    );
  }
  return {
    locale,
    filePath: targetFilePath,
    isNew: false,
    keysAdded
  };
}
async function runLocalesGenerate(options) {
  const appRoot = import_path15.default.resolve(options.path);
  const config = await requireConfig(appRoot);
  const rawTargets = options.only ?? config.targetLanguages ?? [];
  if (rawTargets.length === 0) {
    logger.error(
      "No target languages specified.\n\n  Option A \u2014 pass languages directly:\n    eai locales-generate --only fr,es,ar\n\n  Option B \u2014 add languages to your config and run without --only:\n    targetLanguages: ['fr', 'es', 'ar']  // in eai.config.ts"
    );
    process.exit(1);
  }
  const { valid, invalid } = validateLanguageCodes(rawTargets);
  if (invalid.length > 0) {
    logger.warn(
      `The following code${invalid.length === 1 ? " is" : "s are"} not valid ISO 639-1 language codes and will be skipped:
` + invalid.map((c) => `    \u2022 "${c}"`).join("\n")
    );
    logger.dim(
      "  Valid examples: en, fr, es, de, ar, zh, pt, ja, ru, tr, ko, ja\n  Full list: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes"
    );
    logger.newline();
  }
  if (valid.length === 0) {
    logger.error(
      "No valid language codes remaining. Nothing to generate.\n\n  Check your codes against the ISO 639-1 standard:\n  https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes"
    );
    process.exit(1);
  }
  const skippedDefault = valid.filter((c) => c === config.defaultLanguage);
  const targets = valid.filter((c) => c !== config.defaultLanguage);
  if (skippedDefault.length > 0) {
    logger.warn(
      `  Skipping "${config.defaultLanguage}" \u2014 this is your default language.
  Its locale file is managed by "eai scan", not "eai locales-generate".`
    );
    logger.newline();
  }
  if (targets.length === 0) {
    logger.error("No languages to generate after filtering. Nothing to do.");
    process.exit(1);
  }
  const defaultFilePath = resolveLocaleFilePath2(config, config.defaultLanguage);
  if (!import_fs15.default.existsSync(defaultFilePath)) {
    logger.error(
      `Default locale file not found at:
  ${defaultFilePath}

  Run "eai scan" first to generate it.`
    );
    process.exit(1);
  }
  const defaultContent = JSON.parse(import_fs15.default.readFileSync(defaultFilePath, "utf-8"));
  const defaultKeyCount = Object.keys(flattenKeys(defaultContent)).length;
  if (options.force) {
    const existingTargets = targets.filter(
      (lang) => import_fs15.default.existsSync(resolveLocaleFilePath2(config, lang))
    );
    if (existingTargets.length > 0 && !options.yes) {
      const confirmed = await confirm(
        `--force will overwrite ${existingTargets.length} existing locale file(s) (${existingTargets.join(", ")}), discarding any manual translations. Continue?`,
        false
      );
      if (!confirmed) {
        logger.info("Aborted \u2014 no files were changed.");
        return;
      }
    }
  }
  logger.section("eai \u2014 Locales Generate");
  logger.info(
    `  Default locale : ${config.defaultLanguage} (${defaultKeyCount} keys)`
  );
  logger.info(`  Targets        : ${targets.join(", ")}`);
  if (options.dryRun)
    logger.info("  Mode           : dry run (no files written)");
  logger.newline();
  logger.info("Generating...");
  logger.newline();
  const results = [];
  for (const lang of targets) {
    const targetFilePath = resolveLocaleFilePath2(config, lang);
    const result = generateLocaleFile2(
      defaultContent,
      targetFilePath,
      lang,
      !!options.force,
      !!options.dryRun
    );
    results.push(result);
    const displayPath = targetFilePath.length > 60 ? "..." + targetFilePath.slice(-57) : targetFilePath;
    if (result.isNew) {
      logger.success(
        `${displayPath} \u2014 created (${result.keysAdded.length} keys, all pending translation)`
      );
    } else if (result.keysAdded.length > 0) {
      logger.success(
        `${displayPath} \u2014 exists, ${result.keysAdded.length} new key(s) added:`
      );
      for (const key of result.keysAdded) {
        logger.dim(`      \xB7 ${key}`);
      }
    } else {
      logger.info(`${displayPath} \u2014 up to date, no new keys`);
    }
  }
  if (options.withImports && !options.dryRun) {
    if (!config.i18nFilePath) {
      logger.warn(
        "i18nFilePath not set in eai.config.ts \u2014 skipping import wiring."
      );
    } else {
      const wired = wireLocaleImports(
        config.i18nFilePath,
        config.localesDir,
        config.localeFileName,
        targets
      );
      if (wired.length > 0) {
        logger.success(
          `Wired into ${config.i18nFilePath}: ${wired.join(", ")}`
        );
      } else {
        logger.info(
          `${config.i18nFilePath} already up to date \u2014 no imports added.`
        );
      }
    }
  }
  const pendingTranslation = results.filter((r) => r.keysAdded.length > 0);
  if (pendingTranslation.length > 0) {
    logger.section("Next steps");
    logger.info(
      "  Translate the pending keys in each generated file.\n  The values currently match your default language \u2014 replace them with translations."
    );
    if (!options.withImports && config.i18nFilePath) {
      logger.newline();
      logger.info(
        `  Once translated, wire the imports into your i18n config:
    eai locales-generate --only ${targets.join(",")} --with-imports`
      );
    }
  }
  logger.newline();
}
var import_fs15, import_path15;
var init_locales_generate = __esm({
  "src/commands/locales-generate.ts"() {
    "use strict";
    init_cjs_shims();
    import_fs15 = __toESM(require("fs"));
    import_path15 = __toESM(require("path"));
    init_locale_path();
    init_flatten_keys();
    init_wire_i18n_imports();
    init_logger();
    init_prompt();
    init_validation();
    init_config2();
  }
});

// src/cli.ts
var cli_exports = {};
__export(cli_exports, {
  APP_VERSION: () => APP_VERSION
});
module.exports = __toCommonJS(cli_exports);
init_cjs_shims();
var import_commander = require("commander");

// package.json
var package_default = {
  name: "react-auto-i18n",
  version: "1.0.1",
  description: "Automatic i18n scanner and code transformer for React Native apps",
  main: "dist/index.js",
  types: "dist/index.d.ts",
  bin: {
    eai: "dist/cli.js"
  },
  files: [
    "dist"
  ],
  scripts: {
    build: "tsup && tsc --declaration --emitDeclarationOnly --outDir dist",
    dev: "tsup --watch",
    clean: "rimraf dist",
    prepublishOnly: "npm run clean && npm run build"
  },
  keywords: [
    "react",
    "react-native",
    "expo",
    "i18n",
    "internationalization",
    "cli",
    "automation",
    "translation",
    "i18next",
    "react-i18next"
  ],
  engines: {
    node: ">=18.0.0"
  },
  license: "MIT",
  repository: {
    type: "git",
    url: "git+https://github.com/SiandjaRemy/react-auto-i18n.git"
  },
  homepage: "https://github.com/SiandjaRemy/react-auto-i18n#readme",
  bugs: {
    url: "https://github.com/SiandjaRemy/react-auto-i18n/issues"
  },
  dependencies: {
    "@babel/generator": "7.26.5",
    "@babel/parser": "7.26.5",
    "@babel/traverse": "7.26.5",
    "@babel/types": "7.26.5",
    "@inquirer/prompts": "5.5.0",
    chalk: "^4.1.2",
    commander: "^12.0.0",
    glob: "^10.0.0",
    ignore: "^5.0.0",
    jiti: "^2.0.0",
    ora: "^5.4.1",
    recast: "^0.23.0"
  },
  devDependencies: {
    "@types/babel__core": "^7.20.5",
    "@types/babel__generator": "^7.6.0",
    "@types/babel__traverse": "^7.20.0",
    "@types/node": "^20.0.0",
    rimraf: "^5.0.0",
    "ts-node": "^10.9.2",
    tsup: "^8.0.0",
    typescript: "^5.0.0"
  },
  peerDependencies: {
    i18next: ">=23.0.0",
    "react-i18next": ">=14.0.0"
  },
  peerDependenciesMeta: {
    i18next: {
      optional: false
    },
    "react-i18next": {
      optional: false
    }
  }
};

// src/cli.ts
var APP_VERSION = package_default.version;
import_commander.program.name("eai").description(
  "Automatic i18n scanner and code transformer for React Native apps"
).version(APP_VERSION).enablePositionalOptions().option("--debug", "Show verbose debug output").hook("preAction", () => {
  if (import_commander.program.opts().debug) {
    const { setDebugMode: setDebugMode2 } = (init_logger(), __toCommonJS(logger_exports));
    setDebugMode2(true);
  }
});
import_commander.program.command("init").description("Generate eai.config.ts with default settings").option("-p, --path <path>", "Root path of the project", ".").action(async (options) => {
  const { init: init2 } = await Promise.resolve().then(() => (init_init(), init_exports));
  await init2(options);
});
import_commander.program.command("scan").description("Scan the app and generate locale files").option("-p, --path <path>", "Root path of the project", ".").option("--dry-run", "Preview without writing files").action(async (options) => {
  const { scan: scan2 } = await Promise.resolve().then(() => (init_scan(), scan_exports));
  await scan2(options);
});
import_commander.program.command("replace").description("Replace raw strings in source files with t() calls").option("-p, --path <path>", "Root path of the project", ".").option("--dry-run", "Preview without writing files").action(async (options) => {
  const { replace: replace2 } = await Promise.resolve().then(() => (init_replace(), replace_exports));
  await replace2(options);
});
import_commander.program.command("revert").description("Restore source files to their pre-replace state").option("-p, --path <path>", "Root path of the project", ".").option(
  "--clean",
  "Delete backup files without restoring (use after verifying replace output)"
).action(async (options) => {
  const { revert: revert2 } = await Promise.resolve().then(() => (init_revert(), revert_exports));
  await revert2(options);
});
import_commander.program.command("locales-generate").description("Generate locale files for target languages").option("-p, --path <path>", "Root path of the project", ".").option(
  "--only <languages>",
  "Comma-separated list of language codes to generate"
).option(
  "--force",
  "Overwrite existing locale files (discards manual translations)"
).option("--yes", "Skip confirmation prompt when using --force").option("--with-imports", "Automatically wire imports into i18n file").option("--dry-run", "Preview without writing files").action(async (options) => {
  const { runLocalesGenerate: runLocalesGenerate2 } = await Promise.resolve().then(() => (init_locales_generate(), locales_generate_exports));
  await runLocalesGenerate2(options);
});
import_commander.program.parse(process.argv);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APP_VERSION
});
//# sourceMappingURL=cli.js.map