const fs = require('fs');
const path = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('openLinkInBrowser')) {
  code = code.replace(
    'import { applicationContainer, reinitializeApplication } from "../app/application";',
    'import { applicationContainer, reinitializeApplication } from "../app/application";\nimport { openLinkInBrowser } from "../lib/utils/bolt";'
  );
}

const oldOpenButton = `<Button icon="arrowUpRight" onClick={() => onShowNotice("Opening folder...")} variant="secondary">Open Folder</Button>`;

const newOpenButton = `<Button icon="arrowUpRight" onClick={() => {
                const libPath = libraryManager.getLibraryPath();
                if (libPath) {
                  openLinkInBrowser("file://" + libPath);
                } else {
                  onShowNotice("Library not loaded.");
                }
              }} variant="secondary">Open Folder</Button>`;

code = code.replace(oldOpenButton, newOpenButton);
fs.writeFileSync(path, code);
