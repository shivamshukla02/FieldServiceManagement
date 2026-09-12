import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/login-bg.png';

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
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden'
    }}>
      {/* background image layer - stretched to fill exactly, no cropping, no empty space */}
      <img
        src={loginBg}
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
          zIndex: 0
        }}
      />

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
          textAlign: 'center'
        }}>

          {/* logo */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            marginBottom: 18,
            boxShadow: '0 8px 20px rgba(99,102,241,0.4)'
          }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>K</span>
          </div>

          <h2 style={{ color: '#0f172a', margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>Welcome back</h2>
          <p style={{ color: '#64748b', margin: '0 0 28px', fontSize: 14 }}>Sign in to KEYSTONE</p>

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {/* email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#334155', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="manager@company.com" required
                  style={{
                    width: '100%', padding: '13px 16px 13px 42px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(148,163,184,0.3)',
                    borderRadius: 12, color: '#0f172a', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.3)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', color: '#334155', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  style={{
                    width: '100%', padding: '13px 44px 13px 42px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(148,163,184,0.3)',
                    borderRadius: 12, color: '#0f172a', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.3)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16
                }}>{showPassword ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 18,
                color: '#dc2626', fontSize: 13
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#c7c9f0' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
              border: 'none',
              borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
              transition: 'all 0.2s', fontFamily: 'inherit'
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.3)' }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.3)' }} />
          </div>

          {/* google btn */}
          <button style={{
            width: '100%', padding: '13px',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(148,163,184,0.3)',
            borderRadius: 12, color: '#0f172a', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, fontFamily: 'inherit',
            transition: 'all 0.2s', boxSizing: 'border-box'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#64748b' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}