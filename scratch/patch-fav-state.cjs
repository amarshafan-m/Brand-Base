const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/AssetDetailPanel.tsx', 'utf8');

// Add local state
code = code.replace(
  "const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);",
  "const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [isFav, setIsFav] = useState(asset.favorite);"
);

// Update useEffect to sync with prop if it changes externally
if (!code.includes('useEffect(() => { setIsFav(asset.favorite); }, [asset.favorite]);')) {
  code = code.replace(
    "const { timelineContext } = usePremiereTimeline();",
    "const { timelineContext } = usePremiereTimeline();\n  import('react').then(m => m.useEffect(() => { setIsFav(asset.favorite); }, [asset.favorite]));"
  );
}

// Update toggleFavorite
code = code.replace(
  "const toggleFavorite = async () => {\n    if (asset.favorite) {\n      await applicationContainer.assetService.unfavorite(asset.id);\n    } else {\n      await applicationContainer.assetService.favorite(asset.id);\n    }\n    triggerGlobalReload();\n  };",
  "const toggleFavorite = async () => {\n    const newFav = !isFav;\n    setIsFav(newFav); // Optimistic UI update\n    try {\n      if (asset.favorite) {\n        await applicationContainer.assetService.unfavorite(asset.id);\n      } else {\n        await applicationContainer.assetService.favorite(asset.id);\n      }\n      triggerGlobalReload();\n    } catch(e) {\n      setIsFav(!newFav); // Revert on failure\n    }\n  };"
);

// Replace usages of asset.favorite with isFav in the render
code = code.replace(
  /\`detail-panel-action is-star \$\{asset\.favorite \? 'is-active' : ''\}\`/g,
  "`detail-panel-action is-star ${isFav ? 'is-active' : ''}`"
);
code = code.replace(
  /name=\{asset\.favorite \? "starFilled" : "star"\}/g,
  "name={isFav ? \"starFilled\" : \"star\"}"
);

fs.writeFileSync('src/js/main/components/AssetDetailPanel.tsx', code);
console.log('Added optimistic UI update for favorite star');
