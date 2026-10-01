import { useState, useRef, useEffect } from "react";
import { Button } from "./ui";
import { Icon } from "./Icon";

interface ColorPickerProps {
  initialColor: string; // hex
  onSelect: (hex: string) => void;
  onCancel: () => void;
}

export function ColorPicker({ initialColor, onSelect, onCancel }: ColorPickerProps) {
  // Convert hex to HSV
  const hex2hsv = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s, v };
  };

  const hsv2hex = (h: number, s: number, v: number) => {
    let r = 0, g = 0, b = 0;
    const i = Math.floor((h / 360) * 6);
    const f = (h / 360) * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const [hsv, setHsv] = useState(() => hex2hsv(initialColor));
  const currentColor = hsv2hex(hsv.h, hsv.s, hsv.v);
  
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Math for dragging
  const updateSV = (e: MouseEvent | React.MouseEvent) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (isNaN(x)) return; // UXP safety
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));
    const s = x / rect.width;
    const v = 1 - (y / rect.height);
    setHsv({ ...hsv, s, v });
  };

  const updateHue = (e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    if (isNaN(x)) return; // UXP safety
    x = Math.max(0, Math.min(x, rect.width));
    const h = (x / rect.width) * 360;
    setHsv({ ...hsv, h });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSV) updateSV(e);
      if (isDraggingHue) updateHue(e);
      if (isDraggingBox) {
        setPosition({
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y
        });
      }
    };
    const onMouseUp = () => {
      setIsDraggingSV(false);
      setIsDraggingHue(false);
      setIsDraggingBox(false);
    };
    if (isDraggingSV || isDraggingHue || isDraggingBox) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingSV, isDraggingHue, isDraggingBox, hsv]);

  // Derived RGB for text boxes
  const rgbObj = (() => {
    const h = currentColor.replace('#', '');
    if (h.length !== 6) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16)
    };
  })();

  const hueColor = hsv2hex(hsv.h, 1, 1);

  return (
    <div 
      onMouseDown={(e) => { 
        setIsDraggingBox(true); 
        dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y }; 
      }}
      style={{ 
        position: 'fixed', 
        top: `calc(50% + ${position.y}px)`, 
        left: `calc(50% + ${position.x}px)`, 
        transform: 'translate(-50%, -50%)',
        padding: '16px', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: '8px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.8)', 
        width: '90%',
        maxWidth: '280px',
        boxSizing: 'border-box',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'grab'
      }}
    >
      <div 
        style={{ color: 'var(--text-main)', fontSize: '13px', marginBottom: '12px', userSelect: 'none', paddingBottom: '8px', borderBottom: '1px solid #333', pointerEvents: 'none' }}
      >
        Pick a colour
      </div>
      
      {/* Saturation / Value Area */}
      <div 
        ref={satValRef}
        onMouseDown={(e) => { e.stopPropagation(); setIsDraggingSV(true); updateSV(e); }}
        style={{ 
          width: '100%', height: '180px', position: 'relative', cursor: 'crosshair', borderRadius: '4px',
          backgroundColor: hueColor,
          backgroundImage: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0))`
        }}
      >
        <div style={{
          position: 'absolute',
          left: `${hsv.s * 100}%`,
          top: `${(1 - hsv.v) * 100}%`,
          width: '12px', height: '12px',
          border: '2px solid #fff', borderRadius: '50%',
          transform: 'translate(-6px, -6px)',
          boxShadow: '0 0 2px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Hue Slider */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', backgroundColor: currentColor, marginRight: '12px', flexShrink: 0 }} />
        <div 
          ref={hueRef}
          onMouseDown={(e) => { e.stopPropagation(); setIsDraggingHue(true); updateHue(e); }}
          style={{ 
            flex: 1, height: '12px', position: 'relative', cursor: 'ew-resize', borderRadius: '6px',
            background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
          }}
        >
          <div style={{
            position: 'absolute',
            left: `${(hsv.h / 360) * 100}%`,
            top: '50%',
            width: '16px', height: '16px',
            backgroundColor: 'transparent', border: '2px solid #fff', borderRadius: '50%',
            transform: 'translate(-8px, -8px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none'
          }} />
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', marginTop: '16px', gap: '8px' }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ flex: 1.5 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hex</div>
          <input type="text" value={currentColor.replace('#', '').toLowerCase()} readOnly style={{ width: '100%', padding: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)', boxSizing: 'border-box', pointerEvents: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Red</div>
          <input type="text" value={rgbObj.r} readOnly style={{ width: '100%', padding: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)', boxSizing: 'border-box', pointerEvents: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Green</div>
          <input type="text" value={rgbObj.g} readOnly style={{ width: '100%', padding: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)', boxSizing: 'border-box', pointerEvents: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Blue</div>
          <input type="text" value={rgbObj.b} readOnly style={{ width: '100%', padding: '6px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)', boxSizing: 'border-box', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', marginTop: '24px', gap: '8px' }} onMouseDown={e => e.stopPropagation()}>
        <Button variant="primary" onClick={() => onSelect(currentColor)}>Select</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
