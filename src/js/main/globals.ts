// @ts-nocheck
const getHostName = () => {
  if (typeof window !== "undefined" && window.__adobe_cep__) {
    try {
      const cs = new window.CSInterface();
      return cs.getHostEnvironment().appName;
    } catch(e) {}
  }
  return "premierepro"; 
};

export const os: any = typeof window !== 'undefined' && window.require ? window.require("os") : null;

export const uxp: any = {
  storage: {
    localFileSystem: {
      getEntryForPersistentToken: async (token) => {
        const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;
        const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
        const name = path.basename(token);
        return {
           name,
           isFile: true,
           isFolder: false,
           nativePath: token,
           copyTo: async (destFolder, opts) => {
               const dest = path.join(destFolder.nativePath, name);
               if (!opts.overwrite && fs.existsSync(dest)) throw new Error("EntryExists");
               await fs.promises.copyFile(token, dest);
           }
        }
      },
      createPersistentToken: (entry) => {
         return typeof entry === "string" ? entry : entry.nativePath;
      },
      getFileForOpening: async (options) => {
          if (typeof window !== 'undefined' && window.cep) {
             const result = window.cep.fs.showOpenDialog(false, options.allowMultiple, "Select Files", "", options.types);
             if (result.err) return [];
             const files = result.data;
             return files.map((f: string) => {
                const p = typeof window !== 'undefined' && window.require ? window.require('path') : require('path');
                return {
                   name: p.basename(f),
                   isFile: true,
                   nativePath: f
                };
             });
          }
          return [];
      }
    }
  }
};

const hostName = getHostName();

export const photoshop: any = {};
export const indesign: any = {};
export const premierepro: any = {};
export const illustrator: any = {};
export const aftereffects: any = {};
export const mediaencoder: any = {};
