// @ts-ignore
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
// @ts-ignore
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;
const util = typeof window !== 'undefined' && window.require ? window.require('util') : null;
const fsp = fs?.promises || (fs && util ? { readFile: util.promisify(fs.readFile) } : null);

export interface LibraryValidationResult {
  valid: boolean;
  reason?: string;
}

export class LibraryValidator {
  async validate(folder: string): Promise<LibraryValidationResult> {
    const libraryJsonPath = path.join(folder, "library.json");
    if (!fs.existsSync(libraryJsonPath)) {
      return { valid: true }; // New library
    }
    try {
      const data = JSON.parse(await fsp.readFile(libraryJsonPath, 'utf8'));
      if (typeof data.schemaVersion !== "number") {
         return { valid: false, reason: "Missing schema version" };
      }
      return { valid: true };
    } catch (e) {
      return { valid: false, reason: "Invalid JSON" };
    }
  }
}
export const libraryValidator = new LibraryValidator();
