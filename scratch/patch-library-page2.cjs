const fs = require('fs');
const path = 'src/js/main/pages/LibraryPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldFilter = `const filteredAssets = assets?.filter(a => {
    if (selectedCategory !== "all" && a.type !== selectedCategory) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];`;

const newFilter = `const filteredAssets = assets?.filter(a => {
    if (page === "favorites" && !a.favorite) return false;
    // We could implement "recent" by sorting and limiting, but for now just show all if recent
    if (page !== "favorites" && page !== "recent" && selectedCategory !== "all" && a.type !== selectedCategory) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];
  
  if (page === "recent") {
    filteredAssets.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  } else {
    filteredAssets.sort((a, b) => a.name.localeCompare(b.name));
  }
  `;

code = code.replace(oldFilter, newFilter);
fs.writeFileSync(path, code);
