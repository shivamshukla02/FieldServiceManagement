import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const BG = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await client.post('/auth/login', { email, password });
      login(res.data.token, res.data.email, res.data.role,
        res.data.organizationId?.toString(), res.data.organizationName, res.data.inviteCode);
      navigate('/work-orders');
    } catch { setError('Invalid email or password'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 12, color: 'white', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${BG})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(3px) brightness(0.55)',
        transform: 'scale(1.05)',
        zIndex: 0,
      }} />
      {/* subtle tint overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(15,12,41,0.55) 0%, rgba(48,43,99,0.45) 50%, rgba(36,36,62,0.55) 100%)',
        zIndex: 1,
      }} />

      {/* content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, padding: '0 20px' }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 20, marginBottom: 14, fontSize: 28,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>⚙️</div>
          <div style={{ color: 'white', fontSize: 30, fontWeight: 700, letterSpacing: '-1px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>KEYSTONE</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 5 }}>Field Service Management Platform</div>
        </div>

        {/* glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 24, padding: '36px 32px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Welcome back</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 26 }}>Sign in to your workspace</div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required style={inp}
                onFocus={e => { e.target.style.borderColor='rgba(255,255,255,0.6)'; e.target.style.background='rgba(255,255,255,0.18)'; e.target.style.boxShadow='0 0 0 3px rgba(255,255,255,0.1)'; }}
                onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.25)'; e.target.style.background='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
              />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  style={{ ...inp, paddingRight: 48 }}
                  onFocus={e => { e.target.style.borderColor='rgba(255,255,255,0.6)'; e.target.style.background='rgba(255,255,255,0.18)'; e.target.style.boxShadow='0 0 0 3px rgba(255,255,255,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.25)'; e.target.style.background='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, padding: 0
                }}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                color: '#fca5a5', fontSize: 13
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
              letterSpacing: 0.3, transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background='rgba(255,255,255,0.28)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.2)'; e.currentTarget.style.transform='none'; }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          <button style={{
            width: '100%', padding: '13px', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, fontFamily: 'inherit',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          © 2026 KEYSTONE · Meridian Facilities Management
        </p>
      </div>
    </div>
  );
}