const fs = require('fs');
const file = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('checkForUpdates')) {
  // Add state variables
  const importsRegex = /const \[exporting, setExporting\] = useState\(false\);/;
  if (code.match(importsRegex)) {
    code = code.replace(
      importsRegex,
      `const [exporting, setExporting] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);`
    );
  }

  // Add the check function
  const checkFunc = `  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateMsg("Checking for updates...");
    try {
      const info = await applicationContainer.updaterService.checkForUpdates();
      if (info.hasUpdate && info.downloadUrl) {
        setUpdateMsg(\`Update v\${info.latestVersion} found. Downloading...\`);
        await applicationContainer.updaterService.installUpdate(info.downloadUrl, (msg) => setUpdateMsg(msg));
      } else {
        setUpdateMsg(info.hasUpdate ? "Update found, but no update.zip attached to release." : "You are on the latest version.");
        setTimeout(() => setUpdateMsg(null), 3000);
      }
    } catch (e: any) {
      setUpdateMsg("Update failed: " + e.message);
      setTimeout(() => setUpdateMsg(null), 4000);
    } finally {
      setCheckingUpdate(false);
    }
  };`;

  code = code.replace(
    /const handleSetDefault = async \(brandId: string\) => \{/,
    `${checkFunc}\n\n  const handleSetDefault = async (brandId: string) => {`
  );

  // Inject UI
  const uiSection = `      <div className="settings-section">
        <h2 className="settings-section__title">Updates</h2>
        <SettingRow detail="Check for and install updates over the air." control={<Button variant="secondary" onClick={handleCheckUpdate} disabled={checkingUpdate}>{updateMsg || "Check for Updates"}</Button>}>Auto Update</SettingRow>
      </div>`;

  code = code.replace(
    /<\/div>\s*<div className="settings-section">\s*<h2 className="settings-section__title">About<\/h2>/,
    `</div>\n${uiSection}\n      <div className="settings-section">\n        <h2 className="settings-section__title">About</h2>`
  );

  fs.writeFileSync(file, code);
  console.log("Success");
}
