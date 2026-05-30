import { Icon } from '../lib/icons';

const TITLES = {
  dashboard: 'Dashboard',
  detail: 'All patients',
  add: 'Add patient',
  'design-edit': 'Study design',
  'patient-detail': 'Patient',
};

export function Topbar({ screen, overdueCount, study, onToggleSidebar }) {
  return (
    <header className="topbar">
      <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Open menu">
        <Icon name="menu" size={16}/>
      </button>
      <h1>{TITLES[screen]}</h1>
      <span className="crumbs">/ {study?.shortName || study?.name || ''}</span>
      <div className="topbar-actions"/>
    </header>
  );
}
