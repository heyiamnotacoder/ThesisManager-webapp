import { Icon } from '../lib/icons';

export function Sidebar({ screen, setScreen, user, study, overdueCount, collapsed, onToggle, mobileOpen, onSignOut }) {
  const items = [
    { id: 'dashboard', icon: 'home', label: 'Dashboard' },
    { id: 'detail', icon: 'users', label: 'Patients' },
    { id: 'add', icon: 'plus', label: 'Add patient' },
    { id: 'design-edit', icon: 'flask', label: 'Study design' },
  ];

  const initials = (name) => name?.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() || 'AR';

  const handleNavClick = (id) => {
    setScreen(id);
    if (mobileOpen) onToggle?.();
  };

  return (
    <>
      <div className={'sidebar-backdrop' + (mobileOpen ? ' visible' : '')} onClick={onToggle}/>
      <aside className="sidebar" data-collapsed={collapsed} data-mobile-open={mobileOpen}>
        <div className="sidebar-brand">
          <div className="brand-mark">T</div>
          <span className="brand-text">ThesisManager</span>
        </div>

        <div className="sidebar-section">
          {!collapsed && <div className="sidebar-section-label">Workspace</div>}
          {study && !collapsed && (
            <div className="study-pill">
              <div className="study-pill-label">Active study</div>
              <div className="study-pill-name">{study.shortName || study.name}</div>
            </div>
          )}
          {items.map((item) => (
            <button key={item.id} className="nav-item" data-active={screen === item.id} onClick={() => handleNavClick(item.id)} title={item.label}>
              <Icon name={item.icon} size={15}/>
              <span className="nav-label">{item.label}</span>
              {item.id === 'detail' && overdueCount > 0 && !collapsed && (
                <span className="nav-badge">{overdueCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">{initials(user?.name)}</div>
          {!collapsed && (
            <div className="user-meta">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          )}
          {onSignOut && (
            <button className="icon-btn" onClick={onSignOut} style={{ marginLeft: 'auto' }}>
              <Icon name="logOut" size={15}/>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
