import { useState } from "react";
import { Button } from "./ui";
import { applicationContainer } from "../app/application";
import type { UpdateInfo } from "../services/UpdaterService";

interface Props {
  info: UpdateInfo;
  onClose: () => void;
}

export function UpdateModal({ info, onClose }: Props) {
  const [installing, setInstalling] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleInstall = async () => {
    if (!info.downloadUrl) return;
    setInstalling(true);
    setStatus("Starting download...");
    
    try {
      await applicationContainer.updaterService.installUpdate(info.downloadUrl, (msg) => setStatus(msg));
    } catch (e: any) {
      setStatus("Error: " + e.message);
      setInstalling(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="modal-content" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Update Available</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
          Brand Base version <strong>{info.latestVersion}</strong> is now available. You are currently on an older version.
        </p>
        
        {info.releaseNotes && (
          <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '6px', fontSize: '12px', marginBottom: '20px', maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border)' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{info.releaseNotes}</pre>
          </div>
        )}
        
        {status && <p style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '16px', fontWeight: 500 }}>{status}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="secondary" onClick={onClose} disabled={installing}>Later</Button>
          <Button variant="primary" onClick={handleInstall} disabled={installing || !info.downloadUrl}>
            {installing ? "Installing..." : "Install Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
