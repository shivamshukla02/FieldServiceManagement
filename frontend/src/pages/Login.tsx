import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const LOGIN_BACKGROUND =
  '/attached_assets/ChatGPT_Image_Sep_12,_2026,_12_15_27_PM_1789196335767.png';

function MailIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 5 8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ crossed = false }: { crossed?: boolean }) {
  return crossed ? (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.3A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-3.1 4.3M6.2 6.2C3.5 8 2 12 2 12s3.5 8 10 8a10 10 0 0 0 3.4-.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await client.post('/auth/login', {
        email,
        password,
      });

      login(
        response.data.token,
        response.data.email,
        response.data.role,
        response.data.organizationId?.toString(),
        response.data.organizationName,
        response.data.inviteCode,
      );

      navigate('/work-orders');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page login-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 24px 16px;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #091638;
        }

        .login-page {
          background:
            linear-gradient(90deg, rgba(238, 247, 255, .08), rgba(242, 247, 255, .16)),
            url("${LOGIN_BACKGROUND}") center / cover no-repeat;
        }

        .auth-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: rgba(235, 244, 255, .05);
          pointer-events: none;
        }

        .auth-card {
          width: min(100%, 360px);
          box-sizing: border-box;
          padding: 22px 20px 18px;
          border: 1px solid rgba(255, 255, 255, .78);
          border-radius: 15px;
          background: rgba(248, 251, 255, .82);
          box-shadow:
            0 18px 45px rgba(38, 67, 112, .13),
            inset 0 1px rgba(255, 255, 255, .72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .login-card {
          max-width: 274px;
        }

        .auth-brand {
          width: 28px;
          height: 28px;
          margin: 0 auto 8px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          color: white;
          background: linear-gradient(145deg, #5b53df, #4a3be1);
          box-shadow: 0 5px 12px rgba(85, 71, 226, .23);
          font-size: 15px;
          font-weight: 800;
        }

        .auth-heading {
          margin: 0;
          text-align: center;
          color: #091638;
          font-size: 16px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -.02em;
        }

        .auth-subheading {
          margin: 3px 0 18px;
          text-align: center;
          color: #687691;
          font-size: 9px;
          line-height: 1.4;
        }

        .field {
          margin-bottom: 10px;
        }

        .field-label {
          display: block;
          margin: 0 0 4px;
          color: #4e5d78;
          font-size: 8px;
          line-height: 1;
          font-weight: 650;
        }

        .input-shell {
          display: flex;
          align-items: center;
          min-height: 24px;
          box-sizing: border-box;
          padding: 0 8px;
          border: 1px solid rgba(197, 207, 225, .85);
          border-radius: 6px;
          background: rgba(255, 255, 255, .65);
          color: #8c99ad;
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }

        .input-shell:focus-within {
          border-color: #6658e9;
          background: rgba(255, 255, 255, .9);
          box-shadow: 0 0 0 3px rgba(102, 88, 233, .12);
        }

        .input-shell input {
          width: 100%;
          min-width: 0;
          padding: 5px 7px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #182642;
          font: inherit;
          font-size: 9px;
        }

        .input-shell input::placeholder {
          color: #a2adbd;
        }

        .password-toggle {
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: #96a2b4;
          cursor: pointer;
        }

        .auth-error {
          margin: 0 0 10px;
          padding: 7px 8px;
          border: 1px solid #fecaca;
          border-radius: 6px;
          background: #fff1f2;
          color: #c2413e;
          font-size: 9px;
          line-height: 1.35;
        }

        .primary-button,
        .secondary-button {
          width: 100%;
          min-height: 25px;
          border-radius: 6px;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .18s ease, filter .18s ease, background .18s ease;
        }

        .primary-button {
          border: 0;
          background: linear-gradient(100deg, #6554ee, #5551e9);
          color: white;
          box-shadow: 0 5px 12px rgba(91, 77, 231, .2);
        }

        .primary-button:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 13px 0 11px;
          color: #9aa6b8;
          font-size: 8px;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: rgba(197, 207, 225, .75);
        }

        .secondary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(211, 219, 232, .9);
          background: rgba(255, 255, 255, .72);
          color: #56637a;
          font-weight: 550;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, .98);
        }

        .auth-footer {
          margin: 13px 0 0;
          color: #8793a8;
          text-align: center;
          font-size: 8px;
        }

        .auth-footer a {
          color: #5549dd;
          font-weight: 750;
          text-decoration: none;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        @media (min-width: 560px) {
          .auth-card {
            padding: 28px 26px 22px;
          }

          .login-card {
            max-width: 330px;
          }

          .auth-brand {
            width: 38px;
            height: 38px;
            border-radius: 9px;
            font-size: 20px;
          }

          .auth-heading {
            font-size: 21px;
          }

          .auth-subheading {
            font-size: 11px;
            margin-bottom: 24px;
          }

          .field-label {
            font-size: 10px;
          }

          .input-shell {
            min-height: 34px;
            border-radius: 8px;
          }

          .input-shell input {
            padding: 8px;
            font-size: 11px;
          }

          .primary-button,
          .secondary-button {
            min-height: 34px;
            border-radius: 8px;
            font-size: 11px;
          }

          .auth-divider,
          .auth-footer {
            font-size: 10px;
          }
        }
      `}</style>

      <section className="auth-card login-card" aria-labelledby="login-heading">
        <div className="auth-brand" aria-hidden="true">
          K
        </div>

        <h1 id="login-heading" className="auth-heading">
          Welcome back
        </h1>

        <p className="auth-subheading">
          Sign in to KEYSTONE
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field-label" htmlFor="login-email">
              Email address
            </label>

            <div className="input-shell">
              <MailIcon />

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="manager@company.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>

            <div className="input-shell">
              <LockIcon />

              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />

              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <EyeIcon crossed={showPassword} />
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider">
          or
        </div>

        <button className="secondary-button" type="button">
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}