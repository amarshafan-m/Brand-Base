import { useState } from "react";
import { applicationContainer } from "../app/application";
import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import { Button, EmptyState } from "../components/ui";
import { EditTypographyModal } from "../components/EditTypographyModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { Icon } from "../components/Icon";
import { HighlightText } from "../components/HighlightText";
import type { TypographyStyle } from "../domain/models";

export function TypographyPage({ onShowNotice, searchQuery = "" }: { onShowNotice: (msg: string) => void, searchQuery?: string }) {
  const { data, loading, error } = useApplicationData(async (c) => {
    const brands = await c.brandService.getAll();
    const settings = await c.settingsService.getSettings();
    const activeBrandId = brands.find(b => b.isDefault)?.id;
    if (!activeBrandId) return { activeBrandId: null, typography: [] as TypographyStyle[], confirmDelete: settings.confirmDelete, settings };
    const typography = await c.typographyService.getByBrandId(activeBrandId);
    return { activeBrandId, typography, confirmDelete: settings.confirmDelete, settings };
  });

  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editStyle, setEditStyle] = useState<TypographyStyle | undefined>(undefined);

  if (loading) return <div className="page"><EmptyState title="Loading typography..." icon="type" description="" /></div>;
  if (error || !data) return <div className="page"><EmptyState title="Error" icon="info" description={error?.message || "Failed"} /></div>;

  const { activeBrandId, typography: allTypography, confirmDelete } = data;
  const typography = searchQuery
    ? allTypography.filter((t: any) => (t.name || t.fontFamily || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : allTypography;

  const executeDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await applicationContainer.typographyService.delete(id);
      triggerGlobalReload();
      onShowNotice("Typography style deleted.");
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

  const handleOpenModal = (style?: TypographyStyle) => {
    setEditStyle(style);
    setShowModal(true);
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)', fontWeight: 600 }}>Typography</h2>
        {typography.length > 0 && (
          <Button variant="primary" onClick={() => handleOpenModal()} disabled={!activeBrandId}>
            Add Style
          </Button>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {!activeBrandId ? (
          <EmptyState title="No Active Brand" description="Please set an active brand in the Brands view first." icon="type" />
        ) : typography.length === 0 ? (
          <EmptyState 
            title="No Typography" 
            description="No fonts have been added to this brand yet." 
            icon="type" 
            action={<Button variant="primary" onClick={() => handleOpenModal()}>Add Style</Button>}
          />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: data?.settings?.compactMode ? '8px' : '16px' }}>
            {typography.map(t => {
              let w = '240px';
              if (typeof data?.settings?.gridSize === 'number') {
                w = `${Math.max(180, data.settings.gridSize)}px`;
              } else if (data?.settings?.gridSize === 'small') w = '180px';
              else if (data?.settings?.gridSize === 'large') w = '320px';
              
              return (
              <div 
                key={t.id} 
                style={{ 
                  display: 'flex', flexDirection: 'column',
                  padding: data?.settings?.compactMode ? '8px 12px' : '16px', 
                  border: '1px solid #444', borderRadius: '6px', 
                  marginRight: 0, marginBottom: 0,
                  backgroundColor: 'var(--bg-card)', 
                  minWidth: w, width: w,
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0, paddingRight: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><HighlightText text={(t as any).name || t.role} highlight={searchQuery} /></div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: data?.settings?.compactMode ? '2px' : '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <HighlightText text={t.fontFamily} highlight={searchQuery} /> {
                        { '100': 'Thin', '200': 'Extra Light', '300': 'Light', '400': 'Regular', '500': 'Medium', '600': 'Semi Bold', '700': 'Bold', '800': 'Extra Bold', '900': 'Black' }[t.fontWeight] || t.fontWeight
                      }
                    </div>
                  </div>
                  <div style={{ fontSize: data?.settings?.compactMode ? '22px' : '28px', lineHeight: 1, color: 'var(--text-main)' }}>Aa</div>
                </div>
                <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid var(--border)', paddingTop: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <div onClick={(e) => { e.stopPropagation(); handleOpenModal(t); }} className="color-card-action" title="Edit" style={{ padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Icon name="pencil" size={14} />
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="color-card-action" title="Delete" style={{ padding: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Icon name="x" size={16} />
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {showModal && activeBrandId && (
        <EditTypographyModal 
          brandId={activeBrandId}
          style={editStyle}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Typography Style"
          message="Are you sure you want to delete this typography style?"
          confirmText="Delete"
          danger={true}
          onConfirm={() => executeDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
