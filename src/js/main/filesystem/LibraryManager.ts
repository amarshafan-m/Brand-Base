import { NodeFolder, ensureFolder, getFileIfExists, recoverFromBackup, writeJsonSafe } from "./io";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { libraryValidator } from "./LibraryValidator";
// @ts-ignore
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
// @ts-ignore
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;
// @ts-ignore
const os = typeof window !== 'undefined' && window.require ? window.require('os') : null;

const LIBRARY_TOKEN_KEY = "brand_base_library_token";

export class LibraryManager {
  private currentLibrary: string | null = null;
  private initializationComplete = false;

  async chooseLibrary(): Promise<boolean> {
    // @ts-ignore
    if (!window.cep || !window.cep.fs) throw new Error("CEP not available");
    
    const desktopPath = path && os ? path.join(os.homedir(), "Desktop") : "";
    
    // @ts-ignore
    const result = window.cep.fs.showOpenDialog(false, true, "Select a Folder for Brand Base Library", desktopPath);
    if (result.err || !result.data || result.data.length === 0) {
      return false; // User cancelled
    }
    
    let folder = result.data[0];
    
    // CEP showOpenDialog can return file:// URIs with URL-encoded characters (spaces → %20).
    folder = decodeURIComponent(folder);
    if (folder.startsWith("file://")) {
      const isWin = typeof navigator !== 'undefined' ? navigator.platform.toLowerCase().includes('win') : (os && os.platform() === 'win32');
      if (isWin) {
        folder = folder.replace(/^file:\/\/\/?/, '');
        folder = folder.replace(/\//g, '\\');
      } else {
        folder = folder.replace(/^file:\/\//, '');
      }
    }
    
    if (!fs.existsSync(folder)) {
      await ensureFolder(path.dirname(folder), path.basename(folder));
    }

    const libraryFile = await getFileIfExists(folder, "library.json");
    if (libraryFile) {
      const result = await libraryValidator.validate(folder);
      if (!result.valid) throw new Error(`Invalid library: ${result.reason}`);
    }

    this.persistToken(folder);
    this.currentLibrary = folder;

    try {
      await this.initializeStructure(folder);
      this.initializationComplete = true;
    } catch (err) {
      this.initializationComplete = false;
      this.currentLibrary = null;
      throw err;
    }
    return true;
  }

  async loadLibrary(): Promise<boolean> {
    let token = this.getPersistedToken();
    if (!token) return false;
    
    // Auto-fix corrupted paths from previous versions (e.g. /C:/Users/...)
    const isWin = typeof navigator !== 'undefined' ? navigator.platform.toLowerCase().includes('win') : (os && os.platform() === 'win32');
    if (isWin && token.startsWith('/') && token.charAt(2) === ':') {
      token = token.substring(1).replace(/\//g, '\\');
      this.persistToken(token); // Update it in storage automatically
    }

    if (!fs.existsSync(token)) return false;

    const result = await libraryValidator.validate(token);
    if (!result.valid) return false;

    this.currentLibrary = token;

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

  getLibraryFolder(): any {
    if (!this.currentLibrary || !this.initializationComplete) throw new Error("Library not loaded");
    return new NodeFolder(this.currentLibrary, "library");
  }

  isLoaded(): boolean {
    return this.currentLibrary !== null && this.initializationComplete;
  }

  getLibraryPath(): string {
    return this.currentLibrary || "";
  }

  private persistToken(token: string): void {
    try { window.localStorage.setItem(LIBRARY_TOKEN_KEY, token); } catch {}
  }
  private getPersistedToken(): string | null {
    try { return window.localStorage.getItem(LIBRARY_TOKEN_KEY); } catch { return null; }
  }
  private clearPersistedToken(): void {
    try { window.localStorage.removeItem(LIBRARY_TOKEN_KEY); } catch {}
  }

  private async initializeStructure(folder: string): Promise<void> {
    for (const criticalFile of ["library.json", "brands.json", "recent.json"]) {
      await recoverFromBackup(folder, criticalFile);
    }
    await ensureFolder(folder, "brands");
    await ensureFolder(folder, "backups");
    await ensureFolder(folder, "cache");

    if (!await getFileIfExists(folder, "library.json")) {
      await writeJsonSafe(folder, "library.json", { schemaVersion: CURRENT_SCHEMA_VERSION, createdAt: new Date().toISOString() });
    }
    if (!await getFileIfExists(folder, "brands.json")) {
      await writeJsonSafe(folder, "brands.json", []);
    }
    if (!await getFileIfExists(folder, "recent.json")) {
      await writeJsonSafe(folder, "recent.json", []);
    }
  }
}
export const libraryManager = new LibraryManager();
