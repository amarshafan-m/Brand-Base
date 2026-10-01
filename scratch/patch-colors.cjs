const fs = require('fs');
const path = 'src/js/main/pages/ColorsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'import { EditColorModal } from "../components/EditColorModal";',
  'import { EditColorModal } from "../components/EditColorModal";\nimport { ConfirmModal } from "../components/ConfirmModal";'
);

code = code.replace(
  'const [editColor, setEditColor] = useState<BrandColor | undefined>(undefined);',
  'const [editColor, setEditColor] = useState<BrandColor | undefined>(undefined);\n  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);'
);

const newDeleteLogic = `  const executeDelete = async (id: string) => {
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
    setConfirmDeleteId(id);
  };`;

const oldDeleteLogic = `  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) return;
    try {
      await applicationContainer.colorService.delete(id);
      triggerGlobalReload();
      onShowNotice("Color deleted.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };`;

code = code.replace(oldDeleteLogic, newDeleteLogic);

const newModal = `      {showModal && activeBrandId && (
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
      )}`;

code = code.replace(`      {showModal && activeBrandId && (
        <EditColorModal 
          brandId={activeBrandId}
          color={editColor}
          onClose={() => setShowModal(false)}
        />
      )}`, newModal);

fs.writeFileSync(path, code);
