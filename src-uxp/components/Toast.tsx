import { Icon } from "./Icon";

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="toast" role="status">
      <Icon name="info" size={16} />
      <p>{message}</p>
      <button aria-label="Dismiss notification" onClick={onDismiss} type="button"><Icon name="x" size={14} /></button>
    </div>
  );
}
