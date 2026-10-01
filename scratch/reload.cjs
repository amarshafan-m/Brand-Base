const WebSocket = require('/Users/amarshafanm/Desktop/node_modules/ws');
const ws = new WebSocket("ws://localhost:8870/devtools/page/15D3D0AFCEE34336CB73756C1F162AED");
ws.on('open', () => {
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: 'window.location.reload(true)' } }));
});
ws.on('message', (d) => { console.log('Reloaded.'); process.exit(0); });
ws.on('error', (e) => { console.error(e.message); process.exit(1); });
setTimeout(() => process.exit(0), 3000);
