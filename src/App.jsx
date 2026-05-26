import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthScreen } from './screens/Auth';
import { StudyDesignScreen } from './screens/StudyDesign';
import { DashboardScreen } from './screens/Dashboard';
import { AddPatientScreen } from './screens/AddPatient';
import { StudyDetailScreen } from './screens/StudyDetail';
import { Icon } from './lib/icons';
import { shade, hexA, tinted } from './lib/helpers';

const PRIMARY = '#1e3a8a';

function App() {
  const [screen, setScreen] = useState('signup');
  const [user, setUser] = useState(null);
  const [study, setStudy] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', PRIMARY);
    document.documentElement.style.setProperty('--primary-hover', shade(PRIMARY, -8));
    document.documentElement.style.setProperty('--primary-soft', tinted(PRIMARY, 0.08));
    document.documentElement.style.setProperty('--primary-ring', hexA(PRIMARY, 0.18));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleSignUp = (info) => {
    setUser(info);
    setScreen('design');
  };

  const handleSaveStudy = (s) => {
    const followUp = s.followUpCount
      ? `${s.followUpCount} visits · every ${s.followUpInterval?.value} ${s.followUpInterval?.unit}`
      : s.followUp || '';
    setStudy((prev) => ({
      id: prev?.id || `study-${Date.now()}`,
      shortName: s.name.length > 50 ? s.name.slice(0, 50) + '…' : s.name,
      screened: prev?.screened || 0,
      patients: prev?.patients || [],
      ...s,
      arms: s.arms.map((a) => ({ ...a, target: parseInt(a.target) || 0 })),
      followUp,
    }));
    setScreen('dashboard');
    showToast('Study saved.');
  };

  const handleSkipDesign = () => {
    setStudy({
      id: 'study-default',
      name: 'My Study',
      shortName: 'My Study',
      type: 'RCT',
      arms: [{ name: 'Arm A', target: 30 }, { name: 'Arm B', target: 30 }],
      sampleSize: 60,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      followUpCount: 4,
      followUpInterval: { value: 1, unit: 'months' },
      followUp: '4 visits · every 1 months',
      screened: 0,
      patients: [],
      baselineFields: [{ name: 'Systolic BP', type: 'number', unit: 'mmHg' }, { name: 'Diastolic BP', type: 'number', unit: 'mmHg' }],
      followUpFields: [
        { name: 'Systolic BP', type: 'number', unit: 'mmHg', visits: [true, true, true, true] },
        { name: 'Side effects', type: 'text', visits: [true, true, true, true] },
      ],
    });
    setScreen('dashboard');
  };

  const handleAddPatient = (p, andAnother) => {
    const prefix = study.shortName.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const id = `${prefix}-${String(1001 + study.patients.length).padStart(4, '0')}`;
    const newP = {
      id, crNo: p.crNo, name: p.name, age: parseInt(p.age) || 0, sex: p.sex,
      phone: p.phone, relativePhone: p.relativePhone, arm: p.arm,
      enrollDate: new Date(p.enrollDate), status: 'active',
      completedVisits: 0, totalVisits: study.arms.length === 1 ? 4 : 6,
      nextVisitDate: (() => { const d = new Date(p.enrollDate); d.setDate(d.getDate() + 30); return d; })(),
      overdueDays: 0, baseline: p.baseline,
    };
    setStudy((s) => ({ ...s, patients: [newP, ...s.patients] }));
    showToast(`${p.name} enrolled in ${study.arms[p.arm].name}.`);
    if (!andAnother) setScreen('dashboard');
  };

  if (screen === 'signup') return <AuthScreen onSubmit={handleSignUp}/>;
  if (screen === 'design') return <StudyDesignScreen onSave={handleSaveStudy} onSkip={handleSkipDesign}/>;

  const overdueCount = study ? study.patients.filter((p) => p.overdueDays > 0).length : 0;

  return (
    <div className="app">
      <Sidebar
        screen={screen} setScreen={setScreen} user={user} study={study}
        overdueCount={overdueCount} collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="main">
        <Topbar screen={screen} overdueCount={overdueCount} study={study}/>
        {screen === 'dashboard' && study && <DashboardScreen study={study} onNavigate={setScreen} onAddPatient={() => setScreen('add')}/>}
        {screen === 'add' && study && <AddPatientScreen study={study} onSave={handleAddPatient} onCancel={() => setScreen('dashboard')}/>}
        {screen === 'detail' && study && <StudyDetailScreen study={study} onAddPatient={() => setScreen('add')}/>}
        {screen === 'design-edit' && study && <StudyDesignScreen initialStudy={study} onSave={handleSaveStudy} onSkip={() => setScreen('dashboard')}/>}
      </div>

      {toast && (
        <div className="toast">
          <Icon name="check" size={14}/>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
