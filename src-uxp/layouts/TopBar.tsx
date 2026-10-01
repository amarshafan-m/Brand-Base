import { Icon } from "../components/Icon";
import { PremiereStatus } from "../components/PremiereStatus";
import type { PageId } from "../types/navigation";
import { useBrands } from "../hooks/useBrandBaseData";
import { applicationContainer } from "../app/application";

interface TopBarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onShowNotice: (msg: string) => void;
}

export function TopBar({ activePage, onNavigate }: TopBarProps) {
  const { data: brands } = useBrands();
  const activeBrand = brands?.find(b => b.isDefault);

  const pageTitles: Record<PageId, string> = {
    home: "Home",
    assets: "Library",
    brands: "Brands",
    colors: "Brand Colors",
    typography: "Typography",
    audio: "Audio",
    graphics: "Graphics",
    mogrts: "MOGRTs",
    templates: "Templates",
    presets: "Presets",
    packages: "Brand Packages",
    favorites: "Favorites",
    recent: "Recent",
    settings: "Settings",
  };

  return (
    <header className="topbar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 24px', background: '#0d0f12', borderBottom: '1px solid #262a33', minHeight: '64px' }}>
      <div className="global-search" style={{ flex: '1', maxWidth: '600px', display: 'flex', alignItems: 'center', background: '#14161a', padding: '10px 16px', borderRadius: '24px', border: '1px solid #262a33', color: '#9ca3af' }}>
        <Icon name="search" size={15} />
        <span style={{ marginLeft: '10px', fontSize: '13px' }}>Search Brand Base...</span>
        <kbd style={{ marginLeft: 'auto', fontSize: '10px', background: '#0d0f12', padding: '3px 6px', borderRadius: '4px', border: '1px solid #374151' }}>⌘K</kbd>
      </div>
    </header>
  );
}
