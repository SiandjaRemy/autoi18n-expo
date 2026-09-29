import fs from "fs";
import path from "path";
import { glob } from "glob";
import { logger } from "./logger";

/**
 * Extension used for backup files created before replace runs.
 * Using a specific extension (not generic .bak) avoids conflicts
 * with other backup files the user may have in their project.
 */
const BAK_EXT = ".i18nbak";

/**
 * Creates a backup copy of a file before it is modified by replace.
 *
 * The backup sits alongside the original:
 *   src/app/index.tsx       ← will be modified
 *   src/app/index.tsx.i18nbak  ← untouched copy of original
 *
 * If a backup already exists, it is NOT overwritten. This preserves
 * the very first pre-replace state even if replace is run multiple times.
 *
 * @param filePath - Absolute path to the file to back up
 */
export function backupFile(filePath: string): void {
  const backupPath = `${filePath}${BAK_EXT}`;

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    logger.debug(`  Backed up: ${path.basename(filePath)}`);
  }
}

/**
 * Finds all backup files in the project.
 *
 * @param appRoot - Absolute path to the project root
 */
export async function findBackupFiles(appRoot: string): Promise<string[]> {
  return glob(`**/*${BAK_EXT}`, {
    cwd: appRoot,
    absolute: true,
    ignore: ["**/node_modules/**"],
  });
}

/**
 * Restores all backed-up files to their pre-replace state.
 *
 * For each .i18nbak file found:
 *   1. Copy it back over the modified source file
 *   2. Delete the .i18nbak file
 *
 * After this runs, the project is back to its state before replace.
 *
 * @param appRoot - Absolute path to the project root
 * @returns Number of files successfully restored
 */
export async function restoreAllBackups(appRoot: string): Promise<number> {
  const backupFiles = await findBackupFiles(appRoot);

  if (backupFiles.length === 0) return 0;

  let restored = 0;

  for (const backupPath of backupFiles) {
    // Derive original path by stripping the backup extension
    const originalPath = backupPath.slice(0, -BAK_EXT.length);

    try {
      fs.copyFileSync(backupPath, originalPath);
      fs.unlinkSync(backupPath);
      restored++;
      logger.success(`Restored: ${path.relative(appRoot, originalPath)}`);
    } catch (err) {
      logger.error(
        `Failed to restore ${path.relative(appRoot, originalPath)}: ${String(err)}`,
      );
    }
  }

  return restored;
}

/**
 * Deletes all backup files without restoring them.
 * Use this after verifying the replace output is correct.
 *
 * @param appRoot - Absolute path to the project root
 * @returns Number of backup files deleted
 */
export async function deleteAllBackups(appRoot: string): Promise<number> {
  const backupFiles = await findBackupFiles(appRoot);
  let deleted = 0;

  for (const backupPath of backupFiles) {
    try {
      fs.unlinkSync(backupPath);
      deleted++;
    } catch (err) {
      logger.error(`Failed to delete backup: ${backupPath}: ${String(err)}`);
    }
  }

  return deleted;
}
