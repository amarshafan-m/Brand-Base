const { execSync } = require('child_process');
execSync(`osascript -e 'tell application "Adobe Premiere Pro 2025" to invoke "testMogrt.jsx"'`, {stdio: 'inherit'});
