import { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { Badge, Button, EmptyState, IconButton } from "./ui";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload, useApplicationData } from "../hooks/useApplicationData";
import type { Brand, BrandColor, TypographyStyle } from "../domain/models";

import { EditColorModal } from "./EditColorModal";
import { EditBrandModal } from "./EditBrandModal";
import { EditTypographyModal } from "./EditTypographyModal";
import { ConfirmModal } from "./ConfirmModal";

interface Props {
  brandId: string;
  onBack: () => void;
  onShowNotice: (msg: string) => void;
  onNavigateToLibrary?: () => void;
}

export function BrandDetailPanel({ brandId, onBack, onShowNotice, onNavigateToLibrary }: Props) {
  const [showColorModal, setShowColorModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTypographyModal, setShowTypographyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { data, loading, error } = useApplicationData(async (c) => {
    const brand = await c.brandService.getById(brandId);
    const colors = await c.colorService.getByBrandId(brandId);
    const typography = await c.typographyService.getByBrandId(brandId);
    const assets = await c.assetService.getByBrandId(brandId);
    const settings = await c.settingsService.getSettings();
    return { brand, colors, typography, assets, settings };
  }, [brandId]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error || !data) return <div style={{ padding: 20 }}>Error loading brand</div>;

  const { brand, colors, typography, assets } = data;

  const handleSetDefault = async () => {
    try {
      await applicationContainer.brandService.setDefault(brand.id);
      triggerGlobalReload();
      onShowNotice("Default brand updated.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await applicationContainer.brandService.delete(brand.id);
      triggerGlobalReload();
      onShowNotice("Brand deleted.");
      onBack();
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleDelete = () => {
    if (data?.settings?.confirmDelete ?? true) {
      setShowDeleteConfirm(true);
    } else {
      executeDelete();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--uxp-host-border-color, var(--border))', display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ marginRight: '16px' }}><Button onClick={onBack} variant="secondary">Back</Button></div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>{brand.name} {brand.isDefault && <div style={{ marginLeft: '12px' }}><Badge>Active</Badge></div>}</h2>
          {brand.description && <p style={{ margin: 0, color: 'var(--uxp-host-text-color-secondary, #aaa)' }}>{brand.description}</p>}
        </div>
        <div style={{ display: 'flex' }}>
          {!brand.isDefault && <div style={{ marginRight: '8px' }}><Button variant="secondary" onClick={() => handleSetDefault()}>Set Active</Button></div>}
          <div style={{ marginRight: '8px' }}><Button variant="secondary" onClick={() => setShowEditModal(true)}>Edit</Button></div>
          <Button variant="danger" onClick={() => handleDelete()}>Delete</Button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Colors ({colors.length})</h3>
            <Button variant="secondary" onClick={() => setShowColorModal(true)}>Add Color</Button>
          </div>
          {colors.length === 0 ? <p style={{ color: 'var(--text-muted)', margin: 0 }}>No colors added yet.</p> : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {colors.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px', marginRight: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: c.hex, marginRight: '8px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Typography ({typography.length})</h3>
            <Button variant="secondary" onClick={() => setShowTypographyModal(true)}>Add Style</Button>
          </div>
          {typography.length === 0 ? <p style={{ color: 'var(--text-muted)', margin: 0 }}>No typography added yet.</p> : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {typography.map(t => (
                <div key={t.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', minWidth: '150px', display: 'flex', justifyContent: 'space-between', marginRight: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{(t as any).name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.fontFamily} {t.fontWeight}</div>
                  </div>
                  <div style={{ fontSize: '24px', lineHeight: 1 }}>Aa</div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Assets ({assets.length})</h3>
            <Button variant="secondary" onClick={() => { if (onNavigateToLibrary) onNavigateToLibrary(); else onBack(); }}>View Brand Library</Button>
          </div>
          {assets.length === 0 ? <p style={{ color: 'var(--text-muted)', margin: 0 }}>No assets added yet. Import files to this brand from the Media Library.</p> : (
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {assets.map(a => (
                 <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px' }}>{a.type}</span>
                   <span>{a.name}</span>
                 </div>
               ))}
             </div>
          )}
        </section>
      </div>

      {showColorModal && (
        <EditColorModal 
          brandId={brand.id}
          onClose={() => setShowColorModal(false)}
        />
      )}
      
      {showEditModal && (
        <EditBrandModal 
          brand={brand}
          onClose={() => setShowEditModal(false)}
          onSuccess={(name) => {
            setShowEditModal(false);
            triggerGlobalReload();
          }}
        />
      )}
      
      {showTypographyModal && (
        <EditTypographyModal 
          brandId={brand.id}
          onClose={() => setShowTypographyModal(false)}
        />
      )}
      
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Brand"
          message="Are you sure you want to permanently delete this brand? This action cannot be undone."
          confirmText="Delete"
          danger={true}
          onConfirm={executeDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
