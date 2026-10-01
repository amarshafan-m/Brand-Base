import { describe, expect, it } from "vitest";
import { createDefaultSettings } from "../../src/domain/defaults";
import { ValidationError } from "../../src/domain/errors";
import { migrateRecord } from "../../src/domain/migrations";
import { CURRENT_SCHEMA_VERSION } from "../../src/domain/schema";
import { validateBrand, validateTypographyStyle } from "../../src/domain/validation";
import { hexToRgb, hslToRgb, isValidHex, normalizeHex, rgbToHex, rgbToHsl } from "../../src/utils/color";
import { compare, formatForDisplay, now, parse } from "../../src/utils/date";
import { defaultIdGenerator } from "../../src/utils/id";

describe("domain utilities", () => {
  it("normalizes and converts primary colors consistently", () => {
    expect(normalizeHex("ffffff")).toBe("#FFFFFF");
    expect(normalizeHex("#ff0000")).toBe("#FF0000");
    expect(isValidHex("#00FF00")).toBe(true);
    expect(isValidHex("#FFF")).toBe(false);
    expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#FF0000");
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
    expect(() => normalizeHex("#nope")).toThrow(ValidationError);
  });

  it("uses one valid default settings factory", () => {
    expect(createDefaultSettings()).toEqual({
      theme: "dark", compactMode: false, gridSize: "medium", autoGenerateThumbnails: true,
      confirmDelete: true, showFileExtensions: false, rememberLastView: true, schemaVersion: CURRENT_SCHEMA_VERSION,
    });
  });

  it("validates required domain fields", () => {
    expect(() => validateBrand({
      id: "brand-1", name: " ", description: "", isDefault: false,
      createdAt: now(), updatedAt: now(), logoIds: [], colorIds: [], typography: [], packageIds: [],
      settings: { values: {} }, schemaVersion: CURRENT_SCHEMA_VERSION,
    })).toThrow(ValidationError);
    expect(() => validateTypographyStyle({ id: "type-1", brandId: "brand-1", role: "heading", fontFamily: "Adobe Clean", fontWeight: "700", fontSize: 0, schemaVersion: 1 })).toThrow(ValidationError);
  });

  it("centralizes dates and identifiers", () => {
    const timestamp = now();
    expect(parse(timestamp).toISOString()).toBe(timestamp);
    expect(compare("2026-01-01T00:00:00.000Z", "2026-01-02T00:00:00.000Z")).toBeLessThan(0);
    expect(formatForDisplay(timestamp)).toContain("2026");
    expect(defaultIdGenerator.generate()).not.toBe(defaultIdGenerator.generate());
  });

  it("leaves records at their current schema version unchanged", () => {
    const record = { schemaVersion: CURRENT_SCHEMA_VERSION, name: "Current" };
    expect(migrateRecord(record, [])).toBe(record);
  });
});
