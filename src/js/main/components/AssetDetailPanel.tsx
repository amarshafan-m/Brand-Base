import { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload, useApplicationData } from "../hooks/useApplicationData";
import { usePremiereContext } from "../hooks/usePremiereContext";
import { usePremiereTimeline } from "../hooks/usePremiereTimeline";
import type { Asset } from "../domain/models";
import { TimelinePlacementModal } from "./TimelinePlacementModal";
import { ConfirmModal } from "./ConfirmModal";
import { openLinkInBrowser } from "../../lib/utils/bolt";
import { Button } from "./ui";
import { libraryManager } from "../filesystem/LibraryManager";
import { MediaPlayer } from "./MediaPlayer";

interface Props {
  asset: Asset;
  onClose: () => void;
  onShowNotice?: (msg: string) => void;
}

export function AssetDetailPanel({ asset, onClose, onShowNotice }: Props) {
  const [showPlacement, setShowPlacement] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFav, setIsFav] = useState(asset.favorite);
  const [tagInput, setTagInput] = useState("");
  const [currentTags, setCurrentTags] = useState<string[]>(asset.tags || []);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(asset.name);
  const { context } = usePremiereContext();
  const { timelineContext } = usePremiereTimeline();
  useEffect(() => { setIsFav(asset.favorite); }, [asset.favorite]);
  useEffect(() => { setCurrentTags(asset.tags || []); }, [asset.id, asset.tags]);
  useEffect(() => { setRenameValue(asset.name); }, [asset.id, asset.name]);
  

  const toggleFavorite = async () => {
    const newFav = !isFav;
    setIsFav(newFav); // Optimistic UI update
    try {
      if (isFav) {
        await applicationContainer.assetService.unfavorite(asset.id);
      } else {
        await applicationContainer.assetService.favorite(asset.id);
      }
      triggerGlobalReload();
    } catch(e: any) {
      setIsFav(!newFav); // Revert on failure
      if (onShowNotice) onShowNotice("Failed to update favorite: " + (e.message || String(e)));
    }
  };

  const addTag = async (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || currentTags.includes(trimmed)) return;
    const newTags = [...currentTags, trimmed];
    setCurrentTags(newTags);
    setTagInput("");
    try {
      await applicationContainer.assetService.update({ ...asset, tags: newTags });
      triggerGlobalReload();
    } catch (e: any) {
      setCurrentTags(currentTags); // Revert
      if (onShowNotice) onShowNotice("Failed to add tag: " + e.message);
    }
  };

  const removeTag = async (tag: string) => {
    const newTags = currentTags.filter(t => t !== tag);
    setCurrentTags(newTags);
    try {
      await applicationContainer.assetService.update({ ...asset, tags: newTags });
      triggerGlobalReload();
    } catch (e: any) {
      setCurrentTags(currentTags); // Revert
      if (onShowNotice) onShowNotice("Failed to remove tag: " + e.message);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  const isImportSupported = applicationContainer.premiereAssetImportService.isSupported(asset.type);

    const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await applicationContainer.assetService.delete(asset.id);
      triggerGlobalReload();
      if (onShowNotice) onShowNotice('Asset deleted.');
      onClose();
    } catch (e: any) {
      if (onShowNotice) onShowNotice(e.message); else console.error(e.message);
    }
  };

  const handleImportToPremiere = async () => {
    setImporting(true);
    try {
      await applicationContainer.premiereAssetImportService.importAsset(asset);
      if (onShowNotice) onShowNotice("Successfully imported to Premiere Project.");
    } catch (e: any) {
      alert(`Import failed:\n\n${e.message || String(e)}`);
    } finally {
      setImporting(false);
    }
  };

  const { data: settings } = useApplicationData((c) => c.settingsService.getSettings(), []);
  const confirmDelete = settings?.confirmDelete ?? true;

  const handleDeleteRequest = () => {
    if (confirmDelete) {
      setShowDeleteConfirm(true);
    } else {
      handleDelete();
    }
  };

  return (
    <aside className="asset-detail-panel" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 100, height: '100%', width: '340px', background: 'var(--bg-sidebar)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1, marginRight: '12px' }}>{asset.name}</h2>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={toggleFavorite} className={`detail-panel-action is-star ${isFav ? 'is-active' : ''}`} title="Toggle Favorite">
            <Icon name={isFav ? "starFilled" : "star"} size={16} />
          </button>
          <button onClick={onClose} className="detail-panel-action is-close" title="Close Panel">
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ width: '100%', height: '180px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {asset.type === 'logo' || asset.type === 'image' || asset.type === 'graphic' ? (
            <img 
              src={"file://" + ((applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || '') + "/" + (asset.metadata?.thumbnailPath || asset.filePath)} 
              alt={asset.name} 
              style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                const fallback = document.createElement('span');
                fallback.style.fontSize = '32px';
                fallback.style.color = 'var(--text-main)';
                fallback.textContent = asset.name.slice(0, 1);
                e.currentTarget.parentElement?.appendChild(fallback);
              }} 
            />
          ) : asset.type === 'video' ? (
            <MediaPlayer 
              src={"file://" + (libraryManager.getLibraryPath() || '') + "/" + asset.filePath} 
              type="video" 
            />
          ) : asset.type === 'audio' || asset.type === 'music' || asset.type === 'sfx' ? (
            <MediaPlayer 
              src={"file://" + (libraryManager.getLibraryPath() || '') + "/" + asset.filePath} 
              type="audio" 
            />
          ) : (
            <span style={{ fontSize: '32px', color: 'var(--text-main)' }}>{asset.name.slice(0, 1)}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>Properties</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', width: '100px' }}>Name:</span> 
              {isRenaming ? (
                <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
                  <input 
                    autoFocus
                    value={renameValue} 
                    onChange={(e) => setRenameValue(e.target.value)} 
                    onKeyDown={async (e) => {
                       if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (renameValue.trim() && renameValue !== asset.name) {
                            try {
                              await applicationContainer.assetService.update({ ...asset, name: renameValue.trim() });
                              triggerGlobalReload();
                            } catch(err:any) { onShowNotice && onShowNotice(err.message); }
                          }
                          setIsRenaming(false);
                       } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsRenaming(false);
                          setRenameValue(asset.name);
                       }
                    }}
                    onBlur={async () => {
                      if (renameValue.trim() && renameValue !== asset.name) {
                        try {
                          await applicationContainer.assetService.update({ ...asset, name: renameValue.trim() });
                          triggerGlobalReload();
                        } catch(err:any) {}
                      }
                      setIsRenaming(false);
                    }}
                    style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--primary)', color: 'var(--text-main)', borderRadius: '4px', padding: '2px 4px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: '8px', overflow: 'hidden' }}>
                   <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={asset.name}>{asset.name}</span>
                   <span 
                      onClick={() => { setIsRenaming(true); setRenameValue(asset.name); }} 
                      style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                     <Icon name="pencil" size={12} />
                   </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex' }}><span style={{ color: 'var(--text-muted)', width: '100px' }}>Type:</span> <span style={{ color: 'var(--text-main)' }}>{asset.type}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: 'var(--text-muted)', width: '100px' }}>Extension:</span> <span style={{ color: 'var(--text-main)' }}>{asset.extension?.toUpperCase() || "-"}</span></div>
            <div style={{ display: 'flex' }}><span style={{ color: 'var(--text-muted)', width: '100px' }}>File Size:</span> <span style={{ color: 'var(--text-main)' }}>{formatSize(asset.size)}</span></div>
            <div style={{ display: 'flex' }}>
              <span style={{ color: 'var(--text-muted)', width: '100px' }}>Location:</span> 
              <span onClick={() => {
                const lib = libraryManager.getLibraryPath() || '';
                const sep = lib.includes('\\') ? '\\' : '/';
                let norm = asset.filePath;
                if (sep === '\\') norm = norm.replace(/\//g, '\\');
                const abs = `${lib}${sep}${norm}`.replace(/\\+/g, '\\').replace(/\/+/g, '/');
                const safeUrl = 'file:///' + abs.replace(/\\/g, '/');
                openLinkInBrowser(safeUrl);
              }} style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={asset.filePath}>
                {asset.filePath.split('/').pop()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {currentTags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'var(--bg-hover)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '11px', fontWeight: 500 }}>
                #{tag}
                <span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1 }} title="Remove tag">&times;</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input 
              type="text" 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  addTag(tagInput);
                }
              }}
              placeholder="Add tag..."
              style={{ flex: 1, padding: '4px 8px', fontSize: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-main)', outline: 'none' }}
            />
            <div 
              role="button" tabIndex={0}
              onClick={() => { if (tagInput.trim()) addTag(tagInput); }}
              style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600, background: 'var(--primary)', color: '#ffffff', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >+</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>Actions</h3>
          {isImportSupported && (
            <Button variant="primary" onClick={handleImportToPremiere} disabled={importing}>
              {importing ? "Importing..." : "Import to Premiere"}
            </Button>
          )}
          {applicationContainer.premiereTimelineService.isSupported(asset.type) && (
            <Button variant="secondary" onClick={() => setShowPlacement(true)}>
              Place on Timeline
            </Button>
          )}
          <Button variant="danger" onClick={handleDeleteRequest}>
            Delete Asset
          </Button>
          {!isImportSupported && !applicationContainer.premiereTimelineService.isSupported(asset.type) && (
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
              This asset type cannot be placed automatically. Please drag and drop it into the appropriate Premiere Pro panel.
            </p>
          )}
        </div>
      </div>
      {showPlacement && <TimelinePlacementModal asset={asset} onClose={() => setShowPlacement(false)} />}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Asset"
          message="Are you sure you want to delete this asset? The physical file will be removed from your library."
          confirmText="Delete"
          danger={true}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </aside>
  );
}
