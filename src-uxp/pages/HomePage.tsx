import { Icon } from "../components/Icon";
import { Badge, Button, EmptyState } from "../components/ui";
import { useHomeData } from "../hooks/useBrandBaseData";
import { libraryManager } from "../filesystem/LibraryManager";
import { reinitializeApplication } from "../app/application";
import { useState, useEffect } from "react";

interface HomePageProps {
  onNavigate: (page: "assets" | "brands" | "packages" | "settings") => void;
  onShowNotice: (notice: string) => void;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: "assets" | "brand" | "star" | "package" }) {
  return (
    <article className="metric-card">
      <div className="metric-card__icon"><Icon name={icon} size={17} /></div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </article>
  );
}

export function HomePage({ onNavigate, onShowNotice }: HomePageProps) {
  const { data, loading, reload } = useHomeData();
  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());

  useEffect(() => {
    setHasLibrary(libraryManager.isLoaded());
  }, [loading]);

  const handleChooseLibrary = async () => {
    try {
      const success = await libraryManager.chooseLibrary();
      if (success) {
        onShowNotice("Library initialized successfully.");
        await reinitializeApplication();
        setHasLibrary(true);
        reload();
      }
    } catch (e) {
      onShowNotice("Failed to choose library: " + String(e));
    }
  };

  const activeBrand = data?.activeBrand;
  const hasAssets = (data?.totalAssets ?? 0) > 0;

  if (!hasLibrary) {
    return (
      <div className="page page--home">
        <section className="home-hero">
          <div>
            <Badge tone="accent">WELCOME TO BRAND BASE</Badge>
            <h2>Create your local Brand Base library to organize your creative assets.</h2>
            <p>Set up a local Brand Base library to get started. Your files stay under your control.</p>
          </div>
          <Button icon="folder" onClick={handleChooseLibrary} variant="primary">Choose Library Location</Button>
        </section>
      </div>
    );
  }

  return (
    <div className="page page--home">
      <section className="home-hero">
        <div>
          <Badge tone="accent">LOCAL-FIRST LIBRARY</Badge>
          <h2>Your brand assets, ready for your next edit.</h2>
          <p>Your local Brand Base library is connected and ready.</p>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">Start here</p><h2>Quick actions</h2></div></div>
        <div className="quick-actions">
          <div role="button" tabIndex={0} onClick={() => onShowNotice("Add Asset is available in Phase 5.")} type="button"><span><Icon name="plus" size={16} /> Add Asset</span><small>Build your library</small></div>
          <div role="button" tabIndex={0} onClick={() => onNavigate("brands")} type="button"><span><Icon name="brand" size={16} /> Create Brand</span><small>Organize identity</small></div>
          <div role="button" tabIndex={0} onClick={() => onNavigate("packages")} type="button"><span><Icon name="package" size={16} /> Import Package</span><small>Bring in references</small></div>
          <div role="button" tabIndex={0} onClick={() => onNavigate("settings")} type="button"><span><Icon name="folder" size={16} /> Library Settings</span><small>Choose a location</small></div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">At a glance</p><h2>Library statistics</h2></div><span className="section-status">Connected</span></div>
        <div className="metrics-grid">
          <Metric icon="assets" label="Total assets" value={loading ? "…" : String(data?.totalAssets ?? 0)} />
          <Metric icon="brand" label="Total brands" value={loading ? "…" : String(data?.brands.length ?? 0)} />
          <Metric icon="star" label="Favorites" value={loading ? "…" : String(data?.favorites ?? 0)} />
          <Metric icon="package" label="Brand packages" value={loading ? "…" : String(data?.packages ?? 0)} />
        </div>
      </section>

      <div className="home-lower-grid">
        <section className="panel-card active-brand-card">
          <div className="section-heading"><div><p className="eyebrow">Context</p><h2>Active brand</h2></div><Badge>All Brands</Badge></div>
          <div className="active-brand-card__empty"><div className="brand-mark brand-mark--quiet"><span>{activeBrand ? activeBrand.name.slice(0, 1).toUpperCase() : "B"}</span></div><div><strong>{activeBrand?.name ?? "No default brand yet"}</strong><p>{activeBrand ? `${activeBrand.description || "No description"} · ${activeBrand.logoIds.length} logo reference${activeBrand.logoIds.length === 1 ? "" : "s"}` : "Create a brand to set colors, typography, and assets."}</p></div></div>
        </section>
        <section className="panel-card recent-activity">
          <div className="section-heading"><div><p className="eyebrow">History</p><h2>Recent activity</h2></div></div>
          <p className="muted-copy">{data?.recent.length ? `${data.recent.length} recent data-layer event${data.recent.length === 1 ? "" : "s"} available.` : "Activity will appear after your local library is initialized."}</p>
        </section>
      </div>

      <section className="home-empty-zone">
        <EmptyState
          action={<Button icon={hasAssets ? "assets" : "plus"} onClick={() => onShowNotice(hasAssets ? "Asset grid rendering is planned for Phase 5." : "Asset creation is planned for Phase 5.")} variant="secondary">{hasAssets ? "Browse asset data" : "Add your first asset"}</Button>}
          description={hasAssets ? "Data is connected through Brand Base services. Asset management UI arrives in Phase 5." : "Initialize a local library, then keep the files, colors, and templates your team relies on in one place."}
          icon="assets"
          title={hasAssets ? "Asset data connected" : "No assets yet"}
        />
      </section>
    </div>
  );
}
