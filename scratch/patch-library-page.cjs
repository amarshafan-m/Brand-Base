const fs = require('fs');
const path = 'src/js/main/pages/LibraryPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldFilter = `const filteredAssets = assets?.filter(a => selectedCategory === "all" || a.type === selectedCategory) || [];`;

const newFilter = `const filteredAssets = assets?.filter(a => {
    if (selectedCategory !== "all" && a.type !== selectedCategory) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];`;

code = code.replace(oldFilter, newFilter);
fs.writeFileSync(path, code);
