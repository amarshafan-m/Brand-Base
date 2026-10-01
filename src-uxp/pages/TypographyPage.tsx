import { useState } from "react";
import { applicationContainer } from "../app/application";
import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import { Button, EmptyState } from "../components/ui";
import { EditTypographyModal } from "../components/EditTypographyModal";
import type { TypographyStyle } from "../domain/models";

export function TypographyPage({ onShowNotice }: { onShowNotice: (msg: string) => void }) {
  const { data, loading, error } = useApplicationData(async (c) => {
    const brands = await c.brandService.getAll();
    const activeBrandId = brands.find(b => b.isDefault)?.id;
    if (!activeBrandId) return { activeBrandId: null, typography: [] as TypographyStyle[] };
    const typography = await c.typographyService.getByBrandId(activeBrandId);
    return { activeBrandId, typography };
  });

  const [showModal, setShowModal] = useState(false);
  const [editStyle, setEditStyle] = useState<TypographyStyle | undefined>(undefined);

  if (loading) return <div className="page"><EmptyState title="Loading typography..." icon="type" description="" /></div>;
  if (error || !data) return <div className="page"><EmptyState title="Error" icon="info" description={error?.message || "Failed"} /></div>;

  const { activeBrandId, typography } = data;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this style?")) return;
    try {
      await applicationContainer.typographyService.delete(id);
      triggerGlobalReload();
      onShowNotice("Typography style deleted.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleOpenModal = (style?: TypographyStyle) => {
    setEditStyle(style);
    setShowModal(true);
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #262a33', flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#ffffff', fontWeight: 600 }}>Typography</h2>
        <Button variant="primary" onClick={() => handleOpenModal()} disabled={!activeBrandId}>
          Add Style
        </Button>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {!activeBrandId ? (
          <EmptyState title="No Active Brand" description="Please set an active brand in the Brands view first." icon="type" />
        ) : typography.length === 0 ? (
          <EmptyState title="No Typography" description="No fonts have been added to this brand yet." icon="type" />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {typography.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleOpenModal(t)}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '16px', 
                  border: '1px solid #444', borderRadius: '6px', 
                  marginRight: '16px', marginBottom: '16px',
                  backgroundColor: '#1a1a1a', cursor: 'pointer', minWidth: '240px',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{t.name || t.role}</div>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{t.fontFamily} {t.fontWeight}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: '28px', lineHeight: 1, color: '#fff', marginRight: '16px' }}>Aa</div>
                  <div onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} style={{ padding: '4px', cursor: 'pointer', color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }}>
                    &times;
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
}
