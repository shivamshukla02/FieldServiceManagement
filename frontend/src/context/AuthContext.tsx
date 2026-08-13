import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const login = (newToken: string, newEmail: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
    localStorage.setItem('role', newRole);
    setToken(newToken);
    setEmail(newEmail);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setEmail(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}