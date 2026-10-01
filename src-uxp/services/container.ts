import { createDefaultSettings } from "../domain/defaults";
import type { BrandBaseSettings } from "../domain/models";
import {
  InMemoryAssetRepository,
  InMemoryBrandRepository,
  InMemoryColorRepository,
  InMemoryPackageRepository,
  InMemoryRecentRepository,
  InMemorySettingsRepository,
  InMemoryTypographyRepository,
} from "../repositories/in-memory";
import {
  AssetRepository,
  BrandRepository,
  ColorRepository,
  PackageRepository,
  RecentRepository,
  SettingsRepository,
  TypographyRepository,
} from "../repositories/contracts";
import type { IdGenerator } from "../utils/id";
import { defaultIdGenerator } from "../utils/id";
import { AssetService } from "./AssetService";
import { BrandService } from "./BrandService";
import { ColorService } from "./ColorService";
import { PackageService } from "./PackageService";
import { RecentService } from "./RecentService";
import { SettingsService } from "./SettingsService";
import { TypographyService } from "./TypographyService";

import { AssetIntegrityService } from "./AssetIntegrityService";
import type { PremiereAdapter } from "../premiere/models";
import { UxPPremiereAdapter, MockPremiereAdapter } from "../premiere/UxPPremiereAdapter";
import { PremiereAssetImportService } from "../premiere/PremiereAssetImportService";
import { PremiereTimelineService } from "../premiere/PremiereTimelineService";

export interface ApplicationContainer {
  assetRepository: AssetRepository;
  brandRepository: BrandRepository;
  colorRepository: ColorRepository;
  typographyRepository: TypographyRepository;
  packageRepository: PackageRepository;
  settingsRepository: SettingsRepository;
  recentRepository: RecentRepository;
  assetService: AssetService;
  brandService: BrandService;
  colorService: ColorService;
  typographyService: TypographyService;
  packageService: PackageService;
  settingsService: SettingsService;
  recentService: RecentService;
  assetIntegrityService: AssetIntegrityService;
  premiereAdapter: PremiereAdapter;
  premiereAssetImportService: PremiereAssetImportService;
  premiereTimelineService: PremiereTimelineService;
}

export const createApplicationContainer = (
  idGenerator: IdGenerator = defaultIdGenerator,
  initialSettings: BrandBaseSettings = createDefaultSettings(),
): ApplicationContainer => {
  const assetRepository = new InMemoryAssetRepository();
  const brandRepository = new InMemoryBrandRepository();
  const colorRepository = new InMemoryColorRepository();
  const typographyRepository = new InMemoryTypographyRepository();
  const packageRepository = new InMemoryPackageRepository();
  const settingsRepository = new InMemorySettingsRepository(initialSettings);
  const recentRepository = new InMemoryRecentRepository();

  const settingsService = new SettingsService(settingsRepository);
  const brandService = new BrandService(brandRepository, settingsRepository, idGenerator);
  const assetService = new AssetService(assetRepository, brandRepository, idGenerator);
  const colorService = new ColorService(colorRepository, brandRepository, idGenerator);
  const typographyService = new TypographyService(typographyRepository, brandRepository, idGenerator);
  const packageService = new PackageService(packageRepository, brandRepository, assetRepository, idGenerator);
  const recentService = new RecentService(recentRepository, idGenerator);
  const assetIntegrityService = new AssetIntegrityService(assetRepository, brandRepository, libraryManager as any);
  const premiereAdapter = new UxPPremiereAdapter();
  const premiereAssetImportService = new PremiereAssetImportService(premiereAdapter, libraryManager);
  const premiereTimelineService = new PremiereTimelineService(premiereAdapter, libraryManager);

  return {
    assetRepository, brandRepository, colorRepository, typographyRepository, packageRepository, settingsRepository, recentRepository,
    assetService, brandService, colorService, typographyService, packageService, settingsService, recentService, assetIntegrityService, premiereAdapter, premiereAssetImportService, premiereTimelineService,
  };
};

// Add UXP factory function
import { libraryManager } from "../filesystem/LibraryManager";
import { UxPAssetRepository } from "../filesystem/UxPAssetRepository";
import { UxPBrandRepository } from "../filesystem/UxPBrandRepository";
import { UxPColorRepository } from "../filesystem/UxPColorRepository";
import { UxPPackageRepository } from "../filesystem/UxPPackageRepository";
import { UxPRecentRepository } from "../filesystem/UxPRecentRepository";
import { UxPSettingsRepository } from "../filesystem/UxPSettingsRepository";
import { UxPTypographyRepository } from "../filesystem/UxPTypographyRepository";

export const createUxpApplicationContainer = (
  idGenerator: IdGenerator = defaultIdGenerator,
): ApplicationContainer => {
  const assetRepository = new UxPAssetRepository(libraryManager);
  const brandRepository = new UxPBrandRepository(libraryManager);
  const colorRepository = new UxPColorRepository(libraryManager);
  const typographyRepository = new UxPTypographyRepository(libraryManager);
  const packageRepository = new UxPPackageRepository(libraryManager);
  const settingsRepository = new UxPSettingsRepository(libraryManager);
  const recentRepository = new UxPRecentRepository(libraryManager);

  const settingsService = new SettingsService(settingsRepository);
  const brandService = new BrandService(brandRepository, settingsRepository, idGenerator);
  const assetService = new AssetService(assetRepository, brandRepository, idGenerator);
  const colorService = new ColorService(colorRepository, brandRepository, idGenerator);
  const typographyService = new TypographyService(typographyRepository, brandRepository, idGenerator);
  const packageService = new PackageService(packageRepository, brandRepository, assetRepository, idGenerator);
  const recentService = new RecentService(recentRepository, idGenerator);
  const assetIntegrityService = new AssetIntegrityService(assetRepository, brandRepository, libraryManager as any);
  const premiereAdapter = new UxPPremiereAdapter();
  const premiereAssetImportService = new PremiereAssetImportService(premiereAdapter, libraryManager);
  const premiereTimelineService = new PremiereTimelineService(premiereAdapter, libraryManager);

  return {
    assetRepository, brandRepository, colorRepository, typographyRepository, packageRepository, settingsRepository, recentRepository,
    assetService, brandService, colorService, typographyService, packageService, settingsService, recentService, assetIntegrityService, premiereAdapter, premiereAssetImportService, premiereTimelineService,
  };
};

export let activeContainer: ApplicationContainer = createApplicationContainer();

export const setActiveContainer = (container: ApplicationContainer) => {
  activeContainer = container;
};
