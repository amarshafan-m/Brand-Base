import { describe, expect, it } from "vitest";
import type { Asset } from "../../src/domain/models";
import { filterAssets, sortAssets } from "../../src/utils/asset-query";

const assets: Asset[] = [
  { id: "1", brandId: "northstar", name: "Alpha Logo", type: "logo", category: "Logos", filePath: "alpha.svg", extension: "svg", size: 10, tags: ["Approved", "Vector"], favorite: true, status: "approved", version: "1", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-03T00:00:00.000Z", metadata: {}, schemaVersion: 1 },
  { id: "2", brandId: "northstar", name: "Bravo Music", type: "music", category: "Audio", filePath: "bravo.wav", extension: "wav", size: 40, tags: ["Intro", "Licensed"], favorite: false, status: "draft", version: "1", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z", metadata: {}, schemaVersion: 1 },
  { id: "3", brandId: "harbor", name: "Charlie Logo", type: "logo", category: "Logos", filePath: "charlie.svg", extension: "svg", size: 25, tags: ["Approved", "Dark"], favorite: true, status: "approved", version: "1", createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", metadata: {}, schemaVersion: 1 },
];

describe("asset query contracts", () => {
  it("combines case-insensitive query and filters", () => {
    expect(filterAssets(assets, { query: "ALPHA" }).map((asset) => asset.id)).toEqual(["1"]);
    expect(filterAssets(assets, { brandId: "northstar", type: "logo", favorite: true }).map((asset) => asset.id)).toEqual(["1"]);
    expect(filterAssets(assets, { status: "approved", tags: ["approved", "vector"] }).map((asset) => asset.id)).toEqual(["1"]);
    expect(filterAssets(assets, { extension: ".svg", favorite: true }).map((asset) => asset.id)).toEqual(["1", "3"]);
  });

  it("sorts every supported field predictably", () => {
    expect(sortAssets(assets, { field: "name", direction: "desc" }).map((asset) => asset.id)).toEqual(["3", "2", "1"]);
    expect(sortAssets(assets, { field: "createdAt", direction: "asc" }).map((asset) => asset.id)).toEqual(["1", "2", "3"]);
    expect(sortAssets(assets, { field: "updatedAt", direction: "desc" }).map((asset) => asset.id)).toEqual(["1", "2", "3"]);
    expect(sortAssets(assets, { field: "size", direction: "asc" }).map((asset) => asset.id)).toEqual(["1", "3", "2"]);
    expect(sortAssets(assets, { field: "type", direction: "asc" }).map((asset) => asset.id)).toEqual(["1", "3", "2"]);
  });
});
