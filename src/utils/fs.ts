import fs from 'fs'
import path from 'path'

/**
 * Reads a file and returns its content as a UTF-8 string.
 *
 * Returns null instead of throwing if the file does not exist.
 * This lets callers handle missing files gracefully without try/catch
 * at every call site.
 *
 * @param filePath - Absolute path to the file
 */
export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Writes content to a file, creating any missing parent directories.
 *
 * Why recursive mkdir?
 * When writing locale files like locales/en/screens/auth/SignIn.json,
 * the intermediate directories may not exist yet. Without recursive mkdir
 * this would throw. With it, the full path is created in one call.
 *
 * @param filePath - Absolute path to the file to write
 * @param content  - UTF-8 string content to write
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

/**
 * Returns true if a file or directory exists at the given path.
 *
 * @param filePath - Absolute path to check
 */
export function exists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/**
 * Ensures a directory exists, creating it and all parents if necessary.
 * Does nothing if the directory already exists.
 *
 * @param dirPath - Absolute path to the directory
 */
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true })
}

/**
 * Reads and parses a JSON file.
 *
 * Returns null if the file does not exist or cannot be parsed.
 * Generic so callers can specify the expected shape: readJson<MyType>(path)
 *
 * @param filePath - Absolute path to the JSON file
 */
export function readJson<T>(filePath: string): T | null {
  const content = readFileSafe(filePath)
  if (!content) return null
  try {
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

/**
 * Writes an object as formatted JSON to a file.
 * Creates parent directories if they do not exist.
 * Uses 2-space indentation for human readability.
 *
 * @param filePath - Absolute path to write to
 * @param data     - Any JSON-serializable value
 */
export function writeJson(filePath: string, data: unknown): void {
  writeFile(filePath, JSON.stringify(data, null, 2))
}