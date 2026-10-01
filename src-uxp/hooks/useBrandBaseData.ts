import { useCallback } from "react";
import type { Brand, RecentItem } from "../domain/models";
import type { ApplicationContainer } from "../services/container";
import type { PageId } from "../types/navigation";
import { useApplicationData } from "./useApplicationData";

export interface HomeData {
  brands: Brand[];
  totalAssets: number;
  favorites: number;
  packages: number;
  activeBrand?: Brand;
  recent: RecentItem[];
}

export function useHomeData() {
  const loader = useCallback(async (container: ApplicationContainer): Promise<HomeData> => {
    const [brands, assets, favorites, packages, recent, settings] = await Promise.all([
      container.brandService.getAll(), container.assetService.getAll(), container.assetService.getFavorites(),
      container.packageService.getAll(), container.recentService.getRecent(5), container.settingsService.getSettings(),
    ]);
    return { brands, totalAssets: assets.length, favorites: favorites.length, packages: packages.length, activeBrand: brands.find((brand) => brand.id === settings.defaultBrandId) ?? brands.find((brand) => brand.isDefault), recent } satisfies HomeData;
  }, []);
  return useApplicationData(loader, [loader]);
}

export function useBrands() {
  const loader = useCallback((container: ApplicationContainer) => container.brandService.getAll(), []);
  return useApplicationData(loader, [loader]);
}

export function useLibraryCount(page: Exclude<PageId, "home" | "settings">) {
  const loader = useCallback(async (container: ApplicationContainer): Promise<number> => {
    const brands = await container.brandService.getAll();
    const activeBrand = brands.find(b => b.isDefault);
    const activeBrandId = activeBrand?.id;

    switch (page) {
      case "assets": return activeBrandId ? (await container.assetService.getByBrandId(activeBrandId)).length : 0;
      case "brands": return brands.length;
      case "colors": return activeBrandId ? (await container.colorService.getByBrandId(activeBrandId)).length : 0;
      case "typography": return activeBrandId ? (await container.typographyService.getByBrandId(activeBrandId)).length : 0;
      case "packages": return activeBrandId ? (await container.packageService.getByBrandId(activeBrandId)).length : 0;
      case "favorites": return (await container.assetService.getFavorites()).filter(a => a.brandId === activeBrandId).length;
      case "recent": return (await container.recentService.getRecent()).length; // Recent spans all? Or just active? Let's leave recent alone.
      case "audio": return activeBrandId ? (await container.assetService.search({ type: "audio", brandId: activeBrandId })).length : 0;
      case "graphics": return activeBrandId ? (await container.assetService.search({ type: "graphic", brandId: activeBrandId })).length : 0;
      case "mogrts": return activeBrandId ? (await container.assetService.search({ type: "mogrt", brandId: activeBrandId })).length : 0;
      case "templates": return activeBrandId ? (await container.assetService.search({ type: "template", brandId: activeBrandId })).length : 0;
      case "presets": return activeBrandId ? (await container.assetService.search({ type: "preset", brandId: activeBrandId })).length : 0;
    }
  }, [page]);
  return useApplicationData(loader, [loader]);
}

export function useAssets(brandId: string | undefined) {
  return useApplicationData(async (container) => {
    if (!brandId) return [];
    return container.assetService.getByBrandId(brandId);
  }, [brandId]);
}
