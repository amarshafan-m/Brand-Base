import { ValidationError } from "./errors";
import type {
  Asset,
  Brand,
  BrandBaseSettings,
  BrandColor,
  BrandPackage,
  TypographyStyle,
} from "./models";
import { parse } from "../utils/date";
import { isValidHex, isValidHsl, isValidRgb } from "../utils/color";

const assetTypes = new Set<Asset["type"]>(["logo", "image", "video", "audio", "music", "sfx", "graphic", "mogrt", "template", "preset", "font", "other"]);
const assetStatuses = new Set<Asset["status"]>(["approved", "draft", "archived", "deprecated"]);
const colorUsages = new Set<BrandColor["usage"]>(["primary", "secondary", "accent", "background", "text", "custom"]);
const typographyRoles = new Set<TypographyStyle["role"]>(["heading", "subheading", "body", "caption", "display", "custom"]);

const nonEmpty = (value: string, field: string, issues: string[]): void => {
  if (!value.trim()) issues.push(`${field} cannot be empty.`);
};

const validTimestamp = (value: string, field: string, issues: string[]): void => {
  try { parse(value); } catch { issues.push(`${field} must be a valid ISO 8601 timestamp.`); }
};

const uniqueIds = (ids: string[], field: string, issues: string[]): void => {
  if (new Set(ids).size !== ids.length) issues.push(`${field} cannot contain duplicate ids.`);
};

const throwIfInvalid = (entity: string, issues: string[]): void => {
  if (issues.length) throw new ValidationError(`Invalid ${entity}.`, issues);
};

export const validateBrand = (brand: Brand): Brand => {
  const issues: string[] = [];
  nonEmpty(brand.id, "Brand id", issues);
  nonEmpty(brand.name, "Brand name", issues);
  validTimestamp(brand.createdAt, "Brand createdAt", issues);
  validTimestamp(brand.updatedAt, "Brand updatedAt", issues);
  uniqueIds(brand.logoIds, "Brand logoIds", issues);
  uniqueIds(brand.colorIds, "Brand colorIds", issues);
  uniqueIds(brand.typography, "Brand typography", issues);
  uniqueIds(brand.packageIds, "Brand packageIds", issues);
  if (brand.schemaVersion < 1) issues.push("Brand schemaVersion must be positive.");
  throwIfInvalid("brand", issues);
  return brand;
};

export const validateAsset = (asset: Asset): Asset => {
  const issues: string[] = [];
  nonEmpty(asset.id, "Asset id", issues);
  nonEmpty(asset.brandId, "Asset brandId", issues);
  nonEmpty(asset.name, "Asset name", issues);
  nonEmpty(asset.category, "Asset category", issues);
  nonEmpty(asset.filePath, "Asset filePath", issues);
  nonEmpty(asset.version, "Asset version", issues);
  if (!assetTypes.has(asset.type)) issues.push("Asset type is invalid.");
  if (!assetStatuses.has(asset.status)) issues.push("Asset status is invalid.");
  if (asset.size !== undefined && (!Number.isFinite(asset.size) || asset.size < 0)) issues.push("Asset size must be a non-negative number.");
  if (new Set(asset.tags.map((tag) => tag.toLocaleLowerCase())).size !== asset.tags.length) issues.push("Asset tags cannot contain duplicates.");
  validTimestamp(asset.createdAt, "Asset createdAt", issues);
  validTimestamp(asset.updatedAt, "Asset updatedAt", issues);
  if (asset.schemaVersion < 1) issues.push("Asset schemaVersion must be positive.");
  throwIfInvalid("asset", issues);
  return asset;
};

export const validateBrandColor = (color: BrandColor): BrandColor => {
  const issues: string[] = [];
  nonEmpty(color.id, "Color id", issues);
  nonEmpty(color.brandId, "Color brandId", issues);
  nonEmpty(color.name, "Color name", issues);
  if (!isValidHex(color.hex)) issues.push("Color HEX value is invalid.");
  if (!isValidRgb(color.rgb)) issues.push("Color RGB values are invalid.");
  if (!isValidHsl(color.hsl)) issues.push("Color HSL values are invalid.");
  if (!colorUsages.has(color.usage)) issues.push("Color usage is invalid.");
  validTimestamp(color.createdAt, "Color createdAt", issues);
  validTimestamp(color.updatedAt, "Color updatedAt", issues);
  if (color.schemaVersion < 1) issues.push("Color schemaVersion must be positive.");
  throwIfInvalid("color", issues);
  return color;
};

export const validateTypographyStyle = (style: TypographyStyle): TypographyStyle => {
  const issues: string[] = [];
  nonEmpty(style.id, "Typography id", issues);
  nonEmpty(style.brandId, "Typography brandId", issues);
  nonEmpty(style.fontFamily, "Typography fontFamily", issues);
  nonEmpty(style.fontWeight, "Typography fontWeight", issues);
  if (!typographyRoles.has(style.role)) issues.push("Typography role is invalid.");
  if (style.fontSize !== undefined && (!Number.isFinite(style.fontSize) || style.fontSize <= 0)) issues.push("Typography fontSize must be greater than zero.");
  if (style.lineHeight !== undefined && (!Number.isFinite(style.lineHeight) || style.lineHeight <= 0)) issues.push("Typography lineHeight must be greater than zero.");
  if (style.letterSpacing !== undefined && !Number.isFinite(style.letterSpacing)) issues.push("Typography letterSpacing must be a finite number.");
  if (style.schemaVersion < 1) issues.push("Typography schemaVersion must be positive.");
  throwIfInvalid("typography", issues);
  return style;
};

export const validateBrandPackage = (brandPackage: BrandPackage): BrandPackage => {
  const issues: string[] = [];
  nonEmpty(brandPackage.id, "Package id", issues);
  nonEmpty(brandPackage.brandId, "Package brandId", issues);
  nonEmpty(brandPackage.name, "Package name", issues);
  uniqueIds(brandPackage.assetIds, "Package assetIds", issues);
  validTimestamp(brandPackage.createdAt, "Package createdAt", issues);
  validTimestamp(brandPackage.updatedAt, "Package updatedAt", issues);
  if (brandPackage.schemaVersion < 1) issues.push("Package schemaVersion must be positive.");
  throwIfInvalid("package", issues);
  return brandPackage;
};

export const validateSettings = (settings: BrandBaseSettings): BrandBaseSettings => {
  const issues: string[] = [];
  if (settings.theme !== "dark" && settings.theme !== "system") issues.push("Settings theme is invalid.");
  if (!(["small", "medium", "large"] as const).includes(settings.gridSize)) issues.push("Settings gridSize is invalid.");
  for (const key of ["compactMode", "autoGenerateThumbnails", "confirmDelete", "showFileExtensions", "rememberLastView"] as const) {
    if (typeof settings[key] !== "boolean") issues.push(`Settings ${key} must be boolean.`);
  }
  if (settings.libraryLocation !== undefined && !settings.libraryLocation.trim()) issues.push("Settings libraryLocation cannot be empty when provided.");
  if (settings.schemaVersion < 1) issues.push("Settings schemaVersion must be positive.");
  throwIfInvalid("settings", issues);
  return settings;
};
