import { useState } from 'react';
import { Icon } from '../lib/icons';

export function StudyDesignScreen({ initialStudy, onSave, onSkip }) {
  const seed = initialStudy || {
    name: '',
    type: 'RCT',
    arms: [{ name: 'Arm A', target: 30 }, { name: 'Arm B', target: 30 }],
    sampleSize: 60,
    startDate: '2026-06-01',
    endDate: '2026-12-01',
    followUp: 'Monthly for 6 months',
    baselineFields: [
      { name: 'Systolic BP', type: 'number', unit: 'mmHg' },
      { name: 'Diastolic BP', type: 'number', unit: 'mmHg' },
    ],
    followUpFields: [
      { name: 'Systolic BP', type: 'number', unit: 'mmHg' },
      { name: 'Side effects', type: 'text' },
    ],
  };

  const [study, setStudy] = useState(seed);
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

  const updateField = (kind, i, patch) => {
    const list = [...study[kind]];
    list[i] = { ...list[i], ...patch };
    update({ [kind]: list });
  };
  const addField = (kind) => update({ [kind]: [...study[kind], { name: '', type: 'text' }] });
  const removeField = (kind, i) => update({ [kind]: study[kind].filter((_, idx) => idx !== i) });

  return (
    <div className="design-shell">
      <div className="design-topbar">
        <div className="auth-brand" style={{ padding: 0, border: 'none' }}>
          <div className="brand-mark">T</div>
          <span style={{ color: 'var(--text)' }}>ThesisManager</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onSkip}>Skip for now</button>
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
            <div className="card-head"><h3 className="card-title">3. Timeline</h3></div>
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
              <div className="field">
                <label className="label">Follow-up schedule</label>
                <input className="input" placeholder="e.g. Monthly for 6 months"
                  value={study.followUp} onChange={(e) => update({ followUp: e.target.value })}/>
              </div>
            </div>
          </div>

          <FieldBuilderCard title="4. Baseline data fields" sub="What you record once, at enrollment."
            fields={study.baselineFields}
            onAdd={() => addField('baselineFields')}
            onUpdate={(i, patch) => updateField('baselineFields', i, patch)}
            onRemove={(i) => removeField('baselineFields', i)}/>

          <FieldBuilderCard title="5. Follow-up data fields" sub="What you record at every follow-up visit."
            fields={study.followUpFields}
            onAdd={() => addField('followUpFields')}
            onUpdate={(i, patch) => updateField('followUpFields', i, patch)}
            onRemove={(i) => removeField('followUpFields', i)}/>

          <div className="flex gap-8" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={onSkip}>Cancel</button>
            <button className="btn btn-primary btn-lg" disabled={!study.name} onClick={() => onSave(study)}>
              Save study & go to dashboard <Icon name="arrowRight" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBuilderCard({ title, sub, fields, onAdd, onUpdate, onRemove }) {
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
            <div key={i} className="field-builder-row">
              <input className="input" placeholder="Field name (e.g. Systolic BP)"
                value={f.name} onChange={(e) => onUpdate(i, { name: e.target.value })}/>
              <select className="select" value={f.type} onChange={(e) => onUpdate(i, { type: e.target.value })}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="dropdown">Dropdown</option>
                <option value="date">Date</option>
              </select>
              <button className="remove-x" onClick={() => onRemove(i)}><Icon name="x" size={14}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
