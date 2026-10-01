// @ts-ignore
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
// @ts-ignore
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;

const fsp = fs?.promises;

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
                await fsp.rm(path.join(this.nativePath, f.name), { recursive: true, force: true });
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
                await fsp.rm(full, { recursive: true, force: true });
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
        await fsp.rm(this.nativePath, { recursive: true, force: true });
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
    await fsp.writeFile(path.join(basePath, filename), JSON.stringify(data, null, 2), "utf8");
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
