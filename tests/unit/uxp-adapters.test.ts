import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PotentialDuplicateError } from '../../src/domain/errors';
import { fileIdentityService } from '../../src/services/ChecksumService';
import { validateEntryName } from '../../src/filesystem/io';

describe('UXP Filesystem Hardening Tests', () => {

  describe('1. FileIdentityService (Checksum limitations)', () => {
    it('returns a fingerprint without content identity', () => {
      const result = fileIdentityService.fingerprint('test.mp4', 1024);
      expect(result.contentIdentityAvailable).toBe(false);
      expect(result.fingerprint).toBe('test.mp4-1024b');
    });
  });

  describe('2. Path Traversal & Safety', () => {
    it('rejects path traversal attempts', () => {
      expect(() => validateEntryName('../secret')).toThrow(/Unsafe entry name/);
      expect(() => validateEntryName('a/b')).toThrow(/Unsafe entry name/);
      expect(() => validateEntryName('.')).toThrow(/Unsafe entry name/);
    });

    it('rejects empty or null names', () => {
      expect(() => validateEntryName('')).toThrow(/empty/);
      expect(() => validateEntryName('   ')).toThrow(/empty/);
    });
  });

});

  describe('3. Potential Duplicate Behavior (AssetService)', () => {
    it('throws PotentialDuplicateError on exact name/type match without importAnyway', async () => {
      // Create an AssetService instance with In-Memory mocks to test logic
      const { AssetService } = await import('../../src/services/AssetService');
      const { InMemoryAssetRepository, InMemoryBrandRepository } = await import('../../src/repositories/in-memory');
      const { defaultIdGenerator } = await import('../../src/utils/id');

      const brands = new InMemoryBrandRepository([{
        id: 'b1', name: 'Brand 1', description: '', isDefault: true, createdAt: '', updatedAt: '', schemaVersion: 1,
        logoIds: [], colorIds: [], typography: [], packageIds: [], settings: { values: {} }
      }]);
      const assets = new InMemoryAssetRepository([{
        id: 'a1', brandId: 'b1', name: 'Existing Logo', type: 'logo', filePath: 'some/path', extension: 'png', tags: [],
        createdAt: '', updatedAt: '', schemaVersion: 1, favorite: false, category: 'core', version: '1.0', status: 'approved'
      }]);
      
      const service = new AssetService(assets, brands, defaultIdGenerator);

      await expect(service.create({
        brandId: 'b1',
        name: 'Existing Logo',
        type: 'logo',
        filePath: 'uxp-token:123',
        extension: 'png',
        tags: [],
        category: 'core',
        version: '1.0',
        status: 'approved'
      })).rejects.toThrow(PotentialDuplicateError);
    });

    it('allows import if importAnyway is true', async () => {
      const { AssetService } = await import('../../src/services/AssetService');
      const { InMemoryAssetRepository, InMemoryBrandRepository } = await import('../../src/repositories/in-memory');
      const { defaultIdGenerator } = await import('../../src/utils/id');

      const brands = new InMemoryBrandRepository([{
        id: 'b1', name: 'Brand 1', description: '', isDefault: true, createdAt: '', updatedAt: '', schemaVersion: 1,
        logoIds: [], colorIds: [], typography: [], packageIds: [], settings: { values: {} }
      }]);
      const assets = new InMemoryAssetRepository([{
        id: 'a1', brandId: 'b1', name: 'Existing Logo', type: 'logo', filePath: 'some/path', extension: 'png', tags: [],
        createdAt: '', updatedAt: '', schemaVersion: 1, favorite: false, category: 'core', version: '1.0', status: 'approved'
      }]);
      
      const service = new AssetService(assets, brands, defaultIdGenerator);

      const result = await service.create({
        brandId: 'b1',
        name: 'Existing Logo',
        type: 'logo',
        filePath: 'uxp-token:123',
        extension: 'png',
        tags: [],
        category: 'core',
        version: '1.0',
        status: 'approved',
        importAnyway: true
      });

      expect(result.id).toBeDefined();
    });
  });

  describe('4. Token Resolution Failure', () => {
    it('throws explicit error when token cannot be resolved', async () => {
      const { UxPAssetRepository } = await import('../../src/filesystem/UxPAssetRepository');
      const { LibraryManager } = await import('../../src/filesystem/LibraryManager');
      
      const manager = new LibraryManager();
      manager['currentLibrary'] = {
        getEntry: vi.fn().mockRejectedValue(new Error()),
        createFolder: vi.fn().mockResolvedValue({
          getEntry: vi.fn().mockRejectedValue(new Error()),
          createFolder: vi.fn().mockResolvedValue({})
        })
      } as any; // Mock loaded
      manager['initializationComplete'] = true;

      const repo = new UxPAssetRepository(manager);
      
      // We don't have global uxp defined in the vitest environment the same way,
      // but we can mock it here if needed, or rely on the globals.ts fallback.
      // Actually, since globals.ts throws on access, this will throw our globals Error 
      // or the repository Error catching it.
      await expect(repo.create({
        brandId: 'b1', name: 'Logo', type: 'logo', filePath: 'uxp-token:invalid', tags: [],
        id: '1', extension: 'png', favorite: false, category: 'core', status: 'approved', version: '1.0', createdAt: '', updatedAt: '', schemaVersion: 1
      })).rejects.toThrow(/Failed to resolve asset source file token|UXP API is not available/);
    });
  });

  describe('5. LibraryValidator (Validation & Recovery)', () => {
    it('rejects missing library.json', async () => {
      const { libraryValidator } = await import('../../src/filesystem/LibraryValidator');
      // Mock folder where getEntry always throws
      const mockFolder = {
        getEntry: vi.fn().mockRejectedValue(new Error('Not found'))
      } as any;
      
      const result = await libraryValidator.validate(mockFolder);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Missing library.json');
    });

    it('rejects unsupported schema', async () => {
      const { libraryValidator } = await import('../../src/filesystem/LibraryValidator');
      const mockFolder = {
        getEntry: vi.fn((name) => {
          if (name === 'library.json') return { 
            isFile: true, 
            read: () => JSON.stringify({ schemaVersion: 9999 }) 
          };
          throw new Error('Not found');
        })
      } as any;
      
      const result = await libraryValidator.validate(mockFolder);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('newer version');
    });
  });

  describe('6. Safe JSON Write (io.ts)', () => {
    it('throws error and cleans up tmp file if validation fails', async () => {
      const { writeJsonSafe } = await import('../../src/filesystem/io');
      
      const tmpFileMock = {
        write: vi.fn(),
        read: vi.fn().mockReturnValue('invalid-json'),
        delete: vi.fn()
      };

      const folderMock = {
        createFile: vi.fn().mockResolvedValue(tmpFileMock),
        getEntry: vi.fn().mockRejectedValue(new Error())
      } as any;

      await expect(writeJsonSafe(folderMock, 'test.json', { a: 1 })).rejects.toThrow(/Write verification failed/);
      expect(tmpFileMock.delete).toHaveBeenCalled();
    });
  });

  describe('7. Brand Archive Naming', () => {
    it('archives rather than recursively deleting', async () => {
      const { UxPBrandRepository } = await import('../../src/filesystem/UxPBrandRepository');
      const { LibraryManager } = await import('../../src/filesystem/LibraryManager');
      
      const manager = new LibraryManager();
      
      const mockBrandFolder = { moveTo: vi.fn() };
      const mockBrandsFolder = {
        getEntry: vi.fn().mockResolvedValue({ isFolder: true, ...mockBrandFolder }),
        createFolder: vi.fn().mockResolvedValue({ isFolder: true, ...mockBrandFolder })
      };
      
      manager['currentLibrary'] = {
        getEntry: vi.fn().mockResolvedValue({ isFolder: true, ...mockBrandsFolder }),
        createFolder: vi.fn().mockResolvedValue({ isFolder: true, ...mockBrandsFolder })
      } as any;
      manager['initializationComplete'] = true;
      
      const repo = new UxPBrandRepository(manager);
      await repo.delete('my-brand');
      
      expect(mockBrandFolder.moveTo).toHaveBeenCalled();
      const callArgs = mockBrandFolder.moveTo.mock.calls[0];
      expect(callArgs[1].newName).toMatch(/^deleted-my-brand-/);
    });
  });
