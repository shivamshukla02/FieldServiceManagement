import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'MANAGER', label: 'Manager', desc: 'Create workspace, manage team and view all reports', icon: '👨‍💼' },
  { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Create and assign work orders to technicians', icon: '📋' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'View and update your assigned field jobs', icon: '🔧' },
  { value: 'CUSTOMER', label: 'Customer', desc: 'Raise requests and track service status', icon: '👥' },
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
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score-1] : '#e2e8f0', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, fontWeight: 500, color: c.pass ? '#22c55e' : '#94a3b8' }}>
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
      login(res.data.token, res.data.email, res.data.role, res.data.organizationId?.toString(), res.data.organizationName, res.data.inviteCode);
      navigate('/work-orders');
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      /* Match background to screenshot */
      background: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80) center/cover no-repeat',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 20, boxSizing: 'border-box'
    }}>
      <style>{`
        .input-wrapper:focus-within { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important; }
        .role-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; position: relative; transition: all 0.2s; }
        .role-card:hover { border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }
        .role-card.selected { border-color: #6366f1; background: #f8fafc; box-shadow: 0 0 0 1px #6366f1; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      {/* Glass Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: step === 2 ? 640 : 440,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        boxSizing: 'border-box', transition: 'max-width 0.3s ease'
      }}>
        
        <h1 style={{ color: '#0f172a', margin: '0 0 24px', fontSize: 24, fontWeight: 700 }}>Create your account</h1>

        {/* Progress Bar matched perfectly to image */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          {/* Step 1 Node */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > 1 ? '#22c55e' : (step === 1 ? '#6366f1' : 'white'), color: 'white', fontWeight: 600, fontSize: 13, border: step === 1 ? 'none' : (step > 1 ? 'none' : '1px solid #cbd5e1') }}>
            {step > 1 ? '✓' : 1}
          </div>
          {/* Line 1 */}
          <div style={{ flex: 1, height: 2, background: step > 1 ? '#22c55e' : '#e2e8f0', margin: '0 8px' }}></div>
          
          {/* Step 2 Node */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > 2 ? '#22c55e' : (step === 2 ? '#6366f1' : 'white'), color: step >= 2 ? 'white' : '#64748b', fontWeight: 600, fontSize: 13, border: step === 2 ? 'none' : (step > 2 ? 'none' : '1px solid #cbd5e1') }}>
            {step > 2 ? '✓' : 2}
          </div>
          {/* Line 2 */}
          <div style={{ flex: 1, height: 2, background: step > 2 ? '#22c55e' : '#e2e8f0', margin: '0 8px' }}></div>
          
          {/* Step 3 Node */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step === 3 ? '#6366f1' : 'white', color: step === 3 ? 'white' : '#64748b', fontWeight: 600, fontSize: 13, border: step === 3 ? 'none' : '1px solid #cbd5e1' }}>
            3
          </div>
        </div>

        {/* STEP 1: Account Info */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Full Name</label>
              <div className="input-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex' }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }} />
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Email address</label>
              <div className="input-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Password</label>
              <div className="input-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', paddingRight: 12 }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number" style={{ flex: 1, padding: '12px', border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                   {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>{error}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              Continue
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
              Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </form>
        )}

        {/* STEP 2: Role Selection (Matched to screenshot) */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#0f172a', margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Choose your role</h2>
            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 14 }}>This sets your access level across the platform</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {ROLES.map(r => {
                const isSelected = role === r.value;
                return (
                  <div key={r.value} className={`role-card ${isSelected ? 'selected' : ''}`} onClick={() => handleRoleSelect(r.value)}>
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{r.icon}</div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{r.label}</div>
                    <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                );
              })}
            </div>
            
            <button onClick={() => setStep(1)} style={{ marginTop: 24, background: 'none', border: 'none', color: '#64748b', fontWeight: 500, cursor: 'pointer', fontSize: 14, padding: 0 }}>
              ← Back
            </button>
          </div>
        )}

        {/* STEP 3: Setup Info */}
        {step === 3 && (
          <div>
            <h2 style={{ color: '#0f172a', margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>
              {role === 'MANAGER' ? 'Set up your workspace' : role === 'CUSTOMER' ? 'Almost done!' : 'Join your team'}
            </h2>
            <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: 14 }}>
              {role === 'MANAGER' ? 'Name your organization to begin.' : role === 'CUSTOMER' ? 'Your account is ready.' : 'Enter your team invite code.'}
            </p>

            <form onSubmit={handleSubmit}>
              {role === 'MANAGER' && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Organization Name</label>
                  <div className="input-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex' }}>
                    <input value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="e.g. Apex Facilities Management" required style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', background: 'transparent', fontSize: 14 }} />
                  </div>
                </div>
              )}

              {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Team Invite Code</label>
                  <div className="input-wrapper" style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex' }}>
                    <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="KST-XXXX" required style={{ width: '100%', padding: '12px', border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, letterSpacing: 2, textAlign: 'center' }} />
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Get this code from your manager.</p>
                </div>
              )}

              {role === 'CUSTOMER' && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 24 }}>
                  <p style={{ color: '#475569', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    Your customer account will be created. A service manager will link you to the appropriate workspace when they set up your first job.
                  </p>
                </div>
              )}

              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>{error}</div>}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            
            <button onClick={() => setStep(2)} style={{ marginTop: 24, background: 'none', border: 'none', color: '#64748b', fontWeight: 500, cursor: 'pointer', fontSize: 14, padding: 0 }}>
              ← Change role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}