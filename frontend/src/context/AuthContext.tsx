import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  organizationId: string | null;
  organizationName: string | null;
  inviteCode: string | null;
  login: (token: string, email: string, role: string, orgId?: string, orgName?: string, inviteCode?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [organizationId, setOrganizationId] = useState<string | null>(localStorage.getItem('organizationId'));
  const [organizationName, setOrganizationName] = useState<string | null>(localStorage.getItem('organizationName'));
  const [inviteCode, setInviteCode] = useState<string | null>(localStorage.getItem('inviteCode'));

  const login = (newToken: string, newEmail: string, newRole: string, orgId?: string, orgName?: string, newInviteCode?: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
    localStorage.setItem('role', newRole);
    if (orgId) localStorage.setItem('organizationId', orgId);
    if (orgName) localStorage.setItem('organizationName', orgName);
    if (newInviteCode) localStorage.setItem('inviteCode', newInviteCode);
    setToken(newToken);
    setEmail(newEmail);
    setRole(newRole);
    setOrganizationId(orgId || null);
    setOrganizationName(orgName || null);
    setInviteCode(newInviteCode || null);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setEmail(null);
    setRole(null);
    setOrganizationId(null);
    setOrganizationName(null);
    setInviteCode(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, role, organizationId, organizationName, inviteCode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}