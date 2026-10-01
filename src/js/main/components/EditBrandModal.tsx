import { useState } from "react";
import { Button } from "./ui";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import type { Brand } from "../domain/models";

interface Props {
  brand: Brand;
  onClose: () => void;
  onSuccess?: (brandName: string) => void;
}

export function EditBrandModal({ brand, onClose, onSuccess }: Props) {
  const [name, setName] = useState(brand.name);
  const [description, setDescription] = useState(brand.description);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Brand name is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await applicationContainer.brandService.update({ ...brand, name, description });
      triggerGlobalReload();
      if (onSuccess) onSuccess(name);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'var(--uxp-host-background-color, #232323)',
        padding: '24px', borderRadius: '8px', width: '400px',
        border: '1px solid var(--uxp-host-border-color, var(--border))',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Edit Brand</h2>
        
        {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', marginBottom: '16px' }}>
          <span style={{ marginBottom: '4px' }}>Brand Name *</span>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Acme Corp"
            required
            autoFocus
            style={{ 
              padding: '8px', 
              backgroundColor: 'var(--uxp-host-background-color, #1a1a1a)',
              color: 'var(--uxp-host-text-color, #fff)',
              border: '1px solid var(--uxp-host-border-color, var(--border))',
              borderRadius: '4px'
            }} 
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', marginBottom: '24px' }}>
          <span style={{ marginBottom: '4px' }}>Description (Optional)</span>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="A short description"
            style={{ 
              padding: '8px', 
              backgroundColor: 'var(--uxp-host-background-color, #1a1a1a)',
              color: 'var(--uxp-host-text-color, #fff)',
              border: '1px solid var(--uxp-host-border-color, var(--border))',
              borderRadius: '4px',
              minHeight: '60px'
            }} 
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <div style={{ marginRight: '12px' }}><Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button></div>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
