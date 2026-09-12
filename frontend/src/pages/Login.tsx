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
      login(
        res.data.token, 
        res.data.email, 
        res.data.role,
        res.data.organizationId?.toString(), 
        res.data.organizationName, 
        res.data.inviteCode
      );
      navigate('/work-orders');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', 
      width: '100%',
      /* Using a placeholder bright office/window background to match your screenshot's vibe. 
         You can replace this URL with your local image asset like: url('/assets/background.png') */
      background: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80) center/cover no-repeat',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 20, boxSizing: 'border-box'
    }}>
      <style>{`
        .input-wrapper:focus-within { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-google:hover { background: #f8fafc !important; }
      `}</style>

      {/* Glass Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: 24, padding: '40px 36px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        boxSizing: 'border-box'
      }}>
        
        {/* Logo & Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <span style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>K</span>
          </div>
          <h1 style={{ color: '#0f172a', margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>Welcome back</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Sign in to KEYSTONE</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Email address
            </label>
            <div className="input-wrapper" style={{
              display: 'flex', alignItems: 'center', background: 'white',
              border: '1px solid #e2e8f0', borderRadius: 10, padding: '0 12px', transition: 'all 0.2s'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                <polyline points="3 7 12 13 21 7"></polyline>
              </svg>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="manager@company.com" required
                style={{
                  flex: 1, padding: '12px', border: 'none', background: 'transparent',
                  outline: 'none', fontSize: 14, color: '#0f172a'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#334155', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              Password
            </label>
            <div className="input-wrapper" style={{
              display: 'flex', alignItems: 'center', background: 'white',
              border: '1px solid #e2e8f0', borderRadius: 10, padding: '0 12px', transition: 'all 0.2s'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••" required
                style={{
                  flex: 1, padding: '12px', border: 'none', background: 'transparent',
                  outline: 'none', fontSize: 14, color: '#0f172a'
                }}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary" style={{
            width: '100%', padding: '12px', background: '#6366f1', color: 'white',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
          }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}></div>
        </div>

        {/* Google Btn */}
        <button className="btn-google" style={{
          width: '100%', padding: '12px', background: 'white', color: '#334155',
          border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', transition: 'all 0.2s'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b', margin: '24px 0 0' }}>
          No account? <Link to="/register" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>

      </div>
    </div>
  );
}