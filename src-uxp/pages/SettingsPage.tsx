import { useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { Badge, Button, EmptyState } from "../components/ui";
import { applicationContainer } from "../app/application";
import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import type { BrandBaseSettings } from "../domain/models";

function SettingRow({ children, detail, control }: { children: string; detail: string; control: React.ReactNode }) {
  return (
    <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #262a33', flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '16px' }}>
        <strong style={{ fontSize: '14px', color: '#f3f4f6', marginBottom: '4px' }}>{children}</strong>
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{detail}</p>
      </div>
      <div>{control}</div>
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
    return { settings, defaultBrandName };
  });

  const updateSetting = async (key: keyof BrandBaseSettings, value: any) => {
    if (!data?.settings) return;
    try {
      const updated = { ...data.settings, [key]: value };
      await applicationContainer.settingsService.updateSettings(updated);
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
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#f3f4f6', fontWeight: 600 }}>General</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: '#14161a', border: '1px solid #262a33', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <SettingRow control={<span className="setting-value" style={{ color: '#9ca3af', fontSize: '13px' }}>{defaultBrandName}</span>} detail="The brand used by default in new views.">Default Brand</SettingRow>
            
            <SettingRow 
              control={<div tabIndex={0} onClick={() => updateSetting('confirmDelete', !settings.confirmDelete)} aria-checked={settings.confirmDelete} className="toggle" role="switch"><span /></div>} 
              detail="Ask before removing records in a future library.">
              Confirm Before Delete
            </SettingRow>
            
            <SettingRow 
              control={<div tabIndex={0} onClick={() => updateSetting('autoGenerateThumbnails', !settings.autoGenerateThumbnails)} aria-checked={settings.autoGenerateThumbnails} className="toggle" role="switch"><span /></div>} 
              detail="Create thumbnails only when current UXP support is available.">
              Auto Generate Thumbnails
            </SettingRow>
          </div>
        </div>

        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#f3f4f6', fontWeight: 600 }}>Appearance</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: '#14161a', border: '1px solid #262a33', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <SettingRow 
              control={
                <select value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value)} style={{ padding: '4px 8px', background: '#232323', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              } 
              detail="Brand Base follows Premiere's professional dark visual language.">
              Theme
            </SettingRow>
            
            <SettingRow 
              control={<div tabIndex={0} onClick={() => updateSetting('compactMode', !settings.compactMode)} aria-checked={settings.compactMode} className="toggle" role="switch"><span /></div>} 
              detail="Reduce spacing in asset views when enabled.">
              Compact Mode
            </SettingRow>
            
            <SettingRow 
              control={
                <select value={settings.gridSize} onChange={(e) => updateSetting('gridSize', e.target.value)} style={{ padding: '4px 8px', background: '#232323', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              } 
              detail="Default size for future asset grids.">
              Grid Size
            </SettingRow>
          </div>
        </div>

        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#f3f4f6', fontWeight: 600 }}>Library</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: '#14161a', border: '1px solid #262a33', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <SettingRow control={<span className="setting-value" style={{ color: '#9ca3af', fontSize: '13px', wordBreak: 'break-all' }}>{libraryPathDisplay}</span>} detail="A local folder selected explicitly by you.">Library Location</SettingRow>
            <div style={{ display: 'flex', padding: '16px' }}>
              <div style={{ marginRight: '8px' }}><Button icon="folder" onClick={() => onShowNotice("Select from Home screen.")} variant="secondary">Choose Folder</Button></div>
              <Button icon="arrowUpRight" onClick={() => onShowNotice("Opening folder...")} variant="secondary">Open Folder</Button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
