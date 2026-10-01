import { describe, expect, it } from "vitest";
import { DuplicateError, NotFoundError } from "../../src/domain/errors";
import { createApplicationContainer } from "../../src/services/container";
import type { IdGenerator } from "../../src/utils/id";

const testIds = (): IdGenerator => {
  let count = 0;
  return { generate: () => `id-${++count}` };
};

const createAsset = async (container: ReturnType<typeof createApplicationContainer>, brandId: string, name = "Primary Logo") =>
  container.assetService.create({
    brandId, name, type: "logo", category: "Logos", filePath: `demo/${name}.svg`, extension: "svg",
    tags: ["approved", "vector"], status: "approved", version: "1.0.0", metadata: {},
  });

describe("in-memory repositories and application services", () => {
  it("enforces default-brand rules and promotes a replacement when necessary", async () => {
    const container = createApplicationContainer(testIds());
    const first = await container.brandService.create({ name: "Northstar" });
    const second = await container.brandService.create({ name: "Harbor" });
    expect(first.isDefault).toBe(true);
    expect(second.isDefault).toBe(false);
    await container.brandService.setDefault(second.id);
    expect((await container.settingsService.getSettings()).defaultBrandId).toBe(second.id);
    await container.brandService.delete(second.id);
    expect((await container.brandService.getAll()).find((brand) => brand.id === first.id)?.isDefault).toBe(true);
    expect((await container.settingsService.getSettings()).defaultBrandId).toBe(first.id);
  });

  it("uses validation and duplicate checks for assets, queries, sorting, and favorites", async () => {
    const container = createApplicationContainer(testIds());
    const brand = await container.brandService.create({ name: "Northstar" });
    const logo = await createAsset(container, brand.id, "Primary Logo");
    await container.assetService.create({ brandId: brand.id, name: "Documentary Music", type: "music", category: "Audio", filePath: "demo/bed.wav", extension: "wav", size: 20, tags: ["intro", "licensed"], status: "draft", version: "1.0.0", metadata: {} });
    await expect(createAsset(container, brand.id, "Primary Logo")).rejects.toBeInstanceOf(DuplicateError);
    await container.assetService.favorite(logo.id);
    expect(await container.assetService.getFavorites()).toHaveLength(1);
    expect(await container.assetService.search({ query: "documentary", type: "music" }, { field: "name", direction: "asc" })).toHaveLength(1);
    expect(await container.assetService.search({ brandId: brand.id, favorite: true })).toEqual([expect.objectContaining({ id: logo.id })]);
  });

  it("prevents duplicate or cross-brand package asset references", async () => {
    const container = createApplicationContainer(testIds());
    const northstar = await container.brandService.create({ name: "Northstar" });
    const harbor = await container.brandService.create({ name: "Harbor" });
    const northstarAsset = await createAsset(container, northstar.id);
    const harborAsset = await createAsset(container, harbor.id, "Harbor Logo");
    const brandPackage = await container.packageService.create({ brandId: northstar.id, name: "Starter", assetIds: [northstarAsset.id] });
    await expect(container.packageService.addAssetReference(brandPackage.id, northstarAsset.id)).rejects.toBeInstanceOf(DuplicateError);
    await expect(container.packageService.addAssetReference(brandPackage.id, harborAsset.id)).rejects.toBeInstanceOf(DuplicateError);
  });

  it("keeps repository results isolated and reports missing records", async () => {
    const container = createApplicationContainer(testIds());
    const brand = await container.brandService.create({ name: "Northstar" });
    const firstRead = await container.brandRepository.getById(brand.id);
    firstRead!.name = "Mutated outside repository";
    expect((await container.brandRepository.getById(brand.id))?.name).toBe("Northstar");
    await expect(container.assetService.getById("missing")).rejects.toBeInstanceOf(NotFoundError);
    await container.brandRepository.delete(brand.id);
    await expect(container.brandRepository.delete(brand.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
