import { useState } from 'react';
import { Icon } from '../lib/icons';

export function AuthScreen({ onSubmit, loading = false }) {
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordMismatch = mode === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;
  const valid = mode === 'signup'
    ? (name && email && password.length >= 6 && password === confirmPassword)
    : (email && password);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ name, email, password, mode });
  };

  const switchMode = (m) => {
    setMode(m);
    setConfirmPassword('');
  };

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="auth-brand">
          <div className="brand-mark">T</div>
          <span>ThesisManager</span>
        </div>
        <div className="auth-hero">
          <h2>Never lose track of your thesis again.</h2>
          <p>A focused workspace for medical students running clinical trials — recruit patients, schedule follow-ups, and watch your data fall into place.</p>
          <div className="auth-bullets">
            {[
              'Automatic follow-up reminders by patient, by visit window',
              'Real-time recruitment numbers per arm',
              'Custom baseline & follow-up fields for any protocol',
              'One-tap call to lost-to-follow-up patients',
            ].map((b) => (
              <div key={b} className="auth-bullet">
                <div className="auth-bullet-mark"><Icon name="check" size={12}/></div>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-tabs">
            <button type="button" className="auth-tab" data-active={mode === 'signin'} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" className="auth-tab" data-active={mode === 'signup'} onClick={() => switchMode('signup')}>Sign up</button>
          </div>

          <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="sub">
            {mode === 'signup' ? 'Start managing your thesis in two minutes.' : 'Sign in to continue your study.'}
          </p>

          {mode === 'signup' && (
            <div className="field">
              <label className="label">Full name</label>
              <div className="input-group">
                <Icon name="user" size={14}/>
                <input className="input" placeholder="Dr. Aanya Reddy" value={name} onChange={(e) => setName(e.target.value)}/>
              </div>
            </div>
          )}

          <div className="field">
            <label className="label">Email</label>
            <div className="input-group">
              <Icon name="mail" size={14}/>
              <input type="email" className="input" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className="input-group">
              <Icon name="lock" size={14}/>
              <input type="password" className="input" placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="field">
              <label className="label">Confirm password</label>
              <div className="input-group">
                <Icon name="lock" size={14}/>
                <input type="password" className="input" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
              </div>
              {passwordMismatch && <div className="hint" style={{ color: '#ef4444', marginTop: 4 }}>Passwords do not match.</div>}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={!valid || loading}>
            {loading
              ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
              : (mode === 'signup' ? 'Create account' : 'Sign in')}
            {!loading && <Icon name="arrowRight" size={14}/>}
          </button>

          <div className="auth-foot-link">
            {mode === 'signup' ? (
              <>Already have an account? <a onClick={() => switchMode('signin')}>Sign in</a></>
            ) : (
              <>New to ThesisManager? <a onClick={() => switchMode('signup')}>Create an account</a></>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
