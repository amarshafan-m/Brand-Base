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
  "assets", "colors", "typography", "audio", "graphics", "mogrts",
  "templates", "presets", "packages", "favorites", "recent",
];

const isContentPage = (page: PageId): page is ContentPage =>
  contentPages.includes(page as ContentPage);

export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  return (
    <div className={`brand-base-app ${collapsed ? "brand-base-app--compact" : ""}`} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Sidebar activePage={activePage} collapsed={collapsed} onNavigate={setActivePage} onToggle={() => setCollapsed((value) => !value)} />
      <div className="app-frame" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar activePage={activePage} onNavigate={setActivePage} onShowNotice={setNotice} />
        <main className="app-content" style={{ flex: 1, overflowY: 'auto' }}>
          {activePage === "home" ? <HomePage onNavigate={setActivePage} onShowNotice={setNotice} /> : null}
          {activePage === "settings" ? <SettingsPage onShowNotice={setNotice} /> : null}
          {activePage === "brands" ? <BrandsPage onNavigate={setActivePage} onShowNotice={setNotice} /> : null}
          {activePage === "colors" ? <ColorsPage onShowNotice={setNotice} /> : null}
          {activePage === "typography" ? <TypographyPage onShowNotice={setNotice} /> : null}
          {isContentPage(activePage) && activePage !== "colors" && activePage !== "typography" ? <LibraryPage onNavigate={setActivePage} onShowNotice={setNotice} page={activePage} /> : null}
        </main>
      </div>
      {notice ? <Toast message={notice} onDismiss={() => setNotice(null)} /> : null}
    </div>
  );
}
