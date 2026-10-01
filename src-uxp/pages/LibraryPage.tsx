import { useState } from "react";
import { useAssets, useBrands } from "../hooks/useBrandBaseData";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import { applicationContainer } from "../app/application";
import { Button, EmptyState } from "../components/ui";
import { useAssetImport } from "../hooks/useAssetImport";
import { PotentialDuplicateModal } from "../components/PotentialDuplicateModal";
import { AssetDetailPanel } from "../components/AssetDetailPanel";
import { Icon } from "../components/Icon";
import type { Asset, AssetType } from "../domain/models";
import type { PageId } from "../types/navigation";


export function LibraryPage({ onShowNotice, onNavigate, page }: { onShowNotice: (msg: string) => void, onNavigate: (page: PageId) => void, page: string }) {
  const { data: brands } = useBrands();
  const activeBrandId = brands?.find(b => b.isDefault)?.id;
  const { data: assets, loading } = useAssets(activeBrandId);
  const { importFiles, importing, duplicatePrompt, handleDuplicateResolve } = useAssetImport(activeBrandId);
  
  const getCategoryFromPage = (p: string): AssetType | "all" => {
    if (p === "assets") return "all";
    if (p === "audio") return "audio";
    if (p === "graphics") return "graphic";
    if (p === "mogrts") return "mogrt";
    if (p === "templates") return "template";
    if (p === "presets") return "preset";
    if (p === "packages") return "package";
    return "all";
  };

  const selectedCategory = getCategoryFromPage(page);
  
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [integrityScanning, setIntegrityScanning] = useState(false);

  const checkIntegrity = async () => {
    if (!activeBrandId) return;
    setIntegrityScanning(true);
    try {
      const results = await applicationContainer.assetIntegrityService.checkBrand(activeBrandId);
      if (results.broken.length > 0) {
        onShowNotice(`Integrity check found ${results.broken.length} missing files.`);
      } else {
        onShowNotice("All assets are healthy.");
      }
    } catch (e: any) {
      onShowNotice("Integrity check failed.");
    } finally {
      setIntegrityScanning(false);
    }
  };

  const filteredAssets = assets?.filter(a => selectedCategory === "all" || a.type === selectedCategory) || [];
  const selectedAsset = assets?.find(a => a.id === selectedAssetId) || null;

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="page page--library" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div className="library-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#ffffff', fontWeight: 600 }}>
            {page === "assets" ? "All Assets" : 
             page === "mogrts" ? "MOGRTs" : 
             page === "colors" ? "Brand Colors" :
             page === "packages" ? "Brand Packages" :
             page.charAt(0).toUpperCase() + page.slice(1)}
          </h2>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '12px' }}>
            <Button variant="secondary" onClick={checkIntegrity} disabled={integrityScanning}>
              {integrityScanning ? "Scanning..." : "Check Integrity"}
            </Button>
          </div>
          <Button variant="primary" onClick={importFiles} disabled={importing || !activeBrandId}>
            {importing ? "Importing..." : "Import Assets"}
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading library...</div>
        ) : filteredAssets.length === 0 ? (
          <EmptyState title="No assets found" description="No assets found in this category." icon="assets" />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAssetId(asset.id)}
                style={{ 
                  width: '180px', 
                  background: '#14161a', 
                  border: selectedAssetId === asset.id ? '2px solid #2563eb' : '1px solid #262a33', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  boxShadow: selectedAssetId === asset.id ? '0 4px 15px rgba(37, 99, 235, 0.3)' : '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ height: '110px', background: '#0d0f12', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #262a33' }}>
                  <Icon name={asset.type === 'video' ? 'motion' : asset.type === 'audio' ? 'audio' : asset.type === 'mogrt' ? 'template' : 'assets'} size={32} strokeWidth={1.5} />
                </div>
                <div style={{ padding: '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{asset.name}</div>
                  <div style={{ color: '#9ca3af', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500 }}>
                    <span style={{ textTransform: 'uppercase' }}>{asset.extension || asset.type}</span>
                    <span>{formatSize(asset.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAsset && (
        <AssetDetailPanel asset={selectedAsset} onClose={() => setSelectedAssetId(null)} />
      )}

      {duplicatePrompt && (
        <PotentialDuplicateModal
          
          message={`A potential duplicate was found. Continue import?`}
          onResolve={handleDuplicateResolve}
        />
      )}
    </div>
  );
}
