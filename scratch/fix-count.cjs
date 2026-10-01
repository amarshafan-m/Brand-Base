const fs = require('fs');
let code = fs.readFileSync('src/js/main/hooks/useBrandBaseData.ts', 'utf8');

code = code.replace(
  /case "presets": return activeBrandId \? \(await container\.assetService\.search\(\{ type: "preset", brandId: activeBrandId \}\)\)\.length : 0;/g,
  `case "presets": return activeBrandId ? (await container.assetService.search({ type: "preset", brandId: activeBrandId })).length : 0;
      case "video": return activeBrandId ? (await container.assetService.search({ type: "video" as any, brandId: activeBrandId })).length : 0;
      default: return 0;`
);

fs.writeFileSync('src/js/main/hooks/useBrandBaseData.ts', code);
