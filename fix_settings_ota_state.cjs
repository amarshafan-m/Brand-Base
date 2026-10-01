const fs = require('fs');
const file = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(file, 'utf8');

const anchor = '  const updateSetting = async (key: keyof BrandBaseSettings, value: any) => {';

const stateInjection = `  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
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
  };
`;

code = code.replace(anchor, stateInjection + '\n' + anchor);

fs.writeFileSync(file, code);
console.log("Success");
