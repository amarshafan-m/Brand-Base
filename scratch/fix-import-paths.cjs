const fs = require('fs');

let useAssetImport = fs.readFileSync('src/js/main/hooks/useAssetImport.ts', 'utf8');

useAssetImport = useAssetImport.replace(
  `const files = result.data; // Array of absolute string paths`,
  `const files = result.data.map((p: string) => {
        let cleanPath = p;
        if (cleanPath.startsWith("file://")) {
          cleanPath = decodeURIComponent(cleanPath.replace("file://", ""));
        }
        return cleanPath;
      }); // Array of absolute string paths`
);

fs.writeFileSync('src/js/main/hooks/useAssetImport.ts', useAssetImport);
console.log('Patched useAssetImport.ts');
