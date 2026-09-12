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
      background: 'linear-gradient(135deg, #4f46e5, #ec4899, #f59e0b)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-field:focus {
          background: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.9) !important;
        }
        .glass-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4) !important;
        }
        .google-btn:hover {
          background: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>

      <div style={{
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 320,
        boxSizing: 'border-box'
      }}>
        
        {/* Logo */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#4f46e5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
        }}>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>K</span>
        </div>
        
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', textAlign: 'center', margin: '0 0 4px' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', margin: '0 0 20px' }}>
          Sign in to KEYSTONE
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* Email */}
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
            Email address
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="manager@company.com" 
            required
            className="glass-field"
            style={{
              width: '100%', padding: '9px 12px', boxSizing: 'border-box',
              background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: 8, fontSize: 12, color: '#1e293b', outline: 'none',
              marginBottom: 12, transition: 'all 0.3s'
            }}
          />

          {/* Password */}
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••" 
              required
              className="glass-field"
              style={{
                width: '100%', padding: '9px 36px 9px 12px', boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: 8, fontSize: 12, color: '#1e293b', outline: 'none',
                transition: 'all 0.3s'
              }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, padding: 0
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8,
              padding: '8px 12px', marginBottom: 12, color: '#991b1b', fontSize: 11, fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="glass-btn"
            style={{
              width: '100%', padding: 10, background: '#4f46e5', border: 'none',
              borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.6)' }}></div>
          <div style={{ fontSize: 11, color: '#475569' }}>or</div>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.6)' }}></div>
        </div>

        {/* Google Button */}
        <button className="google-btn" style={{
          width: '100%', padding: 9, background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: 8,
          color: '#1e293b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxSizing: 'border-box', transition: 'background 0.2s'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#475569' }}>
          No account? <Link to="/register" style={{ color: '#1e293b', fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
        </div>

      </div>
    </div>
  );
}