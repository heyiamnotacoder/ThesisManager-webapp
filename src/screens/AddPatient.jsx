import { useState } from 'react';
import { Icon } from '../lib/icons';
import { fmtDate } from '../lib/helpers';

export function AddPatientScreen({ study, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', age: '', sex: 'M', phone: '', relativePhone: '', crNo: '',
    arm: study.patients.length % study.arms.length,
    enrollDate: '2026-05-25',
    consent: false,
    baseline: study.baselineFields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}),
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setBL = (name, value) => setForm((f) => ({ ...f, baseline: { ...f.baseline, [name]: value } }));

  const valid = form.name && form.age && form.phone && form.crNo && form.consent;
  const armCounts = study.arms.map((_, i) => study.patients.filter((p) => p.arm === i).length);

  return (
    <div className="content">
      <section className="hero">
        <div className="hero-grid no-ring">
          <div className="hero-content">
            <div>
              <div className="hero-eyebrow">Enrolling into · {study.type}</div>
              <h2 className="hero-title">{form.name ? `${form.name} → ${study.shortName || study.name}` : 'Add a new patient'}</h2>
            </div>
            <p className="hero-sub">
              {study.patients.length} of {study.sampleSize} enrolled — {study.sampleSize - study.patients.length} slots left.
              {' '}{study.type === 'RCT'
                ? <>Block randomisation suggests <strong>{study.arms[form.arm].name}</strong> for the next allocation.</>
                : <>This is an observational cohort; all participants enter the same arm.</>
              }
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${study.arms.length}, 1fr)`, gap: 14, marginTop: 4 }}>
              {study.arms.map((arm, i) => {
                const n = armCounts[i] + (form.arm === i ? 1 : 0);
                const isSelected = form.arm === i;
                return (
                  <div key={i} style={{ background: isSelected ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'), borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="ring-arm-chip" style={{ background: isSelected ? '#fff' : 'rgba(255,255,255,0.18)', color: isSelected ? 'var(--primary)' : '#fff', borderColor: 'transparent' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <strong style={{ fontSize: 13, fontWeight: 600 }}>{arm.name}</strong>
                      {isSelected && <span style={{ marginLeft: 'auto', fontSize: 10.5, padding: '2px 7px', background: '#fff', color: 'var(--primary)', borderRadius: 99, fontWeight: 600 }}>NEW</span>}
                    </div>
                    <div className="stack-bar" style={{ height: 6 }}>
                      <div style={{ width: `${armCounts[i] / arm.target * 100}%`, background: 'rgba(255,255,255,0.85)' }}/>
                      {isSelected && <div style={{ width: `${1 / arm.target * 100}%`, background: '#86efac' }}/>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginTop: 6, opacity: 0.85 }}>
                      <span className="mono">{n} / {arm.target}</span>
                      <span>{arm.target - n} slot{arm.target - n !== 1 ? 's' : ''} left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="page-head" style={{ marginBottom: 20 }}>
        <div>
          <h2>Patient details</h2>
          <p className="sub">Required fields are marked with an asterisk.</p>
        </div>
        <div className="page-head-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <div style={{ maxWidth: 880 }} className="row-gap-16">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Basic details</h3>
            <span className="card-sub">Personal info & contact</span>
          </div>
          <div className="card-body row-gap-16">
            <div className="field">
              <label className="label">Full name <span className="req">*</span></label>
              <input className="input" placeholder="Patient's full name" value={form.name} onChange={(e) => set({ name: e.target.value })}/>
            </div>
            <div className="field-row-3">
              <div className="field">
                <label className="label">Age <span className="req">*</span></label>
                <input type="number" className="input" placeholder="42" value={form.age} onChange={(e) => set({ age: e.target.value })}/>
              </div>
              <div className="field">
                <label className="label">Sex <span className="req">*</span></label>
                <select className="select" value={form.sex} onChange={(e) => set({ sex: e.target.value })}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div className="field">
                <label className="label">CR number <span className="req">*</span></label>
                <input className="input mono" placeholder="CR2451234" value={form.crNo} onChange={(e) => set({ crNo: e.target.value })}/>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Phone number <span className="req">*</span></label>
                <div className="input-group">
                  <Icon name="phone" size={14}/>
                  <input className="input mono" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set({ phone: e.target.value })}/>
                </div>
              </div>
              <div className="field">
                <label className="label">Relative's phone</label>
                <div className="input-group">
                  <Icon name="phone" size={14}/>
                  <input className="input mono" placeholder="Backup contact" value={form.relativePhone} onChange={(e) => set({ relativePhone: e.target.value })}/>
                </div>
                <div className="hint">Used if the patient is unreachable for follow-up.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Enrollment</h3>
            <span className="card-sub">Allocation & dates</span>
          </div>
          <div className="card-body row-gap-16">
            <div className="field">
              <label className="label">Allocate to arm <span className="req">*</span></label>
              <div className="radio-grid" style={{ gridTemplateColumns: `repeat(${study.arms.length}, 1fr)` }}>
                {study.arms.map((arm, i) => (
                  <div key={i} className="radio-card" data-active={form.arm === i} onClick={() => set({ arm: i })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="arm-letter" style={{ width: 24, height: 24, fontSize: 11 }}>{String.fromCharCode(65 + i)}</span>
                      <span className="radio-card-title">{arm.name}</span>
                    </div>
                    <div className="radio-card-desc">{armCounts[i]} / {arm.target} enrolled</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label">Enrollment date <span className="req">*</span></label>
                <input type="date" className="input" value={form.enrollDate} onChange={(e) => set({ enrollDate: e.target.value })}/>
              </div>
              <div className="field">
                <label className="label">Estimated completion</label>
                <input className="input" value={fmtDate(study.endDate)} readOnly/>
                <div className="hint">Based on study end date.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Baseline data</h3>
            <span className="card-sub">Recorded once at enrollment</span>
          </div>
          <div className="card-body">
            <div className="field-row">
              {study.baselineFields.map((f, i) => (
                <BaselineField key={i} field={f} value={form.baseline[f.name]} onChange={(v) => setBL(f.name, v)}/>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="consent" checked={form.consent} onChange={(e) => set({ consent: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}/>
            <label htmlFor="consent" style={{ fontSize: 13.5, cursor: 'pointer' }}>
              Patient has signed informed consent and met inclusion criteria.
              <div className="hint" style={{ marginTop: 2 }}>Required before enrolling into the study.</div>
            </label>
          </div>
        </div>

        <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={() => onSave(form, true)} disabled={!valid}>Save & add another</button>
          <button className="btn btn-primary btn-lg" disabled={!valid} onClick={() => onSave(form, false)}>
            Enroll patient <Icon name="arrowRight" size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function BaselineField({ field, value, onChange }) {
  if (field.type === 'dropdown') {
    const opts = (field.options || '').split(',').map((s) => s.trim()).filter(Boolean);
    return (
      <div className="field">
        <label className="label">{field.name} {field.unit && <span className="hint">({field.unit})</span>}</label>
        <select className="select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div className="field">
        <label className="label">{field.name} {field.unit && <span className="hint">({field.unit})</span>}</label>
        <input type="number" className="input mono" value={value || ''} onChange={(e) => onChange(e.target.value)}/>
      </div>
    );
  }
  if (field.type === 'date') {
    return (
      <div className="field">
        <label className="label">{field.name}</label>
        <input type="date" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}/>
      </div>
    );
  }
  return (
    <div className="field">
      <label className="label">{field.name}</label>
      <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}/>
    </div>
  );
}
