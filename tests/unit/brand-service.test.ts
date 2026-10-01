import { describe, it, expect, beforeEach } from 'vitest';
import { BrandService } from '../../src/services/BrandService';
import { InMemoryBrandRepository, InMemorySettingsRepository } from '../../src/repositories/in-memory';
import { defaultIdGenerator } from '../../src/utils/id';

describe('BrandService', () => {
  let service: BrandService;
  let brands: InMemoryBrandRepository;
  let settings: InMemorySettingsRepository;

  beforeEach(() => {
    brands = new InMemoryBrandRepository([]);
    settings = new InMemorySettingsRepository({ defaultBrandId: undefined });
    service = new BrandService(brands, settings, defaultIdGenerator);
  });

  it('rejects empty name', async () => {
    await expect(service.create({ name: '   ' })).rejects.toThrow(/Invalid brand/i);
  });

  it('rejects duplicate active name', async () => {
    await service.create({ name: 'Acme' });
    await expect(service.create({ name: ' acme ' })).rejects.toThrow(/already exists/i);
  });

  it('preserves brand ID during edit', async () => {
    const brand = await service.create({ name: 'Acme' });
    const edited = await service.update({ ...brand, name: 'Acme 2' });
    expect(edited.id).toBe(brand.id);
  });

  it('sets default brand on creation of first brand', async () => {
    const brand = await service.create({ name: 'Acme' });
    expect(brand.isDefault).toBe(true);
    const sets = await settings.get();
    expect(sets.defaultBrandId).toBe(brand.id);
  });

  it('can switch default brand', async () => {
    const brand1 = await service.create({ name: 'Brand 1' });
    const brand2 = await service.create({ name: 'Brand 2' });
    
    expect(brand1.isDefault).toBe(true);
    expect(brand2.isDefault).toBe(false);

    await service.setDefault(brand2.id);
    
    const updated1 = await service.getById(brand1.id);
    const updated2 = await service.getById(brand2.id);
    expect(updated1.isDefault).toBe(false);
    expect(updated2.isDefault).toBe(true);
  });

  it('repairs default on archive default brand', async () => {
    const brand1 = await service.create({ name: 'Brand 1' });
    const brand2 = await service.create({ name: 'Brand 2' });
    
    await service.delete(brand1.id);
    
    const remaining = await service.getAll();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(brand2.id);
    expect(remaining[0].isDefault).toBe(true);
  });

  it('safely handles archive only brand', async () => {
    const brand = await service.create({ name: 'Acme' });
    await service.delete(brand.id);
    
    const remaining = await service.getAll();
    expect(remaining.length).toBe(0);
    
    const sets = await settings.get();
    expect(sets.defaultBrandId).toBeUndefined();
  });
});
