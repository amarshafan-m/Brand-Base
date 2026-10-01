const fs = require('fs');
const file = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('useCallback')) {
    code = code.replace('import { useState } from "react";', 'import { useState, useCallback } from "react";');
    if (!code.includes('import { useState, useCallback }')) {
        code = 'import { useCallback } from "react";\n' + code;
    }
}

const oldLoader = `  const { data, loading, error } = useApplicationData(async (c) => {
    const settings = await c.settingsService.getSettings();
    let defaultBrandName = "Not set";
    if (settings.defaultBrandId) {
      try {
        const brand = await c.brandService.getById(settings.defaultBrandId);
        if (brand) defaultBrandName = brand.name;
      } catch {}
    }
    return { settings, defaultBrandName };
  }, []);`;

const newLoader = `  const loadSettingsData = useCallback(async (c: any) => {
    const settings = await c.settingsService.getSettings();
    let defaultBrandName = "Not set";
    if (settings.defaultBrandId) {
      try {
        const brand = await c.brandService.getById(settings.defaultBrandId);
        if (brand) defaultBrandName = brand.name;
      } catch {}
    }
    return { settings, defaultBrandName };
  }, []);
  const { data, loading, error } = useApplicationData(loadSettingsData, [loadSettingsData]);`;

code = code.replace(oldLoader, newLoader);

fs.writeFileSync(file, code);
console.log("Success");
