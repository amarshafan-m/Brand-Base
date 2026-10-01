import type { HTMLAttributes, PropsWithChildren } from "react";
import { Icon } from "./Icon";
import type { IconName } from "../types/navigation";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

interface ButtonProps extends HTMLAttributes<HTMLDivElement> {
  icon?: IconName;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export function Button({
  children,
  className = "",
  icon,
  variant = "secondary",
  disabled = false,
  onClick,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <div 
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`bb-button bb-button--${variant} ${className}`} 
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      aria-disabled={disabled}
      {...props}
    >
      {icon ? <span style={{ display: "flex", marginRight: "8px" }}><Icon name={icon} size={15} /></span> : null}
      <span>{children}</span>
    </div>
  );
}

interface IconButtonProps extends HTMLAttributes<HTMLDivElement> {
  icon: IconName;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

export function IconButton({
  active = false,
  className = "",
  icon,
  label,
  disabled = false,
  onClick,
  ...props
}: IconButtonProps) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      className={`bb-icon-button ${active ? "is-active" : ""} ${className}`}
      title={label}
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      aria-disabled={disabled}
      {...props}
    >
      <Icon name={icon} size={16} />
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: "neutral" | "accent" | "success" }>) {
  return <span className={`bb-badge bb-badge--${tone}`}>{children}</span>;
}

export function EmptyState({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: IconName;
  title: string;
}) {
  return (
    <section className="empty-state">
      <div className="empty-state__icon"><Icon name={icon} size={23} /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  );
}
