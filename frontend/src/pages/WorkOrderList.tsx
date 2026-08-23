import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

interface WorkOrder {
  id: number;
  code: string;
  title: string;
  status: string;
  priority: string;
  customerName: string;
  siteName: string;
  assignedToName: string | null;
  slaStatus: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: '#667eea',
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#22c55e',
  ON_HOLD: '#f97316',
  COMPLETED: '#8b5cf6',
  CLOSED: '#6b7280',
  CANCELLED: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const SLA_COLORS: Record<string, string> = {
  ON_TRACK: '#22c55e',
  AT_RISK: '#f59e0b',
  BREACHED: '#ef4444',
  'N/A': '#6b7280',
};

export default function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const { email, role, organizationName, inviteCode, logout } = useAuth();

  useEffect(() => {
    client.get('/work-orders')
      .then(res => setWorkOrders(res.data.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badge = (text: string, color: string) => (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600
    }}>
      {text}
    </span>
  );

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#0d1117',
      fontFamily: "'Segoe UI', sans-serif", color: 'white'
    }}>

      {/* topbar */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
          }}>⚙️</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>KEYSTONE</span>
          {organizationName && (
            <>
              <span style={{ color: '#4a5568', fontSize: 14 }}>·</span>
              <span style={{ color: '#8892a4', fontSize: 14 }}>{organizationName}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {role === 'MANAGER' && inviteCode && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowInviteCode(!showInviteCode)} style={{
                background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)',
                borderRadius: 8, padding: '6px 12px', color: '#667eea',
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
                🔑 Team Invite Code
              </button>
              {showInviteCode && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, zIndex: 100,
                  background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: 20, width: 280,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
                }}>
                  <p style={{ color: '#8892a4', fontSize: 12, margin: '0 0 10px' }}>
                    Share this code with your team members (Dispatchers & Technicians)
                  </p>
                  <div style={{
                    background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.3)',
                    borderRadius: 8, padding: '12px 14px', marginBottom: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#667eea' }}>
                      {inviteCode}
                    </span>
                  </div>
                  <button onClick={copyInviteCode} style={{
                    width: '100%', padding: '9px',
                    background: copied ? '#22c55e' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none', borderRadius: 8, color: 'white',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                  }}>
                    {copied ? '✓ Copied!' : 'Copy Code'}
                  </button>
                  <p style={{ color: '#4a5568', fontSize: 11, margin: '10px 0 0', textAlign: 'center' }}>
                    Never share this with customers
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700
            }}>
              {email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{email}</div>
              <div style={{ fontSize: 11, color: '#667eea' }}>{role}</div>
            </div>
          </div>

          <button onClick={logout} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, padding: '6px 12px', color: '#ef4444',
            fontSize: 13, cursor: 'pointer'
          }}>
            Sign out
          </button>
        </div>
      </div>

      {/* content */}
      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Work Orders</h2>
            <p style={{ margin: '4px 0 0', color: '#8892a4', fontSize: 14 }}>
              {workOrders.length} total · manage and track field service jobs
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#8892a4' }}>Loading work orders...</div>
        ) : workOrders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80,
            background: 'rgba(255,255,255,0.03)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ color: 'white', margin: '0 0 8px' }}>No work orders yet</h3>
            <p style={{ color: '#8892a4', margin: 0, fontSize: 14 }}>Work orders will appear here once created</p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Code', 'Title', 'Status', 'Priority', 'SLA', 'Customer', 'Site', 'Assigned To'].map(h => (
                    <th key={h} style={{
                      padding: '14px 16px', textAlign: 'left',
                      fontSize: 12, fontWeight: 600, color: '#8892a4',
                      textTransform: 'uppercase', letterSpacing: 0.5
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo, i) => (
                  <tr key={wo.id} style={{
                    borderBottom: i < workOrders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#667eea', fontWeight: 600 }}>{wo.code}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wo.title}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{badge(wo.status, STATUS_COLORS[wo.status] || '#6b7280')}</td>
                    <td style={{ padding: '14px 16px' }}>{badge(wo.priority, PRIORITY_COLORS[wo.priority] || '#6b7280')}</td>
                    <td style={{ padding: '14px 16px' }}>{badge(wo.slaStatus || 'N/A', SLA_COLORS[wo.slaStatus] || '#6b7280')}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#b0bac9' }}>{wo.customerName}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#b0bac9' }}>{wo.siteName}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: wo.assignedToName ? '#b0bac9' : '#4a5568' }}>
                      {wo.assignedToName || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}