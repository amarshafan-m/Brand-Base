import { uxp } from "../globals";
import type { storage } from "uxp";

// ---------------------------------------------------------------------------
// Helpers to access UXP storage symbols safely regardless of type definitions
// ---------------------------------------------------------------------------
const getFormats = () => (uxp.storage as any).formats ?? {};
const utf8Format = () => getFormats().utf8;

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

export async function readJson<T>(file: storage.File): Promise<T> {
  const content = await (file as any).read({ format: utf8Format() });
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error(`File is empty or unreadable: ${(file as any).name ?? "unknown"}`);
  }
  return JSON.parse(content) as T;
}

// ---------------------------------------------------------------------------
// WRITE (safe strategy)
//
// UXP does NOT support POSIX-style atomic rename. The safest achievable
// sequence with the entry-based API is:
//
//   1. Serialize data to a string and validate it can be parsed back.
//   2. Write the data to a temporary `.tmp` file.
//   3. Read-back the `.tmp` file and verify parsability.
//   4. If the original file exists, rename it to `.bak` (via moveTo).
//   5. Rename the `.tmp` file to the final name (via moveTo).
//   6. Delete the `.bak` file.
//
// If step 5 fails, the `.bak` still holds the previous valid data and the
// caller / next startup can recover from it.
//
// LIMITATION: This is NOT atomic. A crash between step 4 and step 5 leaves
// only the `.bak` file. The library validator / startup code must check for
// `.bak` files and recover from them.
// ---------------------------------------------------------------------------

export async function writeJsonSafe(
  folder: storage.Folder,
  filename: string,
  data: unknown,
): Promise<void> {
  // 1. Serialize and validate round-trip
  const json = JSON.stringify(data, null, 2);
  try {
    JSON.parse(json); // verify serialization round-trips
  } catch {
    throw new Error(`Serialization round-trip failed for ${filename}`);
  }

  const tmpName = `${filename}.tmp`;
  const bakName = `${filename}.bak`;

  // 2. Write to .tmp
  const tmpFile = await folder.createFile(tmpName, { overwrite: true });
  await (tmpFile as any).write(json, { format: utf8Format() });

  // 3. Read-back and verify
  try {
    const readBack = await (tmpFile as any).read({ format: utf8Format() });
    JSON.parse(readBack as string);
  } catch {
    try { await (tmpFile as any).delete(); } catch { /* best effort */ }
    throw new Error(`Write verification failed for ${filename}`);
  }

  // 4. If original exists, rename to .bak
  const originalFile = await getFileIfExists(folder, filename);
  if (originalFile) {
    try {
      // Remove any old .bak first
      const oldBak = await getFileIfExists(folder, bakName);
      if (oldBak) {
        await (oldBak as any).delete();
      }
      // Rename original → .bak using moveTo with newName
      await (originalFile as any).moveTo(folder, { newName: bakName, overwrite: true });
    } catch (e) {
      // If backup-rename fails, fall back to overwrite: delete original, then rename tmp
      try { await (originalFile as any).delete(); } catch { /* best effort */ }
    }
  }

  // 5. Rename .tmp → final
  try {
    await (tmpFile as any).moveTo(folder, { newName: filename, overwrite: true });
  } catch (moveErr) {
    // Last resort: write directly to final filename
    try {
      const fallbackFile = await folder.createFile(filename, { overwrite: true });
      await (fallbackFile as any).write(json, { format: utf8Format() });
      try { await (tmpFile as any).delete(); } catch { /* best effort */ }
    } catch {
      throw new Error(`Critical: failed to write ${filename}. A .bak or .tmp file may contain the last good data.`);
    }
    return;
  }

  // 6. Clean up .bak
  try {
    const bakFile = await getFileIfExists(folder, bakName);
    if (bakFile) await (bakFile as any).delete();
  } catch { /* .bak cleanup is best-effort */ }
}

// ---------------------------------------------------------------------------
// FOLDER UTILITIES
// ---------------------------------------------------------------------------

/** Validates that a folder/file name is safe (no traversal, no empty). */
export function validateEntryName(name: string): string {
  if (!name || !name.trim()) {
    throw new Error("Entry name cannot be empty.");
  }
  const trimmed = name.trim();
  // Block path traversal
  if (trimmed === "." || trimmed === ".." || trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("..")) {
    throw new Error(`Unsafe entry name rejected: "${trimmed}"`);
  }
  // Block NUL bytes
  if (trimmed.includes("\0")) {
    throw new Error("Entry name contains null bytes.");
  }
  return trimmed;
}

export async function ensureFolder(parent: storage.Folder, name: string): Promise<storage.Folder> {
  const safeName = validateEntryName(name);
  try {
    const entry = await parent.getEntry(safeName);
    if (entry.isFolder) return entry as storage.Folder;
    throw new Error(`Expected folder but found file: ${safeName}`);
  } catch (e: any) {
    if (e?.message?.includes("Expected folder")) throw e;
    // Entry doesn't exist — create it
  }
  return await parent.createFolder(safeName);
}

export async function getFolderIfExists(parent: storage.Folder, name: string): Promise<storage.Folder | null> {
  try {
    const safeName = validateEntryName(name);
    const entry = await parent.getEntry(safeName);
    return entry.isFolder ? (entry as storage.Folder) : null;
  } catch {
    return null;
  }
}

export async function getFileIfExists(parent: storage.Folder, name: string): Promise<storage.File | null> {
  try {
    const entry = await parent.getEntry(name);
    return entry.isFile ? (entry as storage.File) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// BACKUP RECOVERY — called during library load to heal from interrupted writes
// ---------------------------------------------------------------------------

/**
 * If a `.bak` file exists but the primary file does not, the last write
 * was interrupted. Recover by renaming `.bak` → primary.
 */
export async function recoverFromBackup(folder: storage.Folder, filename: string): Promise<boolean> {
  const bakName = `${filename}.bak`;
  const primary = await getFileIfExists(folder, filename);
  const backup = await getFileIfExists(folder, bakName);

  if (!primary && backup) {
    try {
      await (backup as any).moveTo(folder, { newName: filename, overwrite: true });
      return true; // recovered
    } catch {
      return false;
    }
  }

  // Clean up stale .bak if primary exists
  if (primary && backup) {
    try { await (backup as any).delete(); } catch { /* best effort */ }
  }

  // Clean up stale .tmp
  const tmpName = `${filename}.tmp`;
  const tmp = await getFileIfExists(folder, tmpName);
  if (tmp) {
    try { await (tmp as any).delete(); } catch { /* best effort */ }
  }

  return false;
}
