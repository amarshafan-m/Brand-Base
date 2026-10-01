const fs = require('fs');
const path = 'src/js/main/components/FontPicker.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldDirs = `    const fontDirs = [
      '/System/Library/Fonts',
      '/Library/Fonts',
      // We can also check user fonts but sometimes they have permissions issues
      // path.join(process.env.HOME || '', 'Library', 'Fonts') 
    ];`;

const newDirs = `    const os = require('os');
    const fontDirs = [
      '/System/Library/Fonts',
      '/System/Library/Fonts/Supplemental',
      '/Library/Fonts',
      path.join(os.homedir(), 'Library', 'Fonts')
    ];`;

code = code.replace(oldDirs, newDirs);
fs.writeFileSync(path, code);
