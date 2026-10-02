// @ts-ignore
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
// @ts-ignore
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;

// Polyfill fs.promises for older CEP (Node < 10)
const util = typeof window !== 'undefined' && window.require ? window.require('util') : null;
const fsp = fs?.promises || (fs && util ? {
    readdir: util.promisify(fs.readdir),
    rename: util.promisify(fs.rename),
    copyFile: fs.copyFile ? util.promisify(fs.copyFile) : async (src: string, dest: string) => {
        return new Promise((resolve, reject) => {
            const rd = fs.createReadStream(src);
            const wr = fs.createWriteStream(dest);
            rd.on("error", reject);
            wr.on("error", reject);
            wr.on("close", resolve);
            rd.pipe(wr);
        });
    },
    stat: util.promisify(fs.stat),
    mkdir: util.promisify(fs.mkdir),
    writeFile: util.promisify(fs.writeFile),
    readFile: util.promisify(fs.readFile)
} : null);

// Backward-compatible rimraf for Node.js 10 (Premiere 2020)
export function safeDelete(targetPath: string) {
    if (!fs || !fs.existsSync(targetPath)) return;
    try {
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
            fs.readdirSync(targetPath).forEach((file: string) => {
                safeDelete(path.join(targetPath, file));
            });
            fs.rmdirSync(targetPath);
        } else {
            fs.unlinkSync(targetPath);
        }
    } catch (err) {
        // If Node.js fails to delete due to locks/permissions, forcefully use native OS commands
        try {
            const execSync = window.require ? window.require("child_process").execSync : null;
            if (execSync) {
                // @ts-ignore
                const isWin = window.require("os").platform() === "win32";
                if (isWin) {
                    execSync(`rmdir /s /q "${targetPath}"`);
                } else {
                    execSync(`rm -rf "${targetPath}"`);
                }
            }
        } catch (e) {
            console.error("Force delete also failed", e);
        }
    }
}

export class NodeFolder {
    isFolder = true;
    isFile = false;
    constructor(public nativePath: string, public name: string) {}


    async getEntries(): Promise<any[]> {
        const files = await fsp.readdir(this.nativePath, { withFileTypes: true });
        return files.map((f: any) => ({
            isFolder: f.isDirectory(),
            isFile: f.isFile(),
            name: f.name,
            nativePath: path.join(this.nativePath, f.name),
            moveTo: async (parent: NodeFolder, opts: {newName: string}) => {
                await fsp.rename(path.join(this.nativePath, f.name), path.join(parent.nativePath, opts.newName));
            },
            copyTo: async (dest: NodeFolder, opts: {overwrite: boolean}) => {
                const destPath = path.join(dest.nativePath, f.name);
                if (!opts.overwrite && fs.existsSync(destPath)) throw new Error("EntryExists");
                await fsp.copyFile(path.join(this.nativePath, f.name), destPath);
            },
            delete: async () => {
                safeDelete(path.join(this.nativePath, f.name));
            },
            getMetadata: async () => {
                const stat = await fsp.stat(path.join(this.nativePath, f.name));
                return { size: stat.size };
            }
        }));
    }
    
    async getEntry(name: string): Promise<any> {
        const full = path.join(this.nativePath, name);
        if (!fs.existsSync(full)) throw new Error("Not found");
        return {
            name, nativePath: full,
            moveTo: async (parent: NodeFolder, opts: {newName: string}) => {
                await fsp.rename(full, path.join(parent.nativePath, opts.newName));
            },
            delete: async () => {
                safeDelete(full);
            },
            getMetadata: async () => {
                const stat = await fsp.stat(full);
                return { size: stat.size };
            }
        };
    }

    async moveTo(parent: NodeFolder, opts: {newName: string}) {
         await fsp.rename(this.nativePath, path.join(parent.nativePath, opts.newName));
    }
    
    async delete() {
        safeDelete(this.nativePath);
    }
}

export async function ensureFolder(base: any, folderName: string): Promise<NodeFolder> {
    const basePath = typeof base === "string" ? base : base.nativePath;
    const full = path.join(basePath, folderName);
    if (!fs.existsSync(full)) {
        await fsp.mkdir(full, { recursive: true });
    }
    return new NodeFolder(full, folderName);
}

export async function getFileIfExists(base: any, filename: string): Promise<string | null> {
    const basePath = typeof base === "string" ? base : base.nativePath;
    const full = path.join(basePath, filename);
    return fs.existsSync(full) ? full : null;
}

export async function getFolderIfExists(base: any, folderName: string): Promise<NodeFolder | null> {
    const basePath = typeof base === "string" ? base : base.nativePath;
    const full = path.join(basePath, folderName);
    if (fs.existsSync(full)) {
        const stat = await fsp.stat(full);
        if (stat.isDirectory()) {
            return new NodeFolder(full, folderName);
        }
    }
    return null;
}

export async function writeJsonSafe(base: any, filename: string, data: any): Promise<void> {
    if (!fsp || !path) return;
    const basePath = typeof base === "string" ? base : base.nativePath;
    const targetPath = path.join(basePath, filename);
    const tempPath = targetPath + ".tmp";
    
    // Write to a temporary file first
    await fsp.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
    // Atomic rename replaces the target file safely without risk of partial corruption
    await fsp.rename(tempPath, targetPath);
}

export async function recoverFromBackup(base: any, filename: string): Promise<void> {
    // No-op for now
}

export async function readJson<T = any>(full: any): Promise<T> {
    const p = typeof full === 'string' ? full : full.nativePath;
    const content = await fsp.readFile(p, 'utf8');
    try { return JSON.parse(content); } catch (e) { console.error("Failed to parse JSON file at " + p, e); throw new Error("Invalid JSON file"); }
}
export const validateEntryName = (name: string) => name;
