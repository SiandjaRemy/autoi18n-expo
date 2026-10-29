/**
 * Single-token strings that are usually machine values, not UI copy.
 * Matching is case-sensitive: "done" is blocked, "DONE" is not.
 *
 * Keep this list general (layout, RN, generic state). App-specific
 * codes belong in eai.config.ts → blockSingleWords.
 */
export const DEFAULT_SINGLE_WORD_BLOCKLIST = new Set<string>([
  // Booleans / empty
  "true",
  "false",
  "null",
  "undefined",

  // Generic state / status (lowercase codes)
  "active",
  "inactive",
  "pending",
  "loading",
  "enabled",
  "disabled",
  "success",
  "error",
  "warning",
  "info",
  "default",
  "primary",
  "secondary",
  "destructive",
  "cancel",
  "none",
  "auto",
  "all",
  "custom",
  "min",
  "max",
  "asc",
  "desc",

  // Layout / flex (RN style values)
  "center",
  "left",
  "right",
  "top",
  "bottom",
  "flex",
  "block",
  "hidden",
  "absolute",
  "relative",
  "fixed",
  "row",
  "column",
  "wrap",
  "nowrap",
  "contain",
  "cover",
  "stretch",
  "bold",
  "normal",
  "italic",
  "solid",
  "dashed",
  "dotted",
  "horizontal",
  "vertical",

  // Platforms / size tokens
  "android",
  "ios",
  "web",
  "small",
  "medium",
  "large",
  "light",
  "dark",
  "system",
]);

/**
 * Single words that are often real UI on buttons / returns
 * (used by isLikelyUiCopy for return statements).
 */
export const DEFAULT_UI_SINGLE_WORDS = new Set<string>([
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
  "retry",
  "search",
  "today",
  "tomorrow",
  "yesterday",
  "loading",
  "error",
  "success",
]);
