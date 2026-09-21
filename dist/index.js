#!/usr/bin/env node
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  SUPPORTED_LANGUAGE_CODES: () => SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LOCALES: () => SUPPORTED_LOCALES,
  defineRaiConfig: () => defineRaiConfig
});
module.exports = __toCommonJS(src_exports);

// src/utils/defineRaiConfig.ts
function defineRaiConfig(config) {
  return config;
}

// src/types/config.ts
var SUPPORTED_LANGUAGE_CODES = [
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
var SUPPORTED_LOCALES = [
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LOCALES,
  defineRaiConfig
});
//# sourceMappingURL=index.js.map