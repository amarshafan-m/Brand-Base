const fs = require('fs');
const path = 'src/js/main/components/BrandDetailPanel.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'import { EditTypographyModal } from "./EditTypographyModal";',
  'import { EditTypographyModal } from "./EditTypographyModal";\nimport { ConfirmModal } from "./ConfirmModal";'
);

code = code.replace(
  'const [showTypographyModal, setShowTypographyModal] = useState(false);',
  'const [showTypographyModal, setShowTypographyModal] = useState(false);\n  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);'
);

const oldArchive = `  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this brand?")) return;
    try {
      await applicationContainer.brandService.delete(brand.id);
      triggerGlobalReload();
      onShowNotice("Brand archived.");
      onBack();
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };`;

const newArchive = `  const executeArchive = async () => {
    setShowArchiveConfirm(false);
    try {
      await applicationContainer.brandService.delete(brand.id);
      triggerGlobalReload();
      onShowNotice("Brand archived.");
      onBack();
    } catch (e: any) {
      onShowNotice(e.message);
    }
  };

  const handleArchive = () => {
    setShowArchiveConfirm(true);
  };`;

code = code.replace(oldArchive, newArchive);

const oldModalSection = `      {showTypographyModal && (
        <EditTypographyModal 
          brandId={brand.id}
          onClose={() => setShowTypographyModal(false)}
        />
      )}`;

const newModalSection = `      {showTypographyModal && (
        <EditTypographyModal 
          brandId={brand.id}
          onClose={() => setShowTypographyModal(false)}
        />
      )}
      
      {showArchiveConfirm && (
        <ConfirmModal
          title="Archive Brand"
          message="Are you sure you want to archive this brand?"
          confirmText="Archive"
          danger={true}
          onConfirm={executeArchive}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}`;

code = code.replace(oldModalSection, newModalSection);
fs.writeFileSync(path, code);
