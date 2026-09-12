import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
const ROLES = [
  {
    value: 'MANAGER',
    label: 'Manager',
    desc: 'Create a workspace, manage your team, and view reports',
    icon: '👔',
  },
  {
    value: 'DISPATCHER',
    label: 'Dispatcher',
    desc: 'Create and assign work orders to field technicians',
    icon: '📋',
  },
  {
    value: 'TECHNICIAN',
    label: 'Technician',
    desc: 'View and update your assigned field jobs',
    icon: '🔧',
  },
  {
    value: 'CUSTOMER',
    label: 'Customer',
    desc: 'Raise service requests and track their status',
    icon: '🏢',
  },
];
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    {
      label: '8+ chars',
      pass: password.length >= 8,
    },
    {
      label: 'Uppercase',
      pass: /[A-Z]/.test(password),
    },
    {
      label: 'Lowercase',
      pass: /[a-z]/.test(password),
    },
    {
      label: 'Number',
      pass: /[0-9]/.test(password),
    },
  ];
  const score = checks.filter((check) => check.pass).length;
  const colors = ['#ca7180', '#cf9950', '#cf9950', '#54aa8d'];
  if (!password) {
    return null;
  }
  return (
    <div className="register-password-strength">
      <div className="register-strength-bars">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="register-strength-bar"
            style={{
              background:
                item <= score
                  ? colors[score - 1]
                  : 'rgba(116, 135, 164, 0.22)',
            }}
          />
        ))}
      </div>
      <div className="register-password-checks">
        {checks.map((check) => (
          <span
            key={check.label}
            className={
              check.pass
                ? 'register-password-check is-valid'
                : 'register-password-check'
            }
          >
            {check.pass ? '✓' : '○'} {check.label}
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
  const pwValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!pwValid) {
      setError(
        'Password must be 8+ chars with uppercase, lowercase, and number',
      );
      return;
    }
    setStep(2);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (role === 'MANAGER' && !orgName.trim()) {
      setError('Organization name is required');
      return;
    }
    if (
      (role === 'DISPATCHER' || role === 'TECHNICIAN') &&
      !inviteCode.trim()
    ) {
      setError('Invite code is required');
      return;
    }
    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        name,
        email,
        password,
        role,
        organizationName: role === 'MANAGER' ? orgName : undefined,
        inviteCode:
          role === 'DISPATCHER' || role === 'TECHNICIAN'
            ? inviteCode.toUpperCase()
            : undefined,
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
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };
  const stepDot = (number: number) => {
    const done = step > number;
    const active = step === number;
    return (
      <div
        className={[
          'register-step-dot',
          done ? 'is-done' : '',
          active ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {done ? '✓' : number}
      </div>
    );
  };
  const selectedRole = ROLES.find((item) => item.value === role);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .register-page,
        .register-page * {
          box-sizing: border-box;
        }
        .register-page {
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
        .register-page::before,
        .register-page::after {
          content: '';
          position: fixed;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(2px);
          opacity: 0.55;
          z-index: 0;
        }
        .register-page::before {
          width: 32vw;
          height: 32vw;
          right: -11vw;
          top: 34vh;
          background: rgba(122, 145, 221, 0.13);
        }
        .register-page::after {
          width: 25vw;
          height: 25vw;
          left: -10vw;
          bottom: 7vh;
          background: rgba(225, 146, 185, 0.11);
        }
        .register-visual {
          position: relative;
          z-index: 1;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(32px, 6vw, 86px);
        }
        .register-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.04em;
        }
        .register-brand-mark {
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
        .register-visual-content {
          margin: auto 0;
          padding: 42px 0;
        }
        .register-visual h1 {
          max-width: 680px;
          margin: 0;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: clamp(46px, 6.5vw, 90px);
          font-weight: 500;
          letter-spacing: -0.07em;
          line-height: 0.95;
        }
        .register-visual h1 em {
          color: var(--accent);
          font-style: normal;
        }
        .register-visual-copy {
          max-width: 470px;
          margin: 25px 0 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.7;
        }
        .register-signal-card {
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
        .register-signal-orb {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 16px;
          color: var(--mint);
          background: rgba(84, 170, 141, 0.14);
        }
        .register-signal-content strong {
          display: block;
          margin-bottom: 4px;
          color: var(--ink);
          font-size: 14px;
        }
        .register-signal-content span {
          color: var(--muted);
          font-size: 12px;
        }
        .register-signal-check {
          margin-left: auto;
          color: var(--mint);
        }
        .register-panel {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 34px clamp(22px, 6vw, 86px) 34px 20px;
        }
        .register-card {
          width: min(100%, 450px);
          padding: clamp(28px, 4vw, 46px);
          border: 1px solid var(--line);
          border-radius: 30px;
          background: var(--glass);
          box-shadow: var(--shadow);
          backdrop-filter: blur(28px) saturate(145%);
          -webkit-backdrop-filter: blur(28px) saturate(145%);
        }
        .register-stepper {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 30px;
        }
        .register-step-dot {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--line);
          border-radius: 50%;
          color: var(--muted-2);
          background: rgba(255, 255, 255, 0.24);
          font-size: 11px;
          font-weight: 700;
          transition: all 0.3s ease;
        }
        .register-step-dot.is-active {
          border-color: rgba(84, 102, 217, 0.45);
          color: #ffffff;
          background: linear-gradient(145deg, var(--accent), var(--accent-2));
          box-shadow: 0 4px 16px rgba(84, 102, 217, 0.2);
        }
        .register-step-dot.is-done {
          border-color: rgba(84, 170, 141, 0.45);
          color: #ffffff;
          background: var(--mint);
        }
        .register-step-label {
          margin-left: 7px;
          margin-right: 9px;
          color: var(--muted-2);
          font-size: 11px;
          white-space: nowrap;
        }
        .register-step-label.is-active {
          color: var(--ink);
          font-weight: 700;
        }
        .register-step-line {
          flex: 1;
          height: 1px;
          background: var(--line);
          transition: background 0.3s ease;
        }
        .register-step-line.is-done {
          background: rgba(84, 170, 141, 0.5);
        }
        .register-card-title {
          margin: 0 0 8px;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: 29px;
          font-weight: 500;
          letter-spacing: -0.05em;
        }
        .register-card-description {
          margin: 0 0 26px;
          color: var(--muted);
          line-height: 1.5;
        }
        .register-form {
          display: grid;
          gap: 16px;
        }
        .register-form-label {
          display: grid;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
        }
        .register-input {
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
        .register-input::placeholder {
          color: var(--muted-2);
        }
        .register-input:focus {
          border-color: rgba(84, 102, 217, 0.7);
          box-shadow: 0 0 0 4px rgba(84, 102, 217, 0.13);
          outline: none;
        }
        .register-password-wrap {
          position: relative;
        }
        .register-password-wrap .register-input {
          padding-right: 48px;
        }
        .register-icon-btn {
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
        .register-icon-btn:hover {
          color: var(--ink);
          background: var(--glass-soft);
        }
        .register-password-strength {
          margin-top: 8px;
        }
        .register-strength-bars {
          display: flex;
          gap: 4px;
          margin-bottom: 7px;
        }
        .register-strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        .register-password-checks {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .register-password-check {
          color: var(--muted-2);
          font-size: 11px;
        }
        .register-password-check.is-valid {
          color: var(--mint);
        }
        .register-error {
          padding: 11px 13px;
          border: 1px solid rgba(202, 113, 128, 0.28);
          border-radius: 13px;
          color: #b05264;
          background: rgba(202, 113, 128, 0.1);
          font-size: 12px;
          line-height: 1.4;
        }
        .register-primary-btn,
        .register-secondary-btn,
        .register-back-btn {
          font-family: inherit;
          cursor: pointer;
        }
        .register-primary-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 16px;
          border: 1px solid transparent;
          border-radius: 13px;
          color: #fafbff;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          box-shadow: 0 10px 24px rgba(84, 102, 217, 0.22);
          font-weight: 700;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }
        .register-primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(84, 102, 217, 0.3);
        }
        .register-primary-btn:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }
        .register-secondary-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border: 1px solid var(--line);
          border-radius: 13px;
          color: var(--ink);
          background: var(--glass-soft);
          font-weight: 700;
          transition:
            transform 0.18s ease,
            background 0.18s ease;
        }
        .register-secondary-btn:hover {
          transform: translateY(-1px);
          background: var(--glass-strong);
        }
        .register-back-btn {
          margin-top: 16px;
          padding: 0;
          border: 0;
          color: var(--muted);
          background: transparent;
          font-size: 12px;
        }
        .register-back-btn:hover {
          color: var(--accent);
        }
        .register-role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .register-role-card {
          min-height: 148px;
          padding: 17px 13px;
          border: 1px solid var(--line);
          border-radius: 16px;
          color: var(--ink);
          background: var(--glass-soft);
          cursor: pointer;
          font-family: inherit;
          text-align: center;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }
        .register-role-card:hover {
          border-color: rgba(84, 102, 217, 0.4);
          background: var(--glass-strong);
          box-shadow: var(--shadow-soft);
          transform: translateY(-2px);
        }
        .register-role-icon {
          margin-bottom: 10px;
          font-size: 28px;
        }
        .register-role-label {
          margin-bottom: 5px;
          color: var(--ink);
          font-size: 14px;
          font-weight: 700;
        }
        .register-role-description {
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
        }
        .register-setup-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .register-selected-role-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: var(--glass-soft);
          font-size: 24px;
        }
        .register-setup-title {
          margin: 0;
          color: var(--ink);
          font-family: 'Space Grotesk', monospace;
          font-size: 24px;
          font-weight: 500;
          letter-spacing: -0.05em;
        }
        .register-setup-description {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: 12px;
        }
        .register-field-note {
          margin-top: 8px;
          color: var(--muted-2);
          font-size: 11px;
          line-height: 1.5;
        }
        .register-invite-input {
          letter-spacing: 6px;
          text-align: center;
          text-transform: uppercase;
          font-size: 20px;
          font-weight: 700;
        }
        .register-customer-note {
          margin-bottom: 20px;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 13px;
          color: var(--muted);
          background: var(--glass-soft);
          font-size: 12px;
          line-height: 1.6;
        }
        .register-account-link {
          margin: 22px 0 0;
          color: var(--muted-2);
          font-size: 12px;
          text-align: center;
        }
        .register-account-link a {
          color: var(--accent);
          font-weight: 700;
        }
        .register-account-link a:hover {
          text-decoration: underline;
        }
        @media (max-width: 1050px) {
          .register-page {
            grid-template-columns: 1fr 1fr;
          }
          .register-visual {
            padding: 44px;
          }
          .register-visual h1 {
            font-size: clamp(42px, 5vw, 68px);
          }
        }
        @media (max-width: 760px) {
          .register-page {
            display: block;
            min-height: 100dvh;
            overflow-y: auto;
          }
          .register-visual {
            min-height: auto;
            padding: 30px 24px 20px;
          }
          .register-visual-content {
            margin: 0;
            padding: 58px 0 0;
          }
          .register-visual h1 {
            font-size: 48px;
          }
          .register-visual-copy {
            margin-top: 16px;
            font-size: 14px;
          }
          .register-signal-card {
            margin-top: 24px;
          }
          .register-panel {
            align-items: flex-start;
            padding: 16px 16px 32px;
          }
          .register-card {
            padding: 25px 21px;
            border-radius: 23px;
          }
        }
        @media (max-width: 420px) {
          .register-role-grid {
            grid-template-columns: 1fr;
          }
          .register-role-card {
            min-height: auto;
            text-align: left;
          }
          .register-role-icon {
            display: inline-block;
            margin: 0 10px 0 0;
            vertical-align: middle;
          }
          .register-role-label {
            display: inline-block;
            vertical-align: middle;
          }
          .register-role-description {
            margin-top: 8px;
          }
        }
      `}</style>
      <main className="register-page">
        <section className="register-visual">
          <div className="register-brand">
            <span className="register-brand-mark">
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
          <div className="register-visual-content">
            <h1>
              Work that moves
              <br />
              <em>with clarity.</em>
            </h1>
            <p className="register-visual-copy">
              Keep every job, customer, site, and service commitment connected
              before the day gets noisy.
            </p>
          </div>
          <div className="register-signal-card">
            <div className="register-signal-orb">
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
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 1 11 14z" />
              </svg>
            </div>
            <div className="register-signal-content">
              <strong>Field teams stay aligned</strong>
              <span>Schedules, work orders, and updates in one place</span>
            </div>
            <div className="register-signal-check">
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
        <section className="register-panel">
          <div className="register-card">
            <div className="register-stepper">
              {stepDot(1)}
              <span
                className={[
                  'register-step-label',
                  step === 1 ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Account
              </span>
              <div
                className={[
                  'register-step-line',
                  step > 1 ? 'is-done' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              {stepDot(2)}
              <span
                className={[
                  'register-step-label',
                  step === 2 ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Role
              </span>
              <div
                className={[
                  'register-step-line',
                  step > 2 ? 'is-done' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              {stepDot(3)}
              <span
                className={[
                  'register-step-label',
                  step === 3 ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Setup
              </span>
            </div>
            {step === 1 && (
              <>
                <h2 className="register-card-title">Create your account</h2>
                <p className="register-card-description">
                  Set up your access to the field service workspace.
                </p>
                <form className="register-form" onSubmit={handleStep1}>
                  <label className="register-form-label" htmlFor="name">
                    Full name
                    <input
                      id="name"
                      name="name"
                      className="register-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="register-form-label" htmlFor="email">
                    Email address
                    <input
                      id="email"
                      name="email"
                      className="register-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="register-form-label" htmlFor="password">
                    Password
                    <div className="register-password-wrap">
                      <input
                        id="password"
                        name="password"
                        className="register-input"
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a secure password"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="register-icon-btn"
                        aria-label={
                          showPwd ? 'Hide password' : 'Show password'
                        }
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
                    <PasswordStrength password={password} />
                  </label>
                  {error && (
                    <div className="register-error" role="alert">
                      {error}
                    </div>
                  )}
                  <button className="register-primary-btn" type="submit">
                    Continue
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
                  </button>
                </form>
                <p className="register-account-link">
                  Already have an account?{' '}
                  <Link to="/login">Sign in</Link>
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="register-card-title">Choose your role</h2>
                <p className="register-card-description">
                  Select the access level that matches how you work.
                </p>
                <div className="register-role-grid">
                  {ROLES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="register-role-card"
                      onClick={() => {
                        setRole(item.value);
                        setStep(3);
                      }}
                    >
                      <div className="register-role-icon">{item.icon}</div>
                      <div className="register-role-label">{item.label}</div>
                      <div className="register-role-description">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="register-back-btn"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <div className="register-setup-heading">
                  <div className="register-selected-role-icon">
                    {selectedRole?.icon}
                  </div>
                  <div>
                    <h2 className="register-setup-title">
                      {role === 'MANAGER'
                        ? 'Set up your workspace'
                        : role === 'CUSTOMER'
                          ? 'Almost done'
                          : 'Join your team'}
                    </h2>
                    <p className="register-setup-description">
  {role === 'MANAGER'
    ? 'Name your organization'
    : role === 'CUSTOMER'
      ? 'Your account is ready'
      : 'Enter your team invite code'}
</p>
                  </div>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                  {role === 'MANAGER' && (
                    <label
                      className="register-form-label"
                      htmlFor="organization-name"
                    >
                      Organization name

                      <input
                        id="organization-name"
                        name="organizationName"
                        className="register-input"
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Your organization name"
                        autoComplete="organization"
                        required
                      />

                      <span className="register-field-note">
                        An invite code will be generated for your team.
                      </span>
                    </label>
                  )}

                  {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                    <label
                      className="register-form-label"
                      htmlFor="invite-code"
                    >
                      Team invite code

                      <input
                        id="invite-code"
                        name="inviteCode"
                        className="register-input register-invite-input"
                        type="text"
                        value={inviteCode}
                        onChange={(e) =>
                          setInviteCode(e.target.value.toUpperCase())
                        }
                        placeholder="TEAM-CODE"
                        autoComplete="off"
                        required
                      />

                      <span className="register-field-note">
                        Get this code from your manager.
                      </span>
                    </label>
                  )}

                  {role === 'CUSTOMER' && (
                    <div className="register-customer-note">
                      Your customer account will be created. A service manager
                      can connect you to the appropriate workspace when your
                      first job is scheduled.
                    </div>
                  )}

                  {error && (
                    <div className="register-error" role="alert">
                      {error}
                    </div>
                  )}

                  <button
                    className="register-primary-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}

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

                <button
                  type="button"
                  className="register-back-btn"
                  onClick={() => setStep(2)}
                >
                  ← Change role
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}