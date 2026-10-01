const fs = require('fs');
const file = 'src/js/main/components/EditColorModal.tsx';
let code = fs.readFileSync(file, 'utf8');
console.log(code.match(/handleEyeDropper = async \(\) => \{[\s\S]*?\}/)[0]);
