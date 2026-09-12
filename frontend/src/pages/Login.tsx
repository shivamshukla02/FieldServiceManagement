import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/login', { email, password });
      login(res.data.token, res.data.email, res.data.role,
        res.data.organizationId?.toString(), res.data.organizationName, res.data.inviteCode);
      navigate('/work-orders');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #0f0c29 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden'
    }}>
      {/* floating blobs */}
      {[
        { w: 400, h: 400, top: -100, left: -100, color: 'rgba(102,126,234,0.3)' },
        { w: 300, h: 300, bottom: -80, right: -80, color: 'rgba(118,75,162,0.3)' },
        { w: 200, h: 200, top: '40%', left: '60%', color: 'rgba(240,147,43,0.15)' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.h,
          borderRadius: '50%', background: b.color,
          filter: 'blur(80px)',
          top: b.top, left: b.left, bottom: b.bottom, right: b.right,
          pointerEvents: 'none'
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440, padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            <span style={{ fontSize: 28 }}>⚙️</span>
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-1px', textShadow: '0 2px 20px rgba(102,126,234,0.5)' }}>KEYSTONE</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '6px 0 0', fontSize: 13 }}>Field Service Management Platform</p>
        </div>

        {/* glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}>
          <h2 style={{ color: 'white', margin: '0 0 6px', fontSize: 22, fontWeight: 600 }}>Welcome back</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 28px', fontSize: 14 }}>Sign in to your workspace</p>

          <form onSubmit={handleSubmit}>
            {/* email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.3 }}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                style={{
                  width: '100%', padding: '13px 16px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, color: 'white', fontSize: 14,
                  outline: 'none', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(102,126,234,0.8)'; e.target.style.background = 'rgba(102,126,234,0.1)'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.3 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  style={{
                    width: '100%', padding: '13px 48px 13px 16px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, color: 'white', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(102,126,234,0.8)'; e.target.style.background = 'rgba(102,126,234,0.1)'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16
                }}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 18,
                color: '#fca5a5', fontSize: 13
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, rgba(102,126,234,0.9), rgba(118,75,162,0.9))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 32px rgba(102,126,234,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.2s', fontFamily: 'inherit'
            }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* google btn */}
          <button style={{
            width: '100%', padding: '13px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, fontFamily: 'inherit',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: 'all 0.2s', boxSizing: 'border-box'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'rgba(102,126,234,0.9)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          © 2026 KEYSTONE · Meridian Facilities Management
        </p>
      </div>
    </div>
  );
}