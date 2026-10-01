const fs = require('fs');

// 1. Fix TimelinePlacementModal missing Dropdown import
let tpm = fs.readFileSync('src/js/main/components/TimelinePlacementModal.tsx', 'utf8');
if (!tpm.includes("import { Dropdown }")) {
  tpm = tpm.replace(
    `import { Button } from "./ui";`,
    `import { Button } from "./ui";\nimport { Dropdown } from "./Dropdown";`
  );
  fs.writeFileSync('src/js/main/components/TimelinePlacementModal.tsx', tpm);
  console.log('Fixed: TimelinePlacementModal Dropdown import');
}

// 2. Fix seed.ts — add name to typography entries
let seed = fs.readFileSync('src/js/main/services/seed.ts', 'utf8');
seed = seed.replace(
  `{ brandId: northstar.id, role: "heading", fontFamily: "Source Sans 3", fontWeight: "700", fontSize: 44, lineHeight: 1.1, letterSpacing: -0.3, color: northstarBlue.hex, usage: "Editorial headlines" }`,
  `{ brandId: northstar.id, name: "Editorial Heading", role: "heading", fontFamily: "Source Sans 3", fontWeight: "700", fontSize: 44, lineHeight: 1.1, letterSpacing: -0.3, color: northstarBlue.hex, usage: "Editorial headlines" }`
);
seed = seed.replace(
  `{ brandId: harbordesk.id, role: "body", fontFamily: "Adobe Clean", fontWeight: "400", fontSize: 16, lineHeight: 1.5, letterSpacing: 0, usage: "Internal communications" }`,
  `{ brandId: harbordesk.id, name: "Body Text", role: "body", fontFamily: "Adobe Clean", fontWeight: "400", fontSize: 16, lineHeight: 1.5, letterSpacing: 0, usage: "Internal communications" }`
);
fs.writeFileSync('src/js/main/services/seed.ts', seed);
console.log('Fixed: seed.ts typography names');
