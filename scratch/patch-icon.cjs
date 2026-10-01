const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/Icon.tsx', 'utf8');

code = code.replace(
  /graphics: <><rect fill="none" x="3" y="4" width="18" height="16" rx="2" \/><path fill="none" d="m7 16 3-3 2.5 2.5L16 11l3 5" \/><circle fill="none" cx="8" cy="9" r="1.2" \/><\/>,/,
  `video: <><rect fill="none" x="2" y="2" width="20" height="20" rx="2" /><path fill="none" d="M10 8l6 4-6 4V8z" /></>,\n  graphics: <><rect fill="none" x="3" y="4" width="18" height="16" rx="2" /><path fill="none" d="m7 16 3-3 2.5 2.5L16 11l3 5" /><circle fill="none" cx="8" cy="9" r="1.2" /></>,`
);

fs.writeFileSync('src/js/main/components/Icon.tsx', code);
console.log('Patched Icon.tsx');
