import type { Asset, AssetSearchCriteria, AssetSortOptions } from "../domain/models";
import { compare } from "./date";

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

export const matchesAssetCriteria = (asset: Asset, criteria: AssetSearchCriteria): boolean => {
  if (criteria.brandId && asset.brandId !== criteria.brandId) return false;
  if (criteria.type && asset.type !== criteria.type) return false;
  if (criteria.category && normalize(asset.category) !== normalize(criteria.category)) return false;
  if (criteria.favorite !== undefined && asset.favorite !== criteria.favorite) return false;
  if (criteria.status && asset.status !== criteria.status) return false;
  if (criteria.extension && normalize(asset.extension ?? "") !== normalize(criteria.extension).replace(/^\./, "")) return false;
  if (criteria.tags?.length && !criteria.tags.every((tag) => asset.tags.some((assetTag) => normalize(assetTag) === normalize(tag)))) return false;

  if (criteria.query) {
    const query = normalize(criteria.query);
    const searchable = [asset.name, asset.category, asset.type, asset.extension ?? "", asset.status, ...asset.tags]
      .map(normalize)
      .join(" ");
    if (!searchable.includes(query)) return false;
  }
  return true;
};

export const filterAssets = (assets: Asset[], criteria: AssetSearchCriteria = {}): Asset[] =>
  assets.filter((asset) => matchesAssetCriteria(asset, criteria));

export const sortAssets = (assets: Asset[], options: AssetSortOptions = { field: "updatedAt", direction: "desc" }): Asset[] => {
  const modifier = options.direction === "asc" ? 1 : -1;
  return [...assets].sort((left, right) => {
    let result: number;
    switch (options.field) {
      case "name": result = left.name.localeCompare(right.name, undefined, { sensitivity: "base" }); break;
      case "type": result = left.type.localeCompare(right.type); break;
      case "size": result = (left.size ?? -1) - (right.size ?? -1); break;
      case "createdAt": result = compare(left.createdAt, right.createdAt); break;
      case "updatedAt": result = compare(left.updatedAt, right.updatedAt); break;
    }
    return result * modifier;
  });
};
