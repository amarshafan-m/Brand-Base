const fs = require('fs');
const path = 'src/js/main/pages/ColorsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/export function ColorsPage\(\{ onShowNotice \}: \{ onShowNotice: \(msg: string\) => void \}\) \{/, 'export function ColorsPage({ onShowNotice, searchQuery = "" }: { onShowNotice: (msg: string) => void, searchQuery?: string }) {');

code = code.replace(/const filteredColors = activeBrandId\n    \? colors\.filter\(\(c\) => c\.brandId === activeBrandId\)\n    : colors;/, 'const filteredColors = (activeBrandId ? colors.filter(c => c.brandId === activeBrandId) : colors).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.hex.toLowerCase().includes(searchQuery.toLowerCase()));');

fs.writeFileSync(path, code);
