const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('WelcomePage')) {
  code = code.replace(
    'import { FeatureRequestModal } from "../components/FeatureRequestModal";',
    'import { FeatureRequestModal } from "../components/FeatureRequestModal";\nimport { WelcomePage } from "../pages/WelcomePage";\nimport { libraryManager } from "../filesystem/LibraryManager";'
  );
}

if (!code.includes('hasLibrary')) {
  code = code.replace(
    '  const [showFeatureRequest, setShowFeatureRequest] = useState(false);',
    '  const [showFeatureRequest, setShowFeatureRequest] = useState(false);\n  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());'
  );
}

const returnStatement = `  return (
    <div className={\`brand-base-app \${collapsed ? "brand-base-app--compact" : ""}\`} data-theme={settings?.theme === 'system' ? undefined : settings?.theme} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)' }}>`;

const newReturnStatement = `  if (!hasLibrary) {
    return (
      <div data-theme={settings?.theme === 'system' ? undefined : settings?.theme}>
        <WelcomePage 
          onInitialized={() => {
            setHasLibrary(true);
            triggerGlobalReload();
          }} 
          onShowNotice={setNotice} 
        />
        {notice ? <Toast message={notice} onDismiss={() => setNotice(null)} /> : null}
      </div>
    );
  }

  return (
    <div className={\`brand-base-app \${collapsed ? "brand-base-app--compact" : ""}\`} data-theme={settings?.theme === 'system' ? undefined : settings?.theme} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)' }}>`;

if (!code.includes('if (!hasLibrary) {')) {
  code = code.replace(returnStatement, newReturnStatement);
  // Also need to import triggerGlobalReload if it's not there
  if (!code.includes('triggerGlobalReload')) {
    code = code.replace(
      'import { useApplicationData } from "../hooks/useApplicationData";',
      'import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";'
    );
  }
}

fs.writeFileSync(file, code);
console.log("Success");
