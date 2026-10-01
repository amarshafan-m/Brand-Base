import { useState } from "react";
import { Icon } from "../components/Icon";
import { Badge, Button, EmptyState, IconButton } from "../components/ui";
import { useBrandList, type BrandWithStats } from "../hooks/useBrandList";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import { CreateBrandModal } from "../components/CreateBrandModal";
import { EditBrandModal } from "../components/EditBrandModal";
import { BrandDetailPanel } from "../components/BrandDetailPanel";
import type { Brand } from "../domain/models";
import type { PageId } from "../types/navigation";

export function BrandsPage({ onShowNotice, onNavigate }: { onShowNotice: (msg: string) => void, onNavigate: (page: PageId) => void }) {
  const { data: brands, loading, error } = useBrandList();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
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

  const handleArchive = async (brandId: string) => {
    if (!confirm("Are you sure you want to archive this brand? It will be removed from the active lists.")) return;
    try {
      await applicationContainer.brandService.delete(brandId);
      triggerGlobalReload();
      onShowNotice("Brand archived.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  if (selectedBrandId) {
    return (
      <div className="page page--brands">
        <BrandDetailPanel brandId={selectedBrandId} onBack={() => setSelectedBrandId(null)} onShowNotice={onShowNotice} />
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
        {brands?.length > 0 ? (<div><Button icon="plus" onClick={() => setShowCreateModal(true)} variant="primary">Create Brand</Button></div>) : null}
      </section>

      <section className="library-canvas">
        {brands?.length === 0 ? (
          <EmptyState
            title="No brands found"
            description="Create your first brand to start organizing assets."
            icon="brand"
            action={<Button icon="plus" onClick={() => setShowCreateModal(true)}>Create Brand</Button>}
          />
        ) : (
          <div className="brand-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '20px' }}>
            {brands?.map(brand => (
              <div key={brand.id} className="brand-card" style={{ border: '1px solid var(--uxp-host-border-color, #444)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }} onClick={() => setSelectedBrandId(brand.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{brand.name} {brand.isDefault && <div style={{ marginLeft: '8px' }}><Badge>Active</Badge></div>}</h3>
                  <IconButton icon="arrowUpRight" label="View Details" onClick={(e) => { e.stopPropagation(); setSelectedBrandId(brand.id); }} />
                </div>
                {brand.description && <p style={{ margin: 0, marginTop: '6px', fontSize: '13px', color: 'var(--uxp-host-text-color-secondary, #aaa)' }}>{brand.description}</p>}
                
                <div className="brand-card-stats" style={{ display: 'flex', fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  <div className="stat-item"><div className="stat-icon"><Icon name="assets" size={14} /></div><span>{brand.stats.assetCount} assets</span></div>
                  <div className="stat-item"><div className="stat-icon"><Icon name="palette" size={14} /></div><span>{brand.stats.colorCount} colors</span></div>
                  <div className="stat-item"><div className="stat-icon"><Icon name="type" size={14} /></div><span>{brand.stats.typographyCount} styles</span></div>
                </div>
                
                <div className="brand-card-actions" style={{ display: 'flex', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #262a33' }} onClick={(e) => e.stopPropagation()}>
                  {!brand.isDefault && <div style={{ flex: 1, marginRight: '8px' }}><Button variant="secondary" onClick={() => handleSetDefault(brand.id)} style={{ width: '100%' }}>Set Active</Button></div>}
                  <div style={{ flex: 1, marginRight: '8px' }}><Button variant="secondary" onClick={() => setEditBrand(brand)} style={{ width: '100%' }}>Edit</Button></div>
                  <div style={{ flex: 1 }}><Button variant="secondary" onClick={() => handleArchive(brand.id)} style={{ width: '100%' }}>Archive</Button></div>
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
    </div>
  );
}
