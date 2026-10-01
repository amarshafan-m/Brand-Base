const fs = require('fs');
const file = 'src/js/main/pages/HomePage.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldAddAsset = '<div role="button" tabIndex={0} onClick={() => importFiles()} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") importFiles(); }}><span><Icon name="plus" size={16} /> Add Asset</span><small>Build your library</small></div>';
const newAddAsset = '{(data?.brands?.length || 0) > 0 && (<div role="button" tabIndex={0} onClick={() => importFiles()} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") importFiles(); }}><span><Icon name="plus" size={16} /> Add Asset</span><small>Build your library</small></div>)}';

code = code.replace(oldAddAsset, newAddAsset);

fs.writeFileSync(file, code);
console.log("Success");
