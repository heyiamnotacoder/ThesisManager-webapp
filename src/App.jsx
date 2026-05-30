import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthScreen } from './screens/Auth';
import { StudyDesignScreen } from './screens/StudyDesign';
import { DashboardScreen } from './screens/Dashboard';
import { AddPatientScreen } from './screens/AddPatient';
import { StudyDetailScreen } from './screens/StudyDetail';
import { PatientDetailScreen } from './screens/PatientDetail';
import { Icon } from './lib/icons';
import { shade, hexA, tinted, daysFromNow } from './lib/helpers';
import { supabase } from './lib/supabase';

const PRIMARY = '#1e3a8a';

// ── helpers ──────────────────────────────────────────────────────────────────

function rowToStudy(row) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    type: row.type,
    sampleSize: row.sample_size,
    startDate: row.start_date,
    endDate: row.end_date,
    followUpCount: row.follow_up_count,
    followUpInterval: { value: row.follow_up_interval_value, unit: row.follow_up_interval_unit },
    followUp: row.follow_up || '',
    screened: row.screened,
    arms: row.arms || [],
    baselineFields: row.baseline_fields || [],
    followUpFields: row.followup_fields || [],
  };
}

function rowToPatient(row) {
  const nextDate = row.next_visit_date ? new Date(row.next_visit_date) : null;
  return {
    id: row.display_id,
    _uuid: row.id,
    crNo: row.cr_no,
    name: row.name,
    age: row.age,
    sex: row.sex,
    phone: row.phone,
    relativePhone: row.relative_phone,
    arm: row.arm,
    enrollDate: new Date(row.enroll_date),
    status: row.status,
    completedVisits: row.completed_visits,
    totalVisits: row.total_visits,
    nextVisitDate: nextDate,
    overdueDays: nextDate ? Math.max(0, -daysFromNow(nextDate)) : 0,
    baseline: row.baseline || {},
  };
}

function withComputedNextVisit(p, followUpInterval) {
  if (p.status !== 'active' || !followUpInterval?.value) return p;
  const d = new Date(p.enrollDate);
  const n = p.completedVisits + 1;
  if (followUpInterval.unit === 'months') d.setMonth(d.getMonth() + followUpInterval.value * n);
  else d.setDate(d.getDate() + followUpInterval.value * n);
  return { ...p, nextVisitDate: d, overdueDays: Math.max(0, -daysFromNow(d)) };
}

function studyToRow(s, userId) {
  const arms = s.arms.map((a) => ({ ...a, target: parseInt(a.target) || 0 }));
  const followUp = s.followUpCount
    ? `${s.followUpCount} visits · every ${s.followUpInterval?.value} ${s.followUpInterval?.unit}`
    : s.followUp || '';
  return {
    user_id: userId,
    name: s.name,
    short_name: s.name.length > 50 ? s.name.slice(0, 50) + '…' : s.name,
    type: s.type,
    sample_size: arms.reduce((sum, a) => sum + a.target, 0),
    start_date: s.startDate || null,
    end_date: s.endDate || null,
    follow_up_count: s.followUpCount || null,
    follow_up_interval_value: s.followUpInterval?.value || null,
    follow_up_interval_unit: s.followUpInterval?.unit || null,
    follow_up: followUp,
    arms,
    baseline_fields: (s.baselineFields || []).map(({ type: _t, ...rest }) => rest),
    followup_fields: s.followUpFields || [],
  };
}

// ── App shell skeleton ────────────────────────────────────────────────────────

function AppShellSkeleton() {
  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark" style={{ opacity: 0.35 }}>T</div>
          <span className="sk" style={{ width: 100, height: 14 }} />
        </div>
        <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8 }}>
              <span className="sk" style={{ width: 18, height: 18, borderRadius: 4 }} />
              <span className="sk" style={{ width: w, height: 13 }} />
            </div>
          ))}
        </div>
      </nav>
      <div className="main">
        <header className="topbar">
          <span className="sk" style={{ width: 180, height: 17 }} />
        </header>
        <div className="content">
          <section className="hero">
            <div className="hero-grid">
              <span className="sk-white" style={{ width: 160, height: 160, borderRadius: '50%', margin: '0 auto' }} />
              <div className="hero-content">
                <span className="sk-white" style={{ width: 140, height: 12 }} />
                <span className="sk-white" style={{ width: '70%', height: 26 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="sk-white" style={{ width: '85%', height: 12 }} />
                  <span className="sk-white" style={{ width: '55%', height: 12 }} />
                </div>
              </div>
            </div>
          </section>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stat-card">
                <span className="sk" style={{ width: 70, height: 11 }} />
                <span className="sk" style={{ width: 50, height: 28, marginTop: 8 }} />
                <span className="sk" style={{ width: 90, height: 11, marginTop: 6 }} />
              </div>
            ))}
          </div>
          <div className="split-2">
            {[0, 1].map((i) => (
              <div key={i} className="card">
                <div className="card-head">
                  <span className="sk" style={{ width: 100, height: 14 }} />
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: j < 3 ? '1px solid var(--border)' : 'none' }}>
                      <span className="sk" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <span className="sk" style={{ width: '65%', height: 13 }} />
                        <span className="sk" style={{ width: '40%', height: 11 }} />
                      </div>
                      <span className="sk" style={{ width: 52, height: 22, borderRadius: 20 }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [study, setStudy] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    // style.setProperty() is an inline style and overrides any CSS rule including
    // [data-theme="dark"], so --primary-soft must be set here rather than in CSS.
    document.documentElement.style.setProperty('--primary-soft', darkMode ? '#172554' : tinted(PRIMARY, 0.08));
  }, [darkMode]);

  const handleToggleDark = () => setDarkMode((v) => !v);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', PRIMARY);
    document.documentElement.style.setProperty('--primary-hover', shade(PRIMARY, -8));
    document.documentElement.style.setProperty('--primary-ring', hexA(PRIMARY, 0.18));
    // --primary-soft is handled by the darkMode effect to stay in sync with the theme.
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  // ── session helpers ───────────────────────────────────────────────────────

  const applySession = async (sessionUser) => {
    const u = sessionUser;
    setUser({ id: u.id, email: u.email, name: u.user_metadata?.full_name || u.email });
    try {
      const { data, error } = await supabase
        .from('studies')
        .select('*, patients(*)')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) { setScreen('design'); return; }

      const studyObj = rowToStudy(data);
      const patients = (data.patients || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map((row) => withComputedNextVisit(rowToPatient(row), studyObj.followUpInterval));

      setStudy({ ...studyObj, patients });
      setScreen('dashboard');
    } catch {
      setScreen('design');
    }
  };

  const clearSession = () => {
    setUser(null);
    setStudy(null);
    setScreen('signup');
  };

  // ── auth effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    // Primary: restore session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) applySession(session.user);
      else setScreen('signup');
    }).catch(() => setScreen('signup'));

    // Secondary: react to sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) applySession(session.user);
      if (event === 'SIGNED_OUT') clearSession();
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── auth handler ──────────────────────────────────────────────────────────

  const handleAuth = async ({ name, email, password, mode }) => {
    setAuthLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) { showToast(error.message); return; }
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, full_name: name }).maybeSingle();
        }
        if (data.session?.user) await applySession(data.session.user);
        else if (data.user) await applySession(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { showToast(error.message); return; }
        if (data.session?.user) await applySession(data.session.user);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // ── study save ────────────────────────────────────────────────────────────

  const handleSaveStudy = async (s) => {
    if (!user?.id) { showToast('Not signed in.'); return; }
    const row = studyToRow(s, user.id);

    if (study?.id) {
      const { error } = await supabase.from('studies').update(row).eq('id', study.id);
      if (error) { showToast('Failed to save: ' + error.message); return; }
      setStudy((prev) => ({ ...prev, ...rowToStudy({ ...row, id: study.id }), patients: prev.patients }));
    } else {
      const { data, error } = await supabase
        .from('studies')
        .insert({ ...row, screened: 0 })
        .select()
        .single();
      if (error) { showToast('Failed to save: ' + error.message); return; }
      setStudy({ ...rowToStudy(data), patients: [] });
    }

    setScreen('dashboard');
    showToast('Study saved.');
  };

  const handleSkipDesign = async () => {
    if (!user?.id) return;
    const defaultStudy = {
      name: 'My Study',
      type: 'RCT',
      arms: [{ name: 'Arm A', target: 30 }, { name: 'Arm B', target: 30 }],
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      followUpCount: 4,
      followUpInterval: { value: 1, unit: 'months' },
      baselineFields: [
        { name: 'Systolic BP', unit: 'mmHg' },
        { name: 'Diastolic BP', unit: 'mmHg' },
      ],
      followUpFields: [
        { name: 'Systolic BP', type: 'number', unit: 'mmHg', visits: [true, true, true, true] },
        { name: 'Side effects', type: 'text', visits: [true, true, true, true] },
      ],
    };

    if (study?.id) {
      setScreen('dashboard');
      return;
    }

    const row = studyToRow(defaultStudy, user.id);
    const { data, error } = await supabase
      .from('studies')
      .insert({ ...row, screened: 0 })
      .select()
      .single();

    if (error) { showToast('Failed to create study: ' + error.message); return; }
    setStudy({ ...rowToStudy(data), patients: [] });
    setScreen('dashboard');
  };

  // ── add patient ───────────────────────────────────────────────────────────

  const handleAddPatient = async (p, andAnother) => {
    if (!user?.id || !study?.id) return;
    const { count, error: countErr } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('study_id', study.id);

    if (countErr) { showToast('Failed to enroll: ' + countErr.message); return; }

    const prefix = study.shortName.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const displayId = `${prefix}-${String(1001 + (count || 0)).padStart(4, '0')}`;

    const nextVisitDate = new Date(p.enrollDate);
    const fuInterval = study.followUpInterval || { value: 1, unit: 'months' };
    if (fuInterval.unit === 'months') nextVisitDate.setMonth(nextVisitDate.getMonth() + fuInterval.value);
    else nextVisitDate.setDate(nextVisitDate.getDate() + fuInterval.value);

    const row = {
      display_id: displayId,
      study_id: study.id,
      cr_no: p.crNo,
      name: p.name,
      age: parseInt(p.age) || 0,
      sex: p.sex,
      phone: p.phone,
      relative_phone: p.relativePhone,
      arm: p.arm,
      enroll_date: p.enrollDate,
      status: 'active',
      completed_visits: 0,
      total_visits: study.arms.length === 1 ? 4 : 6,
      next_visit_date: nextVisitDate.toISOString().slice(0, 10),
      baseline: p.baseline || {},
    };

    const { data, error } = await supabase.from('patients').insert(row).select().single();
    if (error) { showToast('Failed to enroll: ' + error.message); return; }

    setStudy((s) => ({ ...s, patients: [withComputedNextVisit(rowToPatient(data), study.followUpInterval), ...s.patients] }));
    showToast(`${p.name} enrolled in ${study.arms[p.arm].name}.`);
    if (!andAnother) setScreen('dashboard');
  };

  // ── delete handlers ───────────────────────────────────────────────────────

  const handleDeletePatient = async (patientUuid) => {
    const { error } = await supabase.from('patients').delete().eq('id', patientUuid);
    if (error) { showToast('Failed to delete: ' + error.message); return; }
    setStudy((s) => ({ ...s, patients: s.patients.filter((p) => p._uuid !== patientUuid) }));
    setSelectedPatient(null);
    setScreen('detail');
    showToast('Patient removed.');
  };

  const handleDeleteStudy = async () => {
    if (!study?.id) return;
    const { error } = await supabase.from('studies').delete().eq('id', study.id);
    if (error) { showToast('Failed to delete study: ' + error.message); return; }
    setStudy(null);
    setScreen('design');
    showToast('Study deleted.');
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user');
    if (error) { showToast('Failed to delete account: ' + error.message); return; }
    await supabase.auth.signOut();
    clearSession();
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (screen === 'loading') return <AppShellSkeleton />;

  if (screen === 'signup') return <AuthScreen onSubmit={handleAuth} loading={authLoading} />;
  if (screen === 'design') return <StudyDesignScreen onSave={handleSaveStudy} onSkip={handleSkipDesign} />;

  const overdueCount = study ? study.patients.filter((p) => p.overdueDays > 0).length : 0;

  return (
    <div className="app">
      <Sidebar
        screen={screen} setScreen={setScreen} user={user} study={study}
        overdueCount={overdueCount} collapsed={sidebarCollapsed}
        onToggle={() => setMobileSidebarOpen((v) => !v)}
        mobileOpen={mobileSidebarOpen}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        darkMode={darkMode} onToggleDark={handleToggleDark}
      />
      <div className="main">
        <Topbar screen={screen} overdueCount={overdueCount} study={study} onToggleSidebar={() => setMobileSidebarOpen((v) => !v)} darkMode={darkMode} onToggleDark={handleToggleDark} />
        {screen === 'dashboard' && study && <DashboardScreen study={study} onNavigate={setScreen} onAddPatient={() => setScreen('add')} onDeleteStudy={handleDeleteStudy} />}
        {screen === 'add' && study && <AddPatientScreen study={study} onSave={handleAddPatient} onCancel={() => setScreen('dashboard')} />}
        {screen === 'detail' && study && <StudyDetailScreen study={study} onAddPatient={() => setScreen('add')} onSelectPatient={(p) => { setSelectedPatient(p); setScreen('patient-detail'); }} />}
        {screen === 'patient-detail' && study && selectedPatient && <PatientDetailScreen patient={selectedPatient} study={study} onBack={() => setScreen('detail')} onDelete={handleDeletePatient} />}
        {screen === 'design-edit' && study && <StudyDesignScreen initialStudy={study} onSave={handleSaveStudy} onSkip={() => setScreen('dashboard')} />}
      </div>

      {toast && (
        <div className="toast">
          <Icon name="check" size={14} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
