import { useState } from "react";
import { applicationContainer } from "../app/application";
import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import { Button, EmptyState } from "../components/ui";
import { EditColorModal } from "../components/EditColorModal";
import type { BrandColor } from "../domain/models";

export function ColorsPage({ onShowNotice }: { onShowNotice: (msg: string) => void }) {
  const { data, loading, error } = useApplicationData(async (c) => {
    const brands = await c.brandService.getAll();
    const activeBrandId = brands.find(b => b.isDefault)?.id;
    if (!activeBrandId) return { activeBrandId: null, colors: [] as BrandColor[] };
    const colors = await c.colorService.getByBrandId(activeBrandId);
    return { activeBrandId, colors };
  });

  const [showModal, setShowModal] = useState(false);
  const [editColor, setEditColor] = useState<BrandColor | undefined>(undefined);

  if (loading) return <div className="page"><EmptyState title="Loading colors..." icon="palette" description="" /></div>;
  if (error || !data) return <div className="page"><EmptyState title="Error" icon="info" description={error?.message || "Failed"} /></div>;

  const { activeBrandId, colors } = data;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;
    try {
      await applicationContainer.colorService.delete(id);
      triggerGlobalReload();
      onShowNotice("Color deleted.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleOpenModal = (color?: BrandColor) => {
    setEditColor(color);
    setShowModal(true);
  };

  return (
    <div className="page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #262a33', flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#ffffff', fontWeight: 600 }}>Brand Colors</h2>
        <Button variant="primary" onClick={() => handleOpenModal()} disabled={!activeBrandId}>
          Add Color
        </Button>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {!activeBrandId ? (
          <EmptyState title="No Active Brand" description="Please set an active brand in the Brands view first." icon="palette" />
        ) : colors.length === 0 ? (
          <EmptyState title="No Colors" description="No colors have been added to this brand yet." icon="palette" />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {colors.map(c => (
              <div 
                key={c.id} 
                onClick={() => handleOpenModal(c)}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '12px', 
                  border: '1px solid #444', borderRadius: '6px', 
                  marginRight: '12px', marginBottom: '12px',
                  backgroundColor: '#1a1a1a', cursor: 'pointer', minWidth: '200px',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: c.value || c.hex, marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{c.value || c.hex}</div>
                  </div>
                </div>
                <div onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} style={{ padding: '4px', cursor: 'pointer', color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }}>
                  &times;
                </div>
              </div>
            ))}
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
    </div>
  );
}
