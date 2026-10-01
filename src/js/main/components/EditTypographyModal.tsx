import { useState } from "react";
import { Button } from "./ui";
import { Dropdown } from "./Dropdown";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import type { TypographyStyle } from "../domain/models";
import { FontPicker } from "./FontPicker";

interface Props {
  brandId: string;
  style?: TypographyStyle;
  onClose: () => void;
}

const COMMON_FONTS = [
  "Arial", "Helvetica", "Verdana", "Trebuchet MS", "Tahoma", 
  "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT",
  "Impact", "Comic Sans MS", "Arial Black", "Palatino", "Lucida Sans Unicode",
  "Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Oswald",
  "Source Sans Pro", "Slabo 27px", "Raleway", "PT Sans", "Merriweather",
  "Ubuntu", "Playfair Display", "Lora", "system-ui", "-apple-system", "BlinkMacSystemFont"
].sort();

export function EditTypographyModal({ brandId, style, onClose }: Props) {
  const [fontFamily, setFontFamily] = useState(style?.fontFamily || "Arial");
  const [fontWeight, setFontWeight] = useState(style?.fontWeight || "400");
  const [role, setRole] = useState(style?.role || "body");
  const [name, setName] = useState(style?.name || "");
  const [error, setError] = useState<string | null>(null);

  const guessTypographyName = (family: string, roleVal: string) => {
    const roleName = roleVal.charAt(0).toUpperCase() + roleVal.slice(1);
    return `${family} ${roleName}`;
  };

  const updateName = (newFamily: string, newRole: string) => {
    // Only auto-update if name is empty or matches the previously auto-generated name
    if (!name || name === guessTypographyName(fontFamily, role)) {
      setName(guessTypographyName(newFamily, newRole));
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanFontFamily = fontFamily.trim();

    if (!cleanName) {
      setError("Please provide a name for this typography style.");
      return;
    }

    if (!cleanFontFamily) {
      setError("Please type or select a font family.");
      return;
    }

    try {
      const isNew = !style;
      const data = { brandId, name: cleanName, fontFamily: cleanFontFamily, fontWeight, role: role as any };
      
      if (isNew) {
        await applicationContainer.typographyService.create(data);
      } else {
        await applicationContainer.typographyService.update({ ...style, ...data });
      }
      triggerGlobalReload();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-hover)', padding: '24px', borderRadius: '8px', width: '320px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{style ? "Edit Typography" : "Add Typography"}</h2>
        {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Style Name</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} placeholder="e.g. Primary Heading" />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Font Family</span>
          <FontPicker value={fontFamily} onChange={(val) => { updateName(val, role); setFontFamily(val); }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Font Weight</span>
          <Dropdown value={fontWeight} onChange={val => setFontWeight(val)} options={[
              { value: "100", label: "Thin" },
              { value: "200", label: "Extra Light" },
              { value: "300", label: "Light" },
              { value: "400", label: "Regular" },
              { value: "500", label: "Medium" },
              { value: "600", label: "Semi Bold" },
              { value: "700", label: "Bold" },
              { value: "800", label: "Extra Bold" },
              { value: "900", label: "Black" }
            ]} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '24px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Role</span>
          <Dropdown value={role} onChange={val => { const newRole = val as any; updateName(fontFamily, newRole); setRole(newRole); }} options={[
              { value: "heading", label: "Heading" },
              { value: "subheading", label: "Subheading" },
              { value: "body", label: "Body" },
              { value: "caption", label: "Caption" },
              { value: "display", label: "Display" },
              { value: "custom", label: "Custom" }
            ]} />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <div style={{ marginRight: '8px' }}><Button variant="secondary" onClick={onClose}>Cancel</Button></div>
          <Button variant="primary" onClick={handleSubmit}>Save</Button>
        </div>
      </form>
    </div>
  );
}
