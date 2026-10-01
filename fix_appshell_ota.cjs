const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('UpdateModal')) {
  // Import
  code = code.replace(
    'import { WelcomePage } from "../pages/WelcomePage";',
    'import { WelcomePage } from "../pages/WelcomePage";\nimport { UpdateModal } from "../components/UpdateModal";\nimport type { UpdateInfo } from "../services/UpdaterService";'
  );

  // State
  code = code.replace(
    '  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());',
    '  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());\n  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);'
  );

  // Effect to check
  const checkEffect = `
  useEffect(() => {
    let active = true;
    setTimeout(() => {
      // Background check for updates after 3 seconds of startup
      applicationContainer.updaterService.checkForUpdates().then(info => {
        // FOR TESTING: UNCOMMENT NEXT LINE TO FORCE AN UPDATE MODAL TO APPEAR
        // if (active) setUpdateInfo({ hasUpdate: true, latestVersion: "1.0.1", releaseNotes: "Test Update! Added OTA.", downloadUrl: "https://github.com/amarshafan-m/Brand-Base/archive/refs/heads/main.zip" });
        
        if (active && info.hasUpdate && info.downloadUrl) {
          setUpdateInfo(info);
        }
      }).catch(e => console.error("OTA Check Failed", e));
    }, 3000);
    return () => { active = false; };
  }, []);
`;
  
  code = code.replace(
    '  useEffect(() => {\n    if (!isAppLoading) setHasLibrary(libraryManager.isLoaded());\n  }, [isAppLoading]);',
    `  useEffect(() => {\n    if (!isAppLoading) setHasLibrary(libraryManager.isLoaded());\n  }, [isAppLoading]);\n${checkEffect}`
  );

  // Render Modal
  code = code.replace(
    '{showFeatureRequest && <FeatureRequestModal onClose={() => setShowFeatureRequest(false)} onShowNotice={setNotice} />}',
    '{showFeatureRequest && <FeatureRequestModal onClose={() => setShowFeatureRequest(false)} onShowNotice={setNotice} />}\n      {updateInfo && <UpdateModal info={updateInfo} onClose={() => setUpdateInfo(null)} />}'
  );

  fs.writeFileSync(file, code);
  console.log("Success");
}
