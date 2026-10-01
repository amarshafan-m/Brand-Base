import { useState } from "react";
import { Icon } from "../components/Icon";
import { HighlightText } from "../components/HighlightText";
import { Badge, Button, EmptyState, IconButton } from "../components/ui";
import { useBrandList, type BrandWithStats } from "../hooks/useBrandList";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload, useApplicationData } from "../hooks/useApplicationData";
import { CreateBrandModal } from "../components/CreateBrandModal";
import { EditBrandModal } from "../components/EditBrandModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { ExportBrandModal } from "../components/ExportBrandModal";
import { BrandDetailPanel } from "../components/BrandDetailPanel";
import type { Brand } from "../domain/models";
import type { PageId } from "../types/navigation";

export function BrandsPage({ onShowNotice, onNavigate, searchQuery = "" }: { onShowNotice: (msg: string) => void, onNavigate: (page: PageId) => void, searchQuery?: string }) {
  const { data: allBrands, loading, error } = useBrandList();
  const brands = allBrands?.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null);
  const [exportBrand, setExportBrand] = useState<Brand | null>(null);
  const { data: settings } = useApplicationData(async (c) => c.settingsService.getSettings(), []);
  const confirmDelete = settings?.confirmDelete ?? true;
  
  if (loading) return <div className="page page--brands"><EmptyState title="Loading brands..." icon="brand" description="" /></div>;
  if (error) return <div className="page page--brands"><EmptyState title="Error" icon="info" description={error.message} /></div>;

  const handleSetDefault = async (brandId: string) => {
    try {
      await applicationContainer.brandService.setDefault(brandId);
      triggerGlobalReload();
      onShowNotice("Default brand updated.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const executeDelete = async (brandId: string) => {
    setDeleteBrandId(null);
    try {
      await applicationContainer.brandService.delete(brandId);
      triggerGlobalReload();
      onShowNotice("Brand deleted.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleDelete = (brandId: string) => {
    if (confirmDelete) {
      setDeleteBrandId(brandId);
    } else {
      executeDelete(brandId);
    }
  };

  if (selectedBrandId) {
    return (
      <div className="page page--brands">
        <BrandDetailPanel brandId={selectedBrandId} onBack={() => setSelectedBrandId(null)} onShowNotice={onShowNotice} onNavigateToLibrary={() => onNavigate('assets')} />
      </div>
    );
  }

  return (
    <div className="page page--brands">
      <section className="library-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p className="eyebrow">Brand System</p>
          <h2>All Brands</h2>
          <p>Manage your active brand environments.</p>
        </div>
        {(brands?.length || 0) > 0 ? (<div><Button icon="plus" onClick={() => setShowCreateModal(true)} variant="primary">Create Brand</Button></div>) : null}
      </section>

      <section className="library-canvas">
        {(brands?.length === 0) ? (
        <EmptyState 
          title="No brands found" 
          description="Create your first brand to start organizing assets." 
          icon="brand" 
          action={<Button variant="primary" icon="plus" onClick={() => setShowCreateModal(true)}>Create Brand</Button>} 
        />
        ) : (
          <div className="brand-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: settings?.compactMode ? '8px' : '16px', padding: '20px' }}>
            {brands?.map(brand => (
              <div key={brand.id} className="brand-card" onClick={() => setSelectedBrandId(brand.id)} style={{ padding: settings?.compactMode ? '16px' : '24px', marginRight: 0, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center' }}><HighlightText text={brand.name} highlight={searchQuery} /> {brand.isDefault && <div style={{ marginLeft: '8px' }}><Badge>Active</Badge></div>}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IconButton icon="package" label="Export Package" onClick={(e) => { 
                      e.stopPropagation(); 
                      setExportBrand(brand);
                    }} />
                    <IconButton icon="arrowUpRight" label="View Details" onClick={(e) => { e.stopPropagation(); setSelectedBrandId(brand.id); }} />
                  </div>
                </div>
                {brand.description && <p style={{ margin: 0, marginTop: '6px', fontSize: '13px', color: 'var(--uxp-host-text-color-secondary, #aaa)' }}><HighlightText text={brand.description} highlight={searchQuery} /></p>}
                
                <div className="brand-card-stats">
                  <div className="stat-item"><div className="stat-icon"><Icon name="assets" size={14} /></div><span>{brand.stats.assetCount} assets</span></div>
                  <div className="stat-item"><div className="stat-icon"><Icon name="palette" size={14} /></div><span>{brand.stats.colorCount} colors</span></div>
                  <div className="stat-item"><div className="stat-icon"><Icon name="type" size={14} /></div><span>{brand.stats.typographyCount} styles</span></div>
                </div>
                
                <div className="brand-card-actions" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {!brand.isDefault && <Button variant="secondary" onClick={() => handleSetDefault(brand.id)} style={{ flex: 1, padding: '8px 4px' }}>Set Active</Button>}
                  <Button variant="secondary" onClick={() => setEditBrand(brand)} style={{ flex: 1, padding: '8px 4px' }}>Edit</Button>
                  <Button variant="secondary" onClick={() => handleDelete(brand.id)} style={{ flex: 1, padding: '8px 4px' }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {showCreateModal && (
        <CreateBrandModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={(name) => {
            setShowCreateModal(false);
            onShowNotice(`Brand "${name}" created.`);
          }}
        />
      )}
      {editBrand && (
        <EditBrandModal 
          brand={editBrand}
          onClose={() => setEditBrand(null)}
          onSuccess={(name) => {
            setEditBrand(null);
            onShowNotice(`Brand "${name}" updated.`);
          }}
        />
      )}
      {deleteBrandId && (
        <ConfirmModal
          title="Delete Brand"
          message="Are you sure you want to permanently delete this brand and all of its configurations? This cannot be undone."
          confirmText="Delete"
          danger={true}
          onConfirm={() => executeDelete(deleteBrandId)}
          onCancel={() => setDeleteBrandId(null)}
        />
      )}
      {exportBrand && (
        <ExportBrandModal
          brandName={exportBrand.name}
          onClose={() => setExportBrand(null)}
          onConfirm={async (packageName, exportPath) => {
            setExportBrand(null);
            try {
              onShowNotice("Exporting brand package...");
              const success = await applicationContainer.brandExportService.exportBrand(exportBrand.id, packageName, exportPath);
              if (success) onShowNotice("Brand exported successfully!");
            } catch (err: any) {
              onShowNotice(err.message);
            }
          }}
        />
      )}
    </div>
  );
}
