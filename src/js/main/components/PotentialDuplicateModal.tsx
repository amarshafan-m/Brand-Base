import { Button } from "./ui";

interface Props {
  message: string;
  onResolve: (importAnyway: boolean) => void;
}

export function PotentialDuplicateModal({ message, onResolve }: Props) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--bg-hover)', padding: '24px', borderRadius: '8px', width: '400px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ background: '#f59e0b22', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--warning)', fontWeight: 600 }}>Duplicate Detected</h2>
        </div>
        <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0, color: 'var(--text-main)' }}>{message}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>You can skip this file or import it anyway as a separate copy.</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <Button variant="secondary" onClick={() => onResolve(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => onResolve(true)}>Import Anyway</Button>
        </div>
      </div>
    </div>
  );
}
