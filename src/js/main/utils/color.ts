import { ValidationError } from "../domain/errors";
import type { HSLColor, RGBColor } from "../domain/models";

const HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;
const round = (value: number, precision = 2): number => Number(value.toFixed(precision));
const clampByte = (value: number): number => Math.round(Math.min(255, Math.max(0, value)));

export const isValidHex = (value: string): boolean => HEX_PATTERN.test(value.trim());

export const normalizeHex = (value: string): string => {
  const trimmed = value.trim();
  if (!isValidHex(trimmed)) {
    throw new ValidationError("HEX colors must contain exactly six hexadecimal characters.");
  }
  return `#${trimmed.replace("#", "").toUpperCase()}`;
};

export const isValidRgb = (value: RGBColor): boolean =>
  [value.r, value.g, value.b].every((channel) => Number.isInteger(channel) && channel >= 0 && channel <= 255);

export const isValidHsl = (value: HSLColor): boolean =>
  Number.isFinite(value.h) && Number.isFinite(value.s) && Number.isFinite(value.l) &&
  value.h >= 0 && value.h <= 360 && value.s >= 0 && value.s <= 100 && value.l >= 0 && value.l <= 100;

export const hexToRgb = (value: string): RGBColor => {
  const hex = normalizeHex(value).slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
};

export const rgbToHex = (value: RGBColor): string => {
  if (!isValidRgb(value)) {
    throw new ValidationError("RGB channels must be whole numbers between 0 and 255.");
  }
  return `#${[value.r, value.g, value.b].map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
};

export const rgbToHsl = (value: RGBColor): HSLColor => {
  if (!isValidRgb(value)) {
    throw new ValidationError("RGB channels must be whole numbers between 0 and 255.");
  }
  const r = value.r / 255;
  const g = value.g / 255;
  const b = value.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  return { h: round(h), s: round(s * 100), l: round(l * 100) };
};

export const hslToRgb = (value: HSLColor): RGBColor => {
  if (!isValidHsl(value)) {
    throw new ValidationError("HSL values must be within h: 0–360, s/l: 0–100.");
  }
  const h = value.h / 360;
  const s = value.s / 100;
  const l = value.l / 100;
  if (s === 0) {
    const channel = clampByte(l * 255);
    return { r: channel, g: channel, b: channel };
  }

  const hueToChannel = (offset: number): number => {
    const k = (offset + h * 12) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };

  return { r: clampByte(255 * hueToChannel(0)), g: clampByte(255 * hueToChannel(8)), b: clampByte(255 * hueToChannel(4)) };
};
