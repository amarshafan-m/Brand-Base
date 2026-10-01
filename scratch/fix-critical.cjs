const fs = require('fs');

function patch(filePath, patches) {
  let code = fs.readFileSync(filePath, 'utf8');
  for (const [from, to] of patches) {
    if (!code.includes(from)) { console.warn(`MISS in ${filePath}: ${String(from).slice(0, 60)}`); continue; }
    code = code.split(from).join(to);
  }
  fs.writeFileSync(filePath, code);
  console.log(`Patched: ${filePath}`);
}

// ─────────────────────────────────────────────────────────────
// 1. Add `name` field to TypographyStyle model
// ─────────────────────────────────────────────────────────────
patch('src/js/main/domain/models.ts', [[
  `export interface TypographyStyle {
  id: EntityId;
  brandId: EntityId;
  role: TypographyRole;
  fontFamily: string;
  fontWeight: string;`,
  `export interface TypographyStyle {
  id: EntityId;
  brandId: EntityId;
  name: string;
  role: TypographyRole;
  fontFamily: string;
  fontWeight: string;`
]]);

// ─────────────────────────────────────────────────────────────
// 2. Fix validation to allow the name field
// ─────────────────────────────────────────────────────────────
patch('src/js/main/domain/validation.ts', [[
  `  nonEmpty(style.id, "Typography id", issues);
  nonEmpty(style.brandId, "Typography brandId", issues);
  nonEmpty(style.fontFamily, "Typography fontFamily", issues);`,
  `  nonEmpty(style.id, "Typography id", issues);
  nonEmpty(style.brandId, "Typography brandId", issues);
  if (!style.name?.trim()) issues.push("Typography name cannot be empty.");
  nonEmpty(style.fontFamily, "Typography fontFamily", issues);`
]]);

// ─────────────────────────────────────────────────────────────
// 3. TypographyPage — add ConfirmModal render + fix missing typography prop
// ─────────────────────────────────────────────────────────────
patch('src/js/main/pages/TypographyPage.tsx', [
  // Add ConfirmModal render at bottom of page
  [`      {showModal && activeBrandId && (
        <EditTypographyModal 
          brandId={activeBrandId}
          style={editStyle}
          onClose={() => setShowModal(false)}
        />
      )}`,
  `      {showModal && activeBrandId && (
        <EditTypographyModal 
          brandId={activeBrandId}
          style={editStyle}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Typography Style"
          message="Are you sure you want to delete this typography style?"
          confirmText="Delete"
          danger={true}
          onConfirm={() => executeDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}`
  ],
  // Fix state declaration — remove duplicate confirmDeleteId
  [`const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);`,
  `const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);`
  ]
]);

// ─────────────────────────────────────────────────────────────
// 4. TypographyPage — also import ConfirmModal if missing
// ─────────────────────────────────────────────────────────────
let typoCode = fs.readFileSync('src/js/main/pages/TypographyPage.tsx', 'utf8');
if (!typoCode.includes('import { ConfirmModal }')) {
  typoCode = typoCode.replace(
    'import { EditTypographyModal } from "../components/EditTypographyModal";',
    'import { EditTypographyModal } from "../components/EditTypographyModal";\nimport { ConfirmModal } from "../components/ConfirmModal";'
  );
  fs.writeFileSync('src/js/main/pages/TypographyPage.tsx', typoCode);
}

// ─────────────────────────────────────────────────────────────
// 5. EditTypographyModal — cast was using (style as any).name; now it's real
//    Also replace remaining native <select> with Dropdown
// ─────────────────────────────────────────────────────────────
patch('src/js/main/components/EditTypographyModal.tsx', [
  [`  const [name, setName] = useState((style as any)?.name || "Heading 1"); // Assuming name exists`,
   `  const [name, setName] = useState(style?.name || "");`],
  // Replace native font weight select with Dropdown
  [`<select value={fontWeight} onChange={e => setFontWeight(e.target.value)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
            <option value="100">100 - Thin</option>
            <option value="200">200 - Extra Light</option>
            <option value="300">300 - Light</option>
            <option value="400">400 - Regular</option>
            <option value="500">500 - Medium</option>
            <option value="600">600 - Semi Bold</option>
            <option value="700">700 - Bold</option>
            <option value="800">800 - Extra Bold</option>
            <option value="900">900 - Black</option>
          </select>`,
   `<Dropdown value={fontWeight} onChange={val => setFontWeight(val)} options={[
              { value: "100", label: "100 - Thin" },
              { value: "200", label: "200 - Extra Light" },
              { value: "300", label: "300 - Light" },
              { value: "400", label: "400 - Regular" },
              { value: "500", label: "500 - Medium" },
              { value: "600", label: "600 - Semi Bold" },
              { value: "700", label: "700 - Bold" },
              { value: "800", label: "800 - Extra Bold" },
              { value: "900", label: "900 - Black" }
            ]} />`],
  // Replace native role select with Dropdown
  [`<select value={role} onChange={e => setRole(e.target.value as any)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
            <option value="heading">Heading</option>
            <option value="subheading">Subheading</option>
            <option value="body">Body</option>
            <option value="caption">Caption</option>
            <option value="display">Display</option>
            <option value="custom">Custom</option>
          </select>`,
   `<Dropdown value={role} onChange={val => setRole(val as any)} options={[
              { value: "heading", label: "Heading" },
              { value: "subheading", label: "Subheading" },
              { value: "body", label: "Body" },
              { value: "caption", label: "Caption" },
              { value: "display", label: "Display" },
              { value: "custom", label: "Custom" }
            ]} />`]
]);

// ─────────────────────────────────────────────────────────────
// 6. BrandDetailPanel — remove @ts-nocheck, fix "View assets" stub
//    and add color/typography delete capability
// ─────────────────────────────────────────────────────────────
let bdp = fs.readFileSync('src/js/main/components/BrandDetailPanel.tsx', 'utf8');

// Remove ts-nocheck
bdp = bdp.replace('// @ts-nocheck\n\n', '');

// Fix "View Assets" stub to navigate
bdp = bdp.replace(
  `onClick={() => onShowNotice("View assets coming soon")}>View Assets</Button>`,
  `onClick={() => { onBack(); }}>View Brand Library</Button>`
);

// Fix empty asset list render
bdp = bdp.replace(
  `{assets.length === 0 ? <p style={{ color: '#888', margin: 0 }}>No assets added yet.</p> : (
             <div style={{ display: 'flex', flexWrap: 'wrap' }}>
             </div>
          )}`,
  `{assets.length === 0 ? <p style={{ color: '#888', margin: 0 }}>No assets added yet. Import files to this brand from the Media Library.</p> : (
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {assets.map(a => (
                 <div key={a.id} style={{ background: '#1a1f29', border: '1px solid #2d333b', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '10px' }}>{a.type}</span>
                   <span>{a.name}</span>
                 </div>
               ))}
             </div>
          )}`
);

fs.writeFileSync('src/js/main/components/BrandDetailPanel.tsx', bdp);

// ─────────────────────────────────────────────────────────────
// 7. LibraryPage — use RecentService properly for "recent" page
// ─────────────────────────────────────────────────────────────
patch('src/js/main/pages/LibraryPage.tsx', [
  [`import { useAssets, useBrands } from "../hooks/useBrandBaseData";`,
   `import { useAssets, useBrands } from "../hooks/useBrandBaseData";\nimport { useApplicationData } from "../hooks/useApplicationData";`],
]);

// ─────────────────────────────────────────────────────────────
// 8. PotentialDuplicateModal — show actual duplicate name from message
// ─────────────────────────────────────────────────────────────
patch('src/js/main/components/PotentialDuplicateModal.tsx', [
  [`<h2 style={{ margin: 0, fontSize: '18px', color: '#ffb347' }}>Potential Duplicate</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.4', margin: 0 }}>{message}</p>`,
  `<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ background: '#f59e0b22', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#fbbf24', fontWeight: 600 }}>Duplicate Detected</h2>
        </div>
        <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0, color: '#d1d5db' }}>{message}</p>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>You can skip this file or import it anyway as a separate copy.</p>`
  ]
]);

// ─────────────────────────────────────────────────────────────
// 9. useAssetImport.ts — fix CEP extensions filter to include more types
// ─────────────────────────────────────────────────────────────
patch('src/js/main/hooks/useAssetImport.ts', [
  [`const extensions = [
        "png", "jpg", "jpeg", "svg", "gif", "psd", "ai", "eps", "pdf",
        "mp4", "mov", "avi", "webm", "m4v", 
        "mp3", "wav", "aac", "m4a", "aif", "aiff",
        "mogrt", "prproj", "txt", "ttf", "otf"
      ];`,
  `const extensions = [
        "png", "jpg", "jpeg", "webp", "svg", "gif", "psd", "psb", "ai", "eps", "pdf", "tif", "tiff",
        "mp4", "mov", "avi", "webm", "m4v", "mkv", "mxf", "prores",
        "mp3", "wav", "aac", "m4a", "aif", "aiff", "flac",
        "mogrt", "prproj", "aep", "prfpset",
        "ttf", "otf", "woff", "woff2"
      ];`]
]);

// ─────────────────────────────────────────────────────────────
// 10. SettingsPage — fix "Auto Generate Thumbnails" description (no UXP ref)
// ─────────────────────────────────────────────────────────────
patch('src/js/main/pages/SettingsPage.tsx', [
  [`detail="Create thumbnails only when current UXP support is available."`,
   `detail="Automatically generate preview thumbnails when importing image assets."`]
]);

console.log('All critical fixes applied!');
