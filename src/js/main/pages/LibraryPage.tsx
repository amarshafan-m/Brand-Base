import { useState, useEffect, useRef, useMemo } from "react";
import { useAssets, useBrands } from "../hooks/useBrandBaseData";
import { useApplicationData } from "../hooks/useApplicationData";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import { applicationContainer } from "../app/application";
import { Button, EmptyState } from "../components/ui";
import { useAssetImport } from "../hooks/useAssetImport";
import { PotentialDuplicateModal } from "../components/PotentialDuplicateModal";
import { AssetDetailPanel } from "../components/AssetDetailPanel";
import { TimelinePlacementModal } from "../components/TimelinePlacementModal";
import { Icon } from "../components/Icon";
import { Dropdown } from "../components/Dropdown";
import { HighlightText } from "../components/HighlightText";
import type { Asset, AssetType } from "../domain/models";
import type { PageId } from "../types/navigation";
import { libraryManager } from "../filesystem/LibraryManager";


export function LibraryPage({ page, onShowNotice, onNavigate, searchQuery = "" }: { page: any; onShowNotice: (msg: string) => void; onNavigate: (page: any) => void; searchQuery?: string }) {
  const { data: brands } = useBrands();
  const activeBrandId = brands?.find(b => b.isDefault)?.id;
  const { data: assets, loading } = useAssets(activeBrandId);
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  const { data: settings } = useApplicationData((c) => c.settingsService.getSettings(), []);
  
  const getExtensionsForPage = (p: string): string[] | undefined => {
    if (p === "audio") return ["mp3", "wav", "aac", "m4a", "aif", "aiff", "flac"];
    if (p === "graphics") return ["png", "jpg", "jpeg", "webp", "svg", "gif", "psd", "psb", "ai", "eps", "pdf", "tif", "tiff"];
    if (p === "video") return ["mp4", "mov", "avi", "webm", "m4v", "mkv", "mxf", "prores"];
    if (p === "mogrts") return ["mogrt"];
    if (p === "templates") return ["prproj", "aep"];
    if (p === "presets") return ["prfpset"];
    return undefined;
  };

  const { importFiles: _importFiles, importing, duplicatePrompt, handleDuplicateResolve } = useAssetImport(activeBrandId, getExtensionsForPage(page));
  const importFiles = async () => { try { await _importFiles(); } catch(e: any) { onShowNotice(e.message); } };
  
  const getCategoryFromPage = (p: string): AssetType[] | "all" => {
    if (p === "assets") return "all";
    if (p === "audio") return ["audio", "music", "sfx"];
    if (p === "video") return ["video"];
    if (p === "graphics") return ["graphic", "image", "logo"];
    if (p === "mogrts") return ["mogrt"];
    if (p === "templates") return ["template"];
    if (p === "packages") return ["package" as any];
    return "all";
  };

  const selectedCategories = getCategoryFromPage(page);
  
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [placementAsset, setPlacementAsset] = useState<Asset | null>(null);
  
  // Reset selected asset when navigating to a different page/category
  useEffect(() => {
    setSelectedAssetId(null);
  }, [page]);
  const [integrityScanning, setIntegrityScanning] = useState(false);
  const [sortBy, setSortBy] = useState("name_asc");
  const [localGridSize, setLocalGridSize] = useState<number | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  // Collect all unique tags across assets for filter pills
  const allTags = Array.from(new Set((assets || []).flatMap(a => a.tags || [])));

  useEffect(() => {
    if (settings?.gridSize && typeof settings.gridSize === "number") {
      setLocalGridSize(settings.gridSize);
    } else if (settings?.gridSize === "small") setLocalGridSize(140);
    else if (settings?.gridSize === "large") setLocalGridSize(240);
    else setLocalGridSize(180);
  }, [settings?.gridSize]);

  const updateGlobalGridSize = async (val: number) => {
    if (!settings) return;
    try {
      await applicationContainer.settingsService.updateSettings({ ...settings, gridSize: val });
      triggerGlobalReload();
    } catch (e: any) {
      console.error("Failed to update grid size", e);
    }
  };

  const checkIntegrity = async () => {
    if (!activeBrandId) return;
    setIntegrityScanning(true);
    try {
      const results = await applicationContainer.assetIntegrityService.checkBrand(activeBrandId);
      if (results.broken.length > 0) {
        if (isMounted.current) onShowNotice(`Integrity check found ${results.broken.length} missing files.`);
      } else {
        if (isMounted.current) onShowNotice("All assets are healthy.");
      }
    } catch (e: any) {
      onShowNotice("Integrity check failed: " + (e.message || String(e)));
    } finally {
      if (isMounted.current) setIntegrityScanning(false);
    }
  };

  const filteredAssets = assets?.filter(a => {
    if (a.type === 'mogrt' || a.type === 'template') return false; // Force hide legacy mogrts and templates
    
    if (page === "favorites" && !a.favorite) return false;
    // We could implement "recent" by sorting and limiting, but for now just show all if recent
    if (page !== "favorites" && page !== "recent" && selectedCategories !== "all" && !selectedCategories.includes(a.type)) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(a.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (activeTagFilter && !(a.tags || []).includes(activeTagFilter)) return false;
    return true;
  }) || [];
  
  if (page === "recent") {
    filteredAssets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    filteredAssets.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "date_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "size_desc") return (b.size || 0) - (a.size || 0);
      if (sortBy === "type_asc") return a.type.localeCompare(b.type);
      return 0;
    });
  }
  
  const selectedAsset = assets?.find(a => a.id === selectedAssetId) || null;

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="page page--library" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', position: 'relative' }}>
      <div className="library-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)', fontWeight: 600 }}>
            {page === "assets" ? "All Assets" : 
             page === "mogrts" ? "MOGRTs" : 
             page === "colors" ? "Brand Colors" :
             page === "packages" ? "Brand Packages" :
             page.charAt(0).toUpperCase() + page.slice(1)}
          </h2>
        </div>
        <div style={{ display: 'flex' }}>
          {filteredAssets.length > 0 && (
            <Button variant="primary" onClick={importFiles} disabled={importing || !activeBrandId}>
              {importing ? "Importing..." : "Import Assets"}
            </Button>
          )}
        </div>
      </div>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingBottom: '4px', flexShrink: 0 }}>
          <span 
            onClick={() => setActiveTagFilter(null)} 
            className={`category-pill ${!activeTagFilter ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >All</span>
          {allTags.map(tag => (
            <span 
              key={tag}
              onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)} 
              className={`category-pill ${activeTagFilter === tag ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >#{tag}</span>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading library...</div>
        ) : filteredAssets.length === 0 ? (
          <EmptyState title="No assets found" description="No assets found in this category." icon="assets" action={<Button variant="secondary" onClick={importFiles} disabled={importing || !activeBrandId}>{importing ? "Importing..." : "Import Assets"}</Button>} />
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(auto-fill, minmax(${localGridSize || 180}px, 1fr))`, 
            gap: settings?.compactMode ? '8px' : '16px' 
          }}>
            {filteredAssets.map(asset => {
              let w = `${localGridSize || 180}px`;
              let h = `${Math.round((localGridSize || 180) * 0.6)}px`;
              const libPath = libraryManager.getLibraryPath() || '';
              let absPath = "";
              let fileUri = "";
              if (libPath && asset.filePath && !asset.filePath.startsWith('absolute:') && !asset.filePath.startsWith('uxp-token:')) {
                const separator = libPath.includes('\\') ? '\\' : '/';
                let normalizedAssetPath = asset.filePath;
                if (separator === '\\') {
                  normalizedAssetPath = normalizedAssetPath.replace(/\//g, '\\');
                }
                const rawAbsPath = `${libPath}${separator}${normalizedAssetPath}`;
                absPath = rawAbsPath.replace(/([^:])\/\/+/g, '$1/');
                fileUri = "file://" + encodeURI(absPath);
              }

              return (
              <a 
                className="asset-card"
                href={fileUri || "#"}
                download={asset.name}
                key={asset.id} 
                onClick={(e) => { e.preventDefault(); setSelectedAssetId(asset.id); }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (applicationContainer.premiereTimelineService.isSupported(asset.type)) {
                    setPlacementAsset(asset);
                  }
                }}
                draggable={true}
                onDragStart={(e) => {
                  if (absPath) {
                    // Adobe CEP strict payload - do not add text/plain or DownloadURL as they can confuse Premiere's drop targets
                    try {
                      e.dataTransfer.setData("com.adobe.cep.dnd.file.0", absPath);
                    } catch(err) { console.warn("DND set error:", err); }
                    e.dataTransfer.effectAllowed = "copy";
                    
                    try {
                        (e.nativeEvent as any).dataTransfer.setData("com.adobe.cep.dnd.file.0", absPath);
                    } catch (err) { console.warn("Native DND set error:", err); }
                  }
                }}
                onDragEnd={(e) => {
                  // FAKE DRAG DROP HACK FOR MOGRTS
                  // If Premiere's timeline rejects the MOGRT drop, dropEffect will be "none".
                  // In this case, since they finished dragging, we just programmatically insert it!
                  if (asset.type === 'mogrt' && e.dataTransfer.dropEffect === "none") {
                    applicationContainer.premiereTimelineService.placeAssetOnTimeline(asset, {
                      mode: 'playhead',
                      editMode: 'insert',
                      videoTrackIndex: 0,
                      audioTrackIndex: 0
                    }).catch(err => {
                      if (onShowNotice) onShowNotice("Failed to place MOGRT: " + err.message);
                    });
                  }
                }}
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-card)', 
                  border: selectedAssetId === asset.id ? '2px solid var(--primary)' : '1px solid var(--border)', 
                  borderRadius: settings?.compactMode ? '8px' : '12px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  boxShadow: selectedAssetId === asset.id ? '0 4px 15px rgba(37, 99, 235, 0.3)' : '0 2px 5px rgba(0,0,0,0.2)',
                  userSelect: 'none',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ aspectRatio: '1.6', width: '100%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                  {/* Removed invisible image hack to prevent broken image dragging issues */}

                  {(asset.type === 'logo' || asset.type === 'image' || asset.type === 'graphic' || (asset.type === 'mogrt' && asset.metadata?.thumbnailPath)) ? (
                    <img 
                      draggable={false}
                      src={"file:///" + (((applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || '') + "/" + (asset.metadata?.thumbnailPath || asset.filePath)).replace(/\\/g, '/')} 
                      alt={asset.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
                      onError={(e) => { 
                        e.currentTarget.style.display = 'none'; 
                        const fallback = document.createElement('span');
                        fallback.style.fontSize = '24px';
                        fallback.style.color = 'var(--text-muted)';
                        fallback.style.fontWeight = 'bold';
                        fallback.textContent = asset.name.slice(0, 1);
                        e.currentTarget.parentElement?.appendChild(fallback);
                      }} 
                    />
                  ) : (
                    ((asset.type as string) === "audio" || (asset.type as string) === "music" || (asset.type as string) === "sfx") ? (
      <div 
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        onMouseEnter={(e) => { const a = e.currentTarget.querySelector('audio'); if (a) { a.play().catch(console.error); } }}
        onMouseLeave={(e) => { const a = e.currentTarget.querySelector('audio'); if (a) { a.pause(); a.currentTime = 0; } }}
      >
        <div style={{ pointerEvents: 'none' }}>
          <Icon name="audio" size={settings?.gridSize === 'small' ? 24 : settings?.gridSize === 'large' ? 48 : 32} strokeWidth={1.5} />
        </div>
        <audio src={"file:///" + (((applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || '') + "/" + asset.filePath).replace(/\\/g, '/')} style={{ display: 'none' }} loop />
      </div>
  ) : asset.type === "video" ? (
      <div 
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
        onMouseMove={(e) => { 
           const v = e.currentTarget.querySelector('video'); 
           if (v && !isNaN(v.duration) && v.duration > 0) { 
             const rect = e.currentTarget.getBoundingClientRect(); 
             const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); 
             v.currentTime = percent * v.duration; 
           } 
        }}
        onMouseLeave={(e) => { 
           const v = e.currentTarget.querySelector('video'); 
           if (v) { v.currentTime = 0; } 
        }}
      >
        <video 
          src={"file:///" + (((applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || '') + "/" + asset.filePath).replace(/\\/g, '/')} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
          muted 
          playsInline
          preload="metadata"
        />
      </div>
  ) : (
      <div style={{ pointerEvents: 'none' }}>
        <Icon name={((asset.type as string) === "audio" || (asset.type as string) === "music" || (asset.type as string) === "sfx") ? 'audio' : (asset.type as string) === "mogrt" ? 'template' : 'assets'} size={settings?.gridSize === 'small' ? 24 : settings?.gridSize === 'large' ? 48 : 32} strokeWidth={1.5} />
      </div>
  )
                  )}
                  
                  {/* Quick Add Button */}
                  <div 
                    className="quick-add-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (applicationContainer.premiereTimelineService.isSupported(asset.type)) {
                        applicationContainer.premiereTimelineService.placeAssetOnTimeline(asset, {
                          mode: 'playhead',
                          editMode: 'overwrite',
                          videoTrackIndex: 'auto' as any,
                          audioTrackIndex: 'auto' as any
                        }).catch(err => {
                          if (onShowNotice) onShowNotice("Failed to quick add: " + err.message);
                        });
                      } else {
                        if (onShowNotice) onShowNotice("This asset type cannot be placed on the timeline.");
                      }
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 10,
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    title="Quick Add to Timeline"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.border = '1px solid var(--primary)';
                      e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    }}
                  >
                    <Icon name="plus" size={14} strokeWidth={2.5} />
                  </div>

                </div>
                <div className="asset-card-footer" style={{ padding: settings?.compactMode ? "8px" : "12px", fontSize: "12px" }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}><HighlightText text={asset.name} highlight={searchQuery} /></div>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500 }}>
                    <span style={{ textTransform: 'uppercase' }}>{asset.extension || asset.type}</span>
                    <span>{formatSize(asset.size)}</span>
                  </div>
                </div>
              </a>
            )})}
          </div>
        )}
      </div>

      <div className="library-footer" style={{ 
        display: selectedAsset ? 'none' : 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        padding: '12px 16px', 
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        flexShrink: 0,
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Icon name="graphics" size={14} />
           <input 
             type="range" 
             min="100" 
             max="300" 
             value={localGridSize || 180} 
             onChange={(e) => setLocalGridSize(Number(e.target.value))}
             onMouseUp={() => updateGlobalGridSize(localGridSize || 180)}
             onTouchEnd={() => updateGlobalGridSize(localGridSize || 180)}
             style={{ width: '120px', cursor: 'ew-resize' }}
           />
           <Icon name="graphics" size={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="sort" size={16} />
          <Dropdown 
            placement="top"
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: "name_asc", label: "Name (A-Z)" },
              { value: "name_desc", label: "Name (Z-A)" },
              { value: "date_desc", label: "Newest First" },
              { value: "date_asc", label: "Oldest First" },
              { value: "size_desc", label: "Size (Largest)" },
              { value: "type_asc", label: "Type" }
            ]}
          />
        </div>
      </div>

      {selectedAsset && (
        <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAssetId(null)} onShowNotice={onShowNotice} />
      )}

      {placementAsset && (
        <TimelinePlacementModal asset={placementAsset} onClose={() => setPlacementAsset(null)} />
      )}

      {duplicatePrompt && (
        <PotentialDuplicateModal
          message={`A potential duplicate was found for "${duplicatePrompt.name}". ${duplicatePrompt.message || 'Continue import?'}`}
          onResolve={handleDuplicateResolve}
        />
      )}
    </div>
  );
}
