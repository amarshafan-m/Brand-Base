const fs = require('fs');
const file = 'src/js/main/pages/HomePage.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldWelcomeBlock = `  if (!hasLibrary) {
    return (
      <div className="page page--home">
        <section className="home-hero">
          <div>
            <Badge tone="accent">WELCOME TO BRAND BASE</Badge>
            <h2>Create your local Brand Base library to organize your creative assets.</h2>
            <p>Set up a local Brand Base library to get started. Your files stay under your control.</p>
          </div>
          <Button icon="folder" onClick={handleChooseLibrary} variant="primary">Choose Library Location</Button>
        </section>
      </div>
    );
  }`;

if (code.includes(oldWelcomeBlock)) {
  code = code.replace(oldWelcomeBlock, '');
}

// Clean up unused library setup code
code = code.replace(/const \[hasLibrary, setHasLibrary\] = useState\(libraryManager\.isLoaded\(\)\);/, '');
code = code.replace(/useEffect\(\(\) => \{\n    setHasLibrary\(libraryManager\.isLoaded\(\)\);\n  \}, \[loading\]\);/, '');

const handleChooseLibrary = `  const handleChooseLibrary = async () => {
    try {
      const success = await libraryManager.chooseLibrary();
      if (success) {
        onShowNotice("Library initialized successfully.");
        await reinitializeApplication();
        setHasLibrary(true);
        reload();
      }
    } catch (e) {
      onShowNotice("Failed to choose library: " + String(e));
    }
  };`;

if (code.includes(handleChooseLibrary)) {
  code = code.replace(handleChooseLibrary, '');
}

fs.writeFileSync(file, code);
console.log("Success");
