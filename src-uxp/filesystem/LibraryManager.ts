import { uxp } from "../globals";
import type { storage } from "uxp";
import { ensureFolder, getFileIfExists, recoverFromBackup, writeJsonSafe } from "./io";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { libraryValidator, type LibraryValidationResult } from "./LibraryValidator";

const fs = uxp.storage.localFileSystem;

const LIBRARY_TOKEN_KEY = "brand_base_library_token";

export class LibraryManager {
  private currentLibrary: storage.Folder | null = null;
  private initializationComplete = false;

  /**
   * Opens a folder picker and either opens an existing library or initializes
   * a new one. Throws on invalid existing libraries.
   */
  async chooseLibrary(): Promise<boolean> {
    const folder = await fs.getFolder({} as any);
    if (!folder) return false;

    const libraryFile = await getFileIfExists(folder as storage.Folder, "library.json");

    if (libraryFile) {
      // Existing library — validate before accepting
      const result = await libraryValidator.validate(folder as storage.Folder);
      if (!result.valid) {
        throw new Error(
          `This folder contains an invalid or unsupported Brand Base library: ${result.reason}`,
        );
      }
    }

    // Persist the token BEFORE initialization so a partial init can be retried
    const token = fs.createPersistentToken(folder);
    this.persistToken(token as string);
    this.currentLibrary = folder as storage.Folder;

    try {
      await this.initializeStructure(folder as storage.Folder);
      this.initializationComplete = true;
    } catch (err) {
      // Initialization failed — mark as incomplete so we don't claim validity
      this.initializationComplete = false;
      this.currentLibrary = null;
      throw new Error(
        "Library initialization failed. The selected folder may be read-only or inaccessible. " +
        String(err),
      );
    }

    return true;
  }

  /**
   * Attempts to restore a previously selected library from the persisted UXP token.
   * Returns false if no token exists, if the token is invalid/expired, or if
   * validation fails.
   */
  async loadLibrary(): Promise<boolean> {
    const token = this.getPersistedToken();
    if (!token) return false;

    let entry: any;
    try {
      entry = await fs.getEntryForPersistentToken(token);
    } catch {
      // Token is invalid or expired — clear it
      this.clearPersistedToken();
      return false;
    }

    if (!entry || !entry.isFolder) {
      this.clearPersistedToken();
      return false;
    }

    // Verify the folder is still accessible
    try {
      await (entry as storage.Folder).getEntries();
    } catch {
      // Folder is no longer accessible (moved, deleted, permissions revoked)
      this.clearPersistedToken();
      return false;
    }

    const result = await libraryValidator.validate(entry as storage.Folder);
    if (!result.valid) {
      console.warn("Persisted library failed validation:", result.reason);
      // Don't clear the token — the user might fix the issue.
      // But don't mount the library either.
      return false;
    }

    this.currentLibrary = entry as storage.Folder;

    try {
      await this.initializeStructure(this.currentLibrary);
      this.initializationComplete = true;
    } catch {
      this.initializationComplete = false;
      this.currentLibrary = null;
      return false;
    }

    return true;
  }

  getLibraryFolder(): storage.Folder {
    if (!this.currentLibrary) throw new Error("Library not loaded");
    if (!this.initializationComplete) throw new Error("Library initialization is incomplete");
    return this.currentLibrary;
  }

  isLoaded(): boolean {
    return this.currentLibrary !== null && this.initializationComplete;
  }

  getLibraryPath(): string {
    return this.currentLibrary ? this.currentLibrary.nativePath : "";
  }

  // -----------------------------------------------------------------------
  // Token persistence — uses localStorage (UXP plugin data area)
  // -----------------------------------------------------------------------

  private persistToken(token: string): void {
    try {
      window.localStorage.setItem(LIBRARY_TOKEN_KEY, token);
    } catch {
      console.warn("Could not persist library token to localStorage.");
    }
  }

  private getPersistedToken(): string | null {
    try {
      return window.localStorage.getItem(LIBRARY_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private clearPersistedToken(): void {
    try {
      window.localStorage.removeItem(LIBRARY_TOKEN_KEY);
    } catch { /* best effort */ }
  }

  // -----------------------------------------------------------------------
  // Library structure initialization
  //
  // This is idempotent — calling it on an already-initialized library
  // simply verifies the directories exist without overwriting data files.
  // -----------------------------------------------------------------------

  private async initializeStructure(folder: storage.Folder): Promise<void> {
    // Recover from any interrupted writes first
    for (const criticalFile of ["library.json", "brands.json", "recent.json"]) {
      await recoverFromBackup(folder, criticalFile);
    }

    // Ensure required directories
    await ensureFolder(folder, "brands");
    await ensureFolder(folder, "backups");
    await ensureFolder(folder, "cache");

    // Create metadata files only if they don't exist — never overwrite
    const libraryFile = await getFileIfExists(folder, "library.json");
    if (!libraryFile) {
      await writeJsonSafe(folder, "library.json", {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
      });
    }

    const brandsFile = await getFileIfExists(folder, "brands.json");
    if (!brandsFile) {
      await writeJsonSafe(folder, "brands.json", []);
    }

    const recentFile = await getFileIfExists(folder, "recent.json");
    if (!recentFile) {
      await writeJsonSafe(folder, "recent.json", []);
    }

    // Final validation: re-validate after initialization
    const result = await libraryValidator.validate(folder);
    if (!result.valid) {
      throw new Error(`Library validation failed after initialization: ${result.reason}`);
    }
  }
}

export const libraryManager = new LibraryManager();
