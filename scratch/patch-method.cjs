const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/TimelinePlacementModal.tsx', 'utf8');
code = code.replace(
  'await applicationContainer.premiereTimelineService.placeOnTimeline(asset, placement);',
  'await applicationContainer.premiereTimelineService.placeAssetOnTimeline(asset, placement);'
);
fs.writeFileSync('src/js/main/components/TimelinePlacementModal.tsx', code);
