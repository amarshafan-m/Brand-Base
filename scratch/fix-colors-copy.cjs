const fs = require('fs');

let page = fs.readFileSync('src/js/main/pages/ColorsPage.tsx', 'utf8');

// Replace the card rendering
const oldCard = `<div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: (c as any).value || c.hex, marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{(c as any).value || c.hex}</div>
                  </div>
                </div>
                <div onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} style={{ padding: '4px', cursor: 'pointer', color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }}>
                  &times;
                </div>`;

const newCard = `<div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: (c as any).value || c.hex, marginRight: '12px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</div>
                    <div 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigator.clipboard.writeText((c as any).value || c.hex); 
                        onShowNotice("Color copied to clipboard!"); 
                      }} 
                      style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', cursor: 'copy' }}
                      title="Click to copy"
                    >
                      {(c as any).value || c.hex} <span style={{ fontSize: '10px', marginLeft: '4px' }}>📋</span>
                    </div>
                  </div>
                </div>
                <div onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} style={{ padding: '4px', cursor: 'pointer', color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }} title="Delete">
                  &times;
                </div>`;

page = page.replace(oldCard, newCard);

// Also fix hardcoded background styles for the card itself
page = page.replace(
  `backgroundColor: '#1a1a1a'`,
  `backgroundColor: 'var(--bg-card)'`
).replace(
  `border: '1px solid #444'`,
  `border: '1px solid var(--border)'`
);

fs.writeFileSync('src/js/main/pages/ColorsPage.tsx', page);
console.log('Patched ColorsPage.tsx');
