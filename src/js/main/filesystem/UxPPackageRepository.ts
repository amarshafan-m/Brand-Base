import { PackageRepository } from "../repositories/contracts";
import { BrandPackage, EntityId } from "../domain/models";
import { LibraryManager } from "./LibraryManager";
import { ensureFolder, getFileIfExists, getFolderIfExists, readJson, writeJsonSafe } from "./io";
import { cloneValue } from "../utils/clone";

export class UxPPackageRepository implements PackageRepository {
  constructor(private libraryManager: LibraryManager) {}

  async getAll(): Promise<BrandPackage[]> {
    const brandsFolder = await this.getBrandsFolder();
    const entries = await brandsFolder.getEntries();
    let allPackages: BrandPackage[] = [];
    for (const entry of entries) {
      if (entry.isFolder && !entry.name.startsWith("deleted-")) {
        allPackages = allPackages.concat(await this.getPackagesForBrandFolder(entry as any));
      }
    }
    return allPackages;
  }

  async getById(id: EntityId): Promise<BrandPackage | undefined> {
    const packages = await this.getAll();
    return packages.find((p) => p.id === id);
  }

  async getByBrandId(brandId: EntityId): Promise<BrandPackage[]> {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, brandId);
    if (!brandFolder) return [];
    return this.getPackagesForBrandFolder(brandFolder);
  }

  async create(brandPackage: BrandPackage): Promise<BrandPackage> {
    const cloned = cloneValue(brandPackage);
    const packages = await this.getByBrandId(brandPackage.brandId);
    packages.push(cloned);
    await this.savePackagesForBrand(brandPackage.brandId, packages);
    return cloned;
  }

  async update(brandPackage: BrandPackage): Promise<BrandPackage> {
    const cloned = cloneValue(brandPackage);
    const packages = await this.getByBrandId(brandPackage.brandId);
    const index = packages.findIndex((p) => p.id === brandPackage.id);
    if (index === -1) throw new Error("Package not found");
    packages[index] = cloned;
    await this.savePackagesForBrand(brandPackage.brandId, packages);
    return cloned;
  }

  async delete(id: EntityId): Promise<void> {
    const pkg = await this.getById(id);
    if (!pkg) return;
    const packages = await this.getByBrandId(pkg.brandId);
    const filtered = packages.filter((p) => p.id !== id);
    await this.savePackagesForBrand(pkg.brandId, filtered);
  }

  private async getBrandsFolder() {
    return ensureFolder(this.libraryManager.getLibraryFolder(), "brands");
  }

  private async getPackagesForBrandFolder(brandFolder: any): Promise<BrandPackage[]> {
    const file = await getFileIfExists(brandFolder, "packages.json");
    if (!file) return [];
    try {
      return await readJson<BrandPackage[]>(file);
    } catch {
      return [];
    }
  }

  private async savePackagesForBrand(brandId: string, packages: BrandPackage[]) {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await ensureFolder(brandsFolder, brandId);
    await writeJsonSafe(brandFolder, "packages.json", packages);
  }
}
