import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

interface WorkOrder {
  id: number;
  code: string;
  title: string;
  status: string;
  priority: string;
  slaStatus: string;
  customerName: string;
  siteName: string;
  assignedToName: string | null;
  slaDueAt: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  newCount: number;
  assignedCount: number;
  inProgressCount: number;
  onHoldCount: number;
  completedCount: number;
  closedCount: number;
  breachedCount: number;
  atRiskCount: number;
}

interface HistoryItem {
  fromStatus: string;
  toStatus: string;
  changedByName: string;
  changedAt: string;
  note: string;
}

interface PartItem {
  partName: string;
  qtyUsed: number;
  totalCost: number;
}

interface Customer {
  id: number;
  name: string;
  contactEmail: string | null;
  createdAt: string;
}

interface Site {
  id: number;
  name: string;
  address: string | null;
  customerId: number;
  customerName?: string;
}

interface PartRow {
  sku: string;
  name: string;
  unitCost: number;
  stockQty: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

type Page = 'dashboard' | 'workorders' | 'customers' | 'sites' | 'sla' | 'timelogs' | 'parts' | 'team' | 'wo-detail';

const TERMINAL_STATUSES = ['CLOSED', 'CANCELLED'];

// Hybrid glassmorphism + neomorphism: a colorful frosted-glass surface (strong blur +
// bright tint + glowing border) layered on top of a soft neomorphic shadow pair, sitting
// on a light, airy gradient backdrop so the blur actually has something to diffuse.
const PAGE_BG = 'radial-gradient(circle at 15% 0%, #dbe9ff 0%, transparent 45%), radial-gradient(circle at 85% 15%, #ffe3f1 0%, transparent 40%), radial-gradient(circle at 50% 100%, #dcfce7 0%, transparent 45%), linear-gradient(135deg, #eef2fb 0%, #f7f2fb 50%, #eefbf5 100%)';

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 20,
  boxShadow: '10px 10px 22px rgba(148,163,196,0.35), -8px -8px 18px rgba(255,255,255,0.9), inset 0 1px 0 rgba(255,255,255,0.7)',
};

const insetStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.35)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.6)',
  borderRadius: 16,
  boxShadow: 'inset 5px 5px 12px rgba(148,163,196,0.35), inset -4px -4px 10px rgba(255,255,255,0.8)',
};

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.75)',
  borderRadius: 12,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '5px 5px 12px rgba(148,163,196,0.35), -4px -4px 10px rgba(255,255,255,0.85)',
  transition: 'all 0.18s ease',
};

// Distinct accent colors per nav section so the sidebar isn't a wall of one color.
const NAV_ACCENTS: Record<string, { color: string; bg: string; glow: string }> = {
  dashboard:  { color: '#4f46e5', bg: 'rgba(79,70,229,0.14)',  glow: 'rgba(79,70,229,0.35)' },
  workorders: { color: '#2563eb', bg: 'rgba(37,99,235,0.14)',  glow: 'rgba(37,99,235,0.35)' },
  customers:  { color: '#0d9488', bg: 'rgba(13,148,136,0.14)', glow: 'rgba(13,148,136,0.35)' },
  sites:      { color: '#db2777', bg: 'rgba(219,39,119,0.14)', glow: 'rgba(219,39,119,0.35)' },
  sla:        { color: '#dc2626', bg: 'rgba(220,38,38,0.14)',  glow: 'rgba(220,38,38,0.35)' },
  timelogs:   { color: '#9333ea', bg: 'rgba(147,51,234,0.14)', glow: 'rgba(147,51,234,0.35)' },
  parts:      { color: '#d97706', bg: 'rgba(217,119,6,0.14)',  glow: 'rgba(217,119,6,0.35)' },
  team:       { color: '#16a34a', bg: 'rgba(22,163,74,0.14)',  glow: 'rgba(22,163,74,0.35)' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  NEW: { bg: '#ebf4ff', color: '#3182ce' },
  ASSIGNED: { bg: '#fef3c7', color: '#d97706' },
  IN_PROGRESS: { bg: '#dcfce7', color: '#16a34a' },
  ON_HOLD: { bg: '#fff7ed', color: '#ea580c' },
  COMPLETED: { bg: '#f3e8ff', color: '#7c3aed' },
  CLOSED: { bg: '#f1f5f9', color: '#64748b' },
  CANCELLED: { bg: '#fee2e2', color: '#dc2626' },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  URGENT: { bg: '#fee2e2', color: '#dc2626' },
  HIGH: { bg: '#fff7ed', color: '#ea580c' },
  MEDIUM: { bg: '#fef3c7', color: '#d97706' },
  LOW: { bg: '#dcfce7', color: '#16a34a' },
};

const SLA_COLORS: Record<string, { color: string }> = {
  'ON_TRACK': { color: '#16a34a' },
  'AT_RISK': { color: '#d97706' },
  'BREACHED': { color: '#dc2626' },
  'N/A': { color: '#94a3b8' },
};

const PART_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  IN_STOCK: { bg: '#dcfce7', color: '#16a34a', label: 'In Stock' },
  LOW_STOCK: { bg: '#fef3c7', color: '#d97706', label: 'Low Stock' },
  OUT_OF_STOCK: { bg: '#fee2e2', color: '#dc2626', label: 'Out of Stock' },
};

function Pill({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 6,
      fontSize: 11, fontWeight: 700,
      background: bg, color,
    }}>{text.replace('_', ' ')}</span>
  );
}

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' };
  return <Pill text={status.replace('_', ' ')} bg={c.bg} color={c.color} />;
}

function PriorityPill({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] || { bg: '#f1f5f9', color: '#64748b' };
  return <Pill text={priority} bg={c.bg} color={c.color} />;
}

function SlaText({ slaStatus }: { slaStatus: string }) {
  const c = SLA_COLORS[slaStatus] || { color: '#94a3b8' };
  return <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{slaStatus?.replace('_', ' ') || 'N/A'}</span>;
}

function fmt(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Pulls a human-readable message out of whatever shape an API error takes,
// instead of blindly stringifying an object (which produced "[object Object]").
function extractErrorMessage(e: any, fallback: string): string {
  const data = e?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (Array.isArray(data.errors) && data.errors.length) return data.errors.join(', ');
  }
  if (typeof e?.message === 'string' && e.message.trim()) return e.message;
  return fallback;
}

export default function WorkOrderList() {
  const { email, role, organizationName, inviteCode, logout } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [woHistory, setWoHistory] = useState<HistoryItem[]>([]);
  const [woParts, setWoParts] = useState<PartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [partsInventory, setPartsInventory] = useState<PartRow[]>([]);
  const [slaOrders, setSlaOrders] = useState<WorkOrder[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreateWO, setShowCreateWO] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showCreateSite, setShowCreateSite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [woSearch, setWoSearch] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [woForm, setWoForm] = useState({ title: '', description: '', priority: 'MEDIUM', customerId: '', siteId: '' });
  const [custForm, setCustForm] = useState({ name: '', contactEmail: '' });
  const [siteForm, setSiteForm] = useState({ customerId: '', name: '', address: '' });
  const [siteCustomerFilter, setSiteCustomerFilter] = useState<string>('all');

  useEffect(() => { loadDashboard(); loadAllCustomersAndSitesForForms(); }, []);

  const setLoad = (key: string, val: boolean) => setLoading(prev => ({ ...prev, [key]: val }));
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Keeps the "Customer ID" / "Site ID" dropdowns in the create modals populated,
  // regardless of which page the user is currently viewing.
  const loadAllCustomersAndSitesForForms = async () => {
    try {
      const [custRes, siteRes] = await Promise.all([
        client.get('/customers?size=200').then(r => r.data.content || []),
        client.get('/sites?size=200').then(r => r.data.content || []),
      ]);
      setCustomers(custRes);
      setAllSites(siteRes);
    } catch (e) { console.error(e); }
  };

  const loadDashboard = async () => {
    setLoad('dashboard', true);
    try {
      const [sum, wo] = await Promise.all([
        client.get('/reports/summary').then(r => r.data),
        client.get('/work-orders?size=5').then(r => r.data.content || []),
      ]);
      setSummary(sum);
      setWorkOrders(wo);
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to load dashboard'));
    } finally { setLoad('dashboard', false); }
  };

  const loadWorkOrders = async () => {
    setLoad('workorders', true);
    try {
      const res = await client.get('/work-orders?size=50');
      setWorkOrders(res.data.content || []);
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to load work orders'));
    } finally { setLoad('workorders', false); }
  };

  const loadCustomers = async () => {
    setLoad('customers', true);
    try {
      const res = await client.get('/customers?size=50');
      setCustomers(res.data.content || []);
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to load customers'));
    } finally { setLoad('customers', false); }
  };

  // Fixed: previously hardcoded to customerId=1, which hid every other customer's sites.
  const loadSites = async (customerId?: string) => {
    setLoad('sites', true);
    try {
      const filter = customerId && customerId !== 'all' ? `&customerId=${customerId}` : '';
      const res = await client.get(`/sites?size=200${filter}`);
      setSites(res.data.content || []);
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to load sites'));
    } finally { setLoad('sites', false); }
  };

  // SLA tab previously reused whatever was already in `workOrders`, which could be
  // a stale/partial dashboard snapshot. Now it fetches its own full set.
  const loadSlaOrders = async () => {
    setLoad('sla', true);
    try {
      const res = await client.get('/work-orders?size=200');
      setSlaOrders(res.data.content || []);
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to load SLA data'));
    } finally { setLoad('sla', false); }
  };

  // Parts inventory previously rendered static hardcoded rows. Falls back to that
  // sample data only if the endpoint isn't available, so the tab still works either way.
  const loadPartsInventory = async () => {
    setLoad('parts', true);
    try {
      const res = await client.get('/parts/inventory');
      setPartsInventory(res.data || []);
    } catch (e) {
      console.warn('Parts inventory endpoint unavailable, using fallback sample data', e);
      setPartsInventory([
        { sku: 'REF-410A', name: 'Refrigerant R410A (lb)', unitCost: 45.00, stockQty: 100, status: 'IN_STOCK' },
        { sku: 'CAP-355', name: 'Capacitor 35/5 MFD', unitCost: 22.50, stockQty: 49, status: 'IN_STOCK' },
        { sku: 'FLT-2020', name: 'Air Filter 20×20', unitCost: 15.00, stockQty: 200, status: 'IN_STOCK' },
        { sku: 'CON-40A', name: 'Contactor 40A', unitCost: 38.00, stockQty: 5, status: 'LOW_STOCK' },
      ]);
    } finally { setLoad('parts', false); }
  };

  const openWODetail = async (wo: WorkOrder) => {
    setSelectedWO(wo);
    setPage('wo-detail');
    setWoHistory([]);
    setWoParts([]);
    try {
      const [hist, parts] = await Promise.all([
        client.get(`/work-orders/${wo.id}/history`).then(r => r.data),
        client.get(`/work-orders/${wo.id}/parts`).then(r => r.data),
      ]);
      setWoHistory(hist);
      setWoParts(parts);
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to load work order details'));
    }
  };

  const navTo = (p: Page) => {
    setPage(p);
    if (p === 'dashboard') loadDashboard();
    else if (p === 'workorders') loadWorkOrders();
    else if (p === 'customers') loadCustomers();
    else if (p === 'sites') loadSites(siteCustomerFilter);
    else if (p === 'sla') loadSlaOrders();
    else if (p === 'parts') loadPartsInventory();
  };

  const createWO = async () => {
    if (!woForm.title.trim()) { showToast('Title is required'); return; }
    if (!woForm.customerId || !woForm.siteId) { showToast('Please choose a customer and site'); return; }
    try {
      await client.post('/work-orders', {
        title: woForm.title, description: woForm.description,
        priority: woForm.priority,
        customerId: parseInt(woForm.customerId),
        siteId: parseInt(woForm.siteId),
      });
      setShowCreateWO(false);
      setWoForm({ title: '', description: '', priority: 'MEDIUM', customerId: '', siteId: '' });
      showToast('Work order created!');
      loadWorkOrders(); loadDashboard();
    } catch (e: any) { showToast(extractErrorMessage(e, 'Failed to create work order')); }
  };

  const createCustomer = async () => {
    if (!custForm.name.trim()) { showToast('Company name is required'); return; }
    try {
      await client.post('/customers', custForm);
      setShowCreateCustomer(false);
      setCustForm({ name: '', contactEmail: '' });
      showToast('Customer added!');
      loadCustomers();
      loadAllCustomersAndSitesForForms();
    } catch (e: any) { showToast(extractErrorMessage(e, 'Failed to create customer')); }
  };

  const createSite = async () => {
    if (!siteForm.name.trim()) { showToast('Site name is required'); return; }
    if (!siteForm.customerId) { showToast('Please choose a customer'); return; }
    try {
      await client.post('/sites', { ...siteForm, customerId: parseInt(siteForm.customerId) });
      setShowCreateSite(false);
      setSiteForm({ customerId: '', name: '', address: '' });
      showToast('Site added!');
      loadSites(siteCustomerFilter);
      loadAllCustomersAndSitesForForms();
    } catch (e: any) { showToast(extractErrorMessage(e, 'Failed to create site')); }
  };

  const copyInvite = () => {
    if (inviteCode && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          showToast('Invite code copied!');
        })
        .catch(() => showToast('Could not copy — please copy it manually'));
    } else {
      showToast('Clipboard unavailable — please copy it manually');
    }
  };

  const filteredWO = workOrders.filter(w =>
    w.title.toLowerCase().includes(woSearch.toLowerCase()) ||
    w.code.toLowerCase().includes(woSearch.toLowerCase()) ||
    (w.customerName || '').toLowerCase().includes(woSearch.toLowerCase())
  );

  // Only offer sites belonging to the chosen customer in the "create work order" modal.
  const sitesForWoCustomer = allSites.filter(s => !woForm.customerId || String(s.customerId) === woForm.customerId);

  const neuInput: React.CSSProperties = {
    width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.5)', outline: 'none',
    background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px) saturate(160%)', WebkitBackdropFilter: 'blur(10px) saturate(160%)',
    fontFamily: 'inherit', fontSize: 14, color: '#2d3748',
    borderRadius: 12,
    boxShadow: 'inset 3px 3px 7px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.7)',
    boxSizing: 'border-box' as const,
  };

  // Invite code is a privileged, shareable-only-with-staff secret. Gate it the same
  // way everywhere it appears (previously the Team tab showed it to any role).
  const canSeeInvite = role === 'MANAGER';

  // ── SIDEBAR ──
  const NavButton = ({ id, label, icon }: { id: Page; label: string; icon: string }) => {
    const accent = NAV_ACCENTS[id] || NAV_ACCENTS.dashboard;
    const active = page === id;
    return (
      <button key={id} onClick={() => navTo(id)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', fontSize: 13, width: '100%', textAlign: 'left',
        border: active ? `1px solid ${accent.color}55` : '1px solid rgba(255,255,255,0.5)',
        borderRadius: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: active ? accent.color : '#475569',
        fontWeight: active ? 700 : 500,
        background: active
          ? `linear-gradient(135deg, ${accent.bg}, rgba(255,255,255,0.55))`
          : 'rgba(255,255,255,0.32)',
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        boxShadow: active
          ? `inset 3px 3px 8px rgba(148,163,196,0.3), inset -2px -2px 6px rgba(255,255,255,0.8), 0 0 0 1px ${accent.glow} inset, 0 4px 14px ${accent.glow}`
          : '3px 3px 8px rgba(148,163,196,0.25), -2px -2px 6px rgba(255,255,255,0.75)',
        transition: 'all 0.18s ease',
      }}>
        <span style={{
          fontSize: 16, width: 26, height: 26, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? `${accent.color}22` : 'transparent',
        }}>{icon}</span> {label}
      </button>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase',
      letterSpacing: 1.1, padding: '14px 10px 6px', marginTop: 4,
    }}>{children}</div>
  );

  const Sidebar = () => (
    <div style={{
      width: 226, background: 'rgba(255,255,255,0.4)',
      backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderRight: '1px solid rgba(255,255,255,0.7)',
      flexShrink: 0,
      padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 6,
      boxShadow: '6px 0 24px rgba(148,163,196,0.2)',
    }}>
      <NavButton id="dashboard" label="Dashboard" icon="📊" />
      <NavButton id="workorders" label="Work Orders" icon="📋" />
      <NavButton id="customers" label="Customers" icon="🏢" />
      <NavButton id="sites" label="Sites" icon="📍" />

      <SectionLabel>Reports</SectionLabel>
      <NavButton id="sla" label="SLA Tracking" icon="⏱️" />
      <NavButton id="timelogs" label="Time Logs" icon="🕐" />
      <NavButton id="parts" label="Parts" icon="🔩" />

      <SectionLabel>Settings</SectionLabel>
      <NavButton id="team" label="Team" icon="👥" />
    </div>
  );

  // ── TOPBAR ──
  const Topbar = () => (
    <div style={{
      height: 62, background: 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.7)',
      flexShrink: 0,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
      boxShadow: '0 6px 24px rgba(148,163,196,0.25)',
      position: 'relative', zIndex: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 16, fontWeight: 700,
        boxShadow: '3px 3px 8px rgba(163,177,198,0.6), -2px -2px 6px rgba(255,255,255,0.9)',
      }}>K</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#2d3748' }}>KEYSTONE</div>
      {organizationName && <>
        <div style={{ color: '#a0aec0', fontSize: 14 }}>·</div>
        <div style={{ fontSize: 13, color: '#718096' }}>{organizationName}</div>
      </>}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {canSeeInvite && inviteCode && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowInvite(!showInvite)} style={{
              ...btnStyle, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#667eea',
            }}>🔑 {inviteCode}</button>

            {showInvite && (
              <div style={{
                position: 'absolute', right: 0, top: 48, zIndex: 100,
                width: 280, padding: 20,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(22px) saturate(170%)', WebkitBackdropFilter: 'blur(22px) saturate(170%)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: 18,
                boxShadow: '10px 10px 24px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.8)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2d3748', marginBottom: 4 }}>Team Invite Code</div>
                <div style={{ fontSize: 11, color: '#a0aec0', marginBottom: 12 }}>Share with Dispatchers & Technicians only</div>
                <div style={{
                  ...insetStyle, padding: '14px 16px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 5, color: '#667eea' }}>{inviteCode}</span>
                </div>
                <button onClick={copyInvite} style={{
                  ...btnStyle, width: '100%', padding: '10px',
                  background: copied ? '#22c55e' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', fontSize: 13, fontWeight: 700,
                  boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                }}>
                  {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
                <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 10, fontWeight: 600 }}>⚠️ Never share with customers</div>
              </div>
            )}
          </div>
        )}

        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 13, fontWeight: 700,
          boxShadow: '3px 3px 8px rgba(163,177,198,0.6), -2px -2px 6px rgba(255,255,255,0.9)',
        }}>{email?.charAt(0).toUpperCase()}</div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#2d3748' }}>{email}</div>
          <div style={{ fontSize: 10, color: '#667eea', fontWeight: 600 }}>{role}</div>
        </div>

        <button onClick={logout} style={{ ...btnStyle, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#e53e3e' }}>Sign out</button>
      </div>
    </div>
  );

  // ── STAT CARD ──
  const StatCard = ({ icon, label, value, sub, subColor }: { icon: string; label: string; value: number | string; sub: string; subColor: string }) => (
    <div style={{ ...cardStyle, padding: '20px 18px' }}>
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#2d3748', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: subColor }}>{sub}</div>
    </div>
  );

  // ── TABLE ──
  const Table = ({ cols, rows, empty }: { cols: string[]; rows: React.ReactNode[][]; empty: string }) => (
    <div style={{ overflowX: 'auto' as const }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(163,177,198,0.1)' }}>
            {cols.map(c => (
              <th key={c} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 40, color: '#a0aec0', fontSize: 13 }}>{empty}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(163,177,198,0.15)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '12px 16px', fontSize: 13, color: '#4a5568' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── MODAL ──
  const Modal = ({ title, onClose, onSubmit, children }: { title: string; onClose: () => void; onSubmit: () => void; children: React.ReactNode }) => (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(30,41,59,0.18)',
      backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...cardStyle, padding: 28, width: '100%', maxWidth: 480,
        background: 'rgba(255,255,255,0.65)',
        boxShadow: '16px 16px 36px rgba(163,177,198,0.55), -8px -8px 20px rgba(255,255,255,0.85)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#2d3748', marginBottom: 20 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...btnStyle, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#718096' }}>Cancel</button>
          <button onClick={onSubmit} style={{
            ...btnStyle, padding: '9px 18px', fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
            boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
          }}>Submit</button>
        </div>
      </div>
    </div>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 7, display: 'block' }}>{children}</label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: PAGE_BG, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Topbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748' }}>Dashboard</div>
                  <div style={{ fontSize: 13, color: '#a0aec0', marginTop: 3 }}>Good morning — here's what's happening today</div>
                </div>
                <button onClick={() => setShowCreateWO(true)} style={{
                  ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
                  boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                }}>+ New Work Order</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <StatCard icon="📋" label="Total Open" value={(summary?.newCount||0)+(summary?.assignedCount||0)+(summary?.inProgressCount||0)+(summary?.onHoldCount||0)} sub="Across all statuses" subColor="#38a169" />
                <StatCard icon="⚡" label="In Progress" value={summary?.inProgressCount??'—'} sub="Active now" subColor="#38a169" />
                <StatCard icon="🚨" label="SLA Breached" value={summary?.breachedCount??'—'} sub={(summary?.breachedCount||0)===0?'All clear ✓':'Needs action'} subColor={(summary?.breachedCount||0)===0?'#38a169':'#e53e3e'} />
                <StatCard icon="✅" label="Closed" value={summary?.closedCount??'—'} sub="Completed" subColor="#38a169" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <StatCard icon="🟡" label="On Hold" value={summary?.onHoldCount??'—'} sub="Awaiting action" subColor="#d97706" />
                <StatCard icon="⚠️" label="SLA At Risk" value={summary?.atRiskCount??'—'} sub="Monitor closely" subColor="#d97706" />
              </div>

              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(163,177,198,0.2)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>Recent Work Orders</div>
                  <button onClick={() => navTo('workorders')} style={{ ...btnStyle, padding: '6px 12px', fontSize: 12, color: '#667eea', fontWeight: 600 }}>View all →</button>
                </div>
                <Table
                  cols={['Code', 'Title', 'Status', 'Priority', 'SLA']}
                  empty={loading.dashboard ? 'Loading…' : 'No work orders yet'}
                  rows={workOrders.slice(0,5).map(w => [
                    <span style={{ fontFamily: 'monospace', color: '#667eea', fontSize: 12, fontWeight: 700 }}>{w.code}</span>,
                    <span style={{ fontWeight: 600, color: '#2d3748', cursor: 'pointer' }} onClick={() => openWODetail(w)}>{w.title}</span>,
                    <StatusPill status={w.status} />,
                    <PriorityPill priority={w.priority} />,
                    <SlaText slaStatus={w.slaStatus} />,
                  ])}
                />
              </div>
            </>
          )}

          {/* ── WORK ORDERS ── */}
          {page === 'workorders' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748' }}>Work Orders</div>
                  <div style={{ fontSize: 13, color: '#a0aec0', marginTop: 3 }}>{workOrders.length} total in your workspace</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input value={woSearch} onChange={e => setWoSearch(e.target.value)} placeholder="🔍 Search..." style={{ ...neuInput, width: 220 }} />
                  <button onClick={() => setShowCreateWO(true)} style={{
                    ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white',
                    boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                  }}>+ New</button>
                </div>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['Code', 'Title', 'Status', 'Priority', 'SLA', 'Customer', 'Site', 'Assigned To']}
                  empty={loading.workorders ? 'Loading…' : 'No work orders found'}
                  rows={filteredWO.map(w => [
                    <span style={{ fontFamily: 'monospace', color: '#667eea', fontSize: 12, fontWeight: 700 }}>{w.code}</span>,
                    <span style={{ fontWeight: 600, color: '#667eea', cursor: 'pointer', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => openWODetail(w)}>{w.title}</span>,
                    <StatusPill status={w.status} />,
                    <PriorityPill priority={w.priority} />,
                    <SlaText slaStatus={w.slaStatus} />,
                    w.customerName || '—',
                    w.siteName || '—',
                    w.assignedToName || <span style={{ color: '#a0aec0' }}>Unassigned</span>,
                  ])}
                />
              </div>
            </>
          )}

          {/* ── CUSTOMERS ── */}
          {page === 'customers' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748' }}>Customers</div>
                  <div style={{ fontSize: 13, color: '#a0aec0', marginTop: 3 }}>Manage client organizations</div>
                </div>
                <button onClick={() => setShowCreateCustomer(true)} style={{ ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', boxShadow: '4px 4px 12px rgba(102,126,234,0.4)' }}>+ Add Customer</button>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['ID', 'Name', 'Contact Email', 'Created']}
                  empty={loading.customers ? 'Loading…' : 'No customers yet'}
                  rows={customers.map(c => [
                    <span style={{ color: '#667eea', fontWeight: 700 }}>#{c.id}</span>,
                    <span style={{ fontWeight: 600, color: '#2d3748' }}>{c.name}</span>,
                    c.contactEmail || '—',
                    fmt(c.createdAt),
                  ])}
                />
              </div>
            </>
          )}

          {/* ── SITES ── */}
          {page === 'sites' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748' }}>Sites</div>
                  <div style={{ fontSize: 13, color: '#a0aec0', marginTop: 3 }}>Building locations where work happens</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <select
                    value={siteCustomerFilter}
                    onChange={e => { setSiteCustomerFilter(e.target.value); loadSites(e.target.value); }}
                    style={{ ...neuInput, width: 200, appearance: 'none' }}
                  >
                    <option value="all">All customers</option>
                    {customers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setShowCreateSite(true)} style={{ ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', boxShadow: '4px 4px 12px rgba(102,126,234,0.4)' }}>+ Add Site</button>
                </div>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['ID', 'Name', 'Customer', 'Address']}
                  empty={loading.sites ? 'Loading…' : 'No sites yet'}
                  rows={sites.map(s => [
                    <span style={{ color: '#667eea', fontWeight: 700 }}>#{s.id}</span>,
                    <span style={{ fontWeight: 600, color: '#2d3748' }}>{s.name}</span>,
                    s.customerName || '—',
                    s.address || '—',
                  ])}
                />
              </div>
            </>
          )}

          {/* ── SLA ── */}
          {page === 'sla' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 4 }}>SLA Tracking</div>
              <div style={{ fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>Monitor service level compliance</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                <StatCard icon="🟢" label="On Track" value={((summary?.newCount||0)+(summary?.assignedCount||0)+(summary?.inProgressCount||0)+(summary?.onHoldCount||0))-(summary?.atRiskCount||0)-(summary?.breachedCount||0)} sub="Meeting SLA" subColor="#38a169" />
                <StatCard icon="🟡" label="At Risk" value={summary?.atRiskCount??'—'} sub="Within 2hrs of breach" subColor="#d97706" />
                <StatCard icon="🔴" label="Breached" value={summary?.breachedCount??'—'} sub="Past SLA deadline" subColor="#e53e3e" />
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['Code', 'Title', 'Priority', 'SLA Due', 'SLA Status', 'Current Status']}
                  empty={loading.sla ? 'Loading…' : 'No active work orders'}
                  rows={slaOrders.filter(w => !TERMINAL_STATUSES.includes(w.status)).map(w => [
                    <span style={{ fontFamily: 'monospace', color: '#667eea', fontSize: 12, fontWeight: 700 }}>{w.code}</span>,
                    <span style={{ fontWeight: 600, color: '#2d3748' }}>{w.title}</span>,
                    <PriorityPill priority={w.priority} />,
                    <span style={{ fontSize: 12, color: '#718096' }}>{fmt(w.slaDueAt)}</span>,
                    <SlaText slaStatus={w.slaStatus} />,
                    <StatusPill status={w.status} />,
                  ])}
                />
              </div>
            </>
          )}

          {/* ── TIME LOGS ── */}
          {page === 'timelogs' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 4 }}>Time Logs</div>
              <div style={{ fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>Technician time tracked per work order</div>
              <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🕐</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4a5568', marginBottom: 8 }}>Time logs per work order</div>
                <div style={{ fontSize: 13, color: '#a0aec0' }}>Open a work order to view its time log entries</div>
              </div>
            </>
          )}

          {/* ── PARTS ── */}
          {page === 'parts' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 4 }}>Parts Inventory</div>
              <div style={{ fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>Track parts stock and usage</div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['SKU', 'Name', 'Unit Cost', 'Stock Qty', 'Status']}
                  empty={loading.parts ? 'Loading…' : 'No parts found'}
                  rows={partsInventory.map(p => {
                    const s = PART_STATUS_COLORS[p.status] || { bg: '#f1f5f9', color: '#64748b', label: p.status };
                    return [
                      <span style={{ fontFamily: 'monospace', color: '#667eea', fontWeight: 700 }}>{p.sku}</span>,
                      <span style={{ fontWeight: 600, color: '#2d3748' }}>{p.name}</span>,
                      `$${p.unitCost.toFixed(2)}`,
                      String(p.stockQty),
                      <Pill text={s.label} bg={s.bg} color={s.color} />,
                    ];
                  })}
                />
              </div>
            </>
          )}

          {/* ── TEAM ── */}
          {page === 'team' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 4 }}>Team</div>
              <div style={{ fontSize: 13, color: '#a0aec0', marginBottom: 20 }}>Members in your organization workspace</div>
              <div style={{ ...cardStyle, padding: 28 }}>
                {canSeeInvite ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Your Workspace Invite Code</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div style={{ ...insetStyle, flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, letterSpacing: 6, color: '#667eea' }}>{inviteCode || 'N/A'}</span>
                      </div>
                      <button onClick={copyInvite} style={{ ...btnStyle, padding: '12px 18px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', boxShadow: '4px 4px 12px rgba(102,126,234,0.4)' }}>
                        {copied ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: '#a0aec0' }}>Share this code with Dispatchers and Technicians only. Customers should not receive this code.</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: '#a0aec0' }}>Only Managers can view and share the workspace invite code.</div>
                )}
              </div>
            </>
          )}

          {/* ── WO DETAIL ── */}
          {page === 'wo-detail' && selectedWO && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <button onClick={() => { setPage('workorders'); loadWorkOrders(); }} style={{ ...btnStyle, padding: '7px 14px', fontSize: 12, color: '#718096', marginBottom: 10 }}>← Back to Work Orders</button>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#2d3748' }}>{selectedWO.code} — {selectedWO.title}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* main card */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontFamily: 'monospace', color: '#667eea', fontSize: 13, fontWeight: 700 }}>{selectedWO.code}</span>
                      <StatusPill status={selectedWO.status} />
                      <PriorityPill priority={selectedWO.priority} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#2d3748', marginBottom: 10 }}>{selectedWO.title} — {selectedWO.siteName}</div>
                    <div style={{ fontSize: 14, color: '#718096', lineHeight: 1.6 }}>{selectedWO.description || 'No description provided.'}</div>
                  </div>

                  {/* history */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>Status History</div>
                    {woHistory.length === 0 ? (
                      <div style={{ color: '#a0aec0', fontSize: 13, marginBottom: TERMINAL_STATUSES.includes(selectedWO.status) ? 0 : 14 }}>No history yet</div>
                    ) : woHistory.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: '#38a169', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                            boxShadow: '3px 3px 7px rgba(163,177,198,0.5), -2px -2px 5px rgba(255,255,255,0.9)',
                          }}>✓</div>
                          {i < woHistory.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(163,177,198,0.3)', marginTop: 4, minHeight: 14 }} />}
                        </div>
                        <div style={{ paddingTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>{h.fromStatus || '—'} → {h.toStatus} · {h.changedByName || 'system'}</div>
                          <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>{fmt(h.changedAt)}</div>
                          {h.note && <div style={{ fontSize: 12, color: '#718096', fontStyle: 'italic', marginTop: 3 }}>"{h.note}"</div>}
                        </div>
                      </div>
                    ))}

                    {/* current pending — only meaningful when the work order can still transition */}
                    {!TERMINAL_STATUSES.includes(selectedWO.status) && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: '#e8ecf1', color: '#d97706',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                          boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -1px -1px 3px rgba(255,255,255,0.9)',
                        }}>●</div>
                        <div style={{ paddingTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>Awaiting next transition</div>
                          <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>Current</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* right panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Details</div>
                    {[
                      ['Customer', selectedWO.customerName || '—'],
                      ['Site', selectedWO.siteName || '—'],
                      ['Assigned', selectedWO.assignedToName || 'Unassigned'],
                      ['SLA Due', fmt(selectedWO.slaDueAt)],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
                        <span style={{ color: '#a0aec0' }}>{k}</span>
                        <span style={{ color: '#2d3748', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>SLA Status</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: '#a0aec0' }}>Status</span>
                      <SlaText slaStatus={selectedWO.slaStatus} />
                    </div>
                  </div>

                  <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Parts Used</div>
                    {woParts.length === 0 ? (
                      <div style={{ color: '#a0aec0', fontSize: 13 }}>No parts logged</div>
                    ) : (
                      <>
                        {woParts.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: '#718096' }}>{p.partName} ×{p.qtyUsed}</span>
                            <span style={{ color: '#2d3748', fontWeight: 600 }}>${p.totalCost}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(163,177,198,0.3)', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: '#a0aec0' }}>Total</span>
                          <span style={{ fontWeight: 700, color: '#2d3748' }}>${woParts.reduce((a, p) => a + parseFloat(String(p.totalCost) || '0'), 0).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── MODALS ── */}
      {showCreateWO && (
        <Modal title="Create Work Order" onClose={() => setShowCreateWO(false)} onSubmit={createWO}>
          <div><FieldLabel>Title</FieldLabel><input value={woForm.title} onChange={e => setWoForm({...woForm, title: e.target.value})} placeholder="Brief description" style={neuInput} /></div>
          <div><FieldLabel>Description</FieldLabel><textarea value={woForm.description} onChange={e => setWoForm({...woForm, description: e.target.value})} placeholder="Detailed description..." rows={3} style={{ ...neuInput, resize: 'vertical' as const }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><FieldLabel>Priority</FieldLabel>
              <select value={woForm.priority} onChange={e => setWoForm({...woForm, priority: e.target.value})} style={{ ...neuInput, appearance: 'none' }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div><FieldLabel>Customer</FieldLabel>
              <select
                value={woForm.customerId}
                onChange={e => setWoForm({ ...woForm, customerId: e.target.value, siteId: '' })}
                style={{ ...neuInput, appearance: 'none' }}
              >
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><FieldLabel>Site</FieldLabel>
            <select
              value={woForm.siteId}
              onChange={e => setWoForm({ ...woForm, siteId: e.target.value })}
              style={{ ...neuInput, appearance: 'none' }}
              disabled={!woForm.customerId}
            >
              <option value="">{woForm.customerId ? 'Select site…' : 'Choose a customer first'}</option>
              {sitesForWoCustomer.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {showCreateCustomer && (
        <Modal title="Add Customer" onClose={() => setShowCreateCustomer(false)} onSubmit={createCustomer}>
          <div><FieldLabel>Company Name</FieldLabel><input value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} placeholder="e.g. Meridian Facilities" style={neuInput} /></div>
          <div><FieldLabel>Contact Email</FieldLabel><input type="email" value={custForm.contactEmail} onChange={e => setCustForm({...custForm, contactEmail: e.target.value})} placeholder="ops@company.com" style={neuInput} /></div>
        </Modal>
      )}

      {showCreateSite && (
        <Modal title="Add Site" onClose={() => setShowCreateSite(false)} onSubmit={createSite}>
          <div><FieldLabel>Customer</FieldLabel>
            <select value={siteForm.customerId} onChange={e => setSiteForm({...siteForm, customerId: e.target.value})} style={{ ...neuInput, appearance: 'none' }}>
              <option value="">Select customer…</option>
              {customers.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div><FieldLabel>Site Name</FieldLabel><input value={siteForm.name} onChange={e => setSiteForm({...siteForm, name: e.target.value})} placeholder="e.g. Downtown Office Tower" style={neuInput} /></div>
          <div><FieldLabel>Address</FieldLabel><input value={siteForm.address} onChange={e => setSiteForm({...siteForm, address: e.target.value})} placeholder="123 Main St" style={neuInput} /></div>
        </Modal>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 400,
          padding: '12px 20px', borderRadius: 14,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(18px) saturate(170%)', WebkitBackdropFilter: 'blur(18px) saturate(170%)',
          border: '1px solid rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: 600, color: '#38a169',
          boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -4px -4px 12px rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ {toast}
        </div>
      )}

      {/* close invite on outside click */}
      {showInvite && <div onClick={() => setShowInvite(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />}
    </div>
  );
}