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
      <div className="topbar-actions"/>
    </header>
  );
}
