import { PotentialDuplicateError } from "../domain/errors";

export interface FileLike {
  name: string;
  isFile: boolean;
  getMetadata: () => Promise<{ size: number }>;
}

export class AssetImportQueue {
  private queue: FileLike[] = [];
  public importing = false;
  
  constructor(
    private readonly processFile: (file: FileLike, importAnyway: boolean) => Promise<void>,
    private readonly onDuplicate: (file: FileLike, error: PotentialDuplicateError) => void,
    private readonly onComplete: () => void,
    private readonly onError: (file: FileLike, error: any) => void
  ) {}

  async start(files: FileLike[]) {
    this.queue = [...files];
    this.importing = true;
    await this.processNext();
  }

  private async processNext() {
    if (this.queue.length === 0) {
      this.importing = false;
      this.onComplete();
      return;
    }
    
    const file = this.queue[0];
    this.queue = this.queue.slice(1);
    
    try {
      await this.processFile(file, false);
      // Immediately proceed
      await this.processNext();
    } catch (e: any) {
      if (e instanceof PotentialDuplicateError) {
        // Halt queue and alert caller
        this.onDuplicate(file, e);
      } else {
        // Isolate error, notify, and continue queue
        this.onError(file, e);
        await this.processNext();
      }
    }
  }

  async resolveDuplicate(file: FileLike, importAnyway: boolean) {
    if (importAnyway) {
      try {
        await this.processFile(file, true);
      } catch (e: any) {
        this.onError(file, e);
      }
    }
    // Resume queue regardless of choice
    await this.processNext();
  }
}
