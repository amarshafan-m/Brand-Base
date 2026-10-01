const fs = require('fs');
const path = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// We need to import libraryManager and reinitializeApplication
if (!code.includes('libraryManager')) {
  code = code.replace(
    'import { applicationContainer } from "../app/application";',
    'import { applicationContainer, reinitializeApplication } from "../app/application";\nimport { libraryManager } from "../filesystem/LibraryManager";'
  );
}

const oldButton = `<Button icon="folder" onClick={() => onShowNotice("Select from Home screen.")} variant="secondary">Choose Folder</Button>`;

const newButton = `<Button icon="folder" onClick={async () => {
                try {
                  const success = await libraryManager.chooseLibrary();
                  if (success) {
                    onShowNotice("Library location updated successfully.");
                    await reinitializeApplication();
                    triggerGlobalReload();
                  }
                } catch (e: any) {
                  onShowNotice("Failed to choose library: " + String(e));
                }
              }} variant="secondary">Choose Folder</Button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync(path, code);
