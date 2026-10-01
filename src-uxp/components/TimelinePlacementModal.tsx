import { useState, useEffect } from "react";
import { Button, IconButton } from "./ui";
import { applicationContainer } from "../app/application";
import { usePremiereTimeline } from "../hooks/usePremiereTimeline";
import type { Asset } from "../domain/models";
import type { TimelinePlacement } from "../premiere/models";
import { usePremiereContext } from "../hooks/usePremiereContext";

interface Props {
  asset: Asset;
  onClose: () => void;
}

export function TimelinePlacementModal({ asset, onClose }: Props) {
  const { timelineContext, loadingTimeline, refreshTimeline } = usePremiereTimeline();
  const { context: projectContext } = usePremiereContext();
  
  const [mode, setMode] = useState<"playhead" | "custom">("playhead");
  const [editMode, setEditMode] = useState<"insert" | "overwrite">("insert");
  
  const [videoTrackIndex, setVideoTrackIndex] = useState<number>(0);
  const [audioTrackIndex, setAudioTrackIndex] = useState<number>(0);
  
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio-only assets don't need a video track usually, but Premiere's API requires an index.
  // We'll pass the UI state to the adapter. 
  const isAudioOnly = asset.type === "audio" || asset.type === "music" || asset.type === "sfx";

  useEffect(() => {
    refreshTimeline();
  }, [refreshTimeline]);

  const handlePlace = async () => {
    setPlacing(true);
    setError(null);
    try {
      // Re-fetch context right before execution to prevent stale state
      const freshContext = await applicationContainer.premiereTimelineService.getTimelineContext();
      if (!freshContext.sequenceAvailable) {
        throw new Error("Premiere sequence state changed or is no longer available.");
      }

      const placement: TimelinePlacement = {
        mode,
        editMode,
        videoTrackIndex,
        audioTrackIndex
      };
      
      await applicationContainer.premiereTimelineService.placeAssetOnTimeline(asset, placement);
      
      // Refresh to get new playhead/tracks if any
      await refreshTimeline();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loadingTimeline) {
    return (
      <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: '#222', padding: '24px', borderRadius: '8px', color: '#fff' }}>Loading timeline data...</div>
      </div>
    );
  }

  if (!timelineContext?.sequenceAvailable) {
    return (
      <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: '#222', padding: '24px', borderRadius: '8px', color: '#fff', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px' }}>Timeline Placement</h2>
          <p style={{ margin: 0, color: '#aaa', fontSize: '13px' }}>Open a sequence in Premiere to place assets.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={refreshTimeline}>Refresh</Button>
          </div>
        </div>
      </div>
    );
  }

  const vTrackCount = timelineContext.videoTrackCount || 3;
  const aTrackCount = timelineContext.audioTrackCount || 3;

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#222', width: '450px', borderRadius: '8px', border: '1px solid #444', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Place on Timeline</h2>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#3b1c1c', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#ccc' }}>
            <span style={{ color: '#888' }}>Project:</span> <span style={{ fontWeight: 600 }}>{projectContext?.projectName || "Unknown"}</span>
            <span style={{ color: '#888' }}>Sequence:</span> <span style={{ fontWeight: 600 }}>{timelineContext.sequenceName || "Unknown"}</span>
            <span style={{ color: '#888' }}>Asset:</span> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</span>
          </div>

          <hr style={{ borderColor: '#333', margin: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#eee' }}>Position</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <input type="radio" checked={mode === "playhead"} onChange={() => setMode("playhead")} /> Use Playhead
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
                  <input type="radio" checked={mode === "custom"} onChange={() => {}} disabled /> Custom (Coming Soon)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, opacity: isAudioOnly ? 0.5 : 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#eee' }}>Video Track</label>
                <select 
                  value={videoTrackIndex} 
                  onChange={e => setVideoTrackIndex(Number(e.target.value))}
                  disabled={isAudioOnly}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                >
                  {Array.from({ length: vTrackCount }).map((_, i) => (
                    <option key={i} value={i}>V{i + 1}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#eee' }}>Audio Track</label>
                <select 
                  value={audioTrackIndex} 
                  onChange={e => setAudioTrackIndex(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                >
                  {Array.from({ length: aTrackCount }).map((_, i) => (
                    <option key={i} value={i}>A{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#eee' }}>Edit Mode</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <input type="radio" checked={editMode === "insert"} onChange={() => setEditMode("insert")} /> Insert
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <input type="radio" checked={editMode === "overwrite"} onChange={() => setEditMode("overwrite")} /> Overwrite
                </label>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              {editMode === "insert" 
                ? "Clips will be shifted to the right to make space for the asset." 
                : "Existing clips in the target range will be overwritten."}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#1a1a1a', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={placing}>Cancel</Button>
          <Button variant="primary" onClick={handlePlace} disabled={placing}>
            {placing ? "Executing..." : "Place on Timeline"}
          </Button>
        </div>

      </div>
    </div>
  );
}
