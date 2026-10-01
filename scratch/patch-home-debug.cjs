const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/HomePage.tsx', 'utf8');

const target = "return (";
const replacement = `
  const testJSX = () => {
    const csi = new (require('../../lib/cep/csinterface').default)();
    csi.evalScript('try { JSON.stringify(typeof host === "undefined" ? "nohost" : typeof host["com_brandbase_premiere_cep"]) } catch(e){ "error: " + e }', (res) => {
      alert("Host type: " + res);
    });
  };
  return (
    <button onClick={testJSX} style={{padding: '10px', background: 'red', color: 'white', zIndex: 9999, position: 'relative'}}>TEST JSX</button>
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/js/main/pages/HomePage.tsx', code);
console.log('Patched HomePage for debug');
