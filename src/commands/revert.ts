import path from "path";
import chalk from "chalk";
import { logger } from "../utils/logger";
import {
  findBackupFiles,
  restoreAllBackups,
  deleteAllBackups,
} from "../utils/backup";
import { confirm } from "../utils/prompt";

interface RevertOptions {
  path: string;
  clean?: boolean;
}

/**
 * `eai revert`
 *
 * Restores all source files to their state before `eai replace` was run.
 * Uses the .i18nbak backup files created during replacement.
 *
 * Flags:
 *   --clean   Delete backup files WITHOUT restoring source files.
 *             Use this after you've verified replace output is correct
 *             and you're ready to commit.
 *
 * Typical workflow:
 *   eai replace          → modifies files, creates .i18nbak backups
 *   npx expo start       → verify the app works
 *
 *   If something's wrong:
 *     eai revert         → restores original files, deletes backups
 *
 *   If everything's good:
 *     eai revert --clean → deletes backups only, keeps modified files
 *     git add . && git commit
 */
export async function revert(options: RevertOptions): Promise<void> {
  const appRoot = path.resolve(options.path);
  const isClean = options.clean ?? false;

  logger.section(`eai — ${isClean ? "Clean backups" : "Revert"}`);

  const backupFiles = await findBackupFiles(appRoot);

  if (backupFiles.length === 0) {
    logger.warn("No backup files found.");
    logger.info(
      '  Backup files (.i18nbak) are created when you run "eai replace".\n' +
        '  If you already ran "eai revert --clean", they have been deleted.\n' +
        "  You can also use git to revert: git checkout .",
    );
    process.exit(0);
  }

  // Show which files are affected
  logger.newline();
  logger.info(`  Found ${backupFiles.length} backup file(s):`);

  backupFiles.forEach((f) => {
    // Show the original file path (without .i18nbak) — more meaningful to user
    const originalPath = f.slice(0, -".i18nbak".length);
    logger.dim(`    ${path.relative(appRoot, originalPath)}`);
  });

  logger.newline();

  if (isClean) {
    // ── --clean: delete backups without restoring ──────────────────────────
    const shouldClean = await confirm(
      `Delete ${backupFiles.length} backup file(s) without restoring source files?`,
      false,
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
    ${chalk.cyan("git add .")}
    ${chalk.cyan('git commit -m "feat: replace strings with i18n t() calls"')}
    `);
  } else {
    // ── Default: restore files from backups ────────────────────────────────
    logger.warn(
      "  This will restore your source files to their pre-replace state.\n" +
        "  Your current i18n changes will be lost.",
    );
    logger.newline();

    const shouldRestore = await confirm(
      `Restore ${backupFiles.length} file(s) to their pre-replace state?`,
      false, // default to No — this is destructive
    );

    if (!shouldRestore) {
      logger.info("Aborted. No files were changed.");
      process.exit(0);
    }

    const restored = await restoreAllBackups(appRoot);

    logger.newline();
    logger.success(`Restored ${restored} file(s) to their original state.`);
    logger.info(
      "\n  Your source files have been reverted.\n" +
        "  The locale file was not changed.\n" +
        '  Run "eai replace" again when ready.',
    );
  }
}
