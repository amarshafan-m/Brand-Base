const fs = require('fs');
const file = 'src/js/main/components/EditColorModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const old1 = '<div \n              onClick={() => setShowPicker(true)}';
const new1 = '<div role="button" tabIndex={0} aria-label="Open color picker"\n              onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") setShowPicker(true); }}\n              onClick={() => setShowPicker(true)}';

code = code.replace(old1, new1);
fs.writeFileSync(file, code);
console.log("Success");
