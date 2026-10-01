import type { PremiereAdapter, PremiereContext, PremiereTimelineContext, TimelinePlacement } from "./models";

let ppro: any = null;
try {
  ppro = require("premierepro");
} catch (e) {
  // Ignored
}

export class UxPPremiereAdapter implements PremiereAdapter {
  async getContext(): Promise<PremiereContext> {
    if (!ppro) return { projectAvailable: false, sequenceAvailable: false };
    try {
      const project = await ppro.Project.getActiveProject();
      if (!project) return { projectAvailable: false, sequenceAvailable: false };
      
      let sequenceAvailable = false;
      let sequenceName = undefined;
      let sequenceId = undefined;
      
      try {
        const sequence = await project.getActiveSequence();
        if (sequence) {
          sequenceAvailable = true;
          sequenceName = sequence.name;
          sequenceId = sequence.guid;
        }
      } catch (e) {}
      
      return { projectAvailable: true, projectName: project.name, projectPath: project.path, sequenceAvailable, sequenceName, sequenceId };
    } catch (e) {
      return { projectAvailable: false, sequenceAvailable: false };
    }
  }

  async importFiles(filePaths: string[]): Promise<boolean> {
    if (!ppro) throw new Error("Premiere Pro API is not available.");
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error("No active Premiere project.");
    return project.importFiles(filePaths, true, undefined, false);
  }

  async getTimelineContext(): Promise<PremiereTimelineContext> {
    if (!ppro) return { sequenceAvailable: false };
    try {
      const project = await ppro.Project.getActiveProject();
      if (!project) return { sequenceAvailable: false };
      
      const sequence = await project.getActiveSequence();
      if (!sequence) return { sequenceAvailable: false };

      const videoTrackCount = await sequence.getVideoTrackCount();
      const audioTrackCount = await sequence.getAudioTrackCount();
      
      let playheadTicks = undefined;
      let playheadSeconds = undefined;
      
      try {
        const pos = await sequence.getPlayerPosition();
        if (pos) {
          playheadTicks = pos.ticks;
          playheadSeconds = pos.seconds;
        }
      } catch (e) {}

      return {
        sequenceAvailable: true,
        sequenceName: sequence.name,
        sequenceId: sequence.guid,
        videoTrackCount,
        audioTrackCount,
        playheadTicks,
        playheadSeconds
      };
    } catch (e) {
      return { sequenceAvailable: false };
    }
  }

  async placeOnTimeline(nativePath: string, placement: TimelinePlacement): Promise<void> {
    if (!ppro) throw new Error("Premiere Pro API is not available.");
    const project = await ppro.Project.getActiveProject();
    if (!project) throw new Error("No active Premiere project.");
    const sequence = await project.getActiveSequence();
    if (!sequence) throw new Error("No active sequence.");

    // Import the file into Premiere (this is safe if it's already imported? 
    // Wait, importFiles imports a new copy into the bin. It does not dedup by default!
    // Let's try to find it first in root.
    let targetProjectItem: any = null;
    try {
      const root = await project.getRootItem();
      const items = await root.getItems();
      for (const item of items) {
        if (item.type === ppro.ProjectItem.TYPE_CLIP) {
          const clip = ppro.ProjectItem.cast(item);
          const path = await clip.getMediaFilePath();
          if (path === nativePath) {
            targetProjectItem = item;
            break;
          }
        }
      }
    } catch (e) {
      console.warn("Could not inspect project items for duplicate detection", e);
    }

    if (!targetProjectItem) {
      await project.importFiles([nativePath], true, undefined, false);
      // Wait for import to settle and find it again
      const root = await project.getRootItem();
      const items = await root.getItems();
      for (const item of items) {
        if (item.type === ppro.ProjectItem.TYPE_CLIP) {
          const clip = ppro.ProjectItem.cast(item);
          const path = await clip.getMediaFilePath();
          if (path === nativePath) {
            targetProjectItem = item;
            break;
          }
        }
      }
    }

    if (!targetProjectItem) {
      throw new Error("Failed to resolve Premiere ProjectItem after import.");
    }

    // Determine target time
    let time: any = null;
    if (placement.mode === "playhead") {
      time = await sequence.getPlayerPosition();
    } else if (placement.ticks) {
      time = ppro.TickTime.createWithTicks(placement.ticks);
    } else {
      time = await sequence.getPlayerPosition(); // fallback
    }

    // Default tracks
    const vt = placement.videoTrackIndex !== undefined ? placement.videoTrackIndex : 0;
    const at = placement.audioTrackIndex !== undefined ? placement.audioTrackIndex : 0;

    const editor = ppro.SequenceEditor.getEditor(sequence);
    
    // Execute transaction
    const success = project.executeTransaction((compoundAction: any) => {
      let action: any = null;
      if (placement.editMode === "overwrite") {
        action = editor.createOverwriteItemAction(targetProjectItem, time, vt, at);
      } else {
        action = editor.createInsertProjectItemAction(targetProjectItem, time, vt, at, false);
      }
      compoundAction.addAction(action);
    }, `Brand Base: ${placement.editMode === "overwrite" ? "Overwrite" : "Insert"} Asset`);

    if (!success) {
      throw new Error("Premiere timeline action failed.");
    }
  }
}

export class MockPremiereAdapter implements PremiereAdapter {
  private timelineContext: PremiereTimelineContext = { sequenceAvailable: false };
  constructor(private context: PremiereContext = { projectAvailable: false, sequenceAvailable: false }) {}
  
  async getContext(): Promise<PremiereContext> { return this.context; }
  async getTimelineContext(): Promise<PremiereTimelineContext> { return this.timelineContext; }
  
  async importFiles(filePaths: string[]): Promise<boolean> {
    if (!this.context.projectAvailable) throw new Error("No active Premiere project.");
    return true;
  }
  
  async placeOnTimeline(nativePath: string, placement: TimelinePlacement): Promise<void> {
    if (!this.context.projectAvailable) throw new Error("No active Premiere project.");
    if (!this.timelineContext.sequenceAvailable) throw new Error("No active sequence.");
    if (placement.videoTrackIndex !== undefined && placement.videoTrackIndex < 0) throw new Error("Invalid video track");
  }

  setContext(context: PremiereContext) { this.context = context; }
  setTimelineContext(ctx: PremiereTimelineContext) { this.timelineContext = ctx; }
}
