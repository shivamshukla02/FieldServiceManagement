import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const REGISTER_BACKGROUND =
  '/attached_assets/ChatGPT_Image_Sep_12,_2026,_12_17_40_PM_1789196335766.png';

const ROLES = [
  {
    value: 'MANAGER',
    label: 'Manager',
    description: 'Create workspace, manage team and view all reports',
    icon: '▥',
    tone: 'purple',
  },
  {
    value: 'DISPATCHER',
    label: 'Dispatcher',
    description: 'Create and assign work orders to technicians',
    icon: '▤',
    tone: 'orange',
  },
  {
    value: 'TECHNICIAN',
    label: 'Technician',
    description: 'View and update your assigned field jobs',
    icon: '⌕',
    tone: 'green',
  },
  {
    value: 'CUSTOMER',
    label: 'Customer',
    description: 'Raise requests and track service status',
    icon: '♣',
    tone: 'blue',
  },
] as const;

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

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    {
      label: '8+ chars',
      valid: password.length >= 8,
    },
    {
      label: 'Uppercase',
      valid: /[A-Z]/.test(password),
    },
    {
      label: 'Lowercase',
      valid: /[a-z]/.test(password),
    },
    {
      label: 'Number',
      valid: /[0-9]/.test(password),
    },
  ];

  const score = checks.filter((check) => check.valid).length;

  return (
    <div className="password-strength" aria-live="polite">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={bar <= score ? `strength-${score}` : ''}
          />
        ))}
      </div>

      <div className="strength-checks">
        {checks.map((check) => (
          <span
            key={check.label}
            className={check.valid ? 'valid' : ''}
          >
            {check.valid ? '✓' : '○'} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div
      className="progress"
      aria-label={`Registration step ${step} of 3`}
    >
      <div
        className={`progress-node ${
          step > 1 ? 'complete' : step === 1 ? 'active' : ''
        }`}
      >
        {step > 1 ? '✓' : '1'}
      </div>

      <div className={`progress-line ${step > 1 ? 'complete' : ''}`} />

      <div
        className={`progress-node ${
          step > 2 ? 'complete' : step === 2 ? 'active' : ''
        }`}
      >
        {step > 2 ? '✓' : '2'}
      </div>

      <div className={`progress-line ${step > 2 ? 'complete' : ''}`} />

      <div className={`progress-node ${step === 3 ? 'active' : ''}`}>
        3
      </div>
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  const handleAccountStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!passwordValid) {
      setError('Password must meet all requirements');
      return;
    }

    setStep(2);
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setError('');
    setStep(3);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (role === 'MANAGER' && !organizationName.trim()) {
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
      const response = await client.post('/auth/register', {
        name,
        email,
        password,
        role,
        organizationName:
          role === 'MANAGER' ? organizationName : undefined,
        inviteCode:
          role === 'DISPATCHER' || role === 'TECHNICIAN'
            ? inviteCode.toUpperCase()
            : undefined,
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
    } catch (requestError: any) {
      const message =
        typeof requestError?.response?.data === 'string'
          ? requestError.response.data
          : 'Registration failed';

      setError(message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page register-page">
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

        .register-page {
          background:
            linear-gradient(90deg, rgba(238, 247, 255, .08), rgba(242, 247, 255, .16)),
            url("${REGISTER_BACKGROUND}") center / cover no-repeat;
        }

        .auth-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: rgba(235, 244, 255, .05);
          pointer-events: none;
        }

        .register-card {
          width: min(100%, 440px);
          box-sizing: border-box;
          padding: 24px 22px 20px;
          border: 1px solid rgba(255, 255, 255, .78);
          border-radius: 15px;
          background: rgba(248, 251, 255, .82);
          box-shadow:
            0 18px 45px rgba(38, 67, 112, .13),
            inset 0 1px rgba(255, 255, 255, .72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: width .2s ease;
        }

        .register-title {
          margin: 0 0 15px;
          color: #091638;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -.02em;
        }

        .progress {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 18px;
        }

        .progress-node {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
          display: grid;
          place-items: center;
          box-sizing: border-box;
          border: 1px solid #d5ddeb;
          border-radius: 50%;
          background: rgba(255, 255, 255, .72);
          color: #6e7c94;
          font-size: 8px;
          font-weight: 750;
        }

        .progress-node.active {
          border-color: #5a4de5;
          background: #5a4de5;
          color: white;
          box-shadow: 0 3px 8px rgba(90, 77, 229, .2);
        }

        .progress-node.complete {
          border-color: #2cbd79;
          background: #2cbd79;
          color: white;
        }

        .progress-line {
          height: 1px;
          flex: 1;
          margin: 0 6px;
          background: #dce3ef;
        }

        .progress-line.complete {
          background: #2cbd79;
        }

        .section-title {
          margin: 0 0 3px;
          color: #132044;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 750;
        }

        .section-description {
          margin: 0 0 12px;
          color: #718098;
          font-size: 8px;
          line-height: 1.4;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .role-card {
          min-height: 77px;
          position: relative;
          padding: 10px;
          border: 1px solid rgba(222, 229, 240, .95);
          border-radius: 8px;
          background: rgba(255, 255, 255, .46);
          color: #14203d;
          text-align: left;
          cursor: pointer;
          transition:
            border-color .18s ease,
            box-shadow .18s ease,
            transform .18s ease,
            background .18s ease;
        }

        .role-card:hover,
        .role-card.selected {
          border-color: #9e98ed;
          background: rgba(251, 251, 255, .8);
          box-shadow: 0 4px 12px rgba(90, 77, 229, .08);
          transform: translateY(-1px);
        }

        .role-icon {
          width: 21px;
          height: 21px;
          display: grid;
          place-items: center;
          margin-bottom: 5px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 800;
        }

        .role-icon.purple {
          background: #e6dcff;
          color: #6e4bc6;
        }

        .role-icon.orange {
          background: #ffead5;
          color: #df7b22;
        }

        .role-icon.green {
          background: #d7f4e6;
          color: #239867;
        }

        .role-icon.blue {
          background: #d9ebff;
          color: #3f81ca;
        }

        .role-name {
          display: block;
          margin-bottom: 3px;
          font-size: 9px;
          font-weight: 750;
        }

        .role-description {
          display: block;
          max-width: 145px;
          color: #718098;
          font-size: 7px;
          line-height: 1.35;
        }

        .role-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 13px;
          height: 13px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #5a4de5;
          color: white;
          font-size: 8px;
          font-weight: 800;
        }

        .field {
          margin-bottom: 11px;
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
          min-height: 27px;
          box-sizing: border-box;
          padding: 0 8px;
          border: 1px solid rgba(197, 207, 225, .85);
          border-radius: 6px;
          background: rgba(255, 255, 255, .65);
          color: #96a2b4;
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
          padding: 6px 7px;
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

        .password-strength {
          margin-top: 6px;
        }

        .strength-bars {
          display: flex;
          gap: 3px;
          margin-bottom: 5px;
        }

        .strength-bars span {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: #e2e8f0;
        }

        .strength-bars span.strength-1 {
          background: #ef4444;
        }

        .strength-bars span.strength-2 {
          background: #f97316;
        }

        .strength-bars span.strength-3 {
          background: #eab308;
        }

        .strength-bars span.strength-4 {
          background: #22c55e;
        }

        .strength-checks {
          display: flex;
          flex-wrap: wrap;
          gap: 5px 9px;
        }

        .strength-checks span {
          color: #94a3b8;
          font-size: 7px;
          font-weight: 550;
        }

        .strength-checks span.valid {
          color: #22a66a;
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

        .primary-button {
          width: 100%;
          min-height: 27px;
          border: 0;
          border-radius: 6px;
          background: linear-gradient(100deg, #6554ee, #5551e9);
          color: white;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(91, 77, 231, .2);
          transition: transform .18s ease, filter .18s ease;
        }

        .primary-button:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .text-button {
          margin-top: 13px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #718098;
          font: inherit;
          font-size: 8px;
          cursor: pointer;
        }

        .text-button:hover {
          color: #5549dd;
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

        .setup-note {
          margin: 0 0 13px;
          padding: 10px;
          border: 1px solid rgba(222, 229, 240, .95);
          border-radius: 7px;
          background: rgba(255, 255, 255, .45);
          color: #596881;
          font-size: 8px;
          line-height: 1.45;
        }

        .invite-input {
          text-align: center;
          letter-spacing: .16em;
          font-weight: 750;
        }

        @media (min-width: 560px) {
          .register-card {
            padding: 30px 28px 24px;
          }

          .register-title {
            font-size: 20px;
            margin-bottom: 20px;
          }

          .progress {
            margin-bottom: 23px;
          }

          .progress-node {
            width: 23px;
            height: 23px;
            flex-basis: 23px;
            font-size: 10px;
          }

          .section-title {
            font-size: 17px;
          }

          .section-description {
            font-size: 10px;
            margin-bottom: 16px;
          }

          .role-grid {
            gap: 12px;
          }

          .role-card {
            min-height: 108px;
            padding: 14px;
          }

          .role-icon {
            width: 28px;
            height: 28px;
            font-size: 17px;
            margin-bottom: 7px;
          }

          .role-name {
            font-size: 12px;
          }

          
                  .role-description {
          display: block;
          max-width: 145px;
          color: #718098;
          font-size: 7px;
          line-height: 1.35;
        }

        .role-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 13px;
          height: 13px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #5a4de5;
          color: white;
          font-size: 8px;
          font-weight: 800;
        }

        .field {
          margin-bottom: 11px;
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
          min-height: 27px;
          box-sizing: border-box;
          padding: 0 8px;
          border: 1px solid rgba(197, 207, 225, .85);
          border-radius: 6px;
          background: rgba(255, 255, 255, .65);
          color: #96a2b4;
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
          padding: 6px 7px;
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

        .password-strength {
          margin-top: 6px;
        }

        .strength-bars {
          display: flex;
          gap: 3px;
          margin-bottom: 5px;
        }

        .strength-bars span {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: #e2e8f0;
        }

        .strength-bars span.strength-1 {
          background: #ef4444;
        }

        .strength-bars span.strength-2 {
          background: #f97316;
        }

        .strength-bars span.strength-3 {
          background: #eab308;
        }

        .strength-bars span.strength-4 {
          background: #22c55e;
        }

        .strength-checks {
          display: flex;
          flex-wrap: wrap;
          gap: 5px 9px;
        }

        .strength-checks span {
          color: #94a3b8;
          font-size: 7px;
          font-weight: 550;
        }

        .strength-checks span.valid {
          color: #22a66a;
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

        .primary-button {
          width: 100%;
          min-height: 27px;
          border: 0;
          border-radius: 6px;
          background: linear-gradient(100deg, #6554ee, #5551e9);
          color: white;
          font: inherit;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(91, 77, 231, .2);
          transition: transform .18s ease, filter .18s ease;
        }

        .primary-button:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .text-button {
          margin-top: 13px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #718098;
          font: inherit;
          font-size: 8px;
          cursor: pointer;
        }

        .text-button:hover {
          color: #5549dd;
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

        .setup-note {
          margin: 0 0 13px;
          padding: 10px;
          border: 1px solid rgba(222, 229, 240, .95);
          border-radius: 7px;
          background: rgba(255, 255, 255, .45);
          color: #596881;
          font-size: 8px;
          line-height: 1.45;
        }

        .invite-input {
          text-align: center;
          letter-spacing: .16em;
          font-weight: 750;
        }

        @media (min-width: 560px) {
          .register-card {
            padding: 30px 28px 24px;
          }

          .register-title {
            font-size: 20px;
            margin-bottom: 20px;
          }

          .progress {
            margin-bottom: 23px;
          }

          .progress-node {
            width: 23px;
            height: 23px;
            flex-basis: 23px;
            font-size: 10px;
          }

          .section-title {
            font-size: 17px;
          }

          .section-description {
            font-size: 10px;
            margin-bottom: 16px;
          }

          .role-grid {
            gap: 12px;
          }

          .role-card {
            min-height: 108px;
            padding: 14px;
          }

          .role-icon {
            width: 28px;
            height: 28px;
            font-size: 17px;
            margin-bottom: 7px;
          }

          .role-name {
            font-size: 12px;
          }

          .role-description {
            font-size: 9px;
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

          .primary-button {
            min-height: 34px;
            border-radius: 8px;
            font-size: 11px;
          }

          .text-button,
          .auth-footer {
            font-size: 10px;
          }
        }

        @media (max-width: 360px) {
          .role-card {
            min-height: 90px;
            padding: 8px;
          }

          .role-description {
            font-size: 7px;
          }
        }
      `}</style>

      <section className="register-card" aria-labelledby="register-heading">
        <h1 id="register-heading" className="register-title">
          Create your account
        </h1>

        <Progress step={step} />

        {step === 1 && (
          <form onSubmit={handleAccountStep} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="register-name">
                Full name
              </label>

              <div className="input-shell">
                <input
                  id="register-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Smith"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-email">
                Email address
              </label>

              <div className="input-shell">
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-password">
                Password
              </label>

              <div className="input-shell">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min 8 chars, uppercase, number"
                  autoComplete="new-password"
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

              <PasswordStrength password={password} />
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button className="primary-button" type="submit">
              Continue
            </button>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <div>
            <h2 className="section-title">
              Choose your role
            </h2>

            <p className="section-description">
              This sets your access level across the platform
            </p>

            <div className="role-grid">
              {ROLES.map((item) => (
                <button
                  key={item.value}
                  className={`role-card ${
                    role === item.value ? 'selected' : ''
                  }`}
                  type="button"
                  onClick={() => handleRoleSelect(item.value)}
                >
                  {role === item.value && (
                    <span className="role-check">
                      ✓
                    </span>
                  )}

                  <span className={`role-icon ${item.tone}`}>
                    {item.icon}
                  </span>

                  <span className="role-name">
                    {item.label}
                  </span>

                  <span className="role-description">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="text-button"
              type="button"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="section-title">
              {role === 'MANAGER'
                ? 'Set up your workspace'
                : role === 'CUSTOMER'
                  ? 'Almost done!'
                  : 'Join your team'}
            </h2>

            <p className="section-description">
              {role === 'MANAGER'
                ? 'Name your organization to begin.'
                : role === 'CUSTOMER'
                  ? 'Your account is ready.'
                  : 'Enter your team invite code.'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {role === 'MANAGER' && (
                <div className="field">
                  <label
                    className="field-label"
                    htmlFor="organization-name"
                  >
                    Organization name
                  </label>

                  <div className="input-shell">
                    <input
                      id="organization-name"
                      value={organizationName}
                      onChange={(event) =>
                        setOrganizationName(event.target.value)
                      }
                      placeholder="e.g. Apex Facilities Management"
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>
              )}

              {(role === 'DISPATCHER' || role === 'TECHNICIAN') && (
                <div className="field">
                  <label className="field-label" htmlFor="invite-code">
                    Team invite code
                  </label>

                  <div className="input-shell">
                    <input
                      id="invite-code"
                      className="invite-input"
                      value={inviteCode}
                      onChange={(event) =>
                        setInviteCode(event.target.value.toUpperCase())
                      }
                      placeholder="KST-XXXX"
                      required
                    />
                  </div>

                  <p className="section-description">
                    Get this code from your manager.
                  </p>
                </div>
              )}

              {role === 'CUSTOMER' && (
                <p className="setup-note">
                  Your customer account will be created. A service manager will
                  link you to the appropriate workspace when they set up your
                  first job.
                </p>
              )}

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <button
              className="text-button"
              type="button"
              onClick={() => setStep(2)}
            >
              ← Change role
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
