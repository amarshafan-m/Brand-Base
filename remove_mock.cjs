const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

// The line we uncommented was: `if (active) setUpdateInfo({ hasUpdate: true, latestVersion: "1.0.1", releaseNotes: "Test Update! Added OTA.", downloadUrl: "https://github.com/amarshafan-m/Brand-Base/archive/refs/heads/main.zip" });`
code = code.replace(
  /if \(active\) setUpdateInfo\(\{ hasUpdate: true, latestVersion: "1\.0\.1", releaseNotes: "Test Update! Added OTA\.", downloadUrl: "https:\/\/github\.com\/amarshafan-m\/Brand-Base\/archive\/refs\/heads\/main\.zip" \}\);\n/,
  ''
);

fs.writeFileSync(file, code);
console.log("Success");
