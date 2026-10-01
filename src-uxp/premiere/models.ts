export interface PremiereContext {
  projectAvailable: boolean;
  projectName?: string;
  projectPath?: string;
  sequenceAvailable: boolean;
  sequenceName?: string;
  sequenceId?: string;
}

export interface PremiereTimelineContext {
  sequenceAvailable: boolean;
  sequenceName?: string;
  sequenceId?: string;
  videoTrackCount?: number;
  audioTrackCount?: number;
  playheadTicks?: string;
  playheadSeconds?: number;
}

export interface TimelinePlacement {
  mode: "playhead" | "custom";
  ticks?: string;
  videoTrackIndex?: number; // 0-based
  audioTrackIndex?: number; // 0-based
  editMode: "insert" | "overwrite";
}

export interface PremiereAdapter {
  getContext(): Promise<PremiereContext>;
  importFiles(filePaths: string[]): Promise<boolean>;
  getTimelineContext(): Promise<PremiereTimelineContext>;
  placeOnTimeline(nativePath: string, placement: TimelinePlacement): Promise<void>;
}
