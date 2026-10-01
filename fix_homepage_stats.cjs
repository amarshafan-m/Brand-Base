const fs = require('fs');
const file = 'src/js/main/pages/HomePage.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldStats = `      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">At a glance</p><h2>Library statistics</h2></div><span className="section-status">Connected</span></div>
        <div className="metrics-grid">
          <Metric icon="assets" label="Total assets" value={loading ? "…" : String(data?.totalAssets ?? 0)} />
          <Metric icon="brand" label="Total brands" value={loading ? "…" : String(data?.brands.length ?? 0)} />
          <Metric icon="star" label="Favorites" value={loading ? "…" : String(data?.favorites ?? 0)} />
          <Metric icon="package" label="Brand packages" value={loading ? "…" : String(data?.packages ?? 0)} />
        </div>
      </section>`;

const newStats = `      {(data?.brands?.length || 0) > 0 && (
        <section className="content-section">
          <div className="section-heading"><div><p className="eyebrow">At a glance</p><h2>Library statistics</h2></div><span className="section-status">Connected</span></div>
          <div className="metrics-grid">
            <Metric icon="assets" label="Total assets" value={loading ? "…" : String(data?.totalAssets ?? 0)} />
            <Metric icon="brand" label="Total brands" value={loading ? "…" : String(data?.brands.length ?? 0)} />
            <Metric icon="star" label="Favorites" value={loading ? "…" : String(data?.favorites ?? 0)} />
            <Metric icon="package" label="Brand packages" value={loading ? "…" : String(data?.packages ?? 0)} />
          </div>
        </section>
      )}`;

code = code.replace(oldStats, newStats);

fs.writeFileSync(file, code);
console.log("Success");
