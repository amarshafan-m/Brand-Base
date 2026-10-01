const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/AssetDetailPanel.tsx', 'utf8');

// Ensure useEffect is in static import
code = code.replace(
  'import { useState } from "react";',
  'import { useState, useEffect } from "react";'
);

// Add useEffect properly
code = code.replace(
  "const { timelineContext } = usePremiereTimeline();",
  "const { timelineContext } = usePremiereTimeline();\n  useEffect(() => { setIsFav(asset.favorite); }, [asset.favorite]);"
);

fs.writeFileSync('src/js/main/components/AssetDetailPanel.tsx', code);
