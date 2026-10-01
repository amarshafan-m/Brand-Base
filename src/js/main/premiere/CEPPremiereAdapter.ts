import type { PremiereAdapter, PremiereContext, PremiereTimelineContext, TimelinePlacement } from "./models";
import { evalTS, csi, evalFile, posix } from "../../lib/utils/bolt";

// @ts-ignore
const nodeFs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;

/**
 * CEPPremiereAdapter - Bridge between the React UI and ExtendScript.
 * 
 * Includes auto-reload of the JSX file if the namespace is not found,
 * which fixes Windows where $.evalFile() may silently fail on first load.
 */
export class CEPPremiereAdapter implements PremiereAdapter {
  private jsxVerified = false;

  /**
   * Ensures the ExtendScript namespace is loaded.
   * If not, reloads the JSX file and retries.
   */
  private async ensureJsx(): Promise<void> {
    if (this.jsxVerified) return;

    // Quick ping: check if namespace exists in ExtendScript
    const ok = await new Promise<boolean>((resolve) => {
      csi.evalScript(
        `try { var h = typeof $ !== 'undefined' ? $ : window; typeof h["com_brandbase_premiere_cep"] !== 'undefined' ? "ok" : "missing"; } catch(e) { "error"; }`,
        (res: string) => resolve(res === '"ok"' || res === 'ok')
      );
    });

    if (ok) {
      this.jsxVerified = true;
      return;
    }

    // Namespace missing — reload the JSX file
    console.warn("[BrandBase] ExtendScript namespace not found — reloading JSX...");
    const extRoot = csi.getSystemPath("extension");
    const jsxPath = posix(extRoot + "/jsx/index.js");

    await new Promise<void>((resolve) => {
      csi.evalScript(
        `try { $.evalFile("${jsxPath}"); "loaded"; } catch(e) { "fail:" + e.message; }`,
        (res: string) => {
          console.log("[BrandBase] JSX reload result:", res);
          resolve();
        }
      );
    });

    // Small delay to let ExtendScript finish initializing
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify again
    const ok2 = await new Promise<boolean>((resolve) => {
      csi.evalScript(
        `try { var h = typeof $ !== 'undefined' ? $ : window; typeof h["com_brandbase_premiere_cep"] !== 'undefined' ? "ok" : "missing"; } catch(e) { "error"; }`,
        (res: string) => resolve(res === '"ok"' || res === 'ok')
      );
    });

    if (ok2) {
      console.log("[BrandBase] JSX namespace verified after reload.");
      this.jsxVerified = true;
    } else {
      console.error("[BrandBase] JSX namespace STILL missing after reload.");
    }
  }

  async getContext(): Promise<PremiereContext> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      const result = await evalTS("bbGetContext");
      return result || { projectAvailable: false, sequenceAvailable: false };
    } catch (e) {
      console.error("CEPPremiereAdapter getContext error:", e);
      return { projectAvailable: false, sequenceAvailable: false };
    }
  }

  async importFiles(filePaths: string[]): Promise<boolean> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      await evalTS("bbImportFiles", filePaths);
      return true;
    } catch (e) {
      console.error("CEPPremiereAdapter importFiles error:", e);
      throw e;
    }
  }

  async getTimelineContext(): Promise<PremiereTimelineContext> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      const result = await evalTS("bbGetTimelineContext");
      return result || { sequenceAvailable: false };
    } catch (e) {
      console.error("CEPPremiereAdapter getTimelineContext error:", e);
      return { sequenceAvailable: false };
    }
  }

  async placeOnTimeline(nativePath: string, placement: TimelinePlacement): Promise<void> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      const wasImported = await evalTS("bbEnsureImported", nativePath);
      
      // If the file was just imported, Premiere needs a moment to parse audio streams.
      // If we insert instantly, Premiere drops a silent/broken 0-duration clip.
      if (wasImported) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // @ts-ignore
      await evalTS("bbPlaceOnTimeline", nativePath, placement);
    } catch (e) {
      console.error("CEPPremiereAdapter placeOnTimeline error:", e);
      throw e;
    }
  }

  async applyColorToSelection(hexColor: string): Promise<void> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      await evalTS("bbApplyColorToSelection", hexColor);
    } catch (e) {
      console.error("CEPPremiereAdapter applyColorToSelection error:", e);
      throw e;
    }
  }

  async applyFontToSelection(fontName: string): Promise<void> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      await evalTS("bbApplyFontToSelection", fontName);
    } catch (e) {
      console.error("CEPPremiereAdapter applyFontToSelection error:", e);
      throw e;
    }
  }

  async createTextLayer(fontFamily: string, fontWeight: string, fontSize: number, text: string, hexColor: string): Promise<any> {
    try {
      await this.ensureJsx();
      // @ts-ignore
      return await evalTS("bbCreateTextLayer", fontFamily, fontWeight, fontSize, text, hexColor);
    } catch (e) {
      console.error("CEPPremiereAdapter createTextLayer error:", e);
      throw e;
    }
  }
}
