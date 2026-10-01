const fs = require('fs');
const file = 'src/js/main/index-react.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('ErrorBoundary')) {
  code = code.replace(
    'import { App } from "./main";',
    'import { App } from "./main";\nimport { ErrorBoundary } from "./components/ErrorBoundary";'
  );
  code = code.replace(
    '<App />',
    '<ErrorBoundary>\n        <App />\n      </ErrorBoundary>'
  );
  fs.writeFileSync(file, code);
  console.log("Success");
}
