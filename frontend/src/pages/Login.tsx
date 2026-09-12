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
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .login-page,
        .login-page * {
          box-sizing: border-box;
        }
        .login-page {
          --ink: #222d42;
          --muted: #6d7b91;
          --muted-2: #8c99ab;
          --line: rgba(116, 135, 164, 0.22);
          --glass: rgba(250, 252, 255, 0.58);
          --glass-strong: rgba(249, 251, 255, 0.78);
          --glass-soft: rgba(255, 255, 255, 0.35);
          --field: rgba(238, 243, 250, 0.62);
          --accent: #5466d9;
          --accent-2: #7b6fd7;
          --mint: #54aa8d;
          --shadow: 0 24px 60px rgba(69, 86, 121, 0.16), 0 4px 16px rgba(70, 87, 120, 0.08);
          --shadow-soft: 0 10px 30px rgba(67, 88, 123, 0.11);
          min-height: 100dvh;
          width: 100%;
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.9fr);
          overflow: hidden;
          color: var(--ink);
          background:
            radial-gradient(circle at 7% -9%, rgba(171, 190, 255, 0.5), transparent 32%),
            radial-gradient(circle at 94% 5%, rgba(252, 214, 231, 0.55), transparent 28%),
            linear-gradient(135deg, #f0f4fa 0%, #e7edf6 48%, #f2eef5 100%);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .login-page::before,
        .login-page::after {
          content: '';
          position: fixed;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(2px);
          opacity: 0.55;
          z-index: 0;
        }
        .login-page::before {
          width: 32vw;
          height: 32vw;
          right: -11vw;
          top: 34vh;
          background: rgba(122, 145, 221, 0.13);
        }
        .login-page::after {
          width: 25vw;
          height: 25vw;
          left: -10vw;
          bottom: 7vh;
          background: rgba(225, 146, 185, 0.11);
        }
        .login-visual {
          position: relative;
          z-index: 1;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(32px, 6vw, 86px);
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }
        .login-brand-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 13px;
          color: #f7f8ff;
          background: linear-gradient(145deg, var(--accent), var(--accent-2));
          box-shadow: 0 8px 20px rgba(84, 102, 217, 0.28);
        }
        .login-visual-content {
          margin: auto 0;
          padding: 42px 0;
        }
        .login-visual h1 {
          max-width: 680px;
          margin: 0;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: clamp(46px, 6.5vw, 90px);
          font-weight: 500;
          letter-spacing: -0.07em;
          line-height: 0.95;
        }
        .login-visual h1 em {
          color: var(--accent);
          font-style: normal;
        }
        .login-visual-copy {
          max-width: 470px;
          margin: 25px 0 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.7;
        }
        .login-signal-card {
          max-width: 480px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--glass-soft);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .login-signal-orb {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 16px;
          color: var(--mint);
          background: rgba(84, 170, 141, 0.14);
        }
        .login-signal-content strong {
          display: block;
          margin-bottom: 4px;
          color: var(--ink);
          font-size: 14px;
        }
        .login-signal-content span {
          color: var(--muted);
          font-size: 12px;
        }
        .login-signal-check {
          margin-left: auto;
          color: var(--mint);
        }
        .login-panel {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 34px clamp(22px, 6vw, 86px) 34px 20px;
        }
        .login-card {
          width: min(100%, 450px);
          padding: clamp(28px, 4vw, 46px);
          border: 1px solid var(--line);
          border-radius: 30px;
          background: var(--glass);
          box-shadow: var(--shadow);
          backdrop-filter: blur(28px) saturate(145%);
          -webkit-backdrop-filter: blur(28px) saturate(145%);
        }
        .login-eyebrow {
          margin-bottom: 8px;
          color: var(--muted-2);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
        .login-card h2 {
          margin: 0 0 9px;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: 31px;
          font-weight: 500;
          letter-spacing: -0.05em;
        }
        .login-card-description {
          margin: 0 0 32px;
          color: var(--muted);
          line-height: 1.5;
        }
        .login-form {
          display: grid;
          gap: 16px;
        }
        .login-form-label {
          display: grid;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
        }
        .login-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--line);
          border-radius: 13px;
          outline: none;
          color: var(--ink);
          background: var(--field);
          font-family: inherit;
          transition: 0.18s ease;
        }
        .login-input::placeholder {
          color: var(--muted-2);
        }
        .login-input:focus {
          border-color: rgba(84, 102, 217, 0.7);
          box-shadow: 0 0 0 4px rgba(84, 102, 217, 0.13);
          outline: none;
        }
        .login-password-wrap {
          position: relative;
        }
        .login-password-wrap .login-input {
          padding-right: 48px;
        }
        .login-icon-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 36px;
          height: 36px;
          display: inline-grid;
          place-items: center;
          padding: 8px;
          border: 0;
          border-radius: 10px;
          color: var(--muted);
          background: transparent;
          cursor: pointer;
          transition: 0.18s ease;
        }
        .login-icon-btn:hover {
          color: var(--ink);
          background: var(--glass-soft);
        }
        .login-error {
          padding: 11px 13px;
          border: 1px solid rgba(202, 113, 128, 0.28);
          border-radius: 13px;
          color: #b05264;
          background: rgba(202, 113, 128, 0.1);
          font-size: 12px;
          line-height: 1.4;
        }
        .login-primary-btn,
        .login-secondary-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 11px 16px;
          border-radius: 13px;
          font-family: inherit;
          font-weight: 700;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }
        .login-primary-btn {
          border: 1px solid transparent;
          color: #fafbff;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          box-shadow: 0 10px 24px rgba(84, 102, 217, 0.22);
          cursor: pointer;
        }
        .login-primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(84, 102, 217, 0.3);
        }
        .login-primary-btn:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }
        .login-secondary-btn {
          border: 1px solid var(--line);
          color: var(--ink);
          background: var(--glass-soft);
          cursor: pointer;
        }
        .login-secondary-btn:hover {
          transform: translateY(-1px);
          background: var(--glass-strong);
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: var(--muted-2);
          font-size: 11px;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .login-signup {
          margin: 22px 0 0;
          color: var(--muted-2);
          font-size: 12px;
          text-align: center;
        }
        .login-signup a {
          color: var(--accent);
          font-weight: 700;
        }
        .login-signup a:hover {
          text-decoration: underline;
        }
        @media (max-width: 1050px) {
          .login-page {
            grid-template-columns: 1fr 1fr;
          }
          .login-visual {
            padding: 44px;
          }
          .login-visual h1 {
            font-size: clamp(42px, 5vw, 68px);
          }
        }
        @media (max-width: 760px) {
          .login-page {
            display: block;
            min-height: 100dvh;
            overflow-y: auto;
          }
          .login-visual {
            min-height: auto;
            padding: 30px 24px 20px;
          }
          .login-visual-content {
            margin: 0;
            padding: 58px 0 0;
          }
          .login-visual h1 {
            font-size: 48px;
          }
          .login-visual-copy {
            margin-top: 16px;
            font-size: 14px;
          }
          .login-signal-card {
            margin-top: 24px;
          }
          .login-panel {
            align-items: flex-start;
            padding: 16px 16px 32px;
          }
          .login-card {
            padding: 25px 21px;
            border-radius: 23px;
          }
        }
      `}</style>
      <main className="login-page">
        <section className="login-visual">
          <div className="login-brand">
            <span className="login-brand-mark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                <path d="M14 6a6 6 0 0 1 6 6v3" />
                <path d="M4 15v-3a6 6 0 0 1 6-6" />
                <rect x="2" y="15" width="20" height="4" rx="1" />
              </svg>
            </span>
            <span>Keystone</span>
          </div>
          <div className="login-visual-content">
            <h1>
              Work that moves
              <br />
              <em>with clarity.</em>
            </h1>
            <p className="login-visual-copy">
              Keep every job, customer, site, and service commitment connected
              before the day gets noisy.
            </p>
          </div>
          <div className="login-signal-card">
            <div className="login-signal-orb">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
            </div>
            <div className="login-signal-content">
              <strong>Field teams stay aligned</strong>
              <span>Schedules, work orders, and updates in one place</span>
            </div>
            <div className="login-signal-check">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
        </section>
        <section className="login-panel">
          <div className="login-card">
            <div className="login-eyebrow">Workspace access</div>
            <h2>Welcome back.</h2>
            <p className="login-card-description">
              Sign in to keep your field team in sync.
            </p>
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-form-label" htmlFor="email">
                Email address
                <input
                  id="email"
                  name="email"
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="login-form-label" htmlFor="password">
                Password
                <div className="login-password-wrap">
                  <input
                    id="password"
                    name="password"
                    className="login-input"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-icon-btn"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPwd((current) => !current)}
                  >
                    {showPwd ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}
              <button
                className="login-primary-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>
            <div className="login-divider">or continue with</div>
            <button className="login-secondary-btn" type="button">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
            <p className="login-signup">
              Don't have an account?{' '}
              <Link to="/register">Sign up</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}