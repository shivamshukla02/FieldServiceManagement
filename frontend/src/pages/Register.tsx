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
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= score ? colors[score - 1] : 'rgba(255, 255, 255, 0.4)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, fontWeight: 500, color: c.pass ? '#16a34a' : '#64748b' }}>
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
      login(
        res.data.token, 
        res.data.email, 
        res.data.role,
        res.data.organizationId?.toString(), 
        res.data.organizationName, 
        res.data.inviteCode
      );
      navigate('/work-orders');
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #4f46e5, #ec4899, #f59e0b)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 20, boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-field {
          width: 100%; padding: 11px 16px; box-sizing: border-box;
          background: rgba(255, 255, 255, 0.5); border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 10px; font-size: 13px; color: #1e293b; outline: none;
          transition: all 0.3s; font-family: inherit;
        }
        .glass-field:focus {
          background: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.9) !important;
        }
        .glass-btn {
          width: 100%; padding: 12px; border: none; border-radius: 10px;
          color: white; font-size: 14px; font-weight: 600; font-family: inherit;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); transition: all 0.2s;
        }
        .glass-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }
        .role-card {
          padding: 16px 12px; text-align: center; cursor: pointer;
          background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 14px; transition: all 0.2s;
        }
        .role-card:hover {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(31, 38, 135, 0.1);
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: step === 2 ? 560 : 440, transition: 'max-width 0.3s' }}>
        
        {/* Glass Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 20, padding: '36px 32px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
        }}>

          {/* Logo / Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
             <div style={{
                width: 48, height: 48, borderRadius: 12, background: '#4f46e5',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
              }}>
                <span style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>K</span>
              </div>
            <h1 style={{ color: '#1e293b', margin: 0, fontSize: 22, fontWeight: 700 }}>KEYSTONE</h1>
            <p style={{ color: '#475569', margin: '2px 0 0', fontSize: 12 }}>Field Service Management Platform</p>
          </div>

          {/* Step Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {['Account', 'Role', 'Setup'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: step > i + 1 ? '#16a34a' : step === i + 1 ? '#4f46e5' : 'rgba(255, 255, 255, 0.5)',
                    color: step >= i + 1 ? 'white' : '#64748b',
                    border: step < i + 1 ? '1px solid rgba(255, 255, 255, 0.8)' : 'none',
                    boxShadow: step === i + 1 ? '0 2px 10px rgba(79, 70, 229, 0.3)' : 'none'
                  }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: step >= i + 1 ? '#1e293b' : '#64748b' }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, margin: '0 8px', borderRadius: 1, background: step > i + 1 ? '#16a34a' : 'rgba(255, 255, 255, 0.5)', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Account Setup */}
          {step === 1 && (
            <>
              <h2 style={{ color: '#1e293b', margin: '0 0 4px', fontSize: 18, fontWeight: 600 }}>Create your account</h2>
              <p style={{ color: '#475569', margin: '0 0 20px', fontSize: 13 }}>Join the KEYSTONE platform</p>
              
              <form onSubmit={handleStep1}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: '#475569', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>FULL NAME</label>
                  <input className="glass-field" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: '#475569', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>EMAIL ADDRESS</label>
                  <input type="email" className="glass-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#475569', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} className="glass-field" value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number"
                      style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, padding: 0
                    }}>{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, color: '#991b1b', fontSize: 12, fontWeight: 500 }}>{error}</div>}
                
                <button type="submit" className="glass-btn" style={{ background: '#4f46e5' }}>Continue →</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#475569' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1e293b', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <>
              <h2 style={{ color: '#1e293b', margin: '0 0 4px', fontSize: 18, fontWeight: 600 }}>What's your role?</h2>
              <p style={{ color: '#475569', margin: '0 0 20px', fontSize: 13 }}>This determines your access level across the platform</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ROLES.map(r => (
                  <div key={r.value} className="role-card" onClick={() => handleRoleSelect(r.value)}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{r.icon}</div>
                    <div style={{ color: '#1e293b', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{r.label}</div>
                    <div style={{ color: '#475569', fontSize: 11, lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 20, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0, width: '100%' }}>← Back to account details</button>
            </>
          )}

          {/* Step 3: Organization Setup */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>
                  {ROLES.find(r => r.value === role)?.icon}
                </div>
                <div>
                  <h2 style={{ color: '#1e293b', margin: 0, fontSize: 18, fontWeight: 600 }}>
                    {role === 'MANAGER' ? 'Set up your workspace' : role === 'CUSTOMER' ? 'Almost done!' : 'Join your team'}
                  </h2>
                  <p style={{ color: '#475569', margin: '2px 0 0', fontSize: 12 }}>
                    {role === 'MANAGER' ? 'Name your organization' : role === 'CUSTOMER' ? 'Your account is ready' : 'Enter your team invite code'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {role === 'MANAGER' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#475569', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>ORGANIZATION NAME</label>
                    <input className="glass-field" value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="e.g. Apex Facilities Management" />
                    <p style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>
                      An invite code will be generated — share it with your team.
                    </p>
                  </div>
                )}

                {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#475569', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>TEAM INVITE CODE</label>
                    <input className="glass-field" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="KST-XXXX" style={{ letterSpacing: 3, fontSize: 16, fontWeight: 600, textAlign: 'center' }} />
                    <p style={{ color: '#64748b', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
                      Get this code from your manager.
                    </p>
                  </div>
                )}

                {role === 'CUSTOMER' && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: 10, padding: 16, marginBottom: 20
                  }}>
                    <p style={{ color: '#475569', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                      Your customer account will be created. A service manager will link you to the appropriate workspace when they set up your first job.
                    </p>
                  </div>
                )}

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, color: '#991b1b', fontSize: 12, fontWeight: 500 }}>{error}</div>}

                <button type="submit" disabled={loading} className="glass-btn" style={{
                  background: '#4f46e5', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>
              <button onClick={() => setStep(2)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0, width: '100%' }}>← Change role</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}