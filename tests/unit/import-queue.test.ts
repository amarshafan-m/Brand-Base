import { describe, it, expect, vi } from 'vitest';
import { AssetImportQueue } from '../../src/services/AssetImportQueue';
import { PotentialDuplicateError } from '../../src/domain/errors';

describe('AssetImportQueue', () => {
  it('processes multiple files sequentially', async () => {
    const processFile = vi.fn().mockResolvedValue(undefined);
    const onComplete = vi.fn();
    const queue = new AssetImportQueue(processFile, vi.fn(), onComplete, vi.fn());
    
    await queue.start([{ name: '1.jpg', isFile: true } as any, { name: '2.jpg', isFile: true } as any]);
    
    expect(processFile).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalled();
  });

  it('halts on potential duplicate and resumes on cancel', async () => {
    const processFile = vi.fn()
      .mockRejectedValueOnce(new PotentialDuplicateError('Dup'))
      .mockResolvedValueOnce(undefined);
    
    const onDuplicate = vi.fn();
    const onComplete = vi.fn();
    
    const queue = new AssetImportQueue(processFile, onDuplicate, onComplete, vi.fn());
    
    const f1 = { name: '1.jpg', isFile: true } as any;
    const f2 = { name: '2.jpg', isFile: true } as any;
    
    await queue.start([f1, f2]);
    
    // File 1 halted
    expect(processFile).toHaveBeenCalledTimes(1);
    expect(onDuplicate).toHaveBeenCalledWith(f1, expect.any(PotentialDuplicateError));
    expect(onComplete).not.toHaveBeenCalled();
    
    // Cancel duplicate
    await queue.resolveDuplicate(f1, false);
    
    // File 2 processed
    expect(processFile).toHaveBeenCalledTimes(2); // f1 original attempt, f2 attempt (cancel doesn't re-attempt)
    expect(onComplete).toHaveBeenCalled();
  });
  
  it('resumes and re-imports on importAnyway', async () => {
    const processFile = vi.fn()
      .mockRejectedValueOnce(new PotentialDuplicateError('Dup')) // f1 attempt 1
      .mockResolvedValueOnce(undefined) // f1 attempt 2
      .mockResolvedValueOnce(undefined); // f2 attempt 1
    
    const queue = new AssetImportQueue(processFile, vi.fn(), vi.fn(), vi.fn());
    
    const f1 = { name: '1.jpg', isFile: true } as any;
    const f2 = { name: '2.jpg', isFile: true } as any;
    
    await queue.start([f1, f2]);
    await queue.resolveDuplicate(f1, true);
    
    expect(processFile).toHaveBeenCalledTimes(3);
    // attempt 1: file=f1, false
    expect(processFile).toHaveBeenNthCalledWith(1, f1, false);
    // attempt 2: file=f1, true
    expect(processFile).toHaveBeenNthCalledWith(2, f1, true);
    // attempt 3: file=f2, false
    expect(processFile).toHaveBeenNthCalledWith(3, f2, false);
  });
  
  it('isolates failures and continues', async () => {
    const processFile = vi.fn()
      .mockRejectedValueOnce(new Error('Fatal'))
      .mockResolvedValueOnce(undefined);
      
    const onError = vi.fn();
    const queue = new AssetImportQueue(processFile, vi.fn(), vi.fn(), onError);
    
    const f1 = { name: '1.jpg', isFile: true } as any;
    const f2 = { name: '2.jpg', isFile: true } as any;
    
    await queue.start([f1, f2]);
    
    expect(onError).toHaveBeenCalledWith(f1, expect.any(Error));
    expect(processFile).toHaveBeenCalledTimes(2);
  });
});
