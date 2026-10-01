import { Icon } from "../components/Icon";
import { IconButton } from "../components/ui";
import { navigationGroups, type PageId } from "../types/navigation";

interface SidebarProps {
  activePage: PageId;
  collapsed: boolean;
  onNavigate: (page: PageId) => void;
  onToggle: () => void;
}

export function Sidebar({ activePage, collapsed, onNavigate, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`} aria-label="Brand Base navigation" style={{ display: 'flex', flexDirection: 'column', width: collapsed ? '60px' : '220px', background: '#0d0f12', borderRight: '1px solid #262a33', padding: '16px', overflowY: 'auto' }}>
      <div className="sidebar__brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div className="brand-mark" aria-hidden="true" style={{ width: '32px', height: '32px', background: '#2563eb', color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)' }}><span>B</span></div>
        {!collapsed ? <div className="brand-lockup" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><strong style={{ color: '#f3f4f6', fontSize: '14px', letterSpacing: '-0.02em' }}>BRAND BASE</strong><span style={{ fontSize: '10px', color: '#9ca3af' }}>Local creative library</span></div> : null}
      </div>

      <nav className="sidebar__nav" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {navigationGroups.map((group) => (
          <section className="nav-group" key={group.label} aria-label={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!collapsed ? <p className="nav-group__label" style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, margin: '0 0 4px 8px' }}>{group.label}</p> : null}
            <div className="nav-group__items" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => (
                <div
                  className={`nav-item ${activePage === item.id ? "is-active" : ""}`}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  role="button"
                  tabIndex={0}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '8px 12px', 
                    background: activePage === item.id ? '#2563eb' : 'transparent', 
                    color: activePage === item.id ? '#ffffff' : '#9ca3af', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    boxShadow: activePage === item.id ? '0 2px 10px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  <Icon name={item.icon} size={16} />
                  {!collapsed ? <span className="nav-item__label">{item.label}</span> : null}
                  {!collapsed && item.shortcut ? <kbd style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.6 }}>{item.shortcut}</kbd> : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="sidebar__footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #262a33', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          role="button"
          tabIndex={0}
          className={`nav-item ${activePage === "settings" ? "is-active" : ""}`}
          onClick={() => onNavigate("settings")}
          title={collapsed ? "Settings" : undefined}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '8px 12px', 
            background: activePage === "settings" ? '#2563eb' : 'transparent', 
            color: activePage === "settings" ? '#ffffff' : '#9ca3af', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            textAlign: 'left', 
            fontWeight: 500,
            transition: 'all 0.2s',
            boxShadow: activePage === "settings" ? '0 2px 10px rgba(37, 99, 235, 0.2)' : 'none'
          }}
        >
          <Icon name="settings" size={16} />
          {!collapsed ? <span className="nav-item__label">Settings</span> : null}
        </div>
        {!collapsed ? <p className="sidebar__version" style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', margin: 0, marginTop: '4px' }}>BRAND BASE · v0.0.1</p> : null}
      </div>
    </aside>
  );
}
