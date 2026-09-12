import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const BG = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80';

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
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score-1] : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, color: c.pass ? '#22c55e' : 'rgba(255,255,255,0.35)' }}>
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
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const pwValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 12, color: 'white', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
  };
  const lbl: React.CSSProperties = { display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' };
  const onFoc = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor='rgba(255,255,255,0.6)'; e.target.style.background='rgba(255,255,255,0.18)'; e.target.style.boxShadow='0 0 0 3px rgba(255,255,255,0.1)'; };
  const onBlr = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor='rgba(255,255,255,0.25)'; e.target.style.background='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!pwValid) { setError('Password must be 8+ chars with uppercase, lowercase, and number'); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (role === 'MANAGER' && !orgName.trim()) { setError('Organization name is required'); return; }
    if ((role === 'DISPATCHER' || role === 'TECHNICIAN') && !inviteCode.trim()) { setError('Invite code is required'); return; }
    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        name, email, password, role,
        organizationName: role === 'MANAGER' ? orgName : undefined,
        inviteCode: (role === 'DISPATCHER' || role === 'TECHNICIAN') ? inviteCode.toUpperCase() : undefined,
      });
      login(res.data.token, res.data.email, res.data.role,
        res.data.organizationId?.toString(), res.data.organizationName, res.data.inviteCode);
      navigate('/work-orders');
    } catch (err: any) { setError(err.response?.data || 'Registration failed'); setStep(1); }
    finally { setLoading(false); }
  };

  const stepDot = (n: number) => {
    const done = step > n, active = step === n;
    return (
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, flexShrink: 0,
        background: done ? 'rgba(34,197,94,0.8)' : active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${done ? 'rgba(34,197,94,0.5)' : active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
        color: done || active ? 'white' : 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(10px)',
        boxShadow: active ? '0 4px 16px rgba(255,255,255,0.15)' : 'none',
        transition: 'all 0.3s',
      }}>
        {done ? '✓' : n}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20,
    }}>
      {/* background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(3px) brightness(0.5)',
        transform: 'scale(1.05)', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(15,12,41,0.55) 0%, rgba(48,43,99,0.45) 50%, rgba(36,36,62,0.55) 100%)',
        zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: step === 2 ? 540 : 460 }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16, marginBottom: 12, fontSize: 24,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>⚙️</div>
          <div style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>KEYSTONE</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>Field Service Management Platform</div>
        </div>

        {/* card */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 24, padding: '34px 30px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>

          {/* step bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
            {stepDot(1)}
            <span style={{ fontSize: 12, marginLeft: 6, color: step===1?'rgba(255,255,255,0.7)':step>1?'rgba(34,197,94,0.8)':'rgba(255,255,255,0.25)', marginRight: 8 }}>Account</span>
            <div style={{ flex: 1, height: 1, background: step>1?'rgba(34,197,94,0.5)':'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
            {stepDot(2)}
            <span style={{ fontSize: 12, marginLeft: 6, color: step===2?'rgba(255,255,255,0.7)':step>2?'rgba(34,197,94,0.8)':'rgba(255,255,255,0.25)', marginRight: 8 }}>Role</span>
            <div style={{ flex: 1, height: 1, background: step>2?'rgba(34,197,94,0.5)':'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
            {stepDot(3)}
            <span style={{ fontSize: 12, marginLeft: 6, color: step===3?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.25)' }}>Setup</span>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Create your account</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 22 }}>Join the KEYSTONE platform</div>
              <form onSubmit={handleStep1}>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inp} onFocus={onFoc} onBlur={onBlr} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inp} onFocus={onFoc} onBlur={onBlr} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, number" style={{ ...inp, paddingRight: 48 }} onFocus={onFoc} onBlur={onBlr} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0 }}>{showPwd ? '🙈' : '👁️'}</button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                {error && <div style={{ background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#fca5a5', fontSize: 13 }}>{error}</div>}
                <button type="submit" style={{
                  width: '100%', padding: '14px',
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}>Continue →</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.4)' }}>Sign in</Link>
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>What's your role?</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>This determines your access level across the platform</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ROLES.map(r => (
                  <div key={r.value} onClick={() => { setRole(r.value); setStep(3); }} style={{
                    padding: '18px 14px', textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 16, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>{r.icon}</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{r.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}>← Back</button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  {ROLES.find(r => r.value === role)?.icon}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
                    {role === 'MANAGER' ? 'Set up your workspace' : role === 'CUSTOMER' ? 'Almost done!' : 'Join your team'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 3 }}>
                    {role === 'MANAGER' ? 'Name your organization' : role === 'CUSTOMER' ? 'Your account is ready' : 'Enter your team invite code'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {role === 'MANAGER' && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Organization Name</label>
                    <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Apex Facilities Management" style={inp} onFocus={onFoc} onBlur={onBlr} />
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 8 }}>An invite code will be generated — share with your team only</div>
                  </div>
                )}
                {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Team Invite Code</label>
                    <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="KST-XXXX" style={{ ...inp, letterSpacing: 6, fontSize: 20, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }} onFocus={onFoc} onBlur={onBlr} />
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Get this from your manager</div>
                  </div>
                )}
                {role === 'CUSTOMER' && (
                  <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                      Your customer account will be created. A service manager will link you to the appropriate workspace when they set up your first job.
                    </p>
                  </div>
                )}
                {error && <div style={{ background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#fca5a5', fontSize: 13 }}>{error}</div>}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>
              <button onClick={() => setStep(2)} style={{ marginTop: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}>← Change role</button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 22, color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          © 2026 KEYSTONE · Meridian Facilities Management
        </p>
      </div>
    </div>
  );
}