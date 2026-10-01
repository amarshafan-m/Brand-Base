const fs = require('fs');
const file = 'src/js/main/filesystem/UxPAssetRepository.ts';
let code = fs.readFileSync(file, 'utf8');

const oldBlock = `
    // Remove metadata AND physical file
    const assets = await this.getAssetsForBrandFolder(brandFolder);
    const filtered = assets.filter((a) => a.id !== id);
    await this.saveAssetsForBrand(brandFolder, filtered);
    
    // Delete physical file if it's library-relative
    if (asset.filePath && !asset.filePath.startsWith('uxp-token:') && !asset.filePath.startsWith('absolute:')) {
      // BUG FIX: Check if any other asset in the library points to this exact same file path (e.g. metadata duplicates)
      const isShared = filtered.some(a => a.filePath === asset.filePath);
      
      if (!isShared) {
        try {
          const p = typeof window !== 'undefined' && window.require ? window.require('path') : require('path');
          const fsp = typeof window !== 'undefined' && window.require ? window.require('fs').promises : require('fs').promises;
          const f = typeof window !== 'undefined' && window.require ? window.require('fs') : require('fs');
          
          const libPath = this.libraryManager.getLibraryPath();
          const absPath = p.join(libPath, asset.filePath);
          
          if (f.existsSync(absPath)) {
            await fsp.unlink(absPath);
          }
          
          // Also try to delete the thumbnail if it exists
          const thumbPath = p.join(libPath, 'brands', asset.brandId, 'thumbnails', asset.id + '.jpg');
          if (f.existsSync(thumbPath)) {
            await fsp.unlink(thumbPath);
          }
        } catch (e) {
          console.warn("Failed to delete physical file:", e);
        }
      }
    }
`;

const newBlock = `
    const assets = await this.getAssetsForBrandFolder(brandFolder);
    const filtered = assets.filter((a) => a.id !== id);
    
    // 1. Delete physical file first
    if (asset.filePath && !asset.filePath.startsWith('uxp-token:') && !asset.filePath.startsWith('absolute:')) {
      const isShared = filtered.some(a => a.filePath === asset.filePath);
      if (!isShared) {
        try {
          const p = typeof window !== 'undefined' && window.require ? window.require('path') : require('path');
          const fsp = typeof window !== 'undefined' && window.require ? window.require('fs').promises : require('fs').promises;
          const f = typeof window !== 'undefined' && window.require ? window.require('fs') : require('fs');
          
          const libPath = this.libraryManager.getLibraryPath();
          const absPath = p.join(libPath, asset.filePath);
          
          if (f.existsSync(absPath)) {
            await fsp.unlink(absPath);
          }
          
          const thumbPath = p.join(libPath, 'brands', asset.brandId, 'thumbnails', asset.id + '.jpg');
          if (f.existsSync(thumbPath)) {
            await fsp.unlink(thumbPath);
          }
        } catch (e) {
          console.error("Failed to delete physical file:", e);
          throw new Error("Failed to delete file from disk. Ensure it is not open in another program.");
        }
      }
    }
    
    // 2. Only save metadata if physical deletion succeeds
    await this.saveAssetsForBrand(brandFolder, filtered);
`;

if (code.includes('await this.saveAssetsForBrand(brandFolder, filtered);')) {
  code = code.replace(oldBlock.trim(), newBlock.trim());
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Not found");
}
