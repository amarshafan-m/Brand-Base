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

export class BrandImportService {
  constructor(
    private brandService: BrandService,
    private assetService: AssetService,
    private colorService: ColorService,
    private typographyService: TypographyService,
    private libraryManager: LibraryManager
  ) {}

  // We need to generate IDs, so we'll just use a simple fallback if we don't have idGenerator here
  private generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async importBrand(zipPath: string): Promise<any> {
    if (!AdmZip || !fs || !path) throw new Error("Import is only supported in Adobe Premiere Pro.");
    try {
      const libPath = this.libraryManager.getLibraryPath();
      if (!libPath) throw new Error("Library path not found");

      const zip = new AdmZip(zipPath);
      
      const zipEntries = zip.getEntries();
      const manifestEntry = zipEntries.find((e: any) => e.entryName === "brand.json");
      
      if (!manifestEntry) throw new Error("Invalid brand package: Missing brand.json manifest.");

      const manifestContent = zip.readAsText(manifestEntry);
      const manifest = JSON.parse(manifestContent);

      if (manifest.type !== "brand_package" || !manifest.brand) {
        throw new Error("Invalid brand package format.");
      }

      const newBrandName = manifest.brand.name + " (Imported)";
      
      const existingBrands = await this.brandService.getAll();
      const existing = existingBrands.find(b => b.name.trim().toLocaleLowerCase() === newBrandName.trim().toLocaleLowerCase());
      if (existing) {
        // Delete it first so we can replace it cleanly
        await this.brandService.delete(existing.id);
      }

      const newBrandId = this.generateId();
      
      const brandLibFolder = path.join(libPath, 'brands', newBrandId);
      if (!fs.existsSync(brandLibFolder)) {
        fs.mkdirSync(brandLibFolder, { recursive: true });
      }

      // Security: Direct zip extraction prevents Zip Slip and removes sync IO operations
      const oldBrandId = manifest.brand.id;
      const oldPrefix = `brands/${oldBrandId}/`;
      const newPrefix = `brands/${newBrandId}/`;

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;
        const entryName = entry.entryName.replace(/\\/g, '/');

        // Prevent Zip Slip vulnerabilities
        if (entryName.includes('..') || entryName.startsWith('/')) {
          console.warn(`Skipping potentially malicious zip entry: ${entryName}`);
          continue;
        }

        // Only extract brand assets (skip manifest as we already parsed it)
        if (entryName.startsWith(oldPrefix)) {
          const newEntryName = newPrefix + entryName.substring(oldPrefix.length);
          const destPath = path.join(libPath, newEntryName);
          
          // Ensure parent directory exists asynchronously
          await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
          
          // Write the file
          await fs.promises.writeFile(destPath, entry.getData());
        }
      }

      // 4. NOW create the brand database entry (writes brand.json safely into the copied directory structure)
      const brandData = {
        id: newBrandId, // Force the service to use our ID
        name: newBrandName,
        description: manifest.brand.description,
        settings: manifest.brand.settings,
        isDefault: true // Immediately set the imported brand as active
      };

      const newBrand = await this.brandService.create(brandData as any);
      
      const oldToNewColorId: Record<string, string> = {};
      if (manifest.colors && Array.isArray(manifest.colors)) {
        for (const color of manifest.colors) {
          const newColor = await this.colorService.create({ brandId: newBrandId, name: color.name, hex: color.hex, usage: color.usage });
          if (newColor && newColor.id) oldToNewColorId[color.id] = newColor.id;
        }
      }

      const oldToNewTypographyId: Record<string, string> = {};
      if (manifest.typography && Array.isArray(manifest.typography)) {
        for (const type of manifest.typography) {
          const newType = await this.typographyService.create({ brandId: newBrandId, name: type.name || 'Imported Typography', role: type.role, fontFamily: type.fontFamily, fontWeight: type.fontWeight, usage: type.usage });
          if (newType && newType.id) oldToNewTypographyId[type.id] = newType.id;
        }
      }

      const oldToNewAssetId: Record<string, string> = {};

      if (manifest.assets && Array.isArray(manifest.assets)) {
        for (const asset of manifest.assets) {
          // Rewrite file paths in the metadata too
          let newFilePath = asset.filePath;
          if (newFilePath && newFilePath.startsWith(oldPrefix)) {
            newFilePath = newPrefix + newFilePath.substring(oldPrefix.length);
          }
          let newThumbPath = asset.metadata?.thumbnailPath;
          if (newThumbPath && newThumbPath.startsWith(oldPrefix)) {
            newThumbPath = newPrefix + newThumbPath.substring(oldPrefix.length);
          }

          const newAsset = await this.assetService.create({
            brandId: newBrandId,
            name: asset.name,
            type: asset.type,
            filePath: newFilePath,
            metadata: {
              ...asset.metadata,
              thumbnailPath: newThumbPath
            },
            tags: asset.tags || [],
            favorite: asset.favorite || false,
            status: asset.status || 'active',
            category: asset.category || 'uncategorized',
            version: asset.version || 1,
            size: asset.size,
            importAnyway: true
          });
          
          if (newAsset && newAsset.id) {
             oldToNewAssetId[asset.id] = newAsset.id;
          }
        }
      }

      // Finally, if the brand had logoIds, colorIds, or typography, map them!
      const brandToUpdate = await this.brandService.getById(newBrandId);
      if (brandToUpdate) {
         const newLogoIds = manifest.brand.logoIds ? manifest.brand.logoIds.map((id: string) => oldToNewAssetId[id]).filter(Boolean) : [];
         const newColorIds = manifest.brand.colorIds ? manifest.brand.colorIds.map((id: string) => oldToNewColorId[id]).filter(Boolean) : [];
         const newTypography = manifest.brand.typography ? manifest.brand.typography.map((id: string) => oldToNewTypographyId[id]).filter(Boolean) : [];
         
         await this.brandService.update({ 
           ...brandToUpdate, 
           logoIds: newLogoIds.length > 0 ? newLogoIds : brandToUpdate.logoIds,
           colorIds: newColorIds.length > 0 ? newColorIds : brandToUpdate.colorIds,
           typography: newTypography.length > 0 ? newTypography : brandToUpdate.typography
         });
      }

      // ULTIMATE FIX: Forcefully re-write all JSON files at the end to ensure they aren't wiped!
      try {
        const brandFolderNative = path.join(libPath, 'brands', newBrandId);
        if (fs.existsSync(brandFolderNative)) {
           const finalBrand = await this.brandService.getById(newBrandId);
           await fs.promises.writeFile(path.join(brandFolderNative, 'brand.json'), JSON.stringify(finalBrand, null, 2));
           
           const finalAssets = await this.assetService.getByBrandId(newBrandId);
           await fs.promises.writeFile(path.join(brandFolderNative, 'assets.json'), JSON.stringify(finalAssets, null, 2));
           
           const finalColors = await this.colorService.getByBrandId(newBrandId);
           await fs.promises.writeFile(path.join(brandFolderNative, 'colors.json'), JSON.stringify(finalColors, null, 2));
           
           const finalTypo = await this.typographyService.getByBrandId(newBrandId);
           await fs.promises.writeFile(path.join(brandFolderNative, 'typography.json'), JSON.stringify(finalTypo, null, 2));
        }
      } catch (forceErr) {
        console.error("Failed to force rewrite json", forceErr);
      }

      return {
         assets: manifest.assets ? manifest.assets.length : 0,
         colors: manifest.colors ? manifest.colors.length : 0,
         typography: manifest.typography ? manifest.typography.length : 0
      };
    } catch (e: any) {
      console.error("Import error:", e);
      throw new Error(`Failed to import package: ${e.message}`);
    }
  }
}
