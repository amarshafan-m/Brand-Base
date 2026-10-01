const fs = require('fs');
const path = 'src/js/main/pages/LibraryPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/export function LibraryPage\(\{ page, onShowNotice, onNavigate \}: \{ page: PageId; onShowNotice: \(msg: string\) => void; onNavigate: \(page: PageId\) => void \}\) \{/, 'export function LibraryPage({ page, onShowNotice, onNavigate, searchQuery = "" }: { page: PageId; onShowNotice: (msg: string) => void; onNavigate: (page: PageId) => void; searchQuery?: string }) {');

code = code.replace(/const filteredAssets = activeBrandId\n    \? assets\.filter\(\(a\) => a\.brandId === activeBrandId\)\n    : assets;/, 'const filteredAssets = (activeBrandId ? assets.filter(a => a.brandId === activeBrandId) : assets).filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));');

fs.writeFileSync(path, code);
