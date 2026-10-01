const fs = require('fs');
const file = 'src/js/main/pages/HomePage.tsx';
let code = fs.readFileSync(file, 'utf8');

const old1 = 'onClick={() => importFiles()}>';
const new1 = 'onClick={() => importFiles()} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") importFiles(); }}>';
code = code.replace(old1, new1);

const old2 = 'onClick={() => onNavigate("brands")}>';
const new2 = 'onClick={() => onNavigate("brands")} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") onNavigate("brands"); }}>';
code = code.replace(old2, new2);

const old3 = 'onClick={async () => {';
const new3 = 'onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") { /* Handle below */ } }} onClick={async () => {';
code = code.replace(old3, new3);

fs.writeFileSync(file, code);
console.log("Success");
