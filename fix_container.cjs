const fs = require('fs');
const file = 'src/js/main/services/container.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('UpdaterService')) {
  code = code.replace(
    'import { SettingsService } from "./SettingsService";',
    'import { SettingsService } from "./SettingsService";\nimport { UpdaterService } from "./UpdaterService";'
  );
  
  code = code.replace(
    'settingsService: SettingsService;',
    'settingsService: SettingsService;\n  updaterService: UpdaterService;'
  );
  
  code = code.replace(
    'const settingsService = new SettingsService(settingsRepo);',
    'const settingsService = new SettingsService(settingsRepo);\n  const updaterService = new UpdaterService();'
  );
  
  code = code.replace(
    'settingsService,',
    'settingsService,\n    updaterService,'
  );
  
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Already added");
}
