import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssetIntegrityService } from '../../src/services/AssetIntegrityService';
import { InMemoryAssetRepository, InMemoryBrandRepository } from '../../src/repositories/in-memory';

describe('AssetIntegrityService', () => {
  let assets: InMemoryAssetRepository;
  let brands: InMemoryBrandRepository;
  let service: AssetIntegrityService;
  
  beforeEach(() => {
    assets = new InMemoryAssetRepository([]);
    brands = new InMemoryBrandRepository([{
      id: 'b1', name: 'B1', description: '', isDefault: true, createdAt: '', updatedAt: '', schemaVersion: 1, logoIds: [], colorIds: [], typography: [], packageIds: [], settings: { values: {} }
    }]);
  });

  it('reports healthy assets and missing binaries correctly', async () => {
    // We mock LibraryManager
    const mockLibraryManager = {
      getLibraryFolder: () => ({
        getEntry: async (name: string) => {
          if (name === 'brands') return {
            isFolder: true,
            name: 'brands',
            getEntry: async (id: string) => {
              if (id === 'b1') return {
                isFolder: true,
                name: 'b1',
                getEntries: async () => [
                  {
                    isFolder: true,
                    name: 'images',
                    getEntries: async () => [
                      {
                        isFile: true,
                        name: 'file.jpg',
                        getMetadata: async () => ({ size: 1024 })
                      }
                    ]
                  }
                ]
              };
              throw new Error('Not found');
            }
          };
          throw new Error('Not found');
        }
      })
    } as any;
    
    // Using globals io mock behavior requires overriding `getFolderIfExists` if it calls `fs` directly,
    // but io.ts actually calls `parent.getEntry(name)` directly!
    // Wait, getFolderIfExists catches the error and returns null if not found.
    service = new AssetIntegrityService(assets, brands, mockLibraryManager);

    await assets.create({
      id: 'a1', brandId: 'b1', name: 'Existing', type: 'image', category: 'core',
      filePath: 'brands/b1/images/file.jpg', tags: [], version: '1', favorite: false, status: 'approved', createdAt: '', updatedAt: '', schemaVersion: 1
    } as any);

    await assets.create({
      id: 'a2', brandId: 'b1', name: 'Missing Binary', type: 'video', category: 'core',
      filePath: 'brands/b1/video/missing.mp4', tags: [], version: '1', favorite: false, status: 'approved', createdAt: '', updatedAt: '', schemaVersion: 1
    } as any);

    const report = await service.checkBrand('b1');
    expect(report.healthy.length).toBe(1);
    expect(report.healthy[0].id).toBe('a1');
    expect(report.broken.length).toBe(1);
    expect(report.broken[0].id).toBe('a2');
    expect(report.orphans.length).toBe(0);
  });
  
  it('reports orphans', async () => {
    const mockLibraryManager = {
      getLibraryFolder: () => ({
        getEntry: async (name: string) => {
          if (name === 'brands') return {
            isFolder: true,
            name: 'brands',
            getEntry: async (id: string) => {
              if (id === 'b1') return {
                isFolder: true,
                name: 'b1',
                getEntries: async () => [
                  {
                    isFolder: true,
                    name: 'images',
                    getEntries: async () => [
                      {
                        isFile: true,
                        name: 'orphan.jpg',
                        getMetadata: async () => ({ size: 500 })
                      }
                    ]
                  }
                ]
              };
              throw new Error('Not found');
            }
          };
          throw new Error('Not found');
        }
      })
    } as any;
    
    service = new AssetIntegrityService(assets, brands, mockLibraryManager);
    
    const report = await service.checkBrand('b1');
    expect(report.healthy.length).toBe(0);
    expect(report.broken.length).toBe(0);
    expect(report.orphans.length).toBe(1);
    expect(report.orphans[0].filename).toBe('orphan.jpg');
    expect(report.orphans[0].path).toBe('brands/b1/images/orphan.jpg');
  });
});
