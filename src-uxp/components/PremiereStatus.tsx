import { usePremiereContext } from "../hooks/usePremiereContext";
import { Icon } from "./Icon";

export function PremiereStatus() {
  const { context, loading, refresh } = usePremiereContext();

  let label = "Premiere: Connecting...";
  let subLabel = "";
  let connected = false;

  if (!loading && context) {
    if (!context.projectAvailable) {
      label = "No Premiere project open";
      connected = false;
    } else {
      label = `Project: ${context.projectName || "Unknown"}`;
      subLabel = context.sequenceAvailable ? `Seq: ${context.sequenceName || "Active"}` : "No active sequence";
      connected = true;
    }
  }

  return (
    <div 
      className="runtime-status" 
      onClick={refresh} 
      role="button" 
      tabIndex={0}
      title="Click to refresh Premiere context"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '6px 12px', 
        background: '#1a1f29', 
        border: '1px solid #2d333b', 
        borderRadius: '20px', 
        gap: '10px' 
      }}
    >
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#6b7280', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', color: '#f3f4f6', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
        {subLabel && <span style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{subLabel}</span>}
      </div>
      <Icon name="clock" size={14} /> 
    </div>
  );
}
