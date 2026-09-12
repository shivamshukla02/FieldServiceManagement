import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'MANAGER', label: 'Manager', desc: 'Create workspace, manage team and view all reports', icon: '👔' },
  { value: 'DISPATCHER', label: 'Dispatcher', desc: 'Create and assign work orders to technicians', icon: '📋' },
  { value: 'TECHNICIAN', label: 'Technician', desc: 'View and update your assigned field jobs', icon: '🔧' },
  { value: 'CUSTOMER', label: 'Customer', desc: 'Raise requests and track service status', icon: '🏢' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#16a34a'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score-1] : 'rgba(0,0,0,0.1)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, color: c.pass ? '#16a34a' : '#64748b' }}>
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
      background: `url('/file_000000004cac81f5a10bbf4f82e864f8.png') center/cover no-repeat`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 32, boxSizing: 'border-box'
    }}>
      <style>{`
        .reg-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 0.5px solid rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 28px;
          width: 480px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .step-bar { display: flex; align-items: center; margin-bottom: 22px; }
        .step-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
        .step-dot.done { background: #16a34a; color: white; }
        .step-dot.active { background: #4f46e5; color: white; }
        .step-dot.todo { background: rgba(255,255,255,0.9); color: #64748b; border: 0.5px solid #cbd5e1; }
        .step-line { flex: 1; height: 0.5px; background: #cbd5e1; margin: 0 6px; }
        .step-line.done { background: #16a34a; }
        
        .roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
        .role-card { border: 0.5px solid #cbd5e1; border-radius: 10px; padding: 14px; cursor: pointer; background: rgba(255,255,255,0.6); transition: all 0.2s; }
        .role-card:hover { border-color: #4f46e5; background: rgba(255,255,255,0.9); }
        .role-card.selected { border-color: #4f46e5; background: #eef2ff; }
        .role-icon { font-size: 20px; margin-bottom: 6px; }
        .role-name { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 3px; }
        .role-desc { font-size: 11px; color: #475569; line-height: 1.4; }

        .field-box { width: 100%; padding: 9px 12px; border: 0.5px solid #cbd5e1; border-radius: 8px; font-size: 12px; background: rgba(255,255,255,0.9); color: #1e293b; box-sizing: border-box; margin-bottom: 12px; outline: none; }
        .field-box:focus { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2); }
      `}</style>

      <div className="reg-card">
        {step === 1 && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Create your account</div>
            <div className="step-bar">
              <div className="step-dot active">1</div>
              <div className="step-line"></div>
              <div className="step-dot todo">2</div>
              <div className="step-line"></div>
              <div className="step-dot todo">3</div>
            </div>
            
            <form onSubmit={handleStep1}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Full name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required className="field-box" />

              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Email address</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required className="field-box" />

              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Password</div>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input 
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, number" required className="field-box" style={{ marginBottom: 0, paddingRight: 36 }} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <PasswordStrength password={password} />

              {error && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 12, fontWeight: 500 }}>{error}</div>}

              <button type="submit" style={{ width: '100%', padding: '10px', background: '#4f46e5', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16 }}>
                Continue →
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#64748b' }}>
              Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Create your account</div>
            <div className="step-bar">
              <div className="step-dot done">✓</div>
              <div className="step-line done"></div>
              <div className="step-dot active">2</div>
              <div className="step-line"></div>
              <div className="step-dot todo">3</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Choose your role</div>
            <div style={{ fontSize: 11, color: '#475569' }}>This sets your access level across the platform</div>
            <div className="roles-grid">
              {ROLES.map(r => (
                <div key={r.value} className={`role-card ${role === r.value ? 'selected' : ''}`} onClick={() => handleRoleSelect(r.value)}>
                  <div className="role-icon">{r.icon}</div>
                  <div className="role-name">{r.label}</div>
                  <div className="role-desc">{r.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0 }}>
              ← Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Create your account</div>
            <div className="step-bar">
              <div className="step-dot done">✓</div>
              <div className="step-line done"></div>
              <div className="step-dot done">✓</div>
              <div className="step-line done"></div>
              <div className="step-dot active">3</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
              {role === 'MANAGER' ? 'Set up your workspace' : role === 'CUSTOMER' ? 'Almost done!' : 'Join your team'}
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 16 }}>
              {role === 'MANAGER' ? 'Name your organization' : role === 'CUSTOMER' ? 'Your account is ready' : 'Enter your team invite code'}
            </div>

            <form onSubmit={handleSubmit}>
              {role === 'MANAGER' && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Organization name</div>
                  <input value={organizationName} onChange={e => setOrganizationName(e.target.value)} placeholder="e.g. Apex Facilities Management" className="field-box" />
                </>
              )}

              {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Team invite code</div>
                  <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="KST-XXXX" className="field-box" style={{ letterSpacing: 2, fontWeight: 600, textAlign: 'center' }} />
                </>
              )}

              {role === 'CUSTOMER' && (
                <div style={{ fontSize: 11, color: '#475569', background: 'rgba(255,255,255,0.6)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  Your customer account will be created. A service manager will link you to the appropriate workspace later.
                </div>
              )}

              {error && <div style={{ color: '#dc2626', fontSize: 11, marginBottom: 12, fontWeight: 500 }}>{error}</div>}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#4f46e5', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Creating account...' : 'Complete registration'}
              </button>
            </form>
            <button onClick={() => setStep(2)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 12, padding: 0 }}>
              ← Change role
            </button>
          </>
        )}
      </div>
    </div>
  );
}