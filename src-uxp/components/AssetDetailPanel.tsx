import { useState } from "react";
import { Icon } from "./Icon";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import { usePremiereContext } from "../hooks/usePremiereContext";
import { usePremiereTimeline } from "../hooks/usePremiereTimeline";
import type { Asset } from "../domain/models";
import { TimelinePlacementModal } from "./TimelinePlacementModal";
import { Button } from "./ui";

interface Props {
  asset: Asset;
  onClose: () => void;
}

export function AssetDetailPanel({ asset, onClose }: Props) {
  const [showPlacement, setShowPlacement] = useState(false);
  const [importing, setImporting] = useState(false);
  const { context } = usePremiereContext();
  const { timelineContext } = usePremiereTimeline();

  const toggleFavorite = async () => {
    if (asset.favorite) {
      await applicationContainer.assetService.unfavorite(asset.id);
    } else {
      await applicationContainer.assetService.favorite(asset.id);
    }
    triggerGlobalReload();
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  const isImportSupported = applicationContainer.premiereAssetImportService.isSupported(asset.type);

  const handleImportToPremiere = async () => {
    setImporting(true);
    try {
      await applicationContainer.premiereAssetImportService.importAsset(asset);
      alert("Successfully imported to Premiere Project.");
    } catch (e: any) {
      alert(`Import failed: ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <aside className="asset-detail-panel" style={{ width: '340px', background: '#0d0f12', borderLeft: '1px solid #262a33', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #262a33' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleFavorite} style={{ background: 'transparent', color: asset.favorite ? '#fbbf24' : '#6b7280', border: 'none', cursor: 'pointer' }}>
            <Icon name="star" size={16} />
          </button>
          <button onClick={onClose} style={{ background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ width: '100%', height: '180px', background: '#14161a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid #262a33', overflow: 'hidden' }}>
          {asset.type === 'logo' || asset.type === 'image' || asset.type === 'graphic' ? (
            <img src={asset.metadata?.thumbnailPath ? `file://${asset.metadata.thumbnailPath}` : `file://${asset.filePath}`} alt={asset.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span style="font-size: 32px; color: #fff;">${asset.name.slice(0, 1)}</span>`; }} />
          ) : (
            <span style={{ fontSize: '32px', color: '#fff' }}>{asset.type === 'audio' || asset.type === 'music' ? 'ılıılı' : asset.name.slice(0, 1)}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: '#f3f4f6', fontWeight: 600 }}>Properties</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>Name:</span> <span style={{ color: '#f3f4f6', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>Type:</span> <span style={{ color: '#f3f4f6' }}>{asset.type}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>Extension:</span> <span style={{ color: '#f3f4f6' }}>{asset.extension?.toUpperCase() || "-"}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>File Size:</span> <span style={{ color: '#f3f4f6' }}>{formatSize(asset.size)}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>Location:</span> <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.filePath.replace('uxp-token:', '')}</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: '#f3f4f6', fontWeight: 600 }}>Actions</h3>
          <Button variant="primary" onClick={handleImportToPremiere} disabled={!context?.projectAvailable || !isImportSupported || importing}>
            {importing ? "Importing..." : "Import to Premiere"}
          </Button>
          <Button variant="secondary" onClick={() => setShowPlacement(true)} disabled={!timelineContext?.sequenceAvailable || !isImportSupported}>
            Place on Timeline
          </Button>
          {!isImportSupported && (
            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
              This asset type cannot be directly imported.
            </p>
          )}
        </div>
      </div>
      {showPlacement && <TimelinePlacementModal asset={asset} onClose={() => setShowPlacement(false)} />}
    </aside>
  );
}
