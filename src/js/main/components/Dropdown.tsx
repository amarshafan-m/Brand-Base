import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";

interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  placement?: "top" | "bottom";
}

export function Dropdown({ value, options, onChange, placeholder = "Select...", className = "", placement = "bottom" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`bb-dropdown ${className}`} ref={containerRef} style={{ position: "relative", minWidth: "160px" }}>
      <div 
        className="bb-dropdown-header" 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        tabIndex={0}
        role="button"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "6px 12px", 
          backgroundColor: "var(--bg-main)", 
          border: "1px solid var(--border)", 
          borderRadius: "6px", 
          cursor: "pointer",
          fontSize: "13px",
          color: selectedOption ? "var(--text-main)" : "var(--text-muted)"
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", display: "flex", alignItems: "center" }}>
          <Icon name="chevronDown" size={14} />
        </span>
      </div>
      
      {isOpen && (
        <div 
          className="bb-dropdown-menu"
          style={{ 
            position: "absolute", 
            top: placement === "bottom" ? "100%" : undefined, 
            bottom: placement === "top" ? "100%" : undefined,
            left: 0, 
            right: 0, 
            marginTop: placement === "bottom" ? "4px" : undefined, 
            marginBottom: placement === "top" ? "4px" : undefined,
            backgroundColor: "var(--bg-card)", 
            border: "1px solid var(--border)", 
            borderRadius: "6px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)", 
            zIndex: 100,
            maxHeight: "200px",
            overflowY: "auto",
            padding: "4px"
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>No options</div>
          ) : (
            options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                style={{ 
                  padding: "6px 8px", 
                  fontSize: "13px", 
                  color: "var(--text-main)", 
                  cursor: "pointer", 
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: value === opt.value ? "var(--bg-hover)" : "transparent"
                }}
              >
                <span>{opt.label}</span>
                
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
