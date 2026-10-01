const fs = require('fs');
const path = 'src/js/main/pages/BrandsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'import { EditBrandModal } from "../components/EditBrandModal";',
  'import { EditBrandModal } from "../components/EditBrandModal";\nimport { ConfirmModal } from "../components/ConfirmModal";'
);

code = code.replace(
  'const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);',
  'const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);\n  const [archiveBrandId, setArchiveBrandId] = useState<string | null>(null);'
);

const oldArchive = `  const handleArchive = async (brandId: string) => {
    if (!confirm("Are you sure you want to archive this brand? It will be removed from the active lists.")) return;
    try {
      await applicationContainer.brandService.delete(brandId);
      triggerGlobalReload();
      onShowNotice("Brand archived.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };`;

const newArchive = `  const executeArchive = async (brandId: string) => {
    setArchiveBrandId(null);
    try {
      await applicationContainer.brandService.delete(brandId);
      triggerGlobalReload();
      onShowNotice("Brand archived.");
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleArchive = (brandId: string) => {
    setArchiveBrandId(brandId);
  };`;

code = code.replace(oldArchive, newArchive);

const oldModals = `      {showCreateModal && (
        <CreateBrandModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={(name) => {
            setShowCreateModal(false);
            onShowNotice(\`Brand "\${name}" created.\`);
          }}
        />
      )}
      {editBrand && (
        <EditBrandModal 
          brand={editBrand}
          onClose={() => setEditBrand(null)}
          onSuccess={(name) => {
            setEditBrand(null);
            onShowNotice(\`Brand "\${name}" updated.\`);
          }}
        />
      )}`;

const newModals = `      {showCreateModal && (
        <CreateBrandModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={(name) => {
            setShowCreateModal(false);
            onShowNotice(\`Brand "\${name}" created.\`);
          }}
        />
      )}
      {editBrand && (
        <EditBrandModal 
          brand={editBrand}
          onClose={() => setEditBrand(null)}
          onSuccess={(name) => {
            setEditBrand(null);
            onShowNotice(\`Brand "\${name}" updated.\`);
          }}
        />
      )}
      {archiveBrandId && (
        <ConfirmModal
          title="Archive Brand"
          message="Are you sure you want to archive this brand? It will be removed from the active lists."
          confirmText="Archive"
          danger={true}
          onConfirm={() => executeArchive(archiveBrandId)}
          onCancel={() => setArchiveBrandId(null)}
        />
      )}`;

code = code.replace(oldModals, newModals);
fs.writeFileSync(path, code);
