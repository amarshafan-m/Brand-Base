const fs = require('fs');
const path = 'src/js/main/filesystem/LibraryManager.ts';
let code = fs.readFileSync(path, 'utf8');

const oldLogic = `  async chooseLibrary(): Promise<boolean> {
    // In CEP we can use window.cep.fs.showOpenDialog. For now, default to Desktop.
    const defaultPath = path.join(os.homedir(), "Desktop", "Brand Base Library");
    if (!fs.existsSync(defaultPath)) {
      fs.mkdirSync(defaultPath, { recursive: true });
    }
    const folder = defaultPath;`;

const newLogic = `  async chooseLibrary(): Promise<boolean> {
    const desktopPath = path.join(os.homedir(), "Desktop");
    
    // @ts-ignore
    if (!window.cep || !window.cep.fs) throw new Error("CEP not available");
    
    // @ts-ignore
    const result = window.cep.fs.showOpenDialog(false, true, "Select a Folder for Brand Base Library", desktopPath);
    if (result.err || !result.data || result.data.length === 0) {
      return false; // User cancelled
    }
    
    let folder = result.data[0];
    
    // If the selected folder is not empty and doesn't contain a library, we might want to create a subfolder,
    // but the user chose it, so we'll just initialize there.
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync(path, code);
