import { useState } from 'react';
import { Icon } from '../lib/icons';
import { ARM_COLORS, fmtDate, fmtDateShort, daysFromNow } from '../lib/helpers';
import { StatusPill } from './Dashboard';

export function PatientDetailScreen({ patient: p, study, onBack, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const arm = study.arms[p.arm];
  const armColor = ARM_COLORS[p.arm] || ARM_COLORS[0];
  const initials = p.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const interval = study.followUpInterval || { value: 1, unit: 'months' };
  const applyInterval = (date, count) => {
    const d = new Date(date);
    if (interval.unit === 'months') d.setMonth(d.getMonth() + interval.value * count);
    else d.setDate(d.getDate() + interval.value * count);
    return d;
  };
  const estimatedCompletion = applyInterval(p.enrollDate, study.followUpCount || p.totalVisits);

  const visitCount = study.followUpCount || p.totalVisits || 0;
  const visitNodes = [
    { label: 'Enrolled', date: p.enrollDate, done: true, isEnrollment: true },
    ...Array.from({ length: visitCount }, (_, i) => {
      const isDone = i < p.completedVisits;
      const isCurrent = i === p.completedVisits && p.status === 'active';
      return {
        label: `FU ${i + 1}`,
        date: applyInterval(p.enrollDate, i + 1),
        done: isDone,
        isCurrent,
        isOverdue: isCurrent && p.overdueDays > 0,
      };
    }),
  ];

  const daysUntilNext = p.nextVisitDate ? daysFromNow(p.nextVisitDate) : null;

  const statusColors = { active: '#60a5fa', completed: '#34d399', lost: '#f87171' };
  const statusLabels = { active: 'Active', completed: 'Completed', lost: 'Lost to F/U' };

  return (
    <div className="content">
      <div style={{ marginBottom: 20 }}>
        <button className="btn" onClick={onBack}>
          <Icon name="arrowLeft" size={14}/> Back to patients
        </button>
      </div>

      {/* ── Hero ── */}
      <section className="hero" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16, flexShrink: 0,
            background: armColor + '55', border: '2px solid rgba(255,255,255,0.25)',
            display: 'grid', placeItems: 'center',
            fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em',
          }}>{initials}</div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="hero-eyebrow">Patient profile · {study.shortName || study.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
              <h2 className="hero-title" style={{ fontSize: 26, margin: 0, lineHeight: 1.2 }}>{p.name}</h2>
              <span style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 99, padding: '3px 10px', fontSize: 12, fontFamily: 'monospace', color: '#fff',
              }}>{p.id}</span>
              <span style={{
                background: (statusColors[p.status] || '#60a5fa') + '30',
                border: `1px solid ${statusColors[p.status] || '#60a5fa'}70`,
                borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                color: statusColors[p.status] || '#60a5fa',
              }}>{statusLabels[p.status] || p.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', fontSize: 13, opacity: 0.88 }}>
              <span style={{
                background: armColor + '40', border: `1px solid ${armColor}80`,
                borderRadius: 99, padding: '3px 12px', fontWeight: 500, color: '#fff',
              }}>
                {arm?.name}
              </span>
              <span>{p.age} yrs · {p.sex === 'M' ? 'Male' : p.sex === 'F' ? 'Female' : 'Other'}</span>
              <span>CR: {p.crNo}</span>
            </div>
          </div>

          {p.status === 'active' && p.nextVisitDate && (
            <div style={{
              background: p.overdueDays > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${p.overdueDays > 0 ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.18)'}`,
              borderRadius: 12, padding: '14px 20px', flexShrink: 0, textAlign: 'center', minWidth: 110,
            }}>
              <div style={{ fontSize: 10, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {p.overdueDays > 0 ? 'Overdue by' : 'Next visit'}
              </div>
              {p.overdueDays > 0 ? (
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fca5a5', margin: '4px 0 2px' }}>{p.overdueDays}d</div>
              ) : (
                <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 2px', color: '#fff' }}>
                  {daysUntilNext === 0 ? 'Today' : `in ${daysUntilNext}d`}
                </div>
              )}
              <div style={{ fontSize: 12, opacity: 0.7 }}>{fmtDateShort(p.nextVisitDate)}</div>
            </div>
          )}
        </div>

        <div className="hero-metrics cols-5" style={{ marginTop: 22 }}>
          <div>
            <div className="hero-metric-label">Enrolled</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, opacity: 0.95 }}>{fmtDate(p.enrollDate)}</div>
          </div>
          <div>
            <div className="hero-metric-label">Follow-ups done</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, opacity: 0.95 }}>
              {p.completedVisits} / {visitCount}
            </div>
          </div>
          <div>
            <div className="hero-metric-label">Follow-up interval</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, opacity: 0.95 }}>
              {interval.value} {interval.value === 1 ? interval.unit.replace(/s$/, '') : interval.unit}
            </div>
          </div>
          <div>
            <div className="hero-metric-label">Est. completion</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, opacity: 0.95 }}>{fmtDate(estimatedCompletion)}</div>
          </div>
          <div>
            <div className="hero-metric-label">Phone</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, opacity: 0.95, fontFamily: 'monospace' }}>{p.phone}</div>
          </div>
        </div>
      </section>

      {/* ── Two-column info cards ── */}
      <div className="split-1-1" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <Icon name="user" size={15} style={{ color: 'var(--text-subtle)' }}/>
            <h3 className="card-title">Demographics</h3>
          </div>
          <div className="card-body">
            <InfoGrid rows={[
              ['Full name', p.name, true],
              ['Age', `${p.age} years`],
              ['Sex', p.sex === 'M' ? 'Male' : p.sex === 'F' ? 'Female' : 'Other'],
              ['CR number', p.crNo, false, true],
              ['Phone', p.phone, false, true],
              p.relativePhone ? ["Relative's phone", p.relativePhone, false, true] : null,
            ]}/>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <Icon name="calendar" size={15} style={{ color: 'var(--text-subtle)' }}/>
            <h3 className="card-title">Enrollment & follow-up</h3>
          </div>
          <div className="card-body">
            <InfoGrid rows={[
              ['Enrolled on', fmtDate(p.enrollDate)],
              ['Arm', null, false, false, (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: armColor + '18', color: armColor,
                  border: `1px solid ${armColor}44`,
                  borderRadius: 99, padding: '2px 10px', fontSize: 12.5, fontWeight: 600,
                }}>
                  {arm?.name}
                </span>
              )],
              ['Interval', `${interval.value} ${interval.unit}`],
              ['Total follow-ups', `${visitCount} visits`],
              ['Est. completion', fmtDate(estimatedCompletion)],
              ['Next visit', null, false, false, p.status !== 'active'
                ? <span className="subtle xs">—</span>
                : p.overdueDays > 0
                  ? <span className="chip chip-red"><Icon name="alert" size={11}/> {p.overdueDays}d overdue</span>
                  : <span>{fmtDate(p.nextVisitDate)}</span>
              ],
            ]}/>
          </div>
        </div>
      </div>

      {/* ── Visit timeline ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <Icon name="activity" size={15} style={{ color: 'var(--text-subtle)' }}/>
          <h3 className="card-title">Visit timeline</h3>
          <span className="card-sub">{p.completedVisits} of {visitCount} follow-up visits completed</span>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content', padding: '8px 4px 4px' }}>
            {visitNodes.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: v.isEnrollment ? 46 : 38, height: v.isEnrollment ? 46 : 38,
                    borderRadius: '50%', display: 'grid', placeItems: 'center',
                    fontWeight: 700, fontSize: v.isEnrollment ? 0 : 13,
                    background: v.done
                      ? (v.isEnrollment ? 'var(--green)' : 'var(--primary)')
                      : v.isCurrent
                        ? (v.isOverdue ? 'var(--red-soft)' : 'var(--primary-soft)')
                        : 'var(--surface-3)',
                    color: v.done ? '#fff'
                      : v.isCurrent ? (v.isOverdue ? 'var(--red)' : 'var(--primary)')
                      : 'var(--text-subtle)',
                    border: v.done ? 'none'
                      : v.isCurrent ? `2px solid ${v.isOverdue ? 'var(--red)' : 'var(--primary)'}`
                      : '2px solid var(--border)',
                    boxShadow: v.isCurrent ? `0 0 0 4px ${v.isOverdue ? 'rgba(220,38,38,0.12)' : 'var(--primary-ring)'}` : 'none',
                    transition: 'all 0.15s',
                  }}>
                    {v.done ? <Icon name="check" size={v.isEnrollment ? 18 : 14}/>
                      : v.isCurrent ? <Icon name="clock" size={14}/>
                      : <span style={{ fontSize: 12 }}>{i}</span>}
                  </div>
                  <div style={{ textAlign: 'center', width: 80 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: v.done ? 'var(--text)' : v.isCurrent ? 'var(--primary)' : 'var(--text-subtle)' }}>
                      {v.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                      {fmtDateShort(v.date)}
                    </div>
                    {v.isCurrent && v.isOverdue && (
                      <div style={{ fontSize: 10, marginTop: 3, fontWeight: 600, color: 'var(--red)' }}>
                        {p.overdueDays}d overdue
                      </div>
                    )}
                  </div>
                </div>
                {i < visitNodes.length - 1 && (
                  <div style={{
                    width: 44, height: 2, flexShrink: 0, marginBottom: 30,
                    background: visitNodes[i + 1]?.done ? 'var(--primary)' : 'var(--border)',
                    transition: 'background 0.2s',
                  }}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <Icon name="trash" size={15} style={{ color: 'var(--red)' }}/>
          <h3 className="card-title" style={{ color: 'var(--red)' }}>Danger zone</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>Remove patient from study</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-subtle)', marginTop: 2 }}>Permanently deletes all data for this patient. Cannot be undone.</div>
          </div>
          {!confirmDelete ? (
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={13}/> Delete patient
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, color: 'var(--red)', fontWeight: 500 }}>This cannot be undone.</span>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(p._uuid)}>Confirm delete</button>
              <button className="btn btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Baseline data ── */}
      {(() => {
        const recordedFields = study.baselineFields.filter((f) => p.baseline?.[f.name] != null);
        return recordedFields.length > 0 && (
          <div className="card">
            <div className="card-head">
              <Icon name="file" size={15} style={{ color: 'var(--text-subtle)' }}/>
              <h3 className="card-title">Baseline data</h3>
              <span className="card-sub">Recorded at enrollment · {recordedFields.length} fields</span>
            </div>
            <div className="card-body tight">
              <table className="table">
                <thead>
                  <tr><th>Field</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {recordedFields.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>
                        {f.name}
                        {f.unit && <span className="subtle" style={{ marginLeft: 5, fontWeight: 400 }}>({f.unit})</span>}
                      </td>
                      <td><span className="mono">{p.baseline[f.name]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 14, columnGap: 12, fontSize: 13.5 }}>
      {rows.filter(Boolean).map(([label, value, bold, mono, node], i) => (
        <div key={i} style={{ display: 'contents' }}>
          <dt style={{ color: 'var(--text-subtle)', fontWeight: 500, alignSelf: 'center' }}>{label}</dt>
          <dd style={{ margin: 0, fontWeight: bold ? 600 : 400 }}>
            {node ?? <span className={mono ? 'mono' : ''}>{value}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
