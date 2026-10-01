import { describe, it, expect, beforeEach } from 'vitest';
import { TypographyService } from '../../src/services/TypographyService';
import { InMemoryTypographyRepository, InMemoryBrandRepository } from '../../src/repositories/in-memory';
import { defaultIdGenerator } from '../../src/utils/id';

describe('TypographyService', () => {
  let service: TypographyService;
  let typography: InMemoryTypographyRepository;
  let brands: InMemoryBrandRepository;

  beforeEach(async () => {
    typography = new InMemoryTypographyRepository([]);
    brands = new InMemoryBrandRepository([{
      id: 'b1', name: 'B1', description: '', isDefault: true, createdAt: '', updatedAt: '', schemaVersion: 1, logoIds: [], colorIds: [], typography: [], packageIds: [], settings: { values: {} }
    }]);
    service = new TypographyService(typography, brands, defaultIdGenerator);
  });

  it('create typography style validates fields', async () => {
    await expect(service.create({ brandId: 'b1', fontFamily: '  ', fontWeight: '400', role: 'body' }))
      .rejects.toThrow(/Invalid typography/);
      
    const style = await service.create({ brandId: 'b1', fontFamily: 'Arial', fontWeight: '400', role: 'body' });
    expect(style.fontFamily).toBe('Arial');
  });

  it('edit typography', async () => {
    const style = await service.create({ brandId: 'b1', fontFamily: 'Arial', fontWeight: '700', role: 'heading' });
    const updated = await service.update({ ...style, fontWeight: '800' });
    expect(updated.fontWeight).toBe('800');
  });

  it('delete typography', async () => {
    const style = await service.create({ brandId: 'b1', fontFamily: 'Arial', fontWeight: '700', role: 'heading' });
    await service.delete(style.id);
    const all = await service.getAll();
    expect(all.length).toBe(0);
  });
});
