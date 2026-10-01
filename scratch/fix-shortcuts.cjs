const fs = require('fs');

let appShell = fs.readFileSync('src/js/main/layouts/AppShell.tsx', 'utf8');

if (!appShell.includes('e.key === "1"')) {
  appShell = appShell.replace(
    `export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("home");`,
    `export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("home");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+1 / Ctrl+1 to navigate to Assets
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActivePage("assets");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);`
  );
  fs.writeFileSync('src/js/main/layouts/AppShell.tsx', appShell);
  console.log('Patched: AppShell.tsx (added Cmd+1 shortcut)');
}
