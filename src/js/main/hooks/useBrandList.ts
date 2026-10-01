import { useCallback } from "react";
import type { ApplicationContainer } from "../services/container";
import { useApplicationData } from "./useApplicationData";
import type { Brand } from "../domain/models";

export interface BrandStats {
  assetCount: number;
  colorCount: number;
  typographyCount: number;
}

export interface BrandWithStats extends Brand {
  stats: BrandStats;
}

export function useBrandList() {
  const loader = useCallback(async (container: ApplicationContainer): Promise<BrandWithStats[]> => {
    const brands = await container.brandService.getAll();
    const result = await Promise.all(brands.map(async (brand) => {
      const assets = await container.assetService.getByBrandId(brand.id);
      return {
        ...brand,
        stats: {
          assetCount: assets.length,
          colorCount: (await container.colorService.getByBrandId(brand.id)).length,
          typographyCount: (await container.typographyService.getByBrandId(brand.id)).length,
        }
      };
    }));
    return result;
  }, []);
  
  return useApplicationData(loader, [loader]);
}
