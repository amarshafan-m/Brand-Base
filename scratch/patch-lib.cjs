const fs = require('fs');
const path = 'src/js/main/pages/LibraryPage.tsx';
let code = fs.readFileSync(path, 'utf8');

const lines = code.split('\n');
const newLines = lines.map(line => {
  if (line.startsWith('export function LibraryPage')) {
    return 'export function LibraryPage({ page, onShowNotice, onNavigate, searchQuery = "" }: { page: any; onShowNotice: (msg: string) => void; onNavigate: (page: any) => void; searchQuery?: string }) {';
  }
  return line;
});

fs.writeFileSync(path, newLines.join('\n'));
