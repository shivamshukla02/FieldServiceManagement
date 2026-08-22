import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'MANAGER', label: 'Manager', desc: 'Create and manage your team workspace', icon: '👔' },
  { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Join your team with an invite code', icon: '📋' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'Join your team with an invite code', icon: '🔧' },
  { value: 'CUSTOMER', label: 'Customer', desc: 'Track your service requests', icon: '🏢' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
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
            background: i <= score ? colors[score-1] : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, color: c.pass ? '#22c55e' : '#8892a4' }}>
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
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: 'white', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#b0bac9', fontSize: 13, fontWeight: 500, marginBottom: 7
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!passwordValid) { setError('Password must meet all requirements'); return; }
    setStep(2);
  };

  const handleRoleSelect = (r: string) => {
    setRole(r);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (role === 'MANAGER' && !organizationName.trim()) {
      setError('Organization name is required'); return;
    }
    if ((role === 'DISPATCHER' || role === 'TECHNICIAN') && !inviteCode.trim()) {
      setError('Invite code is required'); return;
    }
    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        name, email, password, role,
        organizationName: role === 'MANAGER' ? organizationName : undefined,
        inviteCode: (role === 'DISPATCHER' || role === 'TECHNICIAN') ? inviteCode.toUpperCase() : undefined
      });
      login(res.data.token, res.data.email, res.data.role);
      // store org info
      if (res.data.organizationId) localStorage.setItem('organizationId', res.data.organizationId);
      if (res.data.organizationName) localStorage.setItem('organizationName', res.data.organizationName);
      if (res.data.inviteCode) localStorage.setItem('inviteCode', res.data.inviteCode);
      navigate('/work-orders');
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: '36px 32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
  };

  const steps = ['Account', 'Role', 'Setup'];

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: step === 2 ? 520 : 440 }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            marginBottom: 12, boxShadow: '0 8px 32px rgba(102,126,234,0.4)'
          }}>
            <span style={{ fontSize: 22 }}>⚙️</span>
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: 24, fontWeight: 700 }}>KEYSTONE</h1>
          <p style={{ color: '#8892a4', margin: '4px 0 0', fontSize: 13 }}>Field Service Management Platform</p>
        </div>

        <div style={cardStyle}>
          {/* step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length-1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: step > i+1 ? '#22c55e' : step === i+1 ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
                    color: step >= i+1 ? 'white' : '#8892a4',
                    boxShadow: step === i+1 ? '0 4px 12px rgba(102,126,234,0.4)' : 'none'
                  }}>
                    {step > i+1 ? '✓' : i+1}
                  </div>
                  <span style={{ fontSize: 12, color: step === i+1 ? '#b0bac9' : '#4a5568', display: step === 2 && i > 0 ? 'inline' : i === 0 ? 'inline' : 'none' }}>{s}</span>
                </div>
                {i < steps.length-1 && <div style={{ flex: 1, height: 2, margin: '0 8px', background: step > i+1 ? '#22c55e' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          {/* step 1 — account details */}
          {step === 1 && (
            <>
              <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>Create your account</h2>
              <p style={{ color: '#8892a4', margin: '0 0 22px', fontSize: 13 }}>Enter your details to get started</p>
              <form onSubmit={handleStep1}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#667eea'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#667eea'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={e => e.target.style.borderColor='#667eea'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 15
                    }}>{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#fca5a5', fontSize: 13 }}>{error}</div>}
                <button type="submit" style={{
                  width: '100%', padding: '13px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none', borderRadius: 10, color: 'white',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(102,126,234,0.4)'
                }}>Continue →</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8892a4' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}

          {/* step 2 — role selection */}
          {step === 2 && (
            <>
              <h2 style={{ color: 'white', margin: '0 0 4px', fontSize: 20, fontWeight: 600 }}>What's your role?</h2>
              <p style={{ color: '#8892a4', margin: '0 0 20px', fontSize: 13 }}>This determines your access level on the platform</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ROLES.map(r => (
                  <div key={r.value} onClick={() => handleRoleSelect(r.value)} style={{
                    padding: '16px 12px', border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.03)',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#667eea'; e.currentTarget.style.background='rgba(102,126,234,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{r.icon}</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.label}</div>
                    <div style={{ color: '#8892a4', fontSize: 11, lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 18, background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                ← Back
              </button>
            </>
          )}

          {/* step 3 — org setup */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{ROLES.find(r => r.value === role)?.icon}</span>
                <div>
                  <h2 style={{ color: 'white', margin: 0, fontSize: 20, fontWeight: 600 }}>
                    {role === 'MANAGER' ? 'Set up your workspace' :
                     role === 'CUSTOMER' ? 'Almost done!' : 'Join your team'}
                  </h2>
                  <p style={{ color: '#8892a4', margin: '2px 0 0', fontSize: 13 }}>
                    {role === 'MANAGER' ? 'Create a workspace for your team' :
                     role === 'CUSTOMER' ? 'Your account will be set up for you' :
                     'Enter the invite code your manager shared'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {role === 'MANAGER' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Organization / Company Name</label>
                    <input value={organizationName} onChange={e => setOrganizationName(e.target.value)}
                      placeholder="e.g. Apex Facilities Management"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor='#667eea'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'} />
                    <p style={{ color: '#8892a4', fontSize: 12, marginTop: 8 }}>
                      An invite code will be generated for you to share with your team
                    </p>
                  </div>
                )}

                {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Team Invite Code</label>
                    <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. KST-XXXX"
                      style={{ ...inputStyle, letterSpacing: 2, textTransform: 'uppercase' }}
                      onFocus={e => e.target.style.borderColor='#667eea'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'} />
                    <p style={{ color: '#8892a4', fontSize: 12, marginTop: 8 }}>
                      Ask your manager for the invite code to join their workspace
                    </p>
                  </div>
                )}

                {role === 'CUSTOMER' && (
                  <div style={{
                    background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.3)',
                    borderRadius: 10, padding: '14px 16px', marginBottom: 20
                  }}>
                    <p style={{ color: '#b0bac9', fontSize: 13, margin: 0 }}>
                      Your account will be created and a service manager will link you to the appropriate workspace when they set up your first job.
                    </p>
                  </div>
                )}

                {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#fca5a5', fontSize: 13 }}>{error}</div>}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#4a5568' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none', borderRadius: 10, color: 'white',
                  fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(102,126,234,0.4)'
                }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>

              <button onClick={() => setStep(2)} style={{ marginTop: 14, background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                ← Change role
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#2d3748', fontSize: 12 }}>
          © 2026 KEYSTONE · Meridian Facilities Management
        </p>
      </div>
    </div>
  );
}