const fs = require('fs');
const path = 'src/js/main/pages/BrandsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/export function BrandsPage\(\{ onShowNotice, onNavigate \}: \{ onShowNotice: \(msg: string\) => void, onNavigate: \(page: PageId\) => void \}\) \{/, 'export function BrandsPage({ onShowNotice, onNavigate, searchQuery = "" }: { onShowNotice: (msg: string) => void, onNavigate: (page: PageId) => void, searchQuery?: string }) {');

code = code.replace(/const \{ data: brands, loading, error \} = useBrandList\(\);/, 'const { data: allBrands, loading, error } = useBrandList();\n  const brands = allBrands?.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.description?.toLowerCase().includes(searchQuery.toLowerCase()));');

fs.writeFileSync(path, code);
