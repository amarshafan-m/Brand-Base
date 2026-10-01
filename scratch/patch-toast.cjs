const fs = require('fs');
const path = 'src/js/main/components/Toast.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldReturn = `  return (
    <div className="toast" role="status">
      <Icon name="info" size={16} />
      <p>{message}</p>
      <button aria-label="Dismiss notification" onClick={onDismiss}><Icon name="x" size={14} /></button>
    </div>
  );`;

const newReturn = `  return (
    <div className="toast" role="status" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
      zIndex: 9999,
      animation: 'toast-slide-up 0.2s ease-out forwards',
      maxWidth: '300px'
    }}>
      <div style={{ flexShrink: 0, display: 'flex' }}><Icon name="info" size={16} /></div>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>{message}</p>
      <button aria-label="Dismiss notification" onClick={onDismiss} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.8 }}>
        <Icon name="x" size={14} />
      </button>
      <style>{
        \`@keyframes toast-slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }\`
      }</style>
    </div>
  );`;

code = code.replace(oldReturn, newReturn);
fs.writeFileSync(path, code);
