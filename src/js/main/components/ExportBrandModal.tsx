import { useState } from "react";
import { Button } from "./ui";

export function ExportBrandModal({ 
  brandName,
  onClose, 
  onConfirm 
}: { 
  brandName: string,
  onClose: () => void,
  onConfirm: (packageName: string, exportPath: string) => void
}) {
  const [packageName, setPackageName] = useState(`${brandName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_package`);
  const [exportPath, setExportPath] = useState("");
  const [error, setError] = useState("");

  const handleChooseFolder = () => {
    if (typeof window !== 'undefined' && window.cep && window.cep.fs) {
      const result = window.cep.fs.showOpenDialogEx(false, true, "Select Export Folder", "", "");
      if (result && result.data && result.data.length > 0) {
        setExportPath(result.data[0]);
      }
    } else {
      setError("Folder picking is only available inside Premiere Pro.");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-main)',
        padding: '24px', borderRadius: '8px', width: '400px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}>
        {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Export Brand Package</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: 0 }}>
          This will package all assets, colors, and typography for "{brandName}" into a .zip file.
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Package Name</label>
          <input 
            type="text"
            className="form-input"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="Package name..."
            style={{ 
              width: '100%', padding: '8px', boxSizing: 'border-box',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid #555',
              color: 'var(--uxp-host-text-color, #fff)',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Export Location</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              readOnly
              value={exportPath || "Desktop (Default)"}
              style={{ 
                flex: 1, padding: '8px', boxSizing: 'border-box',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                borderRadius: '4px'
              }}
            />
            <Button variant="secondary" onClick={handleChooseFolder}>Choose...</Button>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onConfirm(packageName, exportPath)} disabled={!packageName.trim()}>
            Export Package
          </Button>
        </div>
      </div>
    </div>
  );
}
