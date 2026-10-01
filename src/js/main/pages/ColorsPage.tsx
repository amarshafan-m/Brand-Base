import { useState } from "react";
import { applicationContainer } from "../app/application";
import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import { Button, EmptyState } from "../components/ui";
import { EditColorModal } from "../components/EditColorModal";
import { Icon } from "../components/Icon";
import { HighlightText } from "../components/HighlightText";
import { copyToClipboard } from "../utils/clipboard";
import { ConfirmModal } from "../components/ConfirmModal";
import type { BrandColor } from "../domain/models";

export function ColorsPage({ onShowNotice, searchQuery = "" }: { onShowNotice: (msg: string) => void, searchQuery?: string }) {
  const { data, loading, error } = useApplicationData(async (c) => {
    const brands = await c.brandService.getAll();
    const settings = await c.settingsService.getSettings();
    const activeBrandId = brands.find(b => b.isDefault)?.id;
    if (!activeBrandId) return { activeBrandId: null, colors: [] as BrandColor[], confirmDelete: settings.confirmDelete, settings };
    const colors = await c.colorService.getByBrandId(activeBrandId);
    return { activeBrandId, colors, confirmDelete: settings.confirmDelete, settings };
  });

  const [showModal, setShowModal] = useState(false);
  const [editColor, setEditColor] = useState<BrandColor | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (loading) return <div className="page"><EmptyState title="Loading colors..." icon="palette" description="" /></div>;
  if (error || !data) return <div className="page"><EmptyState title="Error" icon="info" description={error?.message || "Failed"} /></div>;

  const { activeBrandId, colors: allColors, confirmDelete } = data;
  const colors = searchQuery
    ? allColors.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.hex.toLowerCase().includes(searchQuery.toLowerCase()))
    : allColors;

  const executeDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await applicationContainer.colorService.delete(id);
      triggerGlobalReload();
      onShowNotice("Color deleted.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDelete) {
      setConfirmDeleteId(id);
    } else {
      executeDelete(id);
    }
  };

  const handleOpenModal = (color?: BrandColor) => {
    setEditColor(color);
    setShowModal(true);
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)', fontWeight: 600 }}>Brand Colors</h2>
        {colors.length > 0 && (
          <Button variant="primary" onClick={() => handleOpenModal()} disabled={!activeBrandId}>
            Add Color
          </Button>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {!activeBrandId ? (
          <EmptyState title="No Active Brand" description="Please set an active brand in the Brands view first." icon="palette" />
        ) : colors.length === 0 ? (
          <EmptyState 
            title="No Colors" 
            description="No colors have been added to this brand yet." 
            icon="palette" 
            action={<Button variant="primary" onClick={() => handleOpenModal()}>Add Color</Button>}
          />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: data?.settings?.compactMode ? '8px' : '12px' }}>
            {colors.map(c => {
              let w = '220px';
              if (typeof data?.settings?.gridSize === 'number') {
                w = `${Math.max(210, data.settings.gridSize)}px`;
              } else if (data?.settings?.gridSize === 'small') w = '210px';
              else if (data?.settings?.gridSize === 'large') w = '280px';
              
              return (
              <div 
                className="color-card"
                key={c.id} 
                style={{ 
                  marginRight: 0, 
                  marginBottom: 0, 
                  padding: data?.settings?.compactMode ? '8px' : '12px',
                  minWidth: w,
                  width: w,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: (c as any).value || c.hex, marginRight: '12px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><HighlightText text={c.name} highlight={searchQuery} /></div>
                    <div 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        copyToClipboard((c as any).value || c.hex); 
                        onShowNotice("Color copied to clipboard!"); 
                      }} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                      }}
                      title="Click to copy"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}><HighlightText text={(c as any).value || c.hex} highlight={searchQuery} /></span> <Icon name="copy" size={12} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <div onClick={(e) => { e.stopPropagation(); handleOpenModal(c); }} className="color-card-action" title="Edit" style={{ padding: '6px', cursor: 'pointer', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '4px' }}>
                    <Icon name="pencil" size={14} />
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="color-card-action" title="Delete" style={{ padding: '6px', cursor: 'pointer', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '4px' }}>
                    <Icon name="x" size={14} />
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {showModal && activeBrandId && (
        <EditColorModal 
          brandId={activeBrandId}
          color={editColor}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Color"
          message="Are you sure you want to delete this color?"
          confirmText="Delete"
          danger={true}
          onConfirm={() => executeDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
