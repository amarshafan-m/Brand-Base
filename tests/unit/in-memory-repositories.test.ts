import { describe, expect, it } from "vitest";
import { DuplicateError, NotFoundError } from "../../src/domain/errors";
import {
  InMemoryAssetRepository,
  InMemoryColorRepository,
  InMemoryPackageRepository,
  InMemoryRecentRepository,
  InMemorySettingsRepository,
  InMemoryTypographyRepository,
} from "../../src/repositories/in-memory";
import { createDefaultSettings } from "../../src/domain/defaults";

const timestamp = "2026-01-01T00:00:00.000Z";

describe("in-memory repository contracts", () => {
  it("creates, reads, updates, and deletes asset records", async () => {
    const repository = new InMemoryAssetRepository();
    const asset = { id: "asset", brandId: "brand", name: "Logo", type: "logo" as const, category: "Logos", filePath: "logo.svg", tags: [], favorite: false, status: "approved" as const, version: "1", createdAt: timestamp, updatedAt: timestamp, metadata: {}, schemaVersion: 1 };
    await repository.create(asset);
    expect(await repository.getById("asset")).toEqual(asset);
    await repository.update({ ...asset, name: "Updated" });
    expect((await repository.getByBrandId("brand"))[0]?.name).toBe("Updated");
    await expect(repository.create(asset)).rejects.toBeInstanceOf(DuplicateError);
    await repository.delete("asset");
    await expect(repository.delete("asset")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("supports color, typography, package, settings, and recent record lifecycle", async () => {
    const colors = new InMemoryColorRepository();
    const typography = new InMemoryTypographyRepository();
    const packages = new InMemoryPackageRepository();
    const settings = new InMemorySettingsRepository(createDefaultSettings());
    const recent = new InMemoryRecentRepository();
    const color = { id: "color", brandId: "brand", name: "Blue", hex: "#0000FF", rgb: { r: 0, g: 0, b: 255 }, hsl: { h: 240, s: 100, l: 50 }, usage: "primary" as const, createdAt: timestamp, updatedAt: timestamp, schemaVersion: 1 };
    const style = { id: "type", brandId: "brand", role: "body" as const, fontFamily: "Adobe Clean", fontWeight: "400", schemaVersion: 1 };
    const brandPackage = { id: "package", brandId: "brand", name: "Starter", description: "", assetIds: [], createdAt: timestamp, updatedAt: timestamp, schemaVersion: 1 };
    await colors.create(color); await typography.create(style); await packages.create(brandPackage);
    expect(await colors.getByBrandId("brand")).toHaveLength(1);
    expect(await typography.getById("type")).toEqual(style);
    await packages.update({ ...brandPackage, name: "Updated Starter" });
    expect((await packages.getById("package"))?.name).toBe("Updated Starter");
    const currentSettings = await settings.get();
    await settings.update({ ...currentSettings, compactMode: true });
    expect((await settings.get()).compactMode).toBe(true);
    await recent.add({ id: "old", entityId: "1", entityType: "asset", action: "viewed", timestamp });
    await recent.add({ id: "new", entityId: "2", entityType: "brand", action: "created", timestamp: "2026-01-02T00:00:00.000Z" });
    expect((await recent.getRecent(1))[0]?.id).toBe("new");
    await colors.delete("color"); await typography.delete("type"); await packages.delete("package"); await recent.clear();
    expect(await recent.getRecent(10)).toHaveLength(0);
  });
});
