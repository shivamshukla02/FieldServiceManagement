import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

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
    setError('');
    setLoading(true);

    try {
      const res = await client.post('/auth/login', {
        email,
        password,
      });

      login(
        res.data.token,
        res.data.email,
        res.data.role,
        res.data.organizationId?.toString(),
        res.data.organizationName,
        res.data.inviteCode,
      );

      navigate('/work-orders');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 15px',
    border: '1px solid #dce3f0',
    borderRadius: 10,
    background: '#f7f9fd',
    color: '#17213a',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#6372dc';
    e.currentTarget.style.background = '#ffffff';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 114, 220, 0.12)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#dce3f0';
    e.currentTarget.style.background = '#f7f9fd';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        overflow: 'hidden',
        color: '#17213a',
        fontFamily:
          "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          'radial-gradient(circle at 12% 8%, rgba(209, 218, 255, 0.8), transparent 34%), linear-gradient(135deg, #eef3fc 0%, #f6f7fc 52%, #fbf8fc 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 72,
        }}
      >
        <section
          style={{
            flex: '1 1 0',
            minWidth: 0,
            maxWidth: 600,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              marginBottom: 52,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                background: 'linear-gradient(145deg, #6675e4, #4d5dd0)',
                boxShadow: '0 6px 14px rgba(77, 93, 208, 0.24)',
              }}
            >
              ✦
            </div>

            <span
              style={{
                color: '#28324b',
                fontSize: 12,
                fontWeight: 750,
                letterSpacing: '-0.15px',
              }}
            >
              KEYSTONE
              <span style={{ color: '#758098', fontWeight: 600 }}>
                {' '}
                service operations
              </span>
            </span>
          </div>

          <div
            style={{
              color: '#7481c7',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1.35,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            A clearer way to run service
          </div>

          <h1
            style={{
              maxWidth: 540,
              margin: 0,
              color: '#17213a',
              fontSize: 'clamp(48px, 6vw, 70px)',
              lineHeight: 0.98,
              fontWeight: 500,
              letterSpacing: '-4px',
            }}
          >
            Field work
            <br />
            <span style={{ color: '#5768d8' }}>without friction.</span>
          </h1>

          <p
            style={{
              maxWidth: 480,
              margin: '24px 0 0',
              color: '#748098',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Keep your dispatchers, technicians, customers, and service
            commitments connected from the first call to the final sign-off.
          </p>

          <div
            style={{
              maxWidth: 390,
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              marginTop: 48,
              padding: '13px 17px',
              border: '1px solid rgba(214, 222, 238, 0.9)',
              borderRadius: 15,
              background: 'rgba(255, 255, 255, 0.56)',
              boxShadow: '0 10px 26px rgba(70, 86, 133, 0.06)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                color: '#6d7ad0',
                fontSize: 17,
                background: '#edf5f5',
              }}
            >
              ◇
            </div>

            <div>
              <div
                style={{
                  color: '#35405c',
                  fontSize: 12,
                  fontWeight: 750,
                }}
              >
                Service teams in sync
              </div>
              <div
                style={{
                  marginTop: 4,
                  color: '#8c97ab',
                  fontSize: 11,
                }}
              >
                Work orders, schedules, and updates in one place
              </div>
            </div>

            <div
              style={{
                marginLeft: 'auto',
                color: '#6fb8ae',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ✓
            </div>
          </div>
        </section>

        <section
          style={{
            width: '100%',
            maxWidth: 360,
            flex: '0 1 360px',
            boxSizing: 'border-box',
            padding: '31px 30px 28px',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 22,
            background: 'rgba(255, 255, 255, 0.74)',
            boxShadow:
              '0 22px 50px rgba(74, 83, 128, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div
            style={{
              color: '#a0a9ba',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Workspace access
          </div>

          <h2
            style={{
              margin: 0,
              color: '#263149',
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: '-0.8px',
            }}
          >
            Welcome back.
          </h2>

          <p
            style={{
              margin: '9px 0 25px',
              color: '#8993a7',
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            Sign in to keep your field team connected.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  color: '#768198',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: 7,
                  color: '#768198',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: 42,
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />

                <button
                  type="button"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd((current) => !current)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: 0,
                    transform: 'translateY(-50%)',
                    color: '#96a0b2',
                    cursor: 'pointer',
                    background: 'transparent',
                    fontSize: 14,
                  }}
                >
                  {showPwd ? '◉' : '◌'}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  marginBottom: 15,
                  padding: '10px 12px',
                  border: '1px solid #f2c5c5',
                  borderRadius: 9,
                  color: '#b44343',
                  background: '#fff4f4',
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: 0,
                borderRadius: 9,
                color: '#ffffff',
                background: loading
                  ? '#9aa4e7'
                  : 'linear-gradient(100deg, #5869db, #7650d4)',
                boxShadow: loading
                  ? 'none'
                  : '0 8px 17px rgba(92, 91, 211, 0.25)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 750,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 20px rgba(92, 91, 211, 0.32)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = loading
                  ? 'none'
                  : '0 8px 17px rgba(92, 91, 211, 0.25)';
              }}
            >
              {loading ? 'Signing in...' : 'Sign in  →'}
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              margin: '18px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: '#e8ebf2',
              }}
            />

            <span
              style={{
                color: '#a5adbb',
                fontSize: 10,
              }}
            >
              or continue with
            </span>

            <div
              style={{
                flex: 1,
                height: 1,
                background: '#e8ebf2',
              }}
            />
          </div>

          <button
            type="button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              boxSizing: 'border-box',
              padding: '10px 14px',
              border: '1px solid #e0e5ee',
              borderRadius: 9,
              color: '#4e5a71',
              background: '#ffffff',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f7f9fd';
              e.currentTarget.style.borderColor = '#cdd5e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e0e5ee';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p
            style={{
              margin: '19px 0 0',
              color: '#9aa3b4',
              fontSize: 11,
              textAlign: 'center',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#5b69cc',
                fontWeight: 750,
                textDecoration: 'none',
              }}
            >
              Sign up
            </Link>
          </p>
        </section>
      </div>

      <style>
        {`
          @media (max-width: 800px) {
            main {
              align-items: flex-start !important;
              padding: 28px 18px !important;
              overflow-y: auto !important;
            }

            main > div {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 40px !important;
            }

            main section:first-child {
              max-width: none !important;
            }

            main section:last-child {
              max-width: none !important;
              flex-basis: auto !important;
            }
          }

          @media (max-width: 480px) {
            main h1 {
              font-size: 48px !important;
              letter-spacing: -2.5px !important;
            }

            main section:last-child {
              padding: 26px 22px 24px !important;
            }
          }
        `}
      </style>
    </main>
  );
}