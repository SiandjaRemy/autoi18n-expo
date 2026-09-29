import { SUPPORTED_LANGUAGE_CODES } from "../types/config";

/**
 * Validates a list of language codes against the supported ISO 639-1 list.
 *
 * Returns valid and invalid codes separately so the caller can:
 *   - Warn about invalid codes without stopping entirely
 *   - Proceed with only the valid subset
 *   - Bail out if nothing valid remains
 */
export function validateLanguageCodes(codes: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const code of codes) {
    const trimmed = code.trim().toLowerCase();
    if ((SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(trimmed)) {
      valid.push(trimmed);
    } else {
      invalid.push(trimmed);
    }
  }

  return { valid, invalid };
}
