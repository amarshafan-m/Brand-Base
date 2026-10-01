const fs = require('fs');
const path = 'src/js/main/components/AssetDetailPanel.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('ConfirmModal')) {
  code = code.replace(
    'import { TimelinePlacementModal } from "./TimelinePlacementModal";',
    'import { TimelinePlacementModal } from "./TimelinePlacementModal";\nimport { ConfirmModal } from "./ConfirmModal";\nimport { openLinkInBrowser } from "../../lib/utils/bolt";'
  );
}

code = code.replace(
  'const [importing, setImporting] = useState(false);',
  'const [importing, setImporting] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);'
);

const newDeleteLogic = `  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await applicationContainer.assetService.delete(asset.id);
      triggerGlobalReload();
      onClose();
    } catch (e: any) {
      alert(e.message);
    }
  };`;

if (!code.includes('handleDelete')) {
  code = code.replace(
    'const handleImportToPremiere = async () => {',
    newDeleteLogic + '\n\n  const handleImportToPremiere = async () => {'
  );
}

const oldLocation = `<div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>Location:</span> <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.filePath.replace('uxp-token:', '')}</span></div>`;

const newLocation = `<div style={{ display: 'flex' }}><span style={{ color: '#9ca3af', width: '100px' }}>Location:</span> <span onClick={() => openLinkInBrowser("file://" + asset.filePath)} style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={asset.filePath}>{asset.filePath.split('/').pop()}</span></div>`;

code = code.replace(oldLocation, newLocation);

const oldActions = `<Button variant="secondary" onClick={() => setShowPlacement(true)} disabled={!timelineContext?.sequenceAvailable || !isImportSupported}>
            Place on Timeline
          </Button>`;

const newActions = `<Button variant="secondary" onClick={() => setShowPlacement(true)} disabled={!timelineContext?.sequenceAvailable || !isImportSupported}>
            Place on Timeline
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete Asset
          </Button>`;

if (!code.includes('Delete Asset')) {
  code = code.replace(oldActions, newActions);
}

const oldModalSection = `{showPlacement && <TimelinePlacementModal asset={asset} onClose={() => setShowPlacement(false)} />}`;

const newModalSection = `{showPlacement && <TimelinePlacementModal asset={asset} onClose={() => setShowPlacement(false)} />}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Asset"
          message="Are you sure you want to delete this asset? The physical file will be removed from your library."
          confirmText="Delete"
          danger={true}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}`;

if (!code.includes('showDeleteConfirm &&')) {
  code = code.replace(oldModalSection, newModalSection);
}

fs.writeFileSync(path, code);
