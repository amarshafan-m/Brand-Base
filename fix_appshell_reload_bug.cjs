const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

// Get `loading` from useApplicationData
code = code.replace(
  'const { data: settings } = useApplicationData(loadSettings, [loadSettings]);',
  'const { data: settings, loading: isAppLoading } = useApplicationData(loadSettings, [loadSettings]);\n\n  useEffect(() => {\n    if (!isAppLoading) setHasLibrary(libraryManager.isLoaded());\n  }, [isAppLoading]);'
);

// Prevent rendering WelcomePage before we know if the library exists
code = code.replace(
  '  if (!hasLibrary) {',
  '  if (isAppLoading) return null;\n\n  if (!hasLibrary) {'
);

fs.writeFileSync(file, code);
console.log("Success");
