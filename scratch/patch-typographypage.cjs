const fs = require('fs');
const path = 'src/js/main/pages/TypographyPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/export function TypographyPage\(\{ onShowNotice \}: \{ onShowNotice: \(msg: string\) => void \}\) \{/, 'export function TypographyPage({ onShowNotice, searchQuery = "" }: { onShowNotice: (msg: string) => void, searchQuery?: string }) {');

code = code.replace(/const filteredTypes = activeBrandId\n    \? typography\.filter\(\(t\) => t\.brandId === activeBrandId\)\n    : typography;/, 'const filteredTypes = (activeBrandId ? typography.filter(t => t.brandId === activeBrandId) : typography).filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.fontFamily.toLowerCase().includes(searchQuery.toLowerCase()));');

fs.writeFileSync(path, code);
