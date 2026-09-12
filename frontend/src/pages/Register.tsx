import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'MANAGER', label: 'Manager', desc: 'Create workspace, manage team and all reports', icon: '👔' },
  { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Create and assign work orders to field technicians', icon: '📋' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'View and update your assigned field jobs', icon: '🔧' },
  { value: 'CUSTOMER', label: 'Customer', desc: 'Raise requests and track their status', icon: '🏢' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score-1] : 'rgba(148,163,184,0.25)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, color: c.pass ? '#16a34a' : '#94a3b8' }}>
            {c.pass ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(148,163,184,0.3)',
    borderRadius: 12, color: '#0f172a', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#334155',
    fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.3
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#6366f1';
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(148,163,184,0.3)';
    e.target.style.boxShadow = 'none';
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!passwordValid) { setError('Password must meet all requirements'); return; }
    setStep(2);
  };

  const handleRoleSelect = (r: string) => { setRole(r); setStep(3); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (role === 'MANAGER' && !organizationName.trim()) { setError('Organization name is required'); return; }
    if ((role === 'DISPATCHER' || role === 'TECHNICIAN') && !inviteCode.trim()) { setError('Invite code is required'); return; }
    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        name, email, password, role,
        organizationName: role === 'MANAGER' ? organizationName : undefined,
        inviteCode: (role === 'DISPATCHER' || role === 'TECHNICIAN') ? inviteCode.toUpperCase() : undefined
      });
      login(res.data.token, res.data.email, res.data.role,
        res.data.organizationId?.toString(), res.data.organizationName, res.data.inviteCode);
      navigate('/work-orders');
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden', padding: 20
    }}>
      {/* animated gradient + blob background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 25%, #f5f3ff 50%, #fdf4ff 75%, #ecfdf5 100%)',
        zIndex: 0
      }}>
        {[
          { w: 500, h: 500, top: '-15%', right: '-10%', color: 'rgba(34,197,94,0.25)' },
          { w: 450, h: 450, bottom: '-10%', left: '-10%', color: 'rgba(99,102,241,0.3)' },
          { w: 350, h: 350, top: '35%', left: '20%', color: 'rgba(236,72,153,0.2)' },
          { w: 300, h: 300, bottom: '15%', right: '15%', color: 'rgba(249,115,22,0.18)' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', width: b.w, height: b.h, borderRadius: '50%',
            background: b.color, filter: 'blur(100px)',
            top: b.top, left: b.left, bottom: b.bottom, right: b.right,
            pointerEvents: 'none'
          }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: step === 2 ? 560 : 460, position: 'relative', zIndex: 1, maxHeight: '95vh', overflowY: 'auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            marginBottom: 12,
            boxShadow: '0 8px 20px rgba(99,102,241,0.4)'
          }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>K</span>
          </div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>KEYSTONE</h1>
          <p style={{ color: '#475569', margin: '4px 0 0', fontSize: 13 }}>Field Service Management Platform</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.6)'
        }}>

          {/* step bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {['Account', 'Role', 'Setup'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: step > i+1 ? '#22c55e' : step === i+1
                      ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                      : 'rgba(148,163,184,0.25)',
                    border: '1px solid rgba(148,163,184,0.3)',
                    color: step >= i+1 ? 'white' : '#94a3b8',
                    boxShadow: step === i+1 ? '0 4px 12px rgba(99,102,241,0.4)' : 'none'
                  }}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize: 12, color: step === i+1 ? '#0f172a' : '#94a3b8' }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, margin: '0 8px', background: step > i+1 ? '#22c55e' : 'rgba(148,163,184,0.3)', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          {/* step 1 */}
          {step === 1 && (
            <>
              <h2 style={{ color: '#0f172a', margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Create your account</h2>
              <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: 13 }}>Join the KEYSTONE platform</p>
              <form onSubmit={handleStep1}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Full name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 chars, uppercase, number"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={focusInput} onBlur={blurInput} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 16
                    }}>{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>}
                <button type="submit" style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  border: 'none',
                  borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
                }}>Continue →</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}

          {/* step 2 — role */}
          {step === 2 && (
            <>
              <h2 style={{ color: '#0f172a', margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>What's your role?</h2>
              <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 13 }}>This determines your access level across the platform</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ROLES.map(r => (
                  <div key={r.value} onClick={() => handleRoleSelect(r.value)} style={{
                    padding: '18px 14px', textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(148,163,184,0.3)',
                    borderRadius: 16, transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>{r.icon}</div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{r.label}</div>
                    <div style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 18, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}>← Back</button>
            </>
          )}

          {/* step 3 — org setup */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>
                  {ROLES.find(r => r.value === role)?.icon}
                </div>
                <div>
                  <h2 style={{ color: '#0f172a', margin: 0, fontSize: 20, fontWeight: 700 }}>
                    {role === 'MANAGER' ? 'Set up your workspace' : role === 'CUSTOMER' ? 'Almost done!' : 'Join your team'}
                  </h2>
                  <p style={{ color: '#64748b', margin: '3px 0 0', fontSize: 13 }}>
                    {role === 'MANAGER' ? 'Name your organization' : role === 'CUSTOMER' ? 'Your account is ready' : 'Enter your team invite code'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {role === 'MANAGER' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Organization name</label>
                    <input value={organizationName} onChange={e => setOrganizationName(e.target.value)}
                      placeholder="e.g. Apex Facilities Management"
                      style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                    <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
                      An invite code will be generated — share it with your team (not customers)
                    </p>
                  </div>
                )}

                {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Team invite code</label>
                    <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="KST-XXXX"
                      style={{ ...inputStyle, letterSpacing: 4, fontSize: 18, fontWeight: 700, textAlign: 'center' }}
                      onFocus={focusInput} onBlur={blurInput} />
                    <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                      Get this code from your manager
                    </p>
                  </div>
                )}

                {role === 'CUSTOMER' && (
                  <div style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '16px',
                    marginBottom: 20
                  }}>
                    <p style={{ color: '#334155', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                      Your customer account will be created. A service manager will link you to the appropriate workspace when they set up your first job.
                    </p>
                  </div>
                )}

                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#c7c9f0' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  border: 'none',
                  borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)'
                }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>
              <button onClick={() => setStep(2)} style={{ marginTop: 14, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}>← Change role</button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#475569', fontSize: 12 }}>
          © 2026 KEYSTONE · Meridian Facilities Management
        </p>
      </div>
    </div>
  );
}
