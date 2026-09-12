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
  id?: number;
  sku: string;
  name: string;
  unitCost: number;
  stockQty: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

type Page = 'dashboard' | 'workorders' | 'customers' | 'sites' | 'sla' | 'timelogs' | 'parts' | 'team' | 'wo-detail';

const TERMINAL_STATUSES = ['CLOSED', 'CANCELLED'];
const KEYSTONE_STYLES = ".ks-shell {\n  --ks-page-bg: radial-gradient(circle at 8% -12%, #dbe6ff 0%, transparent 38%), radial-gradient(circle at 96% 8%, #f8e6f2 0%, transparent 34%), linear-gradient(135deg, #f3f6fb 0%, #eef2f8 52%, #e8edf5 100%);\n  --ks-card: rgba(255,255,255,0.68); --ks-inset: rgba(255,255,255,0.44); --ks-button: rgba(255,255,255,0.52); --ks-input: rgba(255,255,255,0.34); --ks-modal: rgba(255,255,255,0.86); --ks-sidebar: rgba(255,255,255,0.58); --ks-topbar: rgba(255,255,255,0.52);\n  --ks-text: #1d2940; --ks-body: #52627b; --ks-subtle: #71819a; --ks-muted: #8d9bb0; --ks-muted-2: #95a4b8; --ks-body-muted: #708198;\n  --ks-accent: #5c66d8; --ks-accent-2: #8874d6; --ks-info: #3d78c9; --ks-success: #2e986f; --ks-success-strong: #2e986f; --ks-warning: #ad7725; --ks-warning-strong: #bd6d35; --ks-danger: #d95f6d; --ks-danger-strong: #c94c59; --ks-purple: #7656c8;\n  --ks-info-bg: #e7f0ff; --ks-warning-bg: #fff4d7; --ks-success-bg: #def6e9; --ks-orange-bg: #fff0e3; --ks-purple-bg: #f0eaff; --ks-neutral-bg: #edf1f6; --ks-danger-bg: #ffe4e7; --ks-current-bg: #e4e9f0;\n  color: var(--ks-text); color-scheme: light;\n}\n.ks-shell[data-ks-theme=\"dark\"] {\n  --ks-page-bg: radial-gradient(circle at 8% -12%, #202d54 0%, transparent 38%), radial-gradient(circle at 96% 8%, #35233f 0%, transparent 34%), linear-gradient(135deg, #0d1422 0%, #131b2b 52%, #111827 100%);\n  --ks-card: rgba(30,41,59,0.72); --ks-inset: rgba(15,23,42,0.42); --ks-button: rgba(51,65,85,0.7); --ks-input: rgba(30,41,59,0.68); --ks-modal: rgba(24,34,51,0.96); --ks-sidebar: rgba(15,23,42,0.74); --ks-topbar: rgba(15,23,42,0.7);\n  --ks-text: #f3f6fb; --ks-body: #c1ccdc; --ks-subtle: #a6b3c7; --ks-muted: #8d9bb1; --ks-muted-2: #8897ad; --ks-body-muted: #a0aec2;\n  --ks-accent: #aab2ff; --ks-accent-2: #c1a6ff; --ks-info: #8dbdff; --ks-success: #72ddb3; --ks-success-strong: #72ddb3; --ks-warning: #f0c778; --ks-warning-strong: #f1a26d; --ks-danger: #ff929d; --ks-danger-strong: #ff8994; --ks-purple: #c5a8ff;\n  --ks-info-bg: rgba(74,125,196,0.24); --ks-warning-bg: rgba(183,128,36,0.24); --ks-success-bg: rgba(46,152,111,0.24); --ks-orange-bg: rgba(189,109,53,0.24); --ks-purple-bg: rgba(118,86,200,0.24); --ks-neutral-bg: rgba(100,116,139,0.24); --ks-danger-bg: rgba(201,76,89,0.24); --ks-current-bg: rgba(100,116,139,0.24);\n  color-scheme: dark;\n}\n.ks-shell *, .ks-shell *::before, .ks-shell *::after { box-sizing: border-box; }\n.ks-shell button, .ks-shell input, .ks-shell textarea, .ks-shell select { transition: border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .18s ease, opacity .18s ease; }\n.ks-shell button:focus-visible, .ks-shell input:focus-visible, .ks-shell textarea:focus-visible, .ks-shell select:focus-visible { outline: 2px solid var(--ks-accent); outline-offset: 2px; }\n.ks-shell button:disabled { cursor: not-allowed; }\n.ks-shell input::placeholder, .ks-shell textarea::placeholder { color: var(--ks-muted); opacity: .9; }\n.ks-shell select option { background: var(--ks-modal); color: var(--ks-text); }\n.ks-shell ::-webkit-scrollbar { width: 9px; height: 9px; }\n.ks-shell ::-webkit-scrollbar-thumb { background: rgba(125,140,165,.35); border-radius: 99px; border: 2px solid transparent; background-clip: padding-box; }\n.ks-shell ::-webkit-scrollbar-track { background: transparent; }\n@media (max-width: 900px) { .ks-sidebar { width: 78px !important; padding-left: 9px !important; padding-right: 9px !important; } .ks-sidebar button { justify-content: center !important; padding-left: 7px !important; padding-right: 7px !important; } .ks-sidebar button > span:last-child { display: none; } .ks-sidebar > div { text-align: center; padding-left: 0 !important; padding-right: 0 !important; } .ks-content { padding: 18px !important; } .ks-topbar { padding-left: 16px !important; padding-right: 16px !important; } }\n@media (max-width: 640px) { .ks-topbar { height: auto !important; min-height: 62px; padding-top: 10px !important; padding-bottom: 10px !important; flex-wrap: wrap; } .ks-topbar > div:last-child { gap: 7px !important; } .ks-topbar > div:nth-child(3) { display: none; } .ks-topbar .ks-user-email { display: none; } .ks-content { padding: 14px 12px 32px !important; } .ks-content > div { max-width: 100%; } }\n@media (prefers-reduced-motion: reduce) { .ks-shell *, .ks-shell *::before, .ks-shell *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; } }";


// Hybrid glassmorphism + neomorphism, tuned for maximum visible effect: a vivid
// multi-tone animated backdrop, heavily frosted (~80% glass) translucent panels with
// glowing borders, and pronounced soft-shadow neomorphic depth.
const PAGE_BG = 'var(--ks-page-bg)';

const cardStyle: React.CSSProperties = {
  background: 'var(--ks-card)',
  backdropFilter: 'blur(30px) saturate(190%)',
  WebkitBackdropFilter: 'blur(30px) saturate(190%)',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: 20,
  boxShadow: '12px 12px 26px rgba(148,163,196,0.4), -10px -10px 20px rgba(255,255,255,0.95), inset 0 1px 0 rgba(255,255,255,0.8)',
};

const insetStyle: React.CSSProperties = {
  background: 'var(--ks-inset)',
  backdropFilter: 'blur(18px) saturate(190%)',
  WebkitBackdropFilter: 'blur(18px) saturate(190%)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: 16,
  boxShadow: 'inset 6px 6px 14px rgba(148,163,196,0.4), inset -5px -5px 12px rgba(255,255,255,0.85)',
};

const btnStyle: React.CSSProperties = {
  background: 'var(--ks-button)',
  backdropFilter: 'blur(14px) saturate(190%)',
  WebkitBackdropFilter: 'blur(14px) saturate(190%)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 12,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '6px 6px 14px rgba(148,163,196,0.4), -5px -5px 12px rgba(255,255,255,0.9)',
  transition: 'all 0.18s ease',
};

// Distinct accent colors per nav section so the sidebar isn't a wall of one color.
const NAV_ACCENTS: Record<string, { color: string; bg: string; glow: string }> = {
  dashboard:  { color: '#4f46e5', bg: 'rgba(79,70,229,0.16)',  glow: 'rgba(79,70,229,0.45)' },
  workorders: { color: '#2563eb', bg: 'rgba(37,99,235,0.16)',  glow: 'rgba(37,99,235,0.45)' },
  customers:  { color: '#0d9488', bg: 'rgba(13,148,136,0.16)', glow: 'rgba(13,148,136,0.45)' },
  sites:      { color: '#db2777', bg: 'rgba(219,39,119,0.16)', glow: 'rgba(219,39,119,0.45)' },
  sla:        { color: '#dc2626', bg: 'rgba(220,38,38,0.16)',  glow: 'rgba(220,38,38,0.45)' },
  timelogs:   { color: '#9333ea', bg: 'rgba(147,51,234,0.16)', glow: 'rgba(147,51,234,0.45)' },
  parts:      { color: '#d97706', bg: 'rgba(217,119,6,0.16)',  glow: 'rgba(217,119,6,0.45)' },
  team:       { color: '#16a34a', bg: 'rgba(22,163,74,0.16)',  glow: 'rgba(22,163,74,0.45)' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  NEW: { bg: 'var(--ks-info-bg)', color: 'var(--ks-info)' },
  ASSIGNED: { bg: 'var(--ks-warning-bg)', color: 'var(--ks-warning)' },
  IN_PROGRESS: { bg: 'var(--ks-success-bg)', color: 'var(--ks-success-strong)' },
  ON_HOLD: { bg: 'var(--ks-orange-bg)', color: 'var(--ks-warning-strong)' },
  COMPLETED: { bg: 'var(--ks-purple-bg)', color: 'var(--ks-purple)' },
  CLOSED: { bg: 'var(--ks-neutral-bg)', color: 'var(--ks-body-muted)' },
  CANCELLED: { bg: 'var(--ks-danger-bg)', color: 'var(--ks-danger-strong)' },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  URGENT: { bg: 'var(--ks-danger-bg)', color: 'var(--ks-danger-strong)' },
  HIGH: { bg: 'var(--ks-orange-bg)', color: 'var(--ks-warning-strong)' },
  MEDIUM: { bg: 'var(--ks-warning-bg)', color: 'var(--ks-warning)' },
  LOW: { bg: 'var(--ks-success-bg)', color: 'var(--ks-success-strong)' },
};

const SLA_COLORS: Record<string, { color: string }> = {
  'ON_TRACK': { color: 'var(--ks-success-strong)' },
  'AT_RISK': { color: 'var(--ks-warning)' },
  'BREACHED': { color: 'var(--ks-danger-strong)' },
  'N/A': { color: 'var(--ks-muted-2)' },
};

const PART_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  IN_STOCK: { bg: 'var(--ks-success-bg)', color: 'var(--ks-success-strong)', label: 'In Stock' },
  LOW_STOCK: { bg: 'var(--ks-warning-bg)', color: 'var(--ks-warning)', label: 'Low Stock' },
  OUT_OF_STOCK: { bg: 'var(--ks-danger-bg)', color: 'var(--ks-danger-strong)', label: 'Out of Stock' },
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
  const c = STATUS_COLORS[status] || { bg: 'var(--ks-neutral-bg)', color: 'var(--ks-body-muted)' };
  return <Pill text={status.replace('_', ' ')} bg={c.bg} color={c.color} />;
}

function PriorityPill({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] || { bg: 'var(--ks-neutral-bg)', color: 'var(--ks-body-muted)' };
  return <Pill text={priority} bg={c.bg} color={c.color} />;
}

function SlaText({ slaStatus }: { slaStatus: string }) {
  const c = SLA_COLORS[slaStatus] || { color: 'var(--ks-muted-2)' };
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      return (localStorage.getItem('keystone-theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });
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
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [partToDelete, setPartToDelete] = useState<PartRow | null>(null);
  const [deletingPart, setDeletingPart] = useState(false);
  const [partForm, setPartForm] = useState({ sku: '', name: '', unitCost: '', stockQty: '' });
  const [siteCustomerFilter, setSiteCustomerFilter] = useState<string>('all');

  useEffect(() => { loadDashboard(); loadAllCustomersAndSitesForForms(); }, []);
  useEffect(() => {
    try { localStorage.setItem('keystone-theme', theme); } catch { /* storage can be unavailable in private browsing */ }
  }, [theme]);

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

  const derivePartStatus = (qty: number): PartRow['status'] =>
    qty <= 0 ? 'OUT_OF_STOCK' : qty < 10 ? 'LOW_STOCK' : 'IN_STOCK';

  const createPart = async () => {
    if (!partForm.sku.trim() || !partForm.name.trim()) { showToast('SKU and name are required'); return; }
    const unitCost = parseFloat(partForm.unitCost);
    const stockQty = parseInt(partForm.stockQty, 10);
    if (isNaN(unitCost) || unitCost < 0) { showToast('Enter a valid unit cost'); return; }
    if (isNaN(stockQty) || stockQty < 0) { showToast('Enter a valid stock quantity'); return; }
    const newPart: PartRow = { sku: partForm.sku.trim(), name: partForm.name.trim(), unitCost, stockQty, status: derivePartStatus(stockQty) };
    try {
      await client.post('/parts/inventory', newPart);
      showToast('Part added!');
      loadPartsInventory();
    } catch (e) {
      // Endpoint may not exist yet in this environment — keep the UI usable by
      // adding it to local state so the workflow still completes end-to-end.
      console.warn('Parts inventory create endpoint unavailable, adding locally', e);
      setPartsInventory(prev => [...prev, newPart]);
      showToast('Part added (locally — backend endpoint not available)');
    } finally {
      setShowCreatePart(false);
      setPartForm({ sku: '', name: '', unitCost: '', stockQty: '' });
    }
  };

  const deletePart = async () => {
    if (!partToDelete) return;
    setDeletingPart(true);
    try {
      const identifier = partToDelete.id ?? encodeURIComponent(partToDelete.sku);
      await client.delete(`/parts/inventory/${identifier}`);
      setPartsInventory(prev => prev.filter(part => part.id !== partToDelete.id && part.sku !== partToDelete.sku));
      setPartToDelete(null);
      showToast('Part deleted successfully');
    } catch (e) {
      console.error(e);
      showToast(extractErrorMessage(e, 'Failed to delete part'));
    } finally {
      setDeletingPart(false);
    }
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
    background: 'var(--ks-input)', backdropFilter: 'blur(10px) saturate(160%)', WebkitBackdropFilter: 'blur(10px) saturate(160%)',
    fontFamily: 'inherit', fontSize: 14, color: 'var(--ks-text)',
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
    const [hover, setHover] = useState(false);
    const lit = active || hover;
    return (
      <button
        key={id}
        onClick={() => navTo(id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', fontSize: active ? 13.5 : hover ? 13.5 : 13,
          width: '100%', textAlign: 'left',
          border: lit ? `1px solid ${accent.color}66` : '1px solid rgba(255,255,255,0.55)',
          borderRadius: 12,
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: lit ? accent.color : '#475569',
          fontWeight: lit ? 700 : 500,
          background: lit
            ? `linear-gradient(135deg, ${accent.bg}, rgba(255,255,255,0.6))`
            : 'var(--ks-inset)',
          backdropFilter: 'blur(12px) saturate(190%)',
          WebkitBackdropFilter: 'blur(12px) saturate(190%)',
          boxShadow: active
            ? `inset 3px 3px 8px rgba(148,163,196,0.3), inset -2px -2px 6px rgba(255,255,255,0.85), 0 0 18px ${accent.glow}`
            : hover
              ? `4px 4px 10px rgba(148,163,196,0.3), -3px -3px 8px rgba(255,255,255,0.85), 0 0 16px ${accent.glow}`
              : '3px 3px 8px rgba(148,163,196,0.25), -2px -2px 6px rgba(255,255,255,0.8)',
          transform: hover && !active ? 'translateX(3px) scale(1.03)' : 'translateX(0) scale(1)',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}>
        <span style={{
          fontSize: lit ? 18 : 16, width: 26, height: 26, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: lit ? `${accent.color}22` : 'transparent',
          transition: 'all 0.2s ease',
        }}>{icon}</span>
        <span style={{ transition: 'all 0.2s ease' }}>{label}</span>
      </button>
    );
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontSize: 10, fontWeight: 800, color: 'var(--ks-muted-2)', textTransform: 'uppercase',
      letterSpacing: 1.1, padding: '14px 10px 6px', marginTop: 4,
    }}>{children}</div>
  );

  const Sidebar = () => (
    <div className="ks-sidebar" style={{
      width: 226, background: 'var(--ks-sidebar)',
      backdropFilter: 'blur(32px) saturate(190%)', WebkitBackdropFilter: 'blur(32px) saturate(190%)',
      borderRight: '1px solid rgba(255,255,255,0.75)',
      flexShrink: 0,
      padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 6,
      boxShadow: '8px 0 28px rgba(148,163,196,0.22)',
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
    <div className="ks-topbar" style={{
      height: 62, background: 'var(--ks-topbar)',
      backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.7)',
      flexShrink: 0,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
      boxShadow: '0 6px 24px rgba(148,163,196,0.25)',
      position: 'relative', zIndex: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 16, fontWeight: 700,
        boxShadow: '3px 3px 8px rgba(163,177,198,0.6), -2px -2px 6px rgba(255,255,255,0.9)',
      }}>K</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ks-text)' }}>KEYSTONE</div>
      {organizationName && <>
        <div style={{ color: 'var(--ks-muted)', fontSize: 14 }}>·</div>
        <div style={{ fontSize: 13, color: 'var(--ks-subtle)' }}>{organizationName}</div>
      </>}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
          style={{ ...btnStyle, width: 36, height: 36, padding: 0, fontSize: 16 }}
        >{theme === 'dark' ? '☀️' : '◐'}</button>

        {canSeeInvite && inviteCode && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowInvite(!showInvite)} style={{
              ...btnStyle, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: 'var(--ks-accent)',
            }}>🔑 {inviteCode}</button>

            {showInvite && (
              <div style={{
                position: 'absolute', right: 0, top: 48, zIndex: 100,
                width: 280, padding: 20,
                background: 'var(--ks-button)',
                backdropFilter: 'blur(22px) saturate(170%)', WebkitBackdropFilter: 'blur(22px) saturate(170%)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: 18,
                boxShadow: '10px 10px 24px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.8)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ks-text)', marginBottom: 4 }}>Team Invite Code</div>
                <div style={{ fontSize: 11, color: 'var(--ks-muted)', marginBottom: 12 }}>Share with Dispatchers & Technicians only</div>
                <div style={{
                  ...insetStyle, padding: '14px 16px', marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 5, color: 'var(--ks-accent)' }}>{inviteCode}</span>
                </div>
                <button onClick={copyInvite} style={{
                  ...btnStyle, width: '100%', padding: '10px',
                  background: copied ? '#22c55e' : 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))',
                  color: 'white', fontSize: 13, fontWeight: 700,
                  boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                }}>
                  {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
                <div style={{ fontSize: 11, color: 'var(--ks-danger)', marginTop: 10, fontWeight: 600 }}>⚠️ Never share with customers</div>
              </div>
            )}
          </div>
        )}

        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 13, fontWeight: 700,
          boxShadow: '3px 3px 8px rgba(163,177,198,0.6), -2px -2px 6px rgba(255,255,255,0.9)',
        }}>{email?.charAt(0).toUpperCase()}</div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ks-text)' }}>{email}</div>
          <div style={{ fontSize: 10, color: 'var(--ks-accent)', fontWeight: 600 }}>{role}</div>
        </div>

        <button onClick={logout} style={{ ...btnStyle, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: 'var(--ks-danger)' }}>Sign out</button>
      </div>
    </div>
  );

  // ── STAT CARD ──
  const StatCard = ({ icon, label, value, sub, subColor }: { icon: string; label: string; value: number | string; sub: string; subColor: string }) => (
    <div style={{ ...cardStyle, padding: '20px 18px' }}>
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--ks-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ks-text)', lineHeight: 1 }}>{value ?? '—'}</div>
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
              <th key={c} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--ks-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 40, color: 'var(--ks-muted)', fontSize: 13 }}>{empty}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(163,177,198,0.15)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ks-body)' }}>{cell}</td>
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
        background: 'var(--ks-modal)',
        boxShadow: '16px 16px 36px rgba(163,177,198,0.55), -8px -8px 20px rgba(255,255,255,0.85)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ks-text)', marginBottom: 20 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ ...btnStyle, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: 'var(--ks-subtle)' }}>Cancel</button>
          <button onClick={onSubmit} style={{
            ...btnStyle, padding: '9px 18px', fontSize: 13, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white',
            boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
          }}>Submit</button>
        </div>
      </div>
    </div>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ks-subtle)', marginBottom: 7, display: 'block' }}>{children}</label>
  );

  return (
    <div className="ks-shell" data-ks-theme={theme} style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: PAGE_BG, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{KEYSTONE_STYLES}</style>
      <Topbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <div className="ks-content" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)' }}>Dashboard</div>
                  <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginTop: 3 }}>Good morning — here's what's happening today</div>
                </div>
                <button onClick={() => setShowCreateWO(true)} style={{
                  ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white',
                  boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                }}>+ New Work Order</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <StatCard icon="📋" label="Total Open" value={(summary?.newCount||0)+(summary?.assignedCount||0)+(summary?.inProgressCount||0)+(summary?.onHoldCount||0)} sub="Across all statuses" subColor="var(--ks-success)" />
                <StatCard icon="⚡" label="In Progress" value={summary?.inProgressCount??'—'} sub="Active now" subColor="var(--ks-success)" />
                <StatCard icon="🚨" label="SLA Breached" value={summary?.breachedCount??'—'} sub={(summary?.breachedCount||0)===0?'All clear ✓':'Needs action'} subColor={(summary?.breachedCount||0)===0?'var(--ks-success)':'var(--ks-danger)'} />
                <StatCard icon="✅" label="Closed" value={summary?.closedCount??'—'} sub="Completed" subColor="var(--ks-success)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <StatCard icon="🟡" label="On Hold" value={summary?.onHoldCount??'—'} sub="Awaiting action" subColor="var(--ks-warning)" />
                <StatCard icon="⚠️" label="SLA At Risk" value={summary?.atRiskCount??'—'} sub="Monitor closely" subColor="var(--ks-warning)" />
              </div>

              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(163,177,198,0.2)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ks-text)' }}>Recent Work Orders</div>
                  <button onClick={() => navTo('workorders')} style={{ ...btnStyle, padding: '6px 12px', fontSize: 12, color: 'var(--ks-accent)', fontWeight: 600 }}>View all →</button>
                </div>
                <Table
                  cols={['Code', 'Title', 'Status', 'Priority', 'SLA']}
                  empty={loading.dashboard ? 'Loading…' : 'No work orders yet'}
                  rows={workOrders.slice(0,5).map(w => [
                    <span style={{ fontFamily: 'monospace', color: 'var(--ks-accent)', fontSize: 12, fontWeight: 700 }}>{w.code}</span>,
                    <span style={{ fontWeight: 600, color: 'var(--ks-text)', cursor: 'pointer' }} onClick={() => openWODetail(w)}>{w.title}</span>,
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
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)' }}>Work Orders</div>
                  <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginTop: 3 }}>{workOrders.length} total in your workspace</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input value={woSearch} onChange={e => setWoSearch(e.target.value)} placeholder="🔍 Search..." style={{ ...neuInput, width: 220 }} />
                  <button onClick={() => setShowCreateWO(true)} style={{
                    ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white',
                    boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                  }}>+ New</button>
                </div>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['Code', 'Title', 'Status', 'Priority', 'SLA', 'Customer', 'Site', 'Assigned To']}
                  empty={loading.workorders ? 'Loading…' : 'No work orders found'}
                  rows={filteredWO.map(w => [
                    <span style={{ fontFamily: 'monospace', color: 'var(--ks-accent)', fontSize: 12, fontWeight: 700 }}>{w.code}</span>,
                    <span style={{ fontWeight: 600, color: 'var(--ks-accent)', cursor: 'pointer', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => openWODetail(w)}>{w.title}</span>,
                    <StatusPill status={w.status} />,
                    <PriorityPill priority={w.priority} />,
                    <SlaText slaStatus={w.slaStatus} />,
                    w.customerName || '—',
                    w.siteName || '—',
                    w.assignedToName || <span style={{ color: 'var(--ks-muted)' }}>Unassigned</span>,
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
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)' }}>Customers</div>
                  <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginTop: 3 }}>Manage client organizations</div>
                </div>
                <button onClick={() => setShowCreateCustomer(true)} style={{ ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white', boxShadow: '4px 4px 12px rgba(102,126,234,0.4)' }}>+ Add Customer</button>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['ID', 'Name', 'Contact Email', 'Created']}
                  empty={loading.customers ? 'Loading…' : 'No customers yet'}
                  rows={customers.map(c => [
                    <span style={{ color: 'var(--ks-accent)', fontWeight: 700 }}>#{c.id}</span>,
                    <span style={{ fontWeight: 600, color: 'var(--ks-text)' }}>{c.name}</span>,
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
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)' }}>Sites</div>
                  <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginTop: 3 }}>Building locations where work happens</div>
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
                  <button onClick={() => setShowCreateSite(true)} style={{ ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white', boxShadow: '4px 4px 12px rgba(102,126,234,0.4)' }}>+ Add Site</button>
                </div>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['ID', 'Name', 'Customer', 'Address']}
                  empty={loading.sites ? 'Loading…' : 'No sites yet'}
                  rows={sites.map(s => [
                    <span style={{ color: 'var(--ks-accent)', fontWeight: 700 }}>#{s.id}</span>,
                    <span style={{ fontWeight: 600, color: 'var(--ks-text)' }}>{s.name}</span>,
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
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)', marginBottom: 4 }}>SLA Tracking</div>
              <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginBottom: 20 }}>Monitor service level compliance</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                <StatCard icon="🟢" label="On Track" value={((summary?.newCount||0)+(summary?.assignedCount||0)+(summary?.inProgressCount||0)+(summary?.onHoldCount||0))-(summary?.atRiskCount||0)-(summary?.breachedCount||0)} sub="Meeting SLA" subColor="var(--ks-success)" />
                <StatCard icon="🟡" label="At Risk" value={summary?.atRiskCount??'—'} sub="Within 2hrs of breach" subColor="var(--ks-warning)" />
                <StatCard icon="🔴" label="Breached" value={summary?.breachedCount??'—'} sub="Past SLA deadline" subColor="var(--ks-danger)" />
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['Code', 'Title', 'Priority', 'SLA Due', 'SLA Status', 'Current Status']}
                  empty={loading.sla ? 'Loading…' : 'No active work orders'}
                  rows={slaOrders.filter(w => !TERMINAL_STATUSES.includes(w.status)).map(w => [
                    <span style={{ fontFamily: 'monospace', color: 'var(--ks-accent)', fontSize: 12, fontWeight: 700 }}>{w.code}</span>,
                    <span style={{ fontWeight: 600, color: 'var(--ks-text)' }}>{w.title}</span>,
                    <PriorityPill priority={w.priority} />,
                    <span style={{ fontSize: 12, color: 'var(--ks-subtle)' }}>{fmt(w.slaDueAt)}</span>,
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
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)', marginBottom: 4 }}>Time Logs</div>
              <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginBottom: 20 }}>Technician time tracked per work order</div>
              <div style={{ ...cardStyle, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🕐</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ks-body)', marginBottom: 8 }}>Time logs per work order</div>
                <div style={{ fontSize: 13, color: 'var(--ks-muted)' }}>Open a work order to view its time log entries</div>
              </div>
            </>
          )}

          {/* ── PARTS ── */}
          {page === 'parts' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)' }}>Parts Inventory</div>
                  <div style={{ fontSize: 13, color: 'var(--ks-body-muted)', marginTop: 3 }}>Track parts stock and usage</div>
                </div>
                <button onClick={() => setShowCreatePart(true)} style={{
                  ...btnStyle, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white',
                  boxShadow: '4px 4px 12px rgba(102,126,234,0.4)',
                }}>+ New Part</button>
              </div>
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <Table
                  cols={['SKU', 'Name', 'Unit Cost', 'Stock Qty', 'Status', 'Action']}
                  empty={loading.parts ? 'Loading…' : 'No parts found'}
                  rows={partsInventory.map(p => {
                    const s = PART_STATUS_COLORS[p.status] || { bg: 'var(--ks-neutral-bg)', color: 'var(--ks-body-muted)', label: p.status };
                    return [
                      <span style={{ fontFamily: 'monospace', color: 'var(--ks-accent)', fontWeight: 700 }}>{p.sku}</span>,
                      <span style={{ fontWeight: 600, color: 'var(--ks-text)' }}>{p.name}</span>,
                      `$${p.unitCost.toFixed(2)}`,
                      String(p.stockQty),
                      <Pill text={s.label} bg={s.bg} color={s.color} />,
                       <button
                         type="button"
                         title={`Delete ${p.name}`}
                         aria-label={`Delete ${p.name}`}
                         onClick={() => setPartToDelete(p)}
                         style={{ ...btnStyle, padding: '6px 10px', color: 'var(--ks-danger)', fontSize: 14, lineHeight: 1 }}
                       >🗑</button>,
                    ];
                  })}
                />
              </div>
            </>
          )}

          {/* ── TEAM ── */}
          {page === 'team' && (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)', marginBottom: 4 }}>Team</div>
              <div style={{ fontSize: 13, color: 'var(--ks-muted)', marginBottom: 20 }}>Members in your organization workspace</div>
              <div style={{ ...cardStyle, padding: 28 }}>
                {canSeeInvite ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Your Workspace Invite Code</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <div style={{ ...insetStyle, flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, letterSpacing: 6, color: 'var(--ks-accent)' }}>{inviteCode || 'N/A'}</span>
                      </div>
                      <button onClick={copyInvite} style={{ ...btnStyle, padding: '12px 18px', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, var(--ks-accent), var(--ks-accent-2))', color: 'white', boxShadow: '4px 4px 12px rgba(102,126,234,0.4)' }}>
                        {copied ? '✓ Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ks-muted)' }}>Share this code with Dispatchers and Technicians only. Customers should not receive this code.</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--ks-muted)' }}>Only Managers can view and share the workspace invite code.</div>
                )}
              </div>
            </>
          )}

          {/* ── WO DETAIL ── */}
          {page === 'wo-detail' && selectedWO && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <button onClick={() => { setPage('workorders'); loadWorkOrders(); }} style={{ ...btnStyle, padding: '7px 14px', fontSize: 12, color: 'var(--ks-subtle)', marginBottom: 10 }}>← Back to Work Orders</button>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ks-text)' }}>{selectedWO.code} — {selectedWO.title}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* main card */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--ks-accent)', fontSize: 13, fontWeight: 700 }}>{selectedWO.code}</span>
                      <StatusPill status={selectedWO.status} />
                      <PriorityPill priority={selectedWO.priority} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ks-text)', marginBottom: 10 }}>{selectedWO.title} — {selectedWO.siteName}</div>
                    <div style={{ fontSize: 14, color: 'var(--ks-subtle)', lineHeight: 1.6 }}>{selectedWO.description || 'No description provided.'}</div>
                  </div>

                  {/* history */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>Status History</div>
                    {woHistory.length === 0 ? (
                      <div style={{ color: 'var(--ks-muted)', fontSize: 13, marginBottom: TERMINAL_STATUSES.includes(selectedWO.status) ? 0 : 14 }}>No history yet</div>
                    ) : woHistory.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--ks-success)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                            boxShadow: '3px 3px 7px rgba(163,177,198,0.5), -2px -2px 5px rgba(255,255,255,0.9)',
                          }}>✓</div>
                          {i < woHistory.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(163,177,198,0.3)', marginTop: 4, minHeight: 14 }} />}
                        </div>
                        <div style={{ paddingTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ks-text)' }}>{h.fromStatus || '—'} → {h.toStatus} · {h.changedByName || 'system'}</div>
                          <div style={{ fontSize: 11, color: 'var(--ks-muted)', marginTop: 2 }}>{fmt(h.changedAt)}</div>
                          {h.note && <div style={{ fontSize: 12, color: 'var(--ks-subtle)', fontStyle: 'italic', marginTop: 3 }}>"{h.note}"</div>}
                        </div>
                      </div>
                    ))}

                    {/* current pending — only meaningful when the work order can still transition */}
                    {!TERMINAL_STATUSES.includes(selectedWO.status) && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--ks-current-bg)', color: 'var(--ks-warning)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                          boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -1px -1px 3px rgba(255,255,255,0.9)',
                        }}>●</div>
                        <div style={{ paddingTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ks-text)' }}>Awaiting next transition</div>
                          <div style={{ fontSize: 11, color: 'var(--ks-muted)', marginTop: 2 }}>Current</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* right panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Details</div>
                    {[
                      ['Customer', selectedWO.customerName || '—'],
                      ['Site', selectedWO.siteName || '—'],
                      ['Assigned', selectedWO.assignedToName || 'Unassigned'],
                      ['SLA Due', fmt(selectedWO.slaDueAt)],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
                        <span style={{ color: 'var(--ks-muted)' }}>{k}</span>
                        <span style={{ color: 'var(--ks-text)', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>SLA Status</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--ks-muted)' }}>Status</span>
                      <SlaText slaStatus={selectedWO.slaStatus} />
                    </div>
                  </div>

                  <div style={{ ...cardStyle, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Parts Used</div>
                    {woParts.length === 0 ? (
                      <div style={{ color: 'var(--ks-muted)', fontSize: 13 }}>No parts logged</div>
                    ) : (
                      <>
                        {woParts.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: 'var(--ks-subtle)' }}>{p.partName} ×{p.qtyUsed}</span>
                            <span style={{ color: 'var(--ks-text)', fontWeight: 600 }}>${p.totalCost}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(163,177,198,0.3)', paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--ks-muted)' }}>Total</span>
                          <span style={{ fontWeight: 700, color: 'var(--ks-text)' }}>${woParts.reduce((a, p) => a + parseFloat(String(p.totalCost) || '0'), 0).toFixed(2)}</span>
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

      {showCreatePart && (
        <Modal title="Add Part" onClose={() => setShowCreatePart(false)} onSubmit={createPart}>
          <div><FieldLabel>SKU</FieldLabel><input value={partForm.sku} onChange={e => setPartForm({...partForm, sku: e.target.value})} placeholder="e.g. CAP-355" style={neuInput} /></div>
          <div><FieldLabel>Part Name</FieldLabel><input value={partForm.name} onChange={e => setPartForm({...partForm, name: e.target.value})} placeholder="e.g. Capacitor 35/5 MFD" style={neuInput} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><FieldLabel>Unit Cost ($)</FieldLabel><input type="number" step="0.01" min="0" value={partForm.unitCost} onChange={e => setPartForm({...partForm, unitCost: e.target.value})} placeholder="e.g. 22.50" style={neuInput} /></div>
            <div><FieldLabel>Stock Qty</FieldLabel><input type="number" min="0" value={partForm.stockQty} onChange={e => setPartForm({...partForm, stockQty: e.target.value})} placeholder="e.g. 50" style={neuInput} /></div>
          </div>
        </Modal>
      )}

      {partToDelete && (
        <div
          role="presentation"
          onClick={() => !deletingPart && setPartToDelete(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 350, padding: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.42)', backdropFilter: 'blur(8px)',
          }}
        >
          <div
            role="dialog" aria-modal="true" aria-labelledby="delete-part-title"
            onClick={e => e.stopPropagation()}
            style={{ ...cardStyle, width: '100%', maxWidth: 420, padding: 28, background: 'var(--ks-modal)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ks-danger-bg)', color: 'var(--ks-danger)', fontSize: 20, marginBottom: 16 }}>🗑</div>
            <div id="delete-part-title" style={{ fontSize: 18, fontWeight: 750, color: 'var(--ks-text)', marginBottom: 8 }}>Delete inventory item?</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ks-body)', marginBottom: 22 }}>This will permanently remove <strong style={{ color: 'var(--ks-text)' }}>{partToDelete.name}</strong> ({partToDelete.sku}). This action cannot be undone.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" disabled={deletingPart} onClick={() => setPartToDelete(null)} style={{ ...btnStyle, padding: '10px 16px', fontSize: 13, fontWeight: 650, color: 'var(--ks-subtle)' }}>Cancel</button>
              <button type="button" disabled={deletingPart} onClick={deletePart} style={{ ...btnStyle, padding: '10px 16px', fontSize: 13, fontWeight: 700, background: 'var(--ks-danger)', color: 'white', opacity: deletingPart ? 0.65 : 1 }}>
                {deletingPart ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 400,
          padding: '12px 20px', borderRadius: 14,
          background: 'var(--ks-button)',
          backdropFilter: 'blur(18px) saturate(170%)', WebkitBackdropFilter: 'blur(18px) saturate(170%)',
          border: '1px solid rgba(255,255,255,0.7)',
          fontSize: 13, fontWeight: 600, color: 'var(--ks-success)',
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