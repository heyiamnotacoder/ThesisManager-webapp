import { useState } from 'react';
import { Icon } from '../lib/icons';
import { fmtDate } from '../lib/helpers';

export function AddPatientScreen({ study, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', age: '', sex: 'M', phone: '', relativePhone: '', crNo: '',
    arm: study.patients.length % study.arms.length,
    enrollDate: '2026-05-25',
    consent: false,
    baseline: {},
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const valid = form.name && form.age && form.phone && form.crNo && form.consent;
  const armCounts = study.arms.map((_, i) => study.patients.filter((p) => p.arm === i).length);

  return (
    <div className="content">
      <div className="page-head" style={{ marginBottom: 20 }}>
        <div>
          <h2>Add a new patient</h2>
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

        {study.baselineFields.length > 0 && (
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Baseline fields</h3>
              <span className="card-sub">Recorded once at enrollment · defined in study design</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {study.baselineFields.map((f, i) => (
                  <span key={i} className="chip">
                    {f.name}{f.unit ? ` (${f.unit})` : ''}
                    <span className="subtle" style={{ marginLeft: 5, opacity: 0.6 }}>· {f.type}</span>
                  </span>
                ))}
              </div>
              <div className="hint" style={{ marginTop: 10 }}>
                These fields will be collected using your data sheets. Values are recorded outside this app.
              </div>
            </div>
          </div>
        )}

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
