import { useState, useMemo } from 'react';
import { Icon } from '../lib/icons';
import { ARM_COLORS, fmtDate, fmtDateShort, daysFromNow } from '../lib/helpers';

export function DashboardScreen({ study, onNavigate, onAddPatient, onDeleteStudy }) {
  const stats = useMemo(() => ({
    armCounts: study.arms.map((_, i) => study.patients.filter((p) => p.arm === i).length),
    completed: study.patients.filter((p) => p.status === 'completed').length,
    lost: study.patients.filter((p) => p.status === 'lost').length,
    active: study.patients.filter((p) => p.status === 'active').length,
  }), [study]);

  const overdue = useMemo(() =>
    study.patients.filter((p) => p.overdueDays > 0).sort((a, b) => b.overdueDays - a.overdueDays)
  , [study]);

  const upcoming = useMemo(() =>
    study.patients
      .filter((p) => p.status === 'active' && p.nextVisitDate && daysFromNow(p.nextVisitDate) >= 0 && daysFromNow(p.nextVisitDate) <= 7)
      .sort((a, b) => new Date(a.nextVisitDate) - new Date(b.nextVisitDate))
      .slice(0, 6)
  , [study]);

  const projection = useMemo(() => {
    const remaining = study.sampleSize - study.patients.length;
    const start = new Date(study.startDate);
    const today = new Date('2026-05-25');
    const days = Math.max(1, (today - start) / 86400000);
    const ratePerDay = study.patients.length / days;
    const daysToFinish = ratePerDay > 0 ? remaining / ratePerDay : Infinity;
    const projected = new Date(today);
    projected.setDate(today.getDate() + Math.round(daysToFinish));
    const target = new Date(study.endDate);
    const slipDays = Math.round((projected - target) / 86400000);
    return { projected, slipDays, ratePerDay };
  }, [study]);

  const recruitedPct = Math.round(study.patients.length / study.sampleSize * 100);

  return (
    <>
      <div className="content">
        <section className="hero">
          <div className="hero-grid">
            <RingProgress pct={recruitedPct} value={study.patients.length} armCounts={stats.armCounts} arms={study.arms}/>
            <div className="hero-content">
              <div>
                <div className="hero-eyebrow">{study.type} · {study.arms.length} arm{study.arms.length > 1 ? 's' : ''} · {study.followUp}</div>
                <h2 className="hero-title">{study.shortName || study.name}</h2>
              </div>
              <p className="hero-sub">
                {study.patients.length === 0 ? (
                  <>No patients enrolled yet. Add your first patient to start tracking recruitment.</>
                ) : (
                  <>
                    <strong>{recruitedPct}% to target.</strong>{' '}
                    {projection.ratePerDay === 0 ? (
                      <>Start enrolling patients to see your projected completion date.</>
                    ) : projection.slipDays > 7 ? (
                      <>At current pace ({projection.ratePerDay.toFixed(1)}/day), you'll hit your sample size by <strong>{fmtDate(projection.projected)}</strong> — about {projection.slipDays} days past your estimated end.</>
                    ) : projection.slipDays < -7 ? (
                      <>You're ahead of schedule — projected completion by <strong>{fmtDate(projection.projected)}</strong>, {Math.abs(projection.slipDays)} days early.</>
                    ) : (
                      <>You're on track — projected completion by <strong>{fmtDate(projection.projected)}</strong>.</>
                    )}
                    {overdue.length > 0 && <> {overdue.length} patient{overdue.length > 1 ? 's' : ''} need a call today.</>}
                  </>
                )}
              </p>
              <div className="hero-actions">
                <button className="btn btn-hero" onClick={onAddPatient}>
                  <Icon name="plus" size={14}/> Add patient
                </button>
                <button className="btn btn-hero-ghost" onClick={() => onNavigate('detail')}>
                  View all patients <Icon name="arrowRight" size={13}/>
                </button>
              </div>
              <div className="hero-metrics">
                <HeroMetric label="Screened" value={study.screened} foot={study.screened > 0 ? `${Math.round(study.patients.length / study.screened * 100)}% conversion` : 'No screens yet'}/>
                <HeroMetric label="Active" value={stats.active} foot="In follow-up"/>
                <HeroMetric label="Completed" value={stats.completed} foot={study.patients.length > 0 ? `${Math.round(stats.completed / study.patients.length * 100)}% of recruited` : '—'}/>
                <HeroMetric label="Lost / Overdue" value={`${stats.lost} / ${overdue.length}`} foot={overdue.length > 0 ? 'Call today' : 'All caught up'} alert={overdue.length > 0 || stats.lost > 0}/>
              </div>
            </div>
          </div>
        </section>

        <div className="split-2">
          <div className="row-gap-16">
            <ArmDistributionCard study={study} armCounts={stats.armCounts}/>
            <RecentActivityCard study={study}/>
          </div>
          <div className="row-gap-16">
            <NotificationsCard overdue={overdue} upcoming={upcoming} onNavigate={onNavigate}/>
            <StudyMetaCard study={study} onDeleteStudy={onDeleteStudy}/>
          </div>
        </div>
      </div>
    </>
  );
}

function HeroMetric({ label, value, foot, alert }) {
  return (
    <div className={'hero-metric' + (alert ? ' alert' : '')}>
      <div className="hero-metric-label">{label}</div>
      <div className="hero-metric-value">{value}</div>
      {foot && <div className="hero-metric-foot">{foot}</div>}
    </div>
  );
}

function RingProgress({ pct, value, armCounts, arms }) {
  const r = 86, c = 2 * Math.PI * r;
  const total = armCounts.reduce((a, b) => a + b, 0);
  const filledFrac = pct / 100;
  let cumulative = 0;
  return (
    <div className="ring-wrap">
      <svg className="ring-svg" width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none"/>
        {arms.map((arm, i) => {
          const segFrac = (armCounts[i] / Math.max(1, total)) * filledFrac;
          const dash = segFrac * c;
          const offset = c - cumulative - dash;
          cumulative += segFrac * c;
          const color = i === 0 ? '#fff' : 'rgba(255,255,255,0.6)';
          return (
            <circle key={i} cx="110" cy="110" r={r} stroke={color} strokeWidth="14" fill="none"
              strokeDasharray={`${dash} ${c}`}
              strokeDashoffset={-cumulative + dash}
              strokeLinecap={i === arms.length - 1 ? 'round' : 'butt'}/>
          );
        })}
      </svg>
      <div className="ring-center">
        <div className="ring-value">{value}</div>
        <div className="ring-sub">of {arms.reduce((a, b) => a + b.target, 0)} target · {pct}%</div>
      </div>
    </div>
  );
}

function ArmDistributionCard({ study, armCounts }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">Recruitment by arm</h3>
        <span className="card-sub">{study.patients.length} of {study.sampleSize} recruited</span>
      </div>
      <div className="card-body">
        <div className="arm-bars">
          {study.arms.map((arm, i) => {
            const n = armCounts[i];
            const pct = Math.round(n / arm.target * 100);
            return (
              <div className="arm-row" key={i}>
                <div className="arm-row-head">
                  <strong>
                    <span className="chip" style={{ marginRight: 8, background: ARM_COLORS[i], color: '#fff', border: 'none', padding: '2px 8px' }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {arm.name}
                  </strong>
                  <span><strong style={{ color: 'var(--text)' }}>{n}</strong> / {arm.target} <span className="subtle">· {pct}%</span></span>
                </div>
                <div className="arm-bar">
                  <div style={{ width: Math.min(100, pct) + '%', background: ARM_COLORS[i] }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NotificationsCard({ overdue, upcoming, onNavigate }) {
  const [tab, setTab] = useState('overdue');
  const list = tab === 'overdue' ? overdue : upcoming;

  return (
    <div className="card">
      <div className="card-head" style={{ paddingBottom: 0, borderBottom: 'none' }}>
        <Icon name="bell" size={15}/>
        <h3 className="card-title">Notifications</h3>
      </div>
      <div style={{ padding: '8px 18px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
        <TabBtn active={tab === 'overdue'} onClick={() => setTab('overdue')}>
          Overdue
          {overdue.length > 0 && <span className="nav-badge" style={{ position: 'static', margin: '0 0 0 6px' }}>{overdue.length}</span>}
        </TabBtn>
        <TabBtn active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
          Upcoming · 7d
          {upcoming.length > 0 && <span className="chip" style={{ marginLeft: 6, padding: '0 6px', fontSize: 10.5 }}>{upcoming.length}</span>}
        </TabBtn>
      </div>
      <div className="card-body tight" style={{ maxHeight: 360, overflowY: 'auto' }}>
        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon name="check"/></div>
            <div>No {tab} follow-ups. Nice work.</div>
          </div>
        ) : (
          <div className="notif-list">
            {list.map((p) => <NotifRow key={p.id} patient={p} upcoming={tab === 'upcoming'}/>)}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
        <a onClick={() => onNavigate('detail')} style={{ fontSize: 12.5, cursor: 'pointer' }}>View all patients →</a>
      </div>
    </div>
  );
}

function NotifRow({ patient, upcoming }) {
  const d = daysFromNow(patient.nextVisitDate);
  return (
    <div className={'notif-item ' + (upcoming ? 'upcoming' : '')}>
      <div className="patient-row">
        <div className="avatar">{patient.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <strong>{patient.name}</strong>
          <span>{patient.age}{patient.sex} · {patient.phone}</span>
        </div>
      </div>
      <div className="meta">
        {upcoming ? (
          <>
            <strong>{d === 0 ? 'Today' : `in ${d}d`}</strong>
            <span className="xs subtle">{fmtDateShort(patient.nextVisitDate)}</span>
          </>
        ) : (
          <>
            <strong>{patient.overdueDays}d overdue</strong>
            <span className="xs subtle">Visit {patient.completedVisits + 1} of {patient.totalVisits}</span>
          </>
        )}
      </div>
      <button className="call-btn" title={`Call ${patient.phone}`}>
        <Icon name="phone" size={14}/>
      </button>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      border: 'none', background: 'transparent', cursor: 'pointer',
      padding: '8px 0', fontSize: 12.5, fontWeight: active ? 600 : 500,
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      borderBottom: '2px solid ' + (active ? 'var(--primary)' : 'transparent'),
      marginBottom: -1, display: 'inline-flex', alignItems: 'center',
    }}>{children}</button>
  );
}

function RecentActivityCard({ study }) {
  const recent = useMemo(() =>
    [...study.patients].sort((a, b) => new Date(b.enrollDate) - new Date(a.enrollDate)).slice(0, 5)
  , [study]);

  return (
    <div className="card">
      <div className="card-head">
        <Icon name="activity" size={15}/>
        <h3 className="card-title">Recent enrollments</h3>
      </div>
      <div className="card-body tight">
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Icon name="users"/></div>
            <div>No patients enrolled yet.</div>
          </div>
        ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Arm</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="patient-row">
                    <div className="avatar">{p.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div>
                      <strong>{p.name}</strong>
                      <span className="mono">{p.id} · {p.age}{p.sex}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="chip" style={{ background: ARM_COLORS[p.arm] + '22', color: ARM_COLORS[p.arm], borderColor: ARM_COLORS[p.arm] + '55' }}>
                    {study.arms[p.arm].name.split(' ')[0]}
                  </span>
                </td>
                <td><StatusPill status={p.status}/></td>
                <td style={{ textAlign: 'right' }} className="mono subtle">{fmtDateShort(p.enrollDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    active: { cls: 'chip-blue', label: 'Active' },
    completed: { cls: 'chip-green', label: 'Completed' },
    lost: { cls: 'chip-red', label: 'Lost to F/U' },
    screened: { cls: 'chip-amber', label: 'Screened' },
  };
  const s = map[status] || map.active;
  return <span className={'chip ' + s.cls}>{s.label}</span>;
}

function StudyMetaCard({ study, onDeleteStudy }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="card">
      <div className="card-head">
        <Icon name="flask" size={15}/>
        <h3 className="card-title">Study details</h3>
      </div>
      <div className="card-body">
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 12, columnGap: 16, fontSize: 13 }}>
          <dt className="subtle">Type</dt><dd style={{ margin: 0 }}>{study.type}</dd>
          <dt className="subtle">Arms</dt><dd style={{ margin: 0 }}>{study.arms.length}</dd>
          <dt className="subtle">Sample size</dt><dd style={{ margin: 0 }} className="mono">{study.sampleSize}</dd>
          <dt className="subtle">Start</dt><dd style={{ margin: 0 }}>{fmtDate(study.startDate)}</dd>
          <dt className="subtle">Est. end</dt><dd style={{ margin: 0 }}>{fmtDate(study.endDate)}</dd>
          <dt className="subtle">Follow-up</dt><dd style={{ margin: 0 }}>{study.followUp}</dd>
          <dt className="subtle">Baseline fields</dt><dd style={{ margin: 0 }}>{study.baselineFields.length}</dd>
          <dt className="subtle">F/U fields</dt><dd style={{ margin: 0 }}>{study.followUpFields.length}</dd>
        </dl>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          {!confirmDelete ? (
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={13}/> Delete study
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: 'var(--red)', fontWeight: 500 }}>All patients will be lost.</span>
              <button className="btn btn-danger btn-sm" onClick={onDeleteStudy}>Confirm delete</button>
              <button className="btn btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
