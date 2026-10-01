import type { ApplicationContainer } from "../services/container";
import { activeContainer as applicationContainer } from "../services/container";
import React from "react";
import { useEffect, useState } from "react";
import { Toast } from "../components/Toast";
import { HomePage } from "../pages/HomePage";
import { LibraryPage } from "../pages/LibraryPage";
import { SettingsPage } from "../pages/SettingsPage";
import { BrandsPage } from "../pages/BrandsPage";
import { ColorsPage } from "../pages/ColorsPage";
import { TypographyPage } from "../pages/TypographyPage";
import type { PageId } from "../types/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type ContentPage = Exclude<PageId, "home" | "settings" | "brands">;

const contentPages: ContentPage[] = [
  "assets", "colors", "typography", "audio", "video", "graphics",
  "packages", "favorites", "recent",
];

const isContentPage = (page: PageId): page is ContentPage =>
  contentPages.includes(page as ContentPage);

import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";
import { FeatureRequestModal } from "../components/FeatureRequestModal";
import { WelcomePage } from "../pages/WelcomePage";
import { UpdateModal } from "../components/UpdateModal";
import type { UpdateInfo } from "../services/UpdaterService";
import { libraryManager } from "../filesystem/LibraryManager";

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("home");

  const loadSettings = React.useCallback(async (c: ApplicationContainer) => await c.settingsService.getSettings(), []);
  const { data: settings, loading: isAppLoading } = useApplicationData(loadSettings, [loadSettings]);

  useEffect(() => {
    if (!isAppLoading) setHasLibrary(libraryManager.isLoaded());
  }, [isAppLoading]);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      // Background check for updates after 3 seconds of startup
      applicationContainer.updaterService.checkForUpdates().then(info => {
        // FOR TESTING: UNCOMMENT NEXT LINE TO FORCE AN UPDATE MODAL TO APPEAR
                
        if (active && info.hasUpdate && info.downloadUrl) {
          setUpdateInfo(info);
        }
      }).catch(e => console.error("OTA Check Failed", e));
    }, 3000);
    return () => { active = false; };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(window.innerWidth < 800);
  const [notice, setNotice] = useState<string | null>(null);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);
  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 800);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (isAppLoading) return null;

  if (!hasLibrary) {
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
    <div className={`brand-base-app ${collapsed ? "brand-base-app--compact" : ""}`} data-theme={settings?.theme === 'system' ? undefined : settings?.theme} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Sidebar activePage={activePage} collapsed={collapsed} onNavigate={setActivePage} onToggle={() => setCollapsed((value) => !value)} />
      <div className="app-frame" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar activePage={activePage} onNavigate={setActivePage} onShowNotice={setNotice} searchQuery={searchQuery} onSearchChange={setSearchQuery} onShowFeatureRequest={() => setShowFeatureRequest(true)} />
        <main className="app-content" style={{ flex: 1, overflowY: 'auto' }}>
          {activePage === "home" ? <HomePage onNavigate={setActivePage} onShowNotice={setNotice} /> : null}
          {activePage === "settings" ? <SettingsPage onShowNotice={setNotice} /> : null}
          {activePage === "brands" ? <BrandsPage onNavigate={setActivePage} onShowNotice={setNotice} searchQuery={searchQuery} /> : null}
          {activePage === "colors" ? <ColorsPage onShowNotice={setNotice} searchQuery={searchQuery} /> : null}
          {activePage === "typography" ? <TypographyPage onShowNotice={setNotice} searchQuery={searchQuery} /> : null}
          {isContentPage(activePage) && activePage !== "colors" && activePage !== "typography" ? <LibraryPage onNavigate={setActivePage} onShowNotice={setNotice} page={activePage} searchQuery={searchQuery} /> : null}
        </main>
      </div>
      {notice ? <Toast message={notice} onDismiss={() => setNotice(null)} /> : null}
      {showFeatureRequest && <FeatureRequestModal onClose={() => setShowFeatureRequest(false)} onShowNotice={setNotice} />}
      {updateInfo && <UpdateModal info={updateInfo} onClose={() => setUpdateInfo(null)} />}
    </div>
  );
}
