import { Button } from "./ui";

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({ title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, danger = true }: Props) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px', width: '360px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', fontWeight: 600 }}>{title}</h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
