const fs = require('fs');
const path = 'src/js/main/components/FontPicker.tsx';

let code = `import { useState, useRef, useEffect } from "react";
// @ts-ignore
const fs = require('fs');
// @ts-ignore
const path = require('path');
// @ts-ignore
const os = require('os');

function getFontFamily(filePath: string) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    
    const tag = buffer.toString('utf8', 0, 4);
    if (tag === 'ttcf') {
        fs.closeSync(fd);
        return null;
    }
    
    const numTables = buffer.readUInt16BE(4);
    const tableRecords = Buffer.alloc(numTables * 16);
    fs.readSync(fd, tableRecords, 0, numTables * 16, 12);
    
    let nameOffset = 0;
    for (let i = 0; i < numTables; i++) {
      const p = i * 16;
      if (tableRecords.toString('utf8', p, p + 4) === 'name') {
        nameOffset = tableRecords.readUInt32BE(p + 8);
        break;
      }
    }
    
    if (!nameOffset) {
        fs.closeSync(fd);
        return null;
    }
    
    const nameHeader = Buffer.alloc(6);
    fs.readSync(fd, nameHeader, 0, 6, nameOffset);
    const count = nameHeader.readUInt16BE(2);
    const stringOffset = nameHeader.readUInt16BE(4) + nameOffset;
    
    const nameRecords = Buffer.alloc(count * 12);
    fs.readSync(fd, nameRecords, 0, count * 12, nameOffset + 6);
    
    let familyName: string | null = null;
    
    for (let i = 0; i < count; i++) {
      const p = i * 12;
      const platformID = nameRecords.readUInt16BE(p);
      const nameID = nameRecords.readUInt16BE(p + 6);
      const length = nameRecords.readUInt16BE(p + 8);
      const offset = nameRecords.readUInt16BE(p + 10);
      
      if (nameID === 1) {
        const strBuf = Buffer.alloc(length);
        fs.readSync(fd, strBuf, 0, length, stringOffset + offset);
        
        if (platformID === 3 || platformID === 0) { 
          familyName = strBuf.swap16().toString('utf16le');
        } else if (platformID === 1) { 
          familyName = strBuf.toString('binary');
        }
        
        if (platformID === 3 || platformID === 0) break;
      }
    }
    
    fs.closeSync(fd);
    return familyName ? familyName.replace(/\\0/g, '') : null;
  } catch(e) {
    return null;
  }
}

function walkSync(dir: string, filelist: string[] = []) {
  if (!fs.existsSync(dir)) return filelist;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const dirFile = path.join(dir, file);
      try {
        if (fs.statSync(dirFile).isDirectory()) {
          walkSync(dirFile, filelist);
        } else {
          if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf') || file.toLowerCase().endsWith('.ttc')) {
            filelist.push(dirFile);
          }
        }
      } catch(e) {}
    }
  } catch(e) {}
  return filelist;
}

// Global cache so it only runs once per plugin session
// @ts-ignore
window.__BB_FONTS_CACHE__ = window.__BB_FONTS_CACHE__ || null;

async function getSystemFontsAsync(): Promise<string[]> {
  // @ts-ignore
  if (window.__BB_FONTS_CACHE__) return window.__BB_FONTS_CACHE__;

  return new Promise((resolve) => {
    // Run in a slight timeout to yield to React render
    setTimeout(() => {
      try {
        const fontSet = new Set<string>();
        
        // 1. Fast flat scan of standard directories
        const fontDirs = [
          '/System/Library/Fonts',
          '/System/Library/Fonts/Supplemental',
          '/Library/Fonts',
          path.join(os.homedir(), 'Library', 'Fonts'),
          path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CoreSync', 'plugins', 'livetype', '.r')
        ];
        
        fontDirs.forEach(dir => {
          if (fs.existsSync(dir)) {
            try {
              const files = fs.readdirSync(dir);
              files.forEach((file: string) => {
                if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf') || file.toLowerCase().endsWith('.ttc')) {
                  const fullPath = path.join(dir, file);
                  let name = getFontFamily(fullPath);
                  if (!name) name = file.replace(/\\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
                  fontSet.add(name);
                }
              });
            } catch(e) {}
          }
        });

        // 2. Recursive scan of Premiere Pro internal fonts and CEP Extensions (where Inter is usually hidden)
        let deepScanDirs: string[] = [];
        
        // Find Premiere App Root dynamically
        try {
          if (process.execPath && process.execPath.includes('Adobe Premiere Pro')) {
            const match = process.execPath.match(/.*Adobe Premiere Pro \\d+\\.app/);
            if (match) deepScanDirs.push(match[0]);
          }
        } catch(e) {}

        deepScanDirs.push('/Library/Application Support/Adobe/CEP/extensions');
        deepScanDirs.push(path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CEP', 'extensions'));

        deepScanDirs.forEach(dir => {
          const files = walkSync(dir);
          files.forEach(fullPath => {
             let name = getFontFamily(fullPath);
             if (!name) name = path.basename(fullPath).replace(/\\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
             fontSet.add(name);
          });
        });
        
        const finalFonts = Array.from(fontSet).sort();
        // @ts-ignore
        window.__BB_FONTS_CACHE__ = finalFonts;
        resolve(finalFonts);
      } catch (e) {
        console.error("Failed to read system fonts", e);
        resolve(["Arial", "Helvetica", "Times New Roman"]);
      }
    }, 100);
  });
}

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function FontPicker({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load fonts as soon as component mounts
    let isMounted = true;
    setIsLoading(true);
    getSystemFontsAsync().then(fonts => {
      if (isMounted) {
        setSystemFonts(fonts);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const filteredFonts = systemFonts.filter(f => f.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={isOpen ? search : value}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
        }}
        onMouseDown={() => { setIsOpen(true); setSearch(""); }}
        placeholder={isLoading ? "Loading fonts..." : "Search all system & Premiere fonts..."}
        style={{
          padding: '8px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #444',
          color: '#fff',
          borderRadius: '4px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #444',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {isLoading ? (
             <div style={{ padding: '8px 12px', color: '#888', fontSize: '13px' }}>
                Scanning fonts recursively...
             </div>
          ) : filteredFonts.length > 0 ? (
            filteredFonts.map(font => (
              <div
                key={font}
                onMouseDown={() => {
                  onChange(font);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: font,
                  borderBottom: '1px solid #2a2a2a'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {font}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', color: '#888', fontSize: '13px' }}>
              Press Save to use "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path, code);
