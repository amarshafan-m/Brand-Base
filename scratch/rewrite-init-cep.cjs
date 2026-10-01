const fs = require('fs');
const path = 'src/js/lib/utils/init-cep.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/const buildContextMenu = \(\) => \{[\s\S]*?export const initializeCEP =/m, `const buildContextMenu = () => {
  console.log("buildContextMenu");
  const menuObj = {
    menu: [
      {
        label: "Reload",
        enabled: true,
        checked: false,
        checkable: false,
        id: "c-0",
      },
      {
        label: "Force Reload",
        enabled: true,
        checked: false,
        checkable: false,
        id: "c-1",
      },
    ],
  };
  
  window.__adobe_cep__.invokeAsync("setContextMenuByJSON", JSON.stringify(menuObj), (e) => {
    if (e === "c-0") location.reload();
    if (e === "c-1") process.abort();
  });
};

export const initializeCEP =`);

fs.writeFileSync(path, code);
