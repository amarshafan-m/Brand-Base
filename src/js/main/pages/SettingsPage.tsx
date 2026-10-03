import { useCallback } from "react";
import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { Dropdown } from "../components/Dropdown";
import { Badge, Button, EmptyState } from "../components/ui";
import { applicationContainer, reinitializeApplication } from "../app/application";
// openLinkInBrowser removed — using CEP shell open
import { libraryManager } from "../filesystem/LibraryManager";
import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import type { BrandBaseSettings } from "../domain/models";

function SettingRow({ children, detail, control }: { children: React.ReactNode; detail: string; control: React.ReactNode }) {
  return (
    <div className="setting-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 120px', minWidth: '120px', maxWidth: '100%' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px', wordBreak: 'break-word', lineHeight: '1.4' }}>{children}</strong>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-word', lineHeight: '1.4' }}>{detail}</p>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', maxWidth: '100%' }}>{control}</div>
    </div>
  );
}

export function SettingsPage({ onShowNotice }: { onShowNotice: (notice: string) => void }) {
  const { data, loading, error } = useApplicationData(async (c) => {
    const settings = await c.settingsService.getSettings();
    let defaultBrandName = "Not set";
    if (settings.defaultBrandId) {
      try {
        const brand = await c.brandService.getById(settings.defaultBrandId);
        defaultBrandName = brand.name;
      } catch (e) {
        defaultBrandName = "Unknown";
      }
    }
    const allBrands = await c.brandService.getAll();
    return { settings, defaultBrandName, allBrands };
  });

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateMsg("Checking for updates...");
    try {
      const info = await applicationContainer.updaterService.checkForUpdates();
      if (info.hasUpdate && info.downloadUrl) {
        setUpdateMsg(`Update v${info.latestVersion} found. Downloading...`);
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

  const updateSetting = async (key: keyof BrandBaseSettings, value: any) => {
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
  };

  if (loading) return <div className="page page--settings"><EmptyState title="Loading settings..." icon="settings" description="" /></div>;
  if (error || !data) return <div className="page page--settings"><EmptyState title="Error" icon="info" description={error?.message || "Failed to load"} /></div>;

  const { settings, defaultBrandName } = data;

  const libraryPathDisplay = settings.libraryLocation || "Not connected";

  return (
    <div className="page page--settings" style={{ height: '100%', overflowY: 'auto', paddingRight: '16px' }}>
      <section className="settings-content" style={{ display: 'flex', flexDirection: 'column',  maxWidth: '800px' }}>
        
        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>General</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow control={
                <Dropdown 
                  value={settings.defaultBrandId || ""} 
                  onChange={(val) => updateSetting('defaultBrandId', val)} 
                  options={data.allBrands.map(b => ({ value: b.id, label: b.name }))} 
                  placeholder="Select a brand" 
                />
} detail="The brand used by default in new views.">Default Brand</SettingRow>
            
            <SettingRow 
              control={<div tabIndex={0} onClick={() => updateSetting('confirmDelete', !settings.confirmDelete)} onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); updateSetting('confirmDelete', !settings.confirmDelete); } }} aria-checked={settings.confirmDelete} className="toggle" role="switch"><span /></div>} 
              detail="Ask for confirmation before permanently removing items.">
              Confirm Before Delete
            </SettingRow>
            
            <SettingRow 
              control={<div tabIndex={0} onClick={() => updateSetting('autoGenerateThumbnails', !settings.autoGenerateThumbnails)} onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); updateSetting('autoGenerateThumbnails', !settings.autoGenerateThumbnails); } }} aria-checked={settings.autoGenerateThumbnails} className="toggle" role="switch"><span /></div>} 
              detail="Automatically generate preview thumbnails when importing image assets.">
              Auto Generate Thumbnails
            </SettingRow>
          </div>
        </div>

        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>Appearance</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow 
              control={
                <Dropdown 
                  value={data.settings.theme || "system"} 
                  onChange={(val) => updateSetting('theme', val)} 
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                    { value: "system", label: "System" }
                  ]} 
                />
              } 
              detail="Brand Base follows Premiere's professional visual language by default.">
              Theme
            </SettingRow>


            
            <SettingRow 
              control={<div tabIndex={0} onClick={() => updateSetting('compactMode', !settings.compactMode)} onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); updateSetting('compactMode', !settings.compactMode); } }} aria-checked={settings.compactMode} className="toggle" role="switch"><span /></div>} 
              detail="Reduce spacing in asset views when enabled.">
              Compact Mode
            </SettingRow>
            
          </div>
        </div>

        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>Library</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow control={<span className="setting-value" style={{ color: 'var(--text-muted)', fontSize: '13px', wordBreak: 'break-all' }}>{libraryPathDisplay}</span>} detail="A local folder selected explicitly by you.">Library Location</SettingRow>
            <div style={{ display: 'flex', padding: '16px' }}>
              <div style={{ marginRight: '8px' }}><Button icon="folder" onClick={async () => {
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
              }} variant="secondary">Choose Folder</Button></div>
              <Button icon="arrowUpRight" onClick={() => {
                const libPath = libraryManager.getLibraryPath();
                if (libPath) {
                  // Open in Finder via CEP shell
                  try {
                    // @ts-ignore
                    // Safe open
                    // Use cep util if available
                    if (window.cep) window.cep.util.openURLInDefaultBrowser("file://" + libPath);
                  } catch {
                    onShowNotice("Failed to open folder.");
                  }
                } else {
                  onShowNotice("Library not loaded.");
                }
              }} variant="secondary">Open Folder</Button>
            </div>
          </div>
        </div>


                <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>Updates</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow detail="Check for and install updates over the air from GitHub." control={<Button variant="secondary" onClick={handleCheckUpdate} disabled={checkingUpdate}>{updateMsg || "Check for Updates"}</Button>}>Auto Update</SettingRow>
          </div>
        </div>

        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)', fontWeight: 600 }}>About</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow control={<span className="setting-value" style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}>v1.0.0</span>} detail="Currently installed build.">Version</SettingRow>
            <SettingRow 
              control={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button icon="arrowUpRight" onClick={() => {
                    const url = "https://www.linkedin.com/in/amarshafan-m/";
                    try {
                      // @ts-ignore
                      // Safe open
                      if (window.cep) window.cep.util.openURLInDefaultBrowser(url);
                    } catch (e) {}
                  }} variant="secondary">LinkedIn</Button>
                  <Button icon="arrowUpRight" onClick={() => {
                    const url = "https://www.instagram.com/amarshafan.ai/";
                    try {
                      // @ts-ignore
                      // Safe open
                      if (window.cep) window.cep.util.openURLInDefaultBrowser(url);
                    } catch (e) {}
                  }} variant="secondary">Instagram</Button>
                </div>
              } 
              detail="Connect with the developer.">
              Developer: Amarshafan M
            </SettingRow>
          </div>
        </div>
      </section>
    </div>
  );
}
