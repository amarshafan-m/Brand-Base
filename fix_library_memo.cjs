const fs = require('fs');
const file = 'src/js/main/pages/LibraryPage.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('useMemo(() => {')) {
  // Add useMemo to imports if missing
  if (!code.includes('useMemo')) {
    code = code.replace('import { useState, useEffect, useRef }', 'import { useState, useEffect, useRef, useMemo }');
  }
  
  const oldCode = `  const filteredAssets = assets?.filter(a => {
    if (a.type === 'mogrt' || a.type === 'template') return false; // Force hide legacy mogrts and templates
    
    if (page === "favorites" && !a.favorite) return false;
    // We could implement "recent" by sorting and limiting, but for now just show all if recent
    if (page !== "favorites" && page !== "recent" && selectedCategories !== "all" && !selectedCategories.includes(a.type)) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.name.toLowerCase().includes(q)) return false;
    }
    
    if (selectedTags.length > 0) {
      if (!a.tags || !selectedTags.every(t => a.tags?.includes(t))) return false;
    }
    
    return true;
  }) || [];
  
  if (page === "recent") {
    filteredAssets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    filteredAssets.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "date_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "size_desc") return (b.size || 0) - (a.size || 0);
      return 0;
    });
  }

  const allTags = Array.from(new Set((assets || []).flatMap(a => a.tags || []))).sort();`;

  const newCode = `  const filteredAssets = useMemo(() => {
    const list = assets?.filter(a => {
      if (a.type === 'mogrt' || a.type === 'template') return false;
      if (page === "favorites" && !a.favorite) return false;
      if (page !== "favorites" && page !== "recent" && selectedCategories !== "all" && !selectedCategories.includes(a.type)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.name.toLowerCase().includes(q)) return false;
      }
      if (selectedTags.length > 0) {
        if (!a.tags || !selectedTags.every(t => a.tags?.includes(t))) return false;
      }
      return true;
    }) || [];
    
    if (page === "recent") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      list.sort((a, b) => {
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "name_desc") return b.name.localeCompare(a.name);
        if (sortBy === "date_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "date_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "size_desc") return (b.size || 0) - (a.size || 0);
        return 0;
      });
    }
    return list;
  }, [assets, page, selectedCategories, searchQuery, selectedTags, sortBy]);

  const allTags = useMemo(() => Array.from(new Set((assets || []).flatMap(a => a.tags || []))).sort(), [assets]);`;
  
  code = code.replace(oldCode, newCode);
  fs.writeFileSync(file, code);
  console.log("Success");
}
