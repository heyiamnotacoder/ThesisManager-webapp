import { useState } from 'react';
import { Icon } from '../lib/icons';

export function Sidebar({ screen, setScreen, user, study, overdueCount, collapsed, onToggle, mobileOpen, onSignOut, onDeleteAccount, darkMode, onToggleDark }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
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

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    setDeleteInput('');
    onDeleteAccount?.();
  };

  return (
    <>
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, width: 380, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Icon name="trash" size={18} style={{ color: 'var(--red)' }}/>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Delete account</h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-subtle)', lineHeight: 1.6 }}>
              This permanently deletes your account, study, and all patient data. <strong style={{ color: 'var(--text)' }}>This cannot be undone.</strong>
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 500 }}>Type <span className="mono" style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>DELETE</span> to confirm:</p>
            <input
              className="input"
              style={{ width: '100%', marginBottom: 16 }}
              placeholder="DELETE"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}>Cancel</button>
              <button className="btn btn-danger btn-sm" disabled={deleteInput !== 'DELETE'} onClick={handleConfirmDelete}>
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
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
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {onToggleDark && (
              <button className="icon-btn" onClick={onToggleDark} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <Icon name={darkMode ? 'sun' : 'moon'} size={15}/>
              </button>
            )}
            {onDeleteAccount && (
              <button className="icon-btn" onClick={() => setShowDeleteModal(true)} title="Delete account" style={{ color: 'var(--text-subtle)' }}>
                <Icon name="trash" size={14}/>
              </button>
            )}
            {onSignOut && (
              <button className="icon-btn" onClick={onSignOut} title="Sign out">
                <Icon name="logOut" size={15}/>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
