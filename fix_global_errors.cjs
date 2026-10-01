const fs = require('fs');
const file = 'src/js/main/index-react.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('window.addEventListener("unhandledrejection"')) {
  code = code.replace(
    'console.clear();',
    `console.clear();

// Global Error Catching for cross-platform stability
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
window.addEventListener("error", (event) => {
  console.error("Uncaught exception:", event.error);
});`
  );
  fs.writeFileSync(file, code);
  console.log("Success");
}
