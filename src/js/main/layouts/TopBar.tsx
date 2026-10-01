import { Icon } from "../components/Icon";
import { Dropdown } from "../components/Dropdown";
import type { PageId } from "../types/navigation";
import { useBrands } from "../hooks/useBrandBaseData";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onShowNotice: (msg: string) => void;
  onShowFeatureRequest: () => void;
}

import { useEffect, useRef } from "react";

export function TopBar({ activePage, onNavigate, onShowNotice, searchQuery, onSearchChange, onShowFeatureRequest }: TopBarProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: brands } = useBrands();
  const activeBrand = brands?.find(b => b.isDefault);

  const handleBrandChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrandId = e.target.value;
    if (!newBrandId) return;
    try {
      await applicationContainer.brandService.setDefault(newBrandId);
      triggerGlobalReload();
      onShowNotice("Active brand changed.");
    } catch (err: any) {
      onShowNotice(err.message);
    }
  };

  return (
    <header className="topbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', minHeight: '64px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 1, minWidth: '140px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginRight: '8px', display: window.innerWidth < 600 ? 'none' : 'inline' }}>Active Brand:</span>
        <Dropdown 
          value={activeBrand?.id || ""} 
          onChange={(newBrandId) => {
            if (!newBrandId) return;
            applicationContainer.brandService.setDefault(newBrandId)
              .then(() => {
                triggerGlobalReload();
                onShowNotice("Active brand changed.");
              })
              .catch((err) => onShowNotice(err.message));
          }}
          options={brands ? brands.map(b => ({ value: b.id, label: b.name })) : []}
          placeholder="No Brands"
        />
      </div>

      <div className="global-search" style={{ flex: '1', minWidth: '120px', maxWidth: '400px', display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '24px', border: '1px solid var(--border)', color: 'var(--text-muted)', position: 'relative' }}>
        <Icon name="search" size={15} />
        <input ref={searchInputRef} 
          type="text" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => {
            const v = e.target.value;
            onSearchChange(v);
            if (v && (activePage === "home" || activePage === "settings")) {
              onNavigate("assets");
            }
          }}
          style={{ 
            marginLeft: '8px', 
            fontSize: '13px', 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            color: 'var(--text-main)',
            width: '100%'
          }} 
        />
        {searchQuery && <div role="button" tabIndex={0} aria-label="Clear search" onClick={() => onSearchChange('')} onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onSearchChange(''); }} style={{ cursor: 'pointer', display: 'flex', position: 'absolute', right: '12px' }}><Icon name="x" size={14} /></div>}
      </div>

      <div style={{ flexShrink: 0 }}>
        <button 
          aria-label="Request Feature"
          title="Request Feature"
          onClick={onShowFeatureRequest}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          <Icon name="lightbulb" size={16} />
        </button>
      </div>

    </header>
  );
}
