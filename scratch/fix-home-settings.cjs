const fs = require('fs');

// ─────────────────────────────────────────────────────────────
// 1. HomePage — add "Change Library" button when library IS loaded
// ─────────────────────────────────────────────────────────────
let home = fs.readFileSync('src/js/main/pages/HomePage.tsx', 'utf8');

home = home.replace(
  `      <section className="home-hero">
        <div>
          <Badge tone="accent">LOCAL-FIRST LIBRARY</Badge>
          <h2>Your brand assets, ready for your next edit.</h2>
          <p>Your local Brand Base library is connected and ready.</p>
        </div>
      </section>`,
  `      <section className="home-hero">
        <div>
          <Badge tone="accent">LOCAL-FIRST LIBRARY</Badge>
          <h2>Your brand assets, ready for your next edit.</h2>
          <p>Your local Brand Base library is connected and ready.</p>
        </div>
        <Button icon="folder" onClick={handleChooseLibrary} variant="secondary">Change Library</Button>
      </section>`
);

fs.writeFileSync('src/js/main/pages/HomePage.tsx', home);
console.log('Patched: HomePage — Change Library button added');

// ─────────────────────────────────────────────────────────────
// 2. SettingsPage — fix toggles: reinitialize after every settings save
//    so the new container reads from disk, not the stale in-memory repo.
//    Also force a reload with a small delay to let the container swap.
// ─────────────────────────────────────────────────────────────
let settings = fs.readFileSync('src/js/main/pages/SettingsPage.tsx', 'utf8');

// Check if reinitializeApplication is imported
if (!settings.includes('reinitializeApplication')) {
  settings = settings.replace(
    `import { triggerGlobalReload } from "../hooks/useApplicationData";`,
    `import { triggerGlobalReload } from "../hooks/useApplicationData";
import { reinitializeApplication } from "../app/application";`
  );
}

// Replace updateSetting to reinitialize the container after every change
settings = settings.replace(
  `  const updateSetting = async (key: keyof BrandBaseSettings, value: any) => {
    if (!data?.settings) return;
    try {
      const updated = { ...data.settings, [key]: value };
      await applicationContainer.settingsService.updateSettings(updated);
      triggerGlobalReload();
    } catch (e: any) {
      onShowNotice("Failed to update setting: " + e.message);
    }
  };`,
  `  const updateSetting = async (key: keyof BrandBaseSettings, value: any) => {
    if (!data?.settings) return;
    try {
      const updated = { ...data.settings, [key]: value };
      // Persist to disk first via the active container
      await applicationContainer.settingsService.updateSettings(updated);
      // If we have a library loaded, reinitialize so the new container reads
      // settings from disk rather than the stale in-memory snapshot
      if (libraryManager.isLoaded()) {
        await reinitializeApplication();
      }
      triggerGlobalReload();
    } catch (e: any) {
      onShowNotice("Failed to update setting: " + e.message);
    }
  };`
);

// Make sure libraryManager is imported
if (!settings.includes("import { libraryManager }")) {
  settings = settings.replace(
    `import { libraryManager } from "../filesystem/LibraryManager";`,
    `import { libraryManager } from "../filesystem/LibraryManager";`
  );
  // If it's not there at all, add it
  if (!settings.includes("libraryManager")) {
    settings = settings.replace(
      `import { reinitializeApplication } from "../app/application";`,
      `import { reinitializeApplication } from "../app/application";\nimport { libraryManager } from "../filesystem/LibraryManager";`
    );
  }
}

fs.writeFileSync('src/js/main/pages/SettingsPage.tsx', settings);
console.log('Patched: SettingsPage — toggles now reinitialize container on change');
