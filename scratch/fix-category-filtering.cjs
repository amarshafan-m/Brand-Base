const fs = require('fs');

let libPage = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

// Change getCategoryFromPage to return an array of AssetType
libPage = libPage.replace(
  `  const getCategoryFromPage = (p: string): AssetType | "all" => {
    if (p === "assets") return "all";
    if (p === "audio") return "audio";
    if (p === "graphics") return "graphic";
    if (p === "mogrts") return "mogrt";
    if (p === "templates") return "template";
    if (p === "presets") return "preset";
    if (p === "packages") return "package" as any;
    return "all";
  };

  const selectedCategory = getCategoryFromPage(page);`,
  `  const getCategoryFromPage = (p: string): AssetType[] | "all" => {
    if (p === "assets") return "all";
    if (p === "audio") return ["audio", "music", "sfx"];
    if (p === "graphics") return ["graphic", "image", "logo"];
    if (p === "mogrts") return ["mogrt"];
    if (p === "templates") return ["template"];
    if (p === "presets") return ["preset"];
    if (p === "packages") return ["package" as any];
    return "all";
  };

  const selectedCategories = getCategoryFromPage(page);`
);

// Update filtering logic to use selectedCategories array
libPage = libPage.replace(
  `    // We could implement "recent" by sorting and limiting, but for now just show all if recent
    if (page !== "favorites" && page !== "recent" && selectedCategory !== "all" && a.type !== selectedCategory) return false;`,
  `    // We could implement "recent" by sorting and limiting, but for now just show all if recent
    if (page !== "favorites" && page !== "recent" && selectedCategories !== "all" && !selectedCategories.includes(a.type)) return false;`
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', libPage);
console.log('Patched LibraryPage.tsx to support multiple types per category tab');
