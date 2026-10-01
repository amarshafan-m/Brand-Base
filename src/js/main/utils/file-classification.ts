import type { AssetType } from "../domain/models";

const EXTENSION_MAP: Record<string, AssetType> = {
  // Images
  jpg: "image", jpeg: "image", png: "image", webp: "image", gif: "image", 
  tif: "image", tiff: "image", bmp: "image", psd: "image", psb: "image",
  // Video
  mp4: "video", mov: "video", m4v: "video", avi: "video", wmv: "video", 
  webm: "video", mkv: "video", prores: "video", mxf: "video",
  // Audio
  wav: "audio", mp3: "audio", aiff: "audio", aif: "audio", m4a: "audio", 
  aac: "audio", flac: "audio",
  // Graphics
  ai: "graphic", eps: "graphic", svg: "graphic", pdf: "graphic",
  // Specific
  // Fonts
  ttf: "font", otf: "font", woff: "font", woff2: "font"
};

/**
 * Returns the file extension (lowercase, no dot).
 */
export function getExtension(filename: string): string {
  if (!filename || !filename.includes(".")) return "";
  const parts = filename.split(".");
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Returns the base name without extension.
 */
export function getBaseName(filename: string): string {
  if (!filename || !filename.includes(".")) return filename;
  const parts = filename.split(".");
  parts.pop(); // remove extension
  return parts.join(".");
}

/**
 * Detects the asset type based on the file extension.
 * Unknown extensions return "other".
 */
export function detectAssetType(filename: string): AssetType {
  const ext = getExtension(filename);
  return EXTENSION_MAP[ext] || "other";
}
