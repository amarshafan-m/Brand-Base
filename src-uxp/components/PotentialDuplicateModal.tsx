import { Button } from "./ui";

interface Props {
  message: string;
  onResolve: (importAnyway: boolean) => void;
}

export function PotentialDuplicateModal({ message, onResolve }: Props) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#232323', padding: '24px', borderRadius: '8px', width: '400px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #444' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#ffb347' }}>Potential Duplicate</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.4', margin: 0 }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <Button variant="secondary" onClick={() => onResolve(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => onResolve(true)}>Import Anyway</Button>
        </div>
      </div>
    </div>
  );
}
