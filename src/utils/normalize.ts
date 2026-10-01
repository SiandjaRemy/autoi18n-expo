/**
 * Normalizes JSXText whitespace to match React's rendering behaviour.
 *
 * React collapses newlines and surrounding indentation between JSX tags
 * into a single space. Storing the raw multiline value in locale files
 * causes t() to return strings with literal \n characters, which
 * React Native renders as actual line breaks.
 *
 * @example
 *   "\n    hook lets you inspect what the\n    user's current color\n  "
 *   → "hook lets you inspect what the user's current color"
 */
export function normalizeJSXWhitespace(value: string): string {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");
}
