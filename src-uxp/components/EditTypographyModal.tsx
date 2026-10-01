import { useState } from "react";
import { Button } from "./ui";
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
  const [name, setName] = useState(style?.name || "Heading 1"); // Assuming name exists
  const [error, setError] = useState<string | null>(null);

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
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#232323', padding: '24px', borderRadius: '8px', width: '320px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{style ? "Edit Typography" : "Add Typography"}</h2>
        {error && <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Style Name</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} placeholder="e.g. Primary Heading" />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Font Family</span>
          <FontPicker value={fontFamily} onChange={setFontFamily} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Font Weight</span>
          <select value={fontWeight} onChange={e => setFontWeight(e.target.value)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
            <option value="100">100 - Thin</option>
            <option value="200">200 - Extra Light</option>
            <option value="300">300 - Light</option>
            <option value="400">400 - Regular</option>
            <option value="500">500 - Medium</option>
            <option value="600">600 - Semi Bold</option>
            <option value="700">700 - Bold</option>
            <option value="800">800 - Extra Bold</option>
            <option value="900">900 - Black</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '24px', width: '100%' }}>
          <span style={{ marginBottom: '4px' }}>Role</span>
          <select value={role} onChange={e => setRole(e.target.value as any)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
            <option value="heading">Heading</option>
            <option value="subheading">Subheading</option>
            <option value="body">Body</option>
            <option value="caption">Caption</option>
            <option value="display">Display</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <div style={{ marginRight: '8px' }}><Button variant="secondary" onClick={onClose} type="button">Cancel</Button></div>
          <Button variant="primary" onClick={handleSubmit} type="button">Save</Button>
        </div>
      </form>
    </div>
  );
}
