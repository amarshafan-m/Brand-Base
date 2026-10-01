import { describe, it, expect } from 'vitest';
import { detectAssetType, getBaseName, getExtension } from '../../src/utils/file-classification';

describe('file-classification', () => {
  it('extracts base name', () => {
    expect(getBaseName('video.mp4')).toBe('video');
    expect(getBaseName('file.with.dots.jpg')).toBe('file.with.dots');
    expect(getBaseName('noext')).toBe('noext');
  });

  it('extracts extension', () => {
    expect(getExtension('video.mp4')).toBe('mp4');
    expect(getExtension('video.mP4')).toBe('mp4');
    expect(getExtension('noext')).toBe('');
  });

  it('detects asset type', () => {
    expect(detectAssetType('test.png')).toBe('image');
    expect(detectAssetType('test.JPG')).toBe('image');
    expect(detectAssetType('test.mp4')).toBe('video');
    expect(detectAssetType('test.wav')).toBe('audio');
    expect(detectAssetType('test.ai')).toBe('graphic');
    expect(detectAssetType('test.mogrt')).toBe('mogrt');
    expect(detectAssetType('test.prproj')).toBe('template');
    expect(detectAssetType('test.prfpset')).toBe('preset');
    expect(detectAssetType('test.ttf')).toBe('font');
    expect(detectAssetType('test.unknown')).toBe('other');
  });
});
