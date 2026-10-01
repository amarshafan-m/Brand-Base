const fs = require('fs');
const file = 'src/js/main/hooks/useBrandBaseData.ts';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `export function useAssets(brandId: string | undefined) {
  return useApplicationData(async (container) => {
    if (!brandId) return [];
    return container.assetService.getByBrandId(brandId);
  }, [brandId]);
}`;

const newCode = `export function useAssets(brandId: string | undefined) {
  const loader = useCallback(async (container: ApplicationContainer) => {
    if (!brandId) return [];
    return container.assetService.getByBrandId(brandId);
  }, [brandId]);
  return useApplicationData(loader, [loader]);
}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Success");
