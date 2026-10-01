import { describe, it, expect, beforeEach } from 'vitest';
import { AssetService } from '../../src/services/AssetService';
import { InMemoryAssetRepository, InMemoryBrandRepository } from '../../src/repositories/in-memory';
import { defaultIdGenerator } from '../../src/utils/id';

describe('AssetService', () => {
  let service: AssetService;
  let assets: InMemoryAssetRepository;
  let brands: InMemoryBrandRepository;

  beforeEach(async () => {
    assets = new InMemoryAssetRepository([]);
    brands = new InMemoryBrandRepository([{
      id: 'b1', name: 'B1', description: '', isDefault: true, createdAt: '', updatedAt: '', schemaVersion: 1, logoIds: [], colorIds: [], typography: [], packageIds: [], settings: { values: {} }
    }]);
    service = new AssetService(assets, brands, defaultIdGenerator);
  });

  it('creates asset and defaults favorite to false', async () => {
    const a = await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' });
    expect(a.favorite).toBe(false);
  });

  it('rejects duplicate name without importAnyway', async () => {
    await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' });
    await expect(service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' }))
      .rejects.toThrow(/Potential duplicate/);
  });

  it('allows duplicate name if importAnyway is true', async () => {
    await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' });
    const a2 = await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1', importAnyway: true });
    expect(a2.id).toBeDefined();
  });

  it('favorite and unfavorite work', async () => {
    const a = await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' });
    await service.favorite(a.id);
    expect((await service.getById(a.id)).favorite).toBe(true);
    await service.unfavorite(a.id);
    expect((await service.getById(a.id)).favorite).toBe(false);
  });

  it('renames asset and updates timestamp', async () => {
    const a = await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' });
    const oldTime = a.updatedAt;
    // mock delay
    await new Promise(r => setTimeout(r, 10));
    const renamed = await service.update({ ...a, name: 'B' });
    expect(renamed.name).toBe('B');
    expect(renamed.updatedAt).not.toBe(oldTime);
  });

  it('deletes asset metadata', async () => {
    const a = await service.create({ brandId: 'b1', name: 'A', type: 'image', category: 'Imported', filePath: 'test.jpg', tags: [], status: 'approved', version: '1' });
    await service.delete(a.id);
    await expect(service.getById(a.id)).rejects.toThrow();
  });
  
  it('searches assets by criteria', async () => {
    await service.create({ brandId: 'b1', name: 'Alpha', type: 'image', category: 'Imported', filePath: '1.jpg', tags: [], status: 'approved', version: '1' });
    await service.create({ brandId: 'b1', name: 'Beta', type: 'video', category: 'Imported', filePath: '2.mp4', tags: [], status: 'approved', version: '1' });
    
    const all = await service.search({});
    expect(all.length).toBe(2);
    
    const videos = await service.search({ type: 'video' });
    expect(videos.length).toBe(1);
    expect(videos[0].name).toBe('Beta');
    
    const query = await service.search({ query: 'alph' });
    expect(query.length).toBe(1);
  });
});
