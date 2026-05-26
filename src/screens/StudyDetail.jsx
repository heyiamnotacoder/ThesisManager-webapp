import { useState, useMemo } from 'react';
import { Icon } from '../lib/icons';
import { ARM_COLORS, fmtDateShort, daysFromNow } from '../lib/helpers';
import { StatusPill } from './Dashboard';

export function StudyDetailScreen({ study, onAddPatient }) {
  const [activeArm, setActiveArm] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() =>
    study.patients.filter((p) => {
      if (activeArm !== 'all' && p.arm !== activeArm) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (query && !(p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()) || p.crNo.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    })
  , [study, activeArm, statusFilter, query]);

  const armBreakdowns = useMemo(() => study.arms.map((arm, i) => {
    const inArm = study.patients.filter((p) => p.arm === i);
    return { arm, idx: i, total: inArm.length, active: inArm.filter((p) => p.status === 'active').length, completed: inArm.filter((p) => p.status === 'completed').length, lost: inArm.filter((p) => p.status === 'lost').length };
  }), [study]);

  const totalCompleted = study.patients.filter((p) => p.status === 'completed').length;
  const totalActive = study.patients.filter((p) => p.status === 'active').length;
  const totalLost = study.patients.filter((p) => p.status === 'lost').length;
  const overdueN = study.patients.filter((p) => p.overdueDays > 0).length;
  const targetTotal = study.arms.reduce((a, b) => a + b.target, 0);
  const completionPct = Math.round(study.patients.length / Math.max(1, targetTotal) * 100);

  return (
    <div className="content">
      <section className="hero">
        <div className="hero-grid">
          <RingProgress pct={completionPct} value={study.patients.length} armBreakdowns={armBreakdowns} arms={study.arms}/>
          <div className="hero-content">
            <div>
              <div className="hero-eyebrow">All patients · {study.type}</div>
              <h2 className="hero-title">{study.shortName || study.name}</h2>
            </div>
            <p className="hero-sub">
              <strong>{study.patients.length} patients enrolled</strong> across {study.arms.length} arm{study.arms.length > 1 ? 's' : ''}.{' '}
              {totalCompleted} have completed all visits · {totalActive} are actively in follow-up{totalLost > 0 ? ` · ${totalLost} lost to follow-up` : ''}.
              {overdueN > 0 && <> <strong style={{ color: '#fca5a5' }}>{overdueN} need a call today.</strong></>}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              {armBreakdowns.map((b) => (
                <div key={b.idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ fontWeight: 500 }}>
                      <span className="ring-arm-chip" style={{ marginRight: 8 }}>{String.fromCharCode(65 + b.idx)}</span>
                      {b.arm.name}
                    </span>
                    <span className="mono" style={{ opacity: 0.85 }}>{b.total} / {b.arm.target}</span>
                  </div>
                  <div className="stack-bar">
                    <div title={`${b.active} active`} style={{ width: `${b.active / b.arm.target * 100}%`, background: 'rgba(255,255,255,0.85)' }}/>
                    <div title={`${b.completed} completed`} style={{ width: `${b.completed / b.arm.target * 100}%`, background: 'rgba(167, 243, 208, 0.85)' }}/>
                    <div title={`${b.lost} lost`} style={{ width: `${b.lost / b.arm.target * 100}%`, background: 'rgba(252, 165, 165, 0.85)' }}/>
                  </div>
                </div>
              ))}
              <div className="stack-legend" style={{ opacity: 0.85 }}>
                {[['rgba(255,255,255,0.85)', 'Active'], ['rgba(167,243,208,0.85)', 'Completed'], ['rgba(252,165,165,0.85)', 'Lost to F/U']].map(([bg, label]) => (
                  <span key={label} className="stack-legend-item"><span className="stack-legend-dot" style={{ background: bg }}></span>{label}</span>
                ))}
              </div>
            </div>
            <div className="hero-actions" style={{ marginTop: 4 }}>
              <button className="btn btn-hero" onClick={onAddPatient}>
                <Icon name="plus" size={14}/> Add patient
              </button>
              <button className="btn btn-hero-ghost">
                <Icon name="download" size={14}/> Export CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="input-group" style={{ flex: 1, maxWidth: 320 }}>
          <Icon name="search" size={14}/>
          <input className="input" placeholder="Search by name, ID, CR no…" value={query} onChange={(e) => setQuery(e.target.value)}/>
        </div>
        <div className="seg">
          <button className="seg-btn" data-active={activeArm === 'all'} onClick={() => setActiveArm('all')}>All arms <span className="seg-count">{study.patients.length}</span></button>
          {study.arms.map((arm, i) => (
            <button key={i} className="seg-btn" data-active={activeArm === i} onClick={() => setActiveArm(i)}>
              <span className="arm-letter" style={{ width: 18, height: 18, fontSize: 10, background: ARM_COLORS[i] + '22', color: ARM_COLORS[i] }}>{String.fromCharCode(65 + i)}</span>
              {arm.name.split(' ')[0]}
              <span className="seg-count">{study.patients.filter((p) => p.arm === i).length}</span>
            </button>
          ))}
        </div>
        <select className="select" style={{ width: 160, marginLeft: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="lost">Lost to F/U</option>
        </select>
      </div>

      {activeArm === 'all' ? (
        <div className="row-gap-24">
          {study.arms.map((arm, i) => {
            const rows = filtered.filter((p) => p.arm === i);
            if (rows.length === 0) return null;
            return <ArmTable key={i} arm={arm} armIdx={i} rows={rows}/>;
          })}
        </div>
      ) : (
        <ArmTable arm={study.arms[activeArm]} armIdx={activeArm} rows={filtered}/>
      )}
    </div>
  );
}

function RingProgress({ pct, value, armBreakdowns, arms }) {
  const r = 86, c = 2 * Math.PI * r;
  const targetTotal = arms.reduce((a, b) => a + b.target, 0);
  const filledFrac = value / Math.max(1, targetTotal);
  const total = armBreakdowns.reduce((a, b) => a + b.total, 0);
  let cumulative = 0;
  return (
    <div className="ring-wrap">
      <svg className="ring-svg" width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none"/>
        {armBreakdowns.map((b, i) => {
          const segFrac = (b.total / Math.max(1, total)) * filledFrac;
          const dash = segFrac * c;
          cumulative += segFrac * c;
          const color = i === 0 ? '#fff' : 'rgba(255,255,255,0.6)';
          return (
            <circle key={i} cx="110" cy="110" r={r} stroke={color} strokeWidth="14" fill="none"
              strokeDasharray={`${dash} ${c}`}
              strokeDashoffset={-cumulative + dash}
              strokeLinecap={i === armBreakdowns.length - 1 ? 'round' : 'butt'}/>
          );
        })}
      </svg>
      <div className="ring-center">
        <div className="ring-value">{value}</div>
        <div className="ring-sub">of {targetTotal} target · {pct}%</div>
      </div>
    </div>
  );
}

function ArmTable({ arm, armIdx, rows }) {
  const completed = rows.filter((p) => p.status === 'completed').length;
  const active = rows.filter((p) => p.status === 'active').length;
  const lost = rows.filter((p) => p.status === 'lost').length;

  return (
    <div className="card">
      <div className="card-head">
        <span className="arm-letter" style={{ background: ARM_COLORS[armIdx] + '22', color: ARM_COLORS[armIdx] }}>{String.fromCharCode(65 + armIdx)}</span>
        <h3 className="card-title">{arm.name}</h3>
        <span className="card-sub mono">{rows.length} / {arm.target}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <span className="chip chip-blue">{active} active</span>
          <span className="chip chip-green">{completed} done</span>
          {lost > 0 && <span className="chip chip-red">{lost} lost</span>}
        </div>
      </div>
      <div className="card-body tight scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th><th>CR no.</th><th>Age / Sex</th><th>Phone</th>
              <th>Enrolled</th><th>Visits</th><th>Next visit</th><th>Status</th><th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => <PatientRow key={p.id} p={p}/>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PatientRow({ p }) {
  const overdue = p.overdueDays > 0;
  const d = daysFromNow(p.nextVisitDate);
  return (
    <tr>
      <td>
        <div className="patient-row">
          <div className="avatar">{p.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div><strong>{p.name}</strong><span className="mono">{p.id}</span></div>
        </div>
      </td>
      <td className="mono subtle">{p.crNo}</td>
      <td><span className="mono">{p.age}</span> · {p.sex}</td>
      <td className="mono subtle">{p.phone}</td>
      <td className="subtle">{fmtDateShort(p.enrollDate)}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="visit-track">
            {Array.from({ length: p.totalVisits }).map((_, i) => (
              <div key={i} className={'visit-dot ' + (i < p.completedVisits ? 'done ' : '') + (p.status === 'lost' && i === p.completedVisits ? 'lost' : '')}/>
            ))}
          </div>
          <span className="xs mono subtle">{p.completedVisits}/{p.totalVisits}</span>
        </div>
      </td>
      <td>
        {p.status === 'completed' || p.status === 'lost' ? (
          <span className="subtle xs">—</span>
        ) : overdue ? (
          <span className="chip chip-red"><Icon name="alert" size={11}/> {p.overdueDays}d overdue</span>
        ) : (
          <span className="mono small">{d === 0 ? 'Today' : d > 0 ? `in ${d}d` : '—'} <span className="subtle">· {fmtDateShort(p.nextVisitDate)}</span></span>
        )}
      </td>
      <td><StatusPill status={p.status}/></td>
      <td><button className="icon-btn" style={{ width: 28, height: 28 }}><Icon name="moreHoriz" size={14}/></button></td>
    </tr>
  );
}
