const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'src/js/main/index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const debugScript = `
    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        document.body.innerHTML = '<div style="color:red; padding: 20px; font-family: sans-serif; background: white; z-index: 99999; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: auto;">' +
          '<h3>Fatal Error</h3>' +
          '<p><strong>Message:</strong> ' + message + '</p>' +
          '<p><strong>Source:</strong> ' + source + ' (' + lineno + ':' + colno + ')</p>' +
          '<pre style="white-space: pre-wrap; font-size: 11px;">' + (error && error.stack ? error.stack : 'No stack trace') + '</pre>' +
        '</div>';
      };
      window.addEventListener('unhandledrejection', function(event) {
        document.body.innerHTML = '<div style="color:red; padding: 20px; font-family: sans-serif; background: white; z-index: 99999; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: auto;">' +
          '<h3>Unhandled Promise Rejection</h3>' +
          '<p><strong>Reason:</strong> ' + (event.reason && event.reason.message ? event.reason.message : event.reason) + '</p>' +
          '<pre style="white-space: pre-wrap; font-size: 11px;">' + (event.reason && event.reason.stack ? event.reason.stack : 'No stack trace') + '</pre>' +
        '</div>';
      });
    </script>
`;

if (!html.includes('window.onerror = function(message')) {
  html = html.replace('<script type="module"', debugScript + '\n    <script type="module"');
  fs.writeFileSync(indexPath, html);
  console.log('Patched index.html with debug script');
} else {
  console.log('Already patched');
}
