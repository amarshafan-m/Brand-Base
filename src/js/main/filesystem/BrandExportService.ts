import { BrandService } from '../services/BrandService';
import { AssetService } from '../services/AssetService';
import { ColorService } from '../services/ColorService';
import { TypographyService } from '../services/TypographyService';
import { LibraryManager } from './LibraryManager';
// @ts-ignore
const AdmZip = typeof window !== 'undefined' && window.require ? window.require('adm-zip') : null;
// @ts-ignore
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
// @ts-ignore
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;
// @ts-ignore
const os = typeof window !== 'undefined' && window.require ? window.require('os') : null;

export class BrandExportService {
  constructor(
    private brandService: BrandService,
    private assetService: AssetService,
    private colorService: ColorService,
    private typographyService: TypographyService,
    private libraryManager: LibraryManager
  ) {}

  async exportBrand(brandId: string, customPackageName?: string, customExportPath?: string): Promise<boolean> {
    if (!AdmZip || !fs || !path || !os) throw new Error("Export is only supported in Adobe Premiere Pro.");
    try {
      const brand = await this.brandService.getById(brandId);
      if (!brand) throw new Error("Brand not found");

      const assets = await this.assetService.getByBrandId(brandId);
      const colors = await this.colorService.getByBrandId(brandId);
      const typography = await this.typographyService.getByBrandId(brandId);

      const libPath = this.libraryManager.getLibraryPath();
      if (!libPath) throw new Error("Library path not found");

      const zip = new AdmZip();

      // Create manifest
      const manifest = {
        version: "1.0",
        type: "brand_package",
        brand,
        assets,
        colors,
        typography
      };

      zip.addFile("brand.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));

      // Add asset files
      for (const asset of assets) {
        if (asset.filePath) {
          const absPath = path.join(libPath, asset.filePath);
          if (fs.existsSync(absPath)) {
            let relativeDir = path.dirname(asset.filePath).replace(/\\/g, '/');
            if (relativeDir === '.') relativeDir = '';
            zip.addLocalFile(absPath, relativeDir);
          }
        }
        if (asset.metadata?.thumbnailPath && typeof asset.metadata.thumbnailPath === 'string') {
          const absThumb = path.join(libPath, asset.metadata.thumbnailPath);
          if (fs.existsSync(absThumb)) {
            let relativeDir = path.dirname(asset.metadata.thumbnailPath).replace(/\\/g, '/');
            if (relativeDir === '.') relativeDir = '';
            zip.addLocalFile(absThumb, relativeDir);
          }
        }
      }

      // Prompt user for save location
      let defaultName = `${brand.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_package.zip`;
      if (customPackageName) {
         defaultName = customPackageName.endsWith('.zip') ? customPackageName : `${customPackageName}.zip`;
      }
      let savePath = "";
      if (customExportPath) {
        savePath = path.join(customExportPath, defaultName);
      } else {
        savePath = path.join(os.homedir(), 'Desktop', defaultName);
      }

      // Write zip to disk
      zip.writeZip(savePath);
      return true;

    } catch (e: any) {
      console.error("Export error:", e);
      throw new Error(`Failed to export brand: ${e.message}`);
    }
  }
}
