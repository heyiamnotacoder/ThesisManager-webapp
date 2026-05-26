import { Icon } from '../lib/icons';

const TITLES = {
  dashboard: 'Dashboard',
  detail: 'All patients',
  add: 'Add patient',
  'design-edit': 'Study design',
};

export function Topbar({ screen, overdueCount, study }) {
  return (
    <header className="topbar">
      <h1>{TITLES[screen]}</h1>
      <span className="crumbs">/ {study?.shortName || study?.name || ''}</span>
      <div className="topbar-actions">
        <button className="icon-btn" title="Search"><Icon name="search" size={14}/></button>
        <button className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
          <Icon name="bell" size={14}/>
          {overdueCount > 0 && (
            <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', border: '1.5px solid var(--surface)' }}/>
          )}
        </button>
      </div>
    </header>
  );
}
