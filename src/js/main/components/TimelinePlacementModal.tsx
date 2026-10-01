import { useState, useEffect } from "react";
import { Button, IconButton } from "./ui";
import { Dropdown } from "./Dropdown";
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
  const [tcHH, setTcHH] = useState("00");
  const [tcMM, setTcMM] = useState("00");
  const [tcSS, setTcSS] = useState("00");
  const [tcFF, setTcFF] = useState("00");
  
  const [editMode, setEditMode] = useState<"insert" | "overwrite">("overwrite");
  
  const [videoTrackIndex, setVideoTrackIndex] = useState<number>(0);
  const [audioTrackIndex, setAudioTrackIndex] = useState<number>(0);
  
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAudioOnly = asset.type === "audio" || asset.type === "music" || asset.type === "sfx";

  useEffect(() => {
    refreshTimeline();
  }, [refreshTimeline]);

  const handleTcChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    setter(val);
  };

  const handleTcBlur = (setter: (v: string) => void, val: string) => () => {
    if (val.length === 0) setter("00");
    else if (val.length === 1) setter("0" + val);
  };

  const handlePlace = async () => {
    setPlacing(true);
    setError(null);
    try {
      const freshContext = await applicationContainer.premiereTimelineService.getTimelineContext();
      if (!freshContext.sequenceAvailable) {
        throw new Error("Premiere sequence state changed or is no longer available.");
      }

      const customTimecode = `${tcHH.padStart(2, '0')}:${tcMM.padStart(2, '0')}:${tcSS.padStart(2, '0')}:${tcFF.padStart(2, '0')}`;

      const placement: TimelinePlacement & { customTimecode?: string } = {
        mode,
        editMode,
        videoTrackIndex,
        audioTrackIndex,
        customTimecode: mode === "custom" ? customTimecode : undefined
      };
      
      await applicationContainer.premiereTimelineService.placeAssetOnTimeline(asset, placement);
      setPlacing(false);
      onClose();
    } catch (err: any) {
      setError(err.message || String(err));
      setPlacing(false);
    }
  };

  if (!loadingTimeline && !timelineContext?.sequenceAvailable) {
    return (
      <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '8px', color: 'var(--text-main)', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px' }}>Timeline Placement</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Open a sequence in Premiere to place assets.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={refreshTimeline}>Refresh</Button>
          </div>
        </div>
      </div>
    );
  }

  const vTrackCount = timelineContext?.videoTrackCount || 3;
  const aTrackCount = timelineContext?.audioTrackCount || 3;

  const tcInputStyle = {
    width: '32px',
    padding: '4px',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid #3b82f6',
    borderRadius: '4px',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    textAlign: 'center' as const,
    fontFamily: 'monospace'
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', width: '100%', maxWidth: '490px', margin: '20px', maxHeight: '100%', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', opacity: loadingTimeline ? 0.7 : 1, pointerEvents: loadingTimeline ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>Place on Timeline</h2>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {error && (
            <div style={{ padding: '12px', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.5)', color: 'var(--danger)', borderRadius: '6px', fontSize: '13px', lineHeight: '1.4' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
              <span>Project:</span> <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{projectContext?.projectName || "Unknown"}</span>
              <span>Sequence:</span> <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{timelineContext?.sequenceName || "Unknown"}</span>
              <span>Asset:</span> <span style={{ color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Position</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label onClick={() => setMode('playhead')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: mode === 'playhead' ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${mode === 'playhead' ? 'var(--primary)' : '#4b5563'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mode === 'playhead' ? 'var(--primary)' : 'transparent', flexShrink: 0 }}>
                    {mode === 'playhead' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-main)' }} />}
                  </div>
                  Use Playhead
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label onClick={() => setMode('custom')} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: mode === 'custom' ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${mode === 'custom' ? 'var(--primary)' : '#4b5563'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mode === 'custom' ? 'var(--primary)' : 'transparent', flexShrink: 0 }}>
                      {mode === 'custom' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-main)' }} />}
                    </div>
                    Custom Timecode
                  </label>
                  {mode === 'custom' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                      <input type="text" value={tcHH} onChange={handleTcChange(setTcHH)} onBlur={handleTcBlur(setTcHH, tcHH)} style={tcInputStyle} placeholder="HH" />
                      <span>:</span>
                      <input type="text" value={tcMM} onChange={handleTcChange(setTcMM)} onBlur={handleTcBlur(setTcMM, tcMM)} style={tcInputStyle} placeholder="MM" />
                      <span>:</span>
                      <input type="text" value={tcSS} onChange={handleTcChange(setTcSS)} onBlur={handleTcBlur(setTcSS, tcSS)} style={tcInputStyle} placeholder="SS" />
                      <span>:</span>
                      <input type="text" value={tcFF} onChange={handleTcChange(setTcFF)} onBlur={handleTcBlur(setTcFF, tcFF)} style={tcInputStyle} placeholder="FF" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, opacity: isAudioOnly ? 0.4 : 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Video Track</label>
                <Dropdown
                  value={String(videoTrackIndex)}
                  onChange={val => setVideoTrackIndex(Number(val))}
                  options={Array.from({ length: vTrackCount }).map((_, i) => ({ value: String(i), label: `V${i + 1}` }))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Audio Track</label>
                <Dropdown
                  value={String(audioTrackIndex)}
                  onChange={val => setAudioTrackIndex(Number(val))}
                  options={Array.from({ length: aTrackCount }).map((_, i) => ({ value: String(i), label: `A${i + 1}` }))}
                />
              </div>
            </div>

            {/* Removed Edit Mode section per user request */}
          </div>
        </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', flexShrink: 0 }}>
          <Button variant="secondary" onClick={onClose} disabled={placing || loadingTimeline}>Cancel</Button>
          <Button variant="primary" onClick={handlePlace} disabled={placing || loadingTimeline}>
            {placing ? "Executing..." : "Place on Timeline"}
          </Button>
        </div>

      </div>
    </div>
  );
}
