import { useState, useRef } from "react";
import { Button } from "./ui";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import type { BrandColor, BrandColorType } from "../domain/models";
import { ColorPicker } from "./ColorPicker";

interface Props {
  brandId: string;
  color?: BrandColor;
  onClose: () => void;
}

export function EditColorModal({ brandId, color, onClose }: Props) {
  const [name, setName] = useState(color?.name || "");
  const [hex, setHex] = useState(color?.hex || "#000000");
  const [usage, setUsage] = useState<BrandColorType>(color?.usage || "primary");
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Sync color picker with text input
  const handleHexChange = (val: string) => {
    setHex(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Manual validation for UXP (HTML5 'required' doesn't always block submission)
    const cleanName = name.trim();
    const cleanHex = hex.trim();

    if (!cleanName) {
      setError("Please provide a name for this color.");
      return;
    }
    
    if (!cleanHex) {
      setError("Please pick a HEX color value.");
      return;
    }

    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(cleanHex)) {
      setError("Please enter a valid HEX code (e.g. #FF0000).");
      return;
    }

    try {
      const isNew = !color;
      if (isNew) {
        await applicationContainer.colorService.create({ brandId, name: cleanName, hex: cleanHex.toUpperCase(), usage });
      } else {
        await applicationContainer.colorService.update({ ...color, name: cleanName, hex: cleanHex.toUpperCase(), usage });
      }
      triggerGlobalReload();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {!showPicker && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#232323', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '320px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{color ? "Edit Color" : "Add Color"}</h2>
          {error && <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
            <span style={{ marginBottom: '4px' }}>Name</span>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} placeholder="e.g. Primary Blue" />
          </label>
          
          <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'flex-end', width: '100%', position: 'relative' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', flex: 1, marginRight: '8px' }}>
              <span style={{ marginBottom: '4px' }}>HEX Value</span>
              <input type="text" value={hex} onChange={e => handleHexChange(e.target.value)} required style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} placeholder="#FFFFFF" />
            </label>
            <div 
              onClick={() => setShowPicker(true)}
              style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #444', flexShrink: 0, backgroundColor: hex.length >= 4 ? hex : '#000000', cursor: 'pointer' }} 
            />
          </div>
          
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '24px', width: '100%' }}>
            <span style={{ marginBottom: '4px' }}>Usage</span>
            <select value={usage} onChange={e => setUsage(e.target.value as BrandColorType)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="accent">Accent</option>
              <option value="background">Background</option>
              <option value="text">Text</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <div style={{ marginRight: '8px' }}><Button variant="secondary" onClick={onClose} type="button">Cancel</Button></div>
            <Button variant="primary" onClick={handleSubmit} type="button">Save</Button>
          </div>
        </form>
      )}
      
      {showPicker && (
        <ColorPicker 
          initialColor={hex.length >= 4 ? hex : '#000000'} 
          onSelect={(c) => { setHex(c); setShowPicker(false); }} 
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
