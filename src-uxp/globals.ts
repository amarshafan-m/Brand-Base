import type { premierepro as premiereproTypes } from "@adobe/premierepro";

if (typeof require === "undefined") {
  //@ts-ignore
  window.require = (moduleName: string) => {
    return {};
  };
}

let safeUxp: any = {};
try {
  safeUxp = require("uxp");
} catch (e) {
  // STRICT NODE FALLBACK FOR TESTS ONLY.
  // Throws immediately if a production build tries to access this.
  const throwNoUxp = () => { throw new Error("UXP API is not available in this environment. This fallback is for tests only."); };
  safeUxp = { 
    storage: { 
      localFileSystem: new Proxy({}, { get: throwNoUxp }),
      formats: { utf8: Symbol("utf8"), binary: Symbol("binary") }
    } 
  };
}

let safeOs: any = {};
try {
  safeOs = require("os");
} catch (e) {
  safeOs = {};
}

export const uxp = safeUxp as typeof import("uxp");
export const os = safeOs as typeof import("os");
const hostName = uxp && uxp?.host?.name?.toLowerCase();

export const photoshop = (
  hostName === "photoshop" ? require("photoshop") : {}
) as typeof import("photoshop");

export const indesign = (
  hostName === "indesign" ? require("indesign") : {}
) as any;

export const premierepro = (
  hostName === "premierepro" ? require("premierepro") : {}
) as premiereproTypes;

export const illustrator = (
  hostName === "illustrator" ? require("illustrator") : {}
) as any;

export const aftereffects = (
  hostName === "aftereffects" ? require("aftereffects") : {}
) as any;

export const mediaencoder = (
  hostName === "mediaencoder" ? require("mediaencoder") : {}
) as any;
