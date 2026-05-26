import { useState } from 'react';
import { Icon } from '../lib/icons';
import { fmtDate } from '../lib/helpers';

export function StudyDesignScreen({ initialStudy, onSave, onSkip }) {
  const seed = initialStudy || {
    name: '',
    type: 'RCT',
    arms: [{ name: 'Arm A', target: 30 }, { name: 'Arm B', target: 30 }],
    sampleSize: 60,
    startDate: '2026-06-01',
    endDate: '2026-12-01',
    followUpCount: 4,
    followUpInterval: { value: 1, unit: 'months' },
    baselineFields: [
      { name: 'Systolic BP', type: 'number', unit: 'mmHg' },
      { name: 'Diastolic BP', type: 'number', unit: 'mmHg' },
    ],
    followUpFields: [
      { name: 'Systolic BP', type: 'number', unit: 'mmHg', visits: [true, true, true, true] },
      { name: 'Side effects', type: 'text', visits: [true, true, true, true] },
    ],
  };

  const [study, setStudy] = useState(seed);
  const [editing, setEditing] = useState(!initialStudy);

  const update = (patch) => setStudy((s) => ({ ...s, ...patch }));

  const updateArm = (i, patch) => {
    const arms = [...study.arms];
    arms[i] = { ...arms[i], ...patch };
    update({ arms, sampleSize: arms.reduce((a, b) => a + (parseInt(b.target) || 0), 0) });
  };
  const addArm = () => {
    const letter = String.fromCharCode(65 + study.arms.length);
    const arms = [...study.arms, { name: `Arm ${letter}`, target: 30 }];
    update({ arms, sampleSize: arms.reduce((a, b) => a + (parseInt(b.target) || 0), 0) });
  };
  const removeArm = (i) => {
    if (study.arms.length <= 1) return;
    const arms = study.arms.filter((_, idx) => idx !== i);
    update({ arms, sampleSize: arms.reduce((a, b) => a + (parseInt(b.target) || 0), 0) });
  };

  const updateFollowUpCount = (count) => {
    const n = Math.max(1, count);
    const followUpFields = study.followUpFields.map((f) => ({
      ...f,
      visits: Array.from({ length: n }, (_, i) => f.visits?.[i] ?? true),
    }));
    update({ followUpCount: n, followUpFields });
  };

  const updateField = (kind, i, patch) => {
    const list = [...study[kind]];
    list[i] = { ...list[i], ...patch };
    update({ [kind]: list });
  };
  const addField = (kind) => {
    const newField = kind === 'followUpFields'
      ? { name: '', type: 'text', visits: Array(study.followUpCount || 1).fill(true) }
      : { name: '', type: 'text' };
    update({ [kind]: [...study[kind], newField] });
  };
  const removeField = (kind, i) => update({ [kind]: study[kind].filter((_, idx) => idx !== i) });

  // View mode — shown when editing an existing study
  if (!editing) {
    const fuLabel = study.followUpCount
      ? `${study.followUpCount} visits · every ${study.followUpInterval?.value} ${study.followUpInterval?.unit}`
      : '—';
    return (
      <div className="design-shell">
        <div className="design-topbar">
          <div className="auth-brand" style={{ padding: 0, border: 'none' }}>
            <div className="brand-mark">T</div>
            <span style={{ color: 'var(--text)' }}>ThesisManager</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onSkip}>Back</button>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <Icon name="edit" size={14}/> Edit design
            </button>
          </div>
        </div>
        <div className="design-content">
          <div className="page-head">
            <div>
              <h2>{study.name}</h2>
              <p className="sub">{study.type} · {study.arms.length} arm{study.arms.length !== 1 ? 's' : ''} · {study.sampleSize} target participants</p>
            </div>
          </div>
          <div className="row-gap-16">
            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Arms</h3>
                <span className="card-sub">Total: {study.sampleSize}</span>
              </div>
              <div className="card-body">
                <div className="arm-builder">
                  {study.arms.map((a, i) => (
                    <div key={i} className="arm-builder-row" style={{ pointerEvents: 'none' }}>
                      <div className="arm-letter">{String.fromCharCode(65 + i)}</div>
                      <div className="input" style={{ background: 'var(--surface-2, var(--surface))' }}>{a.name}</div>
                      <div className="input mono" style={{ background: 'var(--surface-2, var(--surface))', paddingLeft: 12 }}>{a.target}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3 className="card-title">Timeline & follow-up</h3></div>
              <div className="card-body">
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: 12, columnGap: 16, fontSize: 13 }}>
                  <dt className="subtle">Start date</dt><dd style={{ margin: 0 }}>{fmtDate(study.startDate)}</dd>
                  <dt className="subtle">End date</dt><dd style={{ margin: 0 }}>{fmtDate(study.endDate)}</dd>
                  <dt className="subtle">Sample size</dt><dd style={{ margin: 0 }} className="mono">{study.sampleSize}</dd>
                  <dt className="subtle">Follow-ups</dt><dd style={{ margin: 0 }}>{fuLabel}</dd>
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Baseline fields</h3>
                <span className="card-sub">{study.baselineFields.length} fields · recorded once at enrollment</span>
              </div>
              <div className="card-body">
                {study.baselineFields.length === 0 ? (
                  <div className="hint">No baseline fields defined.</div>
                ) : (
                  <div className="field-builder">
                    {study.baselineFields.map((f, i) => (
                      <div key={i} className="field-builder-row" style={{ pointerEvents: 'none' }}>
                        <div className="input" style={{ background: 'var(--surface-2, var(--surface))' }}>
                          {f.name}{f.unit ? ` (${f.unit})` : ''}
                        </div>
                        <div className="select" style={{ background: 'var(--surface-2, var(--surface))', display: 'flex', alignItems: 'center' }}>
                          {f.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <h3 className="card-title">Follow-up fields</h3>
                <span className="card-sub">{study.followUpFields.length} fields · {study.followUpCount} visits</span>
              </div>
              <div className="card-body tight scroll-x">
                {study.followUpFields.length === 0 ? (
                  <div className="hint" style={{ padding: '8px 0' }}>No follow-up fields defined.</div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Type</th>
                        {Array.from({ length: study.followUpCount || 1 }).map((_, i) => (
                          <th key={i} style={{ textAlign: 'center' }}>FU {i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {study.followUpFields.map((f, fi) => (
                        <tr key={fi}>
                          <td><strong>{f.name}</strong>{f.unit && <span className="subtle"> ({f.unit})</span>}</td>
                          <td className="subtle">{f.type}</td>
                          {Array.from({ length: study.followUpCount || 1 }).map((_, vi) => (
                            <td key={vi} style={{ textAlign: 'center' }}>
                              {(f.visits?.[vi] ?? true)
                                ? <Icon name="check" size={13} style={{ color: 'var(--primary)' }}/>
                                : <span className="subtle xs">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit form
  return (
    <div className="design-shell">
      <div className="design-topbar">
        <div className="auth-brand" style={{ padding: 0, border: 'none' }}>
          <div className="brand-mark">T</div>
          <span style={{ color: 'var(--text)' }}>ThesisManager</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn" onClick={initialStudy ? () => setEditing(false) : onSkip}>
            {initialStudy ? 'Cancel' : 'Skip for now'}
          </button>
        </div>
      </div>

      <div className="design-content">
        <div className="page-head">
          <div>
            <h2>Design your study</h2>
            <p className="sub">Set this up once. You can edit details from the dashboard later.</p>
          </div>
        </div>

        <div className="row-gap-16">
          <div className="card">
            <div className="card-head"><h3 className="card-title">1. Study overview</h3></div>
            <div className="card-body row-gap-16">
              <div className="field">
                <label className="label">Study name <span className="req">*</span></label>
                <input className="input" placeholder="e.g. Amlodipine vs Losartan in Stage-2 Hypertension"
                  value={study.name} onChange={(e) => update({ name: e.target.value })}/>
                <div className="hint">Full title as it will appear in your thesis manuscript.</div>
              </div>
              <div className="field">
                <label className="label">Type of trial <span className="req">*</span></label>
                <div className="radio-grid">
                  <div className="radio-card" data-active={study.type === 'RCT'} onClick={() => update({ type: 'RCT' })}>
                    <div className="radio-card-title">Randomised Controlled Trial</div>
                    <div className="radio-card-desc">Participants are randomly allocated between 2+ arms.</div>
                  </div>
                  <div className="radio-card" data-active={study.type === 'Observational'} onClick={() => update({ type: 'Observational', arms: study.arms.slice(0, 1) })}>
                    <div className="radio-card-title">Observational</div>
                    <div className="radio-card-desc">Single cohort; outcomes are observed, not assigned.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3 className="card-title">2. Arms</h3>
              <span className="card-sub">Total sample size <strong className="mono" style={{ color: 'var(--text)' }}>{study.sampleSize}</strong></span>
              {study.type === 'RCT' && (
                <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={addArm}>
                  <Icon name="plus" size={12}/> Add arm
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="arm-builder">
                {study.arms.map((a, i) => (
                  <div key={i} className="arm-builder-row">
                    <div className="arm-letter">{String.fromCharCode(65 + i)}</div>
                    <input className="input" placeholder="Arm name (e.g. Amlodipine 10mg OD)"
                      value={a.name} onChange={(e) => updateArm(i, { name: e.target.value })}/>
                    <div className="input-group">
                      <input type="number" className="input" style={{ paddingLeft: 12 }} placeholder="60"
                        value={a.target} onChange={(e) => updateArm(i, { target: parseInt(e.target.value) || 0 })}/>
                    </div>
                    <button className="remove-x" onClick={() => removeArm(i)} disabled={study.arms.length <= 1}>
                      <Icon name="x" size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3 className="card-title">3. Timeline & follow-up</h3></div>
            <div className="card-body row-gap-16">
              <div className="field-row-3">
                <div className="field">
                  <label className="label">Start date <span className="req">*</span></label>
                  <input type="date" className="input" value={study.startDate} onChange={(e) => update({ startDate: e.target.value })}/>
                </div>
                <div className="field">
                  <label className="label">Estimated end date <span className="req">*</span></label>
                  <input type="date" className="input" value={study.endDate} onChange={(e) => update({ endDate: e.target.value })}/>
                </div>
                <div className="field">
                  <label className="label">Total sample size</label>
                  <input type="number" className="input mono" value={study.sampleSize} readOnly/>
                  <div className="hint">Sum of all arm targets.</div>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Number of follow-ups <span className="req">*</span></label>
                  <input type="number" className="input mono" placeholder="4" min="1"
                    value={study.followUpCount}
                    onChange={(e) => updateFollowUpCount(parseInt(e.target.value) || 1)}/>
                  <div className="hint">Total visits per patient after enrollment.</div>
                </div>
                <div className="field">
                  <label className="label">Follow-up interval from baseline <span className="req">*</span></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" className="input mono" placeholder="1" min="1"
                      style={{ flex: 1 }}
                      value={study.followUpInterval.value}
                      onChange={(e) => update({ followUpInterval: { ...study.followUpInterval, value: parseInt(e.target.value) || '' } })}/>
                    <select className="select" style={{ width: 120 }}
                      value={study.followUpInterval.unit}
                      onChange={(e) => update({ followUpInterval: { ...study.followUpInterval, unit: e.target.value } })}>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                  <div className="hint">Interval between each follow-up visit.</div>
                </div>
              </div>
            </div>
          </div>

          <FieldBuilderCard title="4. Baseline data fields" sub="What you record once, at enrollment."
            fields={study.baselineFields}
            onAdd={() => addField('baselineFields')}
            onUpdate={(i, patch) => updateField('baselineFields', i, patch)}
            onRemove={(i) => removeField('baselineFields', i)}/>

          <FieldBuilderCard title="5. Follow-up data fields" sub="What you record at follow-up visits. Check which visits each field applies to."
            fields={study.followUpFields}
            visitCount={study.followUpCount}
            onAdd={() => addField('followUpFields')}
            onUpdate={(i, patch) => updateField('followUpFields', i, patch)}
            onRemove={(i) => removeField('followUpFields', i)}/>

          <div className="flex gap-8" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={initialStudy ? () => setEditing(false) : onSkip}>Cancel</button>
            <button className="btn btn-primary btn-lg" disabled={!study.name} onClick={() => onSave(study)}>
              Save study & go to dashboard <Icon name="arrowRight" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBuilderCard({ title, sub, fields, onAdd, onUpdate, onRemove, visitCount }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{title}</h3>
        <span className="card-sub">{sub}</span>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={onAdd}>
          <Icon name="plus" size={12}/> Add field
        </button>
      </div>
      <div className="card-body">
        <div className="field-builder">
          {fields.length === 0 && <div className="hint" style={{ padding: '8px 0' }}>No fields yet. Click "Add field" above.</div>}
          {fields.map((f, i) => (
            <div key={i} className="field-builder-row" style={{ flexWrap: 'wrap', rowGap: 6 }}>
              <input className="input" placeholder="Field name (e.g. Systolic BP)"
                value={f.name} onChange={(e) => onUpdate(i, { name: e.target.value })}/>
              <select className="select" value={f.type} onChange={(e) => onUpdate(i, { type: e.target.value })}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="dropdown">Dropdown</option>
                <option value="date">Date</option>
              </select>
              {visitCount > 0 && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
                  {Array.from({ length: visitCount }).map((_, v) => (
                    <label key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={f.visits?.[v] ?? true}
                        onChange={(e) => {
                          const visits = Array.from({ length: visitCount }, (_, j) => f.visits?.[j] ?? true);
                          visits[v] = e.target.checked;
                          onUpdate(i, { visits });
                        }}
                        style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      {v + 1}
                    </label>
                  ))}
                </div>
              )}
              <button className="remove-x" onClick={() => onRemove(i)}><Icon name="x" size={14}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
