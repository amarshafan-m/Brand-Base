const fs = require('fs');
const path = 'src/js/main/layouts/TopBar.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/interface TopBarProps \{/, 'interface TopBarProps {\n  searchQuery: string;\n  onSearchChange: (q: string) => void;');
code = code.replace(/export function TopBar\(\{ activePage, onNavigate, onShowNotice \}: TopBarProps\) \{/, 'export function TopBar({ activePage, onNavigate, onShowNotice, searchQuery, onSearchChange }: TopBarProps) {');

const oldSearch = `<div className="global-search" style={{ flex: '1', maxWidth: '400px', display: 'flex', alignItems: 'center', background: '#14161a', padding: '10px 16px', borderRadius: '24px', border: '1px solid #262a33', color: '#9ca3af', marginLeft: '24px' }}>
        <Icon name="search" size={15} />
        <span style={{ marginLeft: '10px', fontSize: '13px' }}>Search Brand Base...</span>
        <kbd style={{ marginLeft: 'auto', fontSize: '10px', background: '#0d0f12', padding: '3px 6px', borderRadius: '4px', border: '1px solid #374151' }}>⌘K</kbd>
      </div>`;

const newSearch = `<div className="global-search" style={{ flex: '1', maxWidth: '400px', display: 'flex', alignItems: 'center', background: '#14161a', padding: '6px 16px', borderRadius: '24px', border: '1px solid #262a33', color: '#9ca3af', marginLeft: '24px', position: 'relative' }}>
        <Icon name="search" size={15} />
        <input 
          type="text" 
          placeholder="Search Brand Base..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ 
            marginLeft: '10px', 
            fontSize: '13px', 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            color: '#e5e7eb',
            width: '100%'
          }} 
        />
        {!searchQuery && <kbd style={{ position: 'absolute', right: '12px', fontSize: '10px', background: '#0d0f12', padding: '3px 6px', borderRadius: '4px', border: '1px solid #374151', pointerEvents: 'none' }}>⌘K</kbd>}
        {searchQuery && <div onClick={() => onSearchChange('')} style={{ cursor: 'pointer', display: 'flex', position: 'absolute', right: '12px' }}><Icon name="x" size={14} /></div>}
      </div>`;

code = code.replace(oldSearch, newSearch);

// Also let's add a global hotkey handler for Cmd+K to focus search!
code = code.replace(/export function TopBar.*\{/, `import { useEffect, useRef } from "react";\n\n$&`);

const hookInjection = `  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);`;

code = code.replace(/const \{ data: brands \} = useBrands\(\);/, `${hookInjection}\n\n  const { data: brands } = useBrands();`);
code = code.replace(/<input/, '<input ref={searchInputRef}');

fs.writeFileSync(path, code);
