const http = require('http');
const WebSocket = require('/Users/amarshafanm/Desktop/node_modules/ws');

http.get('http://localhost:8870/json', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const targets = JSON.parse(data);
    const page = targets.find(t => t.type === 'page' && t.url.includes('index.html'));
    if (!page) { console.error('No extension page found.'); process.exit(1); }
    
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: 'window.location.reload(true)' } }));
    });
    ws.on('message', () => { console.log('Reloaded via dynamic URL.'); process.exit(0); });
    ws.on('error', (e) => { console.error(e.message); process.exit(1); });
  });
}).on('error', (e) => {
  console.error(e.message); process.exit(1);
});
