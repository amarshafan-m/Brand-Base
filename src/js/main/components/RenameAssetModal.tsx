import { useState } from "react";
import { Button } from "./ui";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import type { Asset } from "../domain/models";

interface Props {
  asset: Asset;
  onClose: () => void;
}

export function RenameAssetModal({ asset, onClose }: Props) {
  const [name, setName] = useState(asset.name);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applicationContainer.assetService.update({ ...asset, name });
      triggerGlobalReload();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-hover)', padding: '24px', borderRadius: '8px', width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Rename Asset</h2>
        {error && <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>Name
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }} />
        </label>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Save</Button>
        </div>
      </form>
    </div>
  );
}
