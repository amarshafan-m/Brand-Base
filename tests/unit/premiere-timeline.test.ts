import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockPremiereAdapter } from '../../src/premiere/UxPPremiereAdapter';
import { PremiereTimelineService } from '../../src/premiere/PremiereTimelineService';

describe('PremiereTimelineService', () => {
  let adapter: MockPremiereAdapter;
  let service: PremiereTimelineService;

  beforeEach(() => {
    adapter = new MockPremiereAdapter();
    const mockLibraryManager = {
      getLibraryFolder: () => ({
        getEntry: async (name: string) => {
          if (name === 'brands') return {
            isFolder: true,
            name: 'brands',
            getEntry: async (cat: string) => {
              if (cat === 'b1') return {
                isFolder: true,
                name: 'b1',
                getEntry: async (sub: string) => {
                  if (sub === 'images') return {
                    isFolder: true,
                    name: 'images',
                    getEntry: async (file: string) => {
                      if (file === 'file.jpg') return {
                        isFile: true,
                        name: 'file.jpg',
                        nativePath: '/mock/os/path/brands/b1/images/file.jpg'
                      };
                      throw new Error('Not found');
                    }
                  };
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
    
    service = new PremiereTimelineService(adapter, mockLibraryManager);
  });

  it('provides timeline context', async () => {
    adapter.setTimelineContext({
      sequenceAvailable: true,
      sequenceName: 'Test Sequence',
      videoTrackCount: 3,
      audioTrackCount: 2
    });
    const ctx = await service.getTimelineContext();
    expect(ctx.sequenceAvailable).toBe(true);
    expect(ctx.videoTrackCount).toBe(3);
  });

  it('blocks placement when no sequence open', async () => {
    adapter.setContext({ projectAvailable: true, sequenceAvailable: false });
    adapter.setTimelineContext({ sequenceAvailable: false });
    
    await expect(service.placeAssetOnTimeline({
      type: 'image',
      filePath: 'brands/b1/images/file.jpg'
    } as any, { editMode: 'insert', mode: 'playhead' })).rejects.toThrow(/No active Premiere sequence/);
  });

  it('validates video track index bounds', async () => {
    adapter.setContext({ projectAvailable: true, sequenceAvailable: true });
    adapter.setTimelineContext({ sequenceAvailable: true, videoTrackCount: 2, audioTrackCount: 2 });
    
    await expect(service.placeAssetOnTimeline({
      type: 'image',
      filePath: 'brands/b1/images/file.jpg'
    } as any, { editMode: 'insert', mode: 'playhead', videoTrackIndex: 2 })).rejects.toThrow(/Target video track V3 does not exist/);
  });

  it('resolves OS path and calls adapter', async () => {
    adapter.setContext({ projectAvailable: true, sequenceAvailable: true });
    adapter.setTimelineContext({ sequenceAvailable: true, videoTrackCount: 3, audioTrackCount: 2 });
    vi.spyOn(adapter, 'placeOnTimeline');
    
    const placement = { editMode: 'insert' as const, mode: 'playhead' as const, videoTrackIndex: 0 };
    await service.placeAssetOnTimeline({
      type: 'image',
      filePath: 'brands/b1/images/file.jpg'
    } as any, placement);
    
    expect(adapter.placeOnTimeline).toHaveBeenCalledWith('/mock/os/path/brands/b1/images/file.jpg', placement);
  });
});
