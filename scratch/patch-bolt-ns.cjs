const fs = require('fs');
let code = fs.readFileSync('src/js/lib/utils/bolt.ts', 'utf8');

code = code.replace(
  /host\["\$\{ns\}"\]/g,
  `host["\${ns.replace(/\\./g, '_')}"]`
);

fs.writeFileSync('src/js/lib/utils/bolt.ts', code);
console.log('Patched bolt.ts to use underscore namespace');

let config = fs.readFileSync('vite.es.config.ts', 'utf8');
config = config.replace(
  "      name: cepConfig.id,",
  "      name: cepConfig.id.replace(/\\./g, '_'),"
);
fs.writeFileSync('vite.es.config.ts', config);
console.log('Patched vite.es.config.ts back to underscore namespace');
