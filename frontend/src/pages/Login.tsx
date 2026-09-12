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
      background: `url('/file_000000004cac81f5a10bbf4f82e864f8.png') center/cover no-repeat`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: 32, boxSizing: 'border-box'
    }}>
      <style>{`
        .login-card { 
          background: rgba(255, 255, 255, 0.75); 
          backdrop-filter: blur(20px); 
          -webkit-backdrop-filter: blur(20px); 
          border: 0.5px solid rgba(255, 255, 255, 0.8); 
          border-radius: 16px; 
          padding: 32px; 
          width: 320px; 
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .field-box:focus {
          border-color: #4f46e5 !important;
          outline: none;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        .btn-primary:hover { opacity: 0.95; }
        .btn-google:hover { background: #f8f9fa !important; }
      `}</style>

      <div className="login-card">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>K</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', textAlign: 'center', marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 20 }}>Sign in to KEYSTONE</div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Email address</div>
          <input 
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="manager@company.com" required
            className="field-box"
            style={{ width: '100%', padding: '9px 12px', border: '0.5px solid #cbd5e1', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.9)', color: '#1e293b', boxSizing: 'border-box', marginBottom: 12 }} 
          />

          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>Password</div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input 
              type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••" required
              className="field-box"
              style={{ width: '100%', padding: '9px 36px 9px 12px', border: '0.5px solid #cbd5e1', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.9)', color: '#1e293b', boxSizing: 'border-box' }} 
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && <div style={{ color: '#dc2626', fontSize: 11, marginBottom: 12, fontWeight: 500 }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '10px', background: '#4f46e5', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
          <div style={{ flex: 1, height: 0.5, background: '#cbd5e1' }}></div>
          <div style={{ fontSize: 11, color: '#64748b' }}>or</div>
          <div style={{ flex: 1, height: 0.5, background: '#cbd5e1' }}></div>
        </div>

        <button className="btn-google" style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.9)', border: '0.5px solid #cbd5e1', borderRadius: 8, color: '#1e293b', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}>
          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#64748b' }}>
          No account? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}