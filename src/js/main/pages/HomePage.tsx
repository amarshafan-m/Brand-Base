import { Icon } from "../components/Icon";
import { Badge, Button } from "../components/ui";
import { useHomeData } from "../hooks/useBrandBaseData";
import { libraryManager } from "../filesystem/LibraryManager";
import { reinitializeApplication } from "../app/application";
import { activeContainer as applicationContainer } from "../services/container";
import { useState, useEffect } from "react";
import { useAssetImport } from "../hooks/useAssetImport";
import { CreateBrandModal } from "../components/CreateBrandModal";
import { triggerGlobalReload } from "../hooks/useApplicationData";

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
  
  const [showCreateBrand, setShowCreateBrand] = useState(false);

  



  const { importFiles: _importFiles } = useAssetImport(data?.activeBrand?.id);
  const importFiles = async () => { try { await _importFiles(); } catch(e: any) { onShowNotice(e.message); } };



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
          {(data?.brands?.length || 0) > 0 && (<div role="button" tabIndex={0} onClick={() => importFiles()} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") importFiles(); }}><span><Icon name="plus" size={16} /> Add Asset</span><small>Build your library</small></div>)}
          <div role="button" tabIndex={0} onClick={() => setShowCreateBrand(true)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") setShowCreateBrand(true); }}><span><Icon name="brand" size={16} /> Create Brand</span><small>Organize identity</small></div>
          <div role="button" tabIndex={0} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") { /* Handle below */ } }} onClick={async () => {
            if (typeof window !== 'undefined' && window.cep && window.cep.fs) {
              const result = window.cep.fs.showOpenDialogEx(false, false, "Select Brand Package", "", ["*.zip"], "Brand Package", "Import");
              if (result && result.data && result.data.length > 0) {
                try {
                  onShowNotice("Importing package...");
                  const stats = await applicationContainer.brandImportService.importBrand(result.data[0]) as any;
                  onShowNotice(`Imported: ${stats.assets} assets, ${stats.colors} colors. Reloading...`);
                  setTimeout(() => {
                    triggerGlobalReload();
                  }, 500);
                } catch (e: any) {
                  onShowNotice(e.message);
                }
              }
            } else {
              onShowNotice("Importing is only supported inside Premiere Pro.");
            }
          }}><span><Icon name="package" size={16} /> Import Package</span><small>Load a brand</small></div>
        </div>
      </section>

      {(data?.brands?.length || 0) > 0 && (
        <section className="content-section">
          <div className="section-heading"><div><p className="eyebrow">At a glance</p><h2>Library statistics</h2></div><span className="section-status">Connected</span></div>
          <div className="metrics-grid">
            <Metric icon="assets" label="Total assets" value={loading ? "…" : String(data?.totalAssets ?? 0)} />
            <Metric icon="brand" label="Total brands" value={loading ? "…" : String(data?.brands.length ?? 0)} />
            <Metric icon="star" label="Favorites" value={loading ? "…" : String(data?.favorites ?? 0)} />
            <Metric icon="package" label="Brand packages" value={loading ? "…" : String(data?.packages ?? 0)} />
          </div>
        </section>
      )}
      {showCreateBrand && (
        <CreateBrandModal 
          onClose={() => setShowCreateBrand(false)}
          onSuccess={(name) => {
            setShowCreateBrand(false);
            onShowNotice(`Brand "${name}" created.`);
            reload();
          }}
        />
      )}
    </div>
  );
}
