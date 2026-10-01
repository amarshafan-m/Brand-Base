import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockPremiereAdapter } from '../../src/premiere/UxPPremiereAdapter';
import { PremiereAssetImportService } from '../../src/premiere/PremiereAssetImportService';

describe('PremiereContext & Import', () => {
  let adapter: MockPremiereAdapter;
  let service: PremiereAssetImportService;

  beforeEach(() => {
    adapter = new MockPremiereAdapter();
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
                getEntry: async (cat: string) => {
                  if (cat === 'images') return {
                    isFolder: true,
                    name: 'images',
                    getEntry: async (file: string) => {
                      if (file === 'file.jpg') return {
                        isFile: true,
                        name: 'file.jpg',
                        nativePath: '/mock/os/path/brands/b1/images/file.jpg'
                      }
                      throw new Error('Not found');
                    }
                  }
                  throw new Error('Not found');
                }
              };
              throw new Error('Not found');
            }
          };
          throw new Error('Not found');
        }
      })
    } as any;
    
    service = new PremiereAssetImportService(adapter, mockLibraryManager);
  });

  it('provides empty context when no project', async () => {
    const ctx = await adapter.getContext();
    expect(ctx.projectAvailable).toBe(false);
  });

  it('provides project context', async () => {
    adapter.setContext({
      projectAvailable: true,
      projectName: 'Test',
      sequenceAvailable: true,
      sequenceName: 'Seq'
    });
    const ctx = await adapter.getContext();
    expect(ctx.projectAvailable).toBe(true);
    expect(ctx.projectName).toBe('Test');
    expect(ctx.sequenceAvailable).toBe(true);
  });

  it('blocks import when no project open', async () => {
    await expect(service.importAsset({
      type: 'image',
      filePath: 'brands/b1/images/file.jpg'
    } as any)).rejects.toThrow(/No Premiere project is open/);
  });

  it('blocks unsupported types', async () => {
    adapter.setContext({ projectAvailable: true, sequenceAvailable: false });
    await expect(service.importAsset({
      type: 'mogrt',
      filePath: 'brands/b1/mogrts/file.mogrt'
    } as any)).rejects.toThrow(/unavailable for this asset type/);
  });

  it('resolves OS path and imports', async () => {
    adapter.setContext({ projectAvailable: true, sequenceAvailable: false });
    vi.spyOn(adapter, 'importFiles');
    
    await service.importAsset({
      type: 'image',
      filePath: 'brands/b1/images/file.jpg'
    } as any);
    
    expect(adapter.importFiles).toHaveBeenCalledWith(['/mock/os/path/brands/b1/images/file.jpg']);
  });
  
  it('gracefully handles missing library file during import', async () => {
    adapter.setContext({ projectAvailable: true, sequenceAvailable: false });
    await expect(service.importAsset({
      type: 'image',
      filePath: 'brands/b1/images/missing.jpg'
    } as any)).rejects.toThrow(/File unavailable/);
  });
});
