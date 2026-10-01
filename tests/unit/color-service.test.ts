import { describe, it, expect, beforeEach } from 'vitest';
import { ColorService } from '../../src/services/ColorService';
import { InMemoryColorRepository, InMemoryBrandRepository } from '../../src/repositories/in-memory';
import { defaultIdGenerator } from '../../src/utils/id';

describe('ColorService', () => {
  let service: ColorService;
  let colors: InMemoryColorRepository;
  let brands: InMemoryBrandRepository;

  beforeEach(async () => {
    colors = new InMemoryColorRepository([]);
    brands = new InMemoryBrandRepository([{
      id: 'b1', name: 'B1', description: '', isDefault: true, createdAt: '', updatedAt: '', schemaVersion: 1, logoIds: [], colorIds: [], typography: [], packageIds: [], settings: { values: {} }
    }]);
    service = new ColorService(colors, brands, defaultIdGenerator);
  });

  it('create color', async () => {
    const color = await service.create({ brandId: 'b1', name: 'Red', hex: '#ff0000', role: 'primary' });
    expect(color.hex.toLowerCase()).toBe('#ff0000');
  });

  it('rejects invalid HEX', async () => {
    await expect(service.create({ brandId: 'b1', name: 'Red', hex: 'invalid', role: 'primary' } as any))
      .rejects.toThrow(/HEX colors/);
  });

  it('edit color', async () => {
    const color = await service.create({ brandId: 'b1', name: 'Red', hex: '#ff0000', role: 'primary' });
    const updated = await service.update({ ...color, name: 'Dark Red' });
    expect(updated.name).toBe('Dark Red');
  });

  it('delete color', async () => {
    const color = await service.create({ brandId: 'b1', name: 'Red', hex: '#ff0000', role: 'primary' });
    await service.delete(color.id);
    const all = await service.getAll();
    expect(all.length).toBe(0);
  });
});
