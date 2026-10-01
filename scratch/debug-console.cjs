const WebSocket = require('ws');
const wsUrl = "ws://localhost:8870/devtools/page/3A4F5151F04BF928804F233F07DF7E39";
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  ws.send(JSON.stringify({ 
    id: 1, 
    method: 'Runtime.evaluate', 
    params: { expression: 'window.location.reload(true)' }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.id === 1) {
    console.log('Forced hard reload via debugger.');
    process.exit(0);
  }
});
