const fs = require('fs');
const file = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('checkingUpdate')) {
  // Add state variables
  code = code.replace(
    'const [exporting, setExporting] = useState(false);',
    'const [exporting, setExporting] = useState(false);\n  const [checkingUpdate, setCheckingUpdate] = useState(false);\n  const [updateMsg, setUpdateMsg] = useState<string | null>(null);'
  );

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
  const uiSection = `        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>Updates</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow detail="Check for and install updates over the air from GitHub." control={<Button variant="secondary" onClick={handleCheckUpdate} disabled={checkingUpdate}>{updateMsg || "Check for Updates"}</Button>}>Auto Update</SettingRow>
          </div>
        </div>`;

  code = code.replace(
    /<div className="settings-group" style=\{\{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 \}\}>\s*<h3 style=\{\{ fontSize: '14px', marginBottom: '12px', color: 'var\(--text-main\)', fontWeight: 600 \}\}>About<\/h3>/,
    `${uiSection}\n\n        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>\n          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>About</h3>`
  );

  fs.writeFileSync(file, code);
  console.log("Success");
}
