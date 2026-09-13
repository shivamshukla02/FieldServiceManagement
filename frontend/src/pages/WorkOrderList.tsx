import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Copy,
  HardHat,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Moon,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type ElementType,
} from 'react';
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

type Page =
  | 'dashboard'
  | 'workorders'
  | 'customers'
  | 'sites'
  | 'sla'
  | 'timelogs'
  | 'parts'
  | 'team'
  | 'wo-detail';

const TERMINAL_STATUSES = ['CLOSED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  NEW: 'status-new',
  ASSIGNED: 'status-assigned',
  IN_PROGRESS: 'status-progress',
  ON_HOLD: 'status-hold',
  COMPLETED: 'status-complete',
  CLOSED: 'status-closed',
  CANCELLED: 'status-closed',
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'priority-urgent',
  HIGH: 'priority-high',
  MEDIUM: 'priority-medium',
  LOW: 'priority-low',
};

const PART_STATUS_COLORS: Record<string, string> = {
  IN_STOCK: 'status-progress',
  LOW_STOCK: 'status-assigned',
  OUT_OF_STOCK: 'status-hold',
};

function MapPinIcon({
  size = 18,
  strokeWidth = 2,
}: {
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

const navItems: Array<{
  id: Page;
  label: string;
  icon: ElementType;
}> = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'workorders',
    label: 'Work orders',
    icon: ClipboardList,
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Building2,
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: MapPinIcon,
  },
  {
    id: 'sla',
    label: 'SLA health',
    icon: ShieldCheck,
  },
  {
    id: 'timelogs',
    label: 'Time logs',
    icon: Clock3,
  },
  {
    id: 'parts',
    label: 'Parts inventory',
    icon: Package,
  },
  {
    id: 'team',
    label: 'Team & settings',
    icon: Users,
  },
];

function extractErrorMessage(error: any, fallback: string) {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.join(', ');
    }
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(value: string) {
  return value?.replaceAll('_', ' ') || '—';
}

function getList<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.content)) {
    return data.content;
  }
  return [];
}

function derivePartStatus(quantity: number): PartRow['status'] {
  if (quantity <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (quantity < 10) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
}

function Pill({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`status ${className}`}>
      {formatStatus(text)}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <Pill
      text={status}
      className={STATUS_COLORS[status] || 'status-closed'}
    />
  );
}

function PriorityPill({ priority }: { priority: string }) {
  return (
    <span
      className={`priority ${PRIORITY_COLORS[priority] || 'priority-medium'}`}
    >
      {priority || '—'}
    </span>
  );
}

function SlaPill({ value }: { value: string }) {
  const className =
    value === 'BREACHED'
      ? 'status-hold'
      : value === 'AT_RISK'
        ? 'status-assigned'
        : value === 'ON_TRACK'
          ? 'status-progress'
          : 'status-closed';
  return <Pill text={value || 'N/A'} className={className} />;
}

function PartStatusPill({ status }: { status: PartRow['status'] }) {
  return (
    <Pill
      text={status}
      className={PART_STATUS_COLORS[status] || 'status-closed'}
    />
  );
}
function Modal({
  title,
  description,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Save',
  submitDisabled = false,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
}) {
  return (
    <div
      className="workorder-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="workorder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workorder-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="workorder-modal-head">
          <div>
            <h3 id="workorder-modal-title">{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="workorder-icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
        {onSubmit && (
          <div className="workorder-modal-actions">
            <button
              type="button"
              className="workorder-secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="workorder-primary-button"
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              {submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  foot,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  foot: string;
  icon: ElementType;
  tone: 'indigo' | 'amber' | 'mint' | 'rose';
}) {
  return (
    <section className="workorder-metric-card">
      <div className="workorder-metric-top">
        <span>{label}</span>
        <span className={`workorder-metric-icon accent-${tone}`}>
          <Icon size={17} />
        </span>
      </div>
      <div className="workorder-metric-value">{value}</div>
      <div className="workorder-metric-foot">{foot}</div>
    </section>
  );
}

function WorkOrderRow({
  order,
  onClick,
}: {
  order: WorkOrder;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="workorder-row"
      onClick={onClick}
      data-testid={`row-workorder-${order.id}`}
    >
      <div>
        <div className="workorder-code">{order.code}</div>
        <div className="workorder-row-title">{order.title}</div>
        <div className="workorder-row-meta">
          {order.customerName || '—'} · {order.siteName || '—'}
        </div>
      </div>
      <div>
        <StatusPill status={order.status} />
        <div className="workorder-row-meta">
          {order.assignedToName || 'Unassigned'}
        </div>
      </div>
      <div>
        <PriorityPill priority={order.priority} />
        <div className="workorder-row-meta">
          Due {formatDate(order.slaDueAt)}
        </div>
      </div>
      <div>
        <SlaPill value={order.slaStatus} />
      </div>
    </button>
  );
}

function Table({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  return (
    <div className="workorder-table-scroll">
      <table className="workorder-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="workorder-table-empty">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function WorkOrderList() {
  const { email, role, organizationName, inviteCode, logout } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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
  const [showCreatePart, setShowCreatePart] = useState(false);
  const [partToDelete, setPartToDelete] = useState<PartRow | null>(null);
  const [deletingPart, setDeletingPart] = useState(false);
  const [copied, setCopied] = useState(false);
  const [woSearch, setWoSearch] = useState('');
  const [siteCustomerFilter, setSiteCustomerFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const [woForm, setWoForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    customerId: '',
    siteId: '',
  });

  const [custForm, setCustForm] = useState({
    name: '',
    contactEmail: '',
  });

  const [siteForm, setSiteForm] = useState({
    customerId: '',
    name: '',
    address: '',
  });

  const [partForm, setPartForm] = useState({
    sku: '',
    name: '',
    unitCost: '',
    stockQty: '',
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('keystone-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('keystone-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadDashboard();
    loadAllCustomersAndSitesForForms();
  }, []);

  const setLoad = (key: string, value: boolean) => {
    setLoading((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

 const loadAllCustomersAndSitesForForms = async () => {
  try {
    const customerResponse = await client.get('/customers?size=200');
    const customerList = getList<Customer>(customerResponse.data);
    setCustomers(customerList);
    if (customerList.length > 0) {
      const sitePromises = customerList.slice(0, 5).map(c =>
        client.get(`/sites?customerId=${c.id}&size=200`).then(r => getList<Site>(r.data))
      );
      const siteArrays = await Promise.all(sitePromises);
      setAllSites(siteArrays.flat());
    }
  } catch (error) {
    console.error(error);
  }
};

  const loadDashboard = async () => {
    setLoad('dashboard', true);
    try {
      const [summaryResponse, orderResponse] = await Promise.all([
        client.get('/reports/summary'),
       client.get(role === 'TECHNICIAN' ? '/work-orders?size=5&assignedTo=me' : '/work-orders?size=5'),
      ]);
      setSummary(summaryResponse.data);
      setWorkOrders(getList<WorkOrder>(orderResponse.data));
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Failed to load dashboard'));
    } finally {
      setLoad('dashboard', false);
    }
  };

  const loadWorkOrders = async () => {
    setLoad('workorders', true);
    try {
      const response = await client.get('/work-orders?size=200');
      setWorkOrders(getList<WorkOrder>(response.data));
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Failed to load work orders'));
    } finally {
      setLoad('workorders', false);
    }
  };

  const loadCustomers = async () => {
    setLoad('customers', true);
    try {
      const response = await client.get('/customers?size=200');
      setCustomers(getList<Customer>(response.data));
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Failed to load customers'));
    } finally {
      setLoad('customers', false);
    }
  };

  const loadSites = async (customerId = siteCustomerFilter) => {
    setLoad('sites', true);
    try {
      const filter =
        customerId && customerId !== 'all'
          ? `&customerId=${encodeURIComponent(customerId)}`
          : '';
      const response = await client.get(`/sites?size=200${filter}`);
      setSites(getList<Site>(response.data));
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Failed to load sites'));
    } finally {
      setLoad('sites', false);
    }
  };

  const loadSlaOrders = async () => {
    setLoad('sla', true);
    try {
      const response = await client.get('/work-orders?size=200');
      setSlaOrders(getList<WorkOrder>(response.data));
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Failed to load SLA data'));
    } finally {
      setLoad('sla', false);
    }
  };

  const loadPartsInventory = async () => {
    setLoad('parts', true);
    try {
      const response = await client.get('/parts');
      setPartsInventory(getList<PartRow>(response.data));
    } catch (error) {
      console.error(error);
      setPartsInventory([]);
      showToast(extractErrorMessage(error, 'Failed to load parts inventory'));
    } finally {
      setLoad('parts', false);
    }
  };

  const openWODetail = async (order: WorkOrder) => {
    setSelectedWO(order);
    setPage('wo-detail');
    setWoHistory([]);
    setWoParts([]);
    try {
      const [historyResponse, partsResponse] = await Promise.all([
        client.get(`/work-orders/${order.id}/history`),
        client.get(`/work-orders/${order.id}/parts`),
      ]);
      setWoHistory(getList<HistoryItem>(historyResponse.data));
      setWoParts(getList<PartItem>(partsResponse.data));
    } catch (error) {
      console.error(error);
      showToast(
        extractErrorMessage(error, 'Failed to load work order details'),
      );
    }
  };

  const navigateTo = (nextPage: Page) => {
    setPage(nextPage);
    if (nextPage === 'dashboard') {
      loadDashboard();
    }
    if (nextPage === 'workorders') {
      loadWorkOrders();
    }
    if (nextPage === 'customers') {
      loadCustomers();
    }
    if (nextPage === 'sites') {
      loadSites();
    }
    if (nextPage === 'sla') {
      loadSlaOrders();
    }
    if (nextPage === 'parts') {
      loadPartsInventory();
    }
  };

  const createWorkOrder = async () => {
    if (!woForm.title.trim()) {
      showToast('Title is required');
      return;
    }
    if (!woForm.customerId || !woForm.siteId) {
      showToast('Please choose a customer and site');
      return;
    }
    try {
      await client.post('/work-orders', {
        title: woForm.title.trim(),
        description: woForm.description.trim(),
        priority: woForm.priority,
        customerId: Number(woForm.customerId),
        siteId: Number(woForm.siteId),
      });
      setShowCreateWO(false);
      setWoForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        customerId: '',
        siteId: '',
      });
      showToast('Work order created');
      await Promise.all([loadWorkOrders(), loadDashboard()]);
    } catch (error) {
      showToast(extractErrorMessage(error, 'Failed to create work order'));
    }
  };

  const createCustomer = async () => {
    if (!custForm.name.trim()) {
      showToast('Company name is required');
      return;
    }
    try {
      await client.post('/customers', {
        name: custForm.name.trim(),
        contactEmail: custForm.contactEmail.trim() || null,
      });
      setShowCreateCustomer(false);
      setCustForm({
        name: '',
        contactEmail: '',
      });
      showToast('Customer added');
      await Promise.all([loadCustomers(), loadAllCustomersAndSitesForForms()]);
    } catch (error) {
      showToast(extractErrorMessage(error, 'Failed to create customer'));
    }
  };

  const createSite = async () => {
    if (!siteForm.name.trim()) {
      showToast('Site name is required');
      return;
    }
    if (!siteForm.customerId) {
      showToast('Please choose a customer');
      return;
    }
    try {
      await client.post('/sites', {
        name: siteForm.name.trim(),
        address: siteForm.address.trim() || null,
        customerId: Number(siteForm.customerId),
      });
      setShowCreateSite(false);
      setSiteForm({
        customerId: '',
        name: '',
        address: '',
      });
      showToast('Site added');
      await Promise.all([
        loadSites(siteCustomerFilter),
        loadAllCustomersAndSitesForForms(),
      ]);
    } catch (error) {
      showToast(extractErrorMessage(error, 'Failed to create site'));
    }
  };

  const createPart = async () => {
    if (!partForm.sku.trim() || !partForm.name.trim()) {
      showToast('SKU and name are required');
      return;
    }
    const unitCost = Number(partForm.unitCost);
    const stockQty = Number(partForm.stockQty);
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      showToast('Enter a valid unit cost');
      return;
    }
    if (!Number.isInteger(stockQty) || stockQty < 0) {
      showToast('Enter a valid stock quantity');
      return;
    }
    try {
      await client.post('/parts', {
        sku: partForm.sku.trim(),
        name: partForm.name.trim(),
        unitCost,
        stockQty,
        status: derivePartStatus(stockQty),
      });
      setShowCreatePart(false);
      setPartForm({
        sku: '',
        name: '',
        unitCost: '',
        stockQty: '',
      });
      showToast('Part added');
      await loadPartsInventory();
    } catch (error) {
      showToast(extractErrorMessage(error, 'Failed to create part'));
    }
  };

  const deletePart = async () => {
    if (!partToDelete) {
      return;
    }
    setDeletingPart(true);
    try {
      const identifier = partToDelete.id
        ? String(partToDelete.id)
        : encodeURIComponent(partToDelete.sku);
      await client.delete(`/parts/${identifier}`);
      setPartsInventory((previous) =>
        previous.filter(
          (part) =>
            part.id !== partToDelete.id && part.sku !== partToDelete.sku,
        ),
      );
      setPartToDelete(null);
      showToast('Part deleted successfully');
    } catch (error) {
      console.error(error);
      showToast(extractErrorMessage(error, 'Failed to delete part'));
    } finally {
      setDeletingPart(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteCode) {
      showToast('No invite code is available');
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      showToast('Invite code copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy the invite code');
    }
  };

  const filteredWorkOrders = workOrders.filter((order) =>
    `${order.code} ${order.title} ${order.customerName} ${order.siteName}`
      .toLowerCase()
      .includes(woSearch.toLowerCase()),
  );

  const sitesForWorkOrderCustomer = allSites.filter(
  (site) =>
    !woForm.customerId ||
    String((site as any).customerId ?? (site as any).customer?.id ?? '') === String(woForm.customerId),
);

  const activeWorkOrders =
    (summary?.newCount ?? 0) +
    (summary?.assignedCount ?? 0) +
    (summary?.inProgressCount ?? 0) +
    (summary?.onHoldCount ?? 0);

  const profileInitial = email?.charAt(0).toUpperCase() || '?';

  const pageTitle =
    page === 'dashboard'
      ? 'Overview'
      : page === 'workorders'
        ? 'Work orders'
        : page === 'customers'
          ? 'Customers'
          : page === 'sites'
            ? 'Sites'
            : page === 'sla'
              ? 'SLA health'
              : page === 'timelogs'
                ? 'Time logs'
                : page === 'parts'
                  ? 'Parts inventory'
                  : page === 'team'
                    ? 'Team & settings'
                    : 'Work order details';

  const pageSubtitle =
    page === 'dashboard'
      ? 'Your field operation at a glance'
      : page === 'workorders'
        ? 'Dispatch board'
        : page === 'customers'
          ? 'Relationship directory'
          : page === 'sites'
            ? 'Places of work'
            : page === 'sla'
              ? 'Service level monitor'
              : page === 'timelogs'
                ? 'Field time and effort'
                : page === 'parts'
                  ? 'Materials on hand'
                  : page === 'team'
                    ? 'Workspace controls'
                    : 'Work order details';

  const navButtonStyle: CSSProperties = {
    width: '100%',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .workorder-shell,
        .workorder-shell * {
          box-sizing: border-box;
        }
        .workorder-shell {
          --background:
            radial-gradient(circle at 7% -9%, rgba(171, 190, 255, .5), transparent 32%),
            radial-gradient(circle at 94% 5%, rgba(252, 214, 231, .55), transparent 28%),
            linear-gradient(135deg, #f0f4fa 0%, #e7edf6 48%, #f2eef5 100%);
          --text: #222d42;
          --body: #52627b;
          --muted: #71819a;
          --muted-2: #8c99ab;
          --line: rgba(116, 135, 164, .22);
          --card: rgba(250, 252, 255, .64);
          --card-strong: rgba(249, 251, 255, .82);
          --soft: rgba(255, 255, 255, .42);
          --input: rgba(238, 243, 250, .7);
          --accent: #5466d9;
          --accent-2: #7b6fd7;
          --success: #2e986f;
          --warning: #ad7725;
          --danger: #c94c59;
          --shadow: 0 24px 60px rgba(69, 86, 121, .16), 0 4px 16px rgba(70, 87, 120, .08);
          min-height: 100dvh;
          height: 100dvh;
          width: 100%;
          overflow: hidden;
          color: var(--text);
          background: var(--background);
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .workorder-shell[data-theme='dark'] {
          --background:
            radial-gradient(circle at 8% -10%, rgba(76, 89, 164, .36), transparent 35%),
            radial-gradient(circle at 92% 4%, rgba(134, 64, 107, .25), transparent 30%),
            linear-gradient(135deg, #111a2c 0%, #182238 52%, #1d1a2c 100%);
          --text: #edf1f8;
          --body: #c1ccdc;
          --muted: #a1aec1;
          --muted-2: #8290a5;
          --line: rgba(177, 192, 218, .16);
          --card: rgba(31, 42, 64, .72);
          --card-strong: rgba(29, 39, 59, .88);
          --soft: rgba(64, 79, 108, .34);
          --input: rgba(19, 29, 46, .66);
          --accent: #aeb7ff;
          --accent-2: #c1a7f4;
          --success: #78d6b1;
          --warning: #f0c47b;
          --danger: #ff929d;
          --shadow: 0 26px 68px rgba(3, 8, 18, .38), 0 4px 20px rgba(3, 8, 18, .22);
        }
        .workorder-shell button,
        .workorder-shell input,
        .workorder-shell textarea,
        .workorder-shell select {
          font: inherit;
          transition: border-color .18s ease, box-shadow .18s ease,
            background .18s ease, transform .18s ease, opacity .18s ease;
        }
        .workorder-shell button:focus-visible,
        .workorder-shell input:focus-visible,
        .workorder-shell textarea:focus-visible,
        .workorder-shell select:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .workorder-shell button:disabled {
          cursor: not-allowed;
          opacity: .62;
        }
        .workorder-shell input::placeholder,
        .workorder-shell textarea::placeholder {
          color: var(--muted-2);
        }
        .workorder-shell ::-webkit-scrollbar {
          width: 9px;
          height: 9px;
        }
        .workorder-shell ::-webkit-scrollbar-thumb {
          background: rgba(125, 140, 165, .35);
          border-radius: 99px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .workorder-shell ::-webkit-scrollbar-track {
          background: transparent;
        }
        .workorder-workspace {
          display: flex;
          min-height: 100%;
          height: 100%;
        }
        .workorder-sidebar {
          width: 254px;
          flex: 0 0 254px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 22px 14px;
          border-right: 1px solid var(--line);
          background: rgba(255, 255, 255, .48);
          backdrop-filter: blur(30px) saturate(145%);
          -webkit-backdrop-filter: blur(30px) saturate(145%);
          box-shadow: 8px 0 28px rgba(148, 163, 196, .16);
        }
        [data-theme='dark'] .workorder-sidebar {
          background: rgba(15, 23, 42, .62);
        }
        .workorder-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 0 8px;
          color: var(--text);
          font-family: 'Space Grotesk', monospace;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -.045em;
        }
        .workorder-brand,
        .workorder-sidebar-brand {
          white-space: nowrap;
        }
        .workorder-brand-mark {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          color: #f7f8ff;
          background: linear-gradient(145deg, var(--accent), var(--accent-2));
          box-shadow: 0 8px 20px rgba(84, 102, 217, .28);
        }
          .workorder-nav-label {
          margin: 12px 8px 3px;
          color: var(--muted-2);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .workorder-nav-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid transparent;
          border-radius: 13px;
          color: var(--body);
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
        }
        .workorder-nav-button:hover {
          color: var(--accent);
          background: var(--soft);
          border-color: var(--line);
          transform: translateX(2px);
        }
        .workorder-nav-button.is-active {
          color: var(--accent);
          background: var(--soft);
          border-color: var(--line);
          box-shadow:
            inset 3px 3px 8px rgba(148, 163, 196, .18),
            inset -2px -2px 6px rgba(255, 255, 255, .68);
        }
        .workorder-sidebar-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--line);
        }
        .workorder-profile {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          padding: 8px;
        }
        .workorder-avatar {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          color: #ffffff;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          font-size: 11px;
          font-weight: 800;
        }
        .workorder-profile-copy {
          min-width: 0;
          flex: 1;
        }
        .workorder-profile-copy strong,
        .workorder-profile-copy span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .workorder-profile-copy strong {
          color: var(--text);
          font-size: 11px;
        }
        .workorder-profile-copy span {
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
        }
        .workorder-main {
          min-width: 0;
          min-height: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .workorder-topbar {
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 26px;
          border-bottom: 1px solid var(--line);
          background: rgba(255, 255, 255, .4);
          backdrop-filter: blur(28px) saturate(145%);
          -webkit-backdrop-filter: blur(28px) saturate(145%);
          box-shadow: 0 6px 24px rgba(148, 163, 196, .16);
        }
        [data-theme='dark'] .workorder-topbar {
          background: rgba(15, 23, 42, .58);
        }
        .workorder-topbar-title {
          min-width: 0;
        }
        .workorder-eyebrow {
          color: var(--muted-2);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .workorder-topbar h1 {
          margin: 3px 0 0;
          color: var(--text);
          font-family: 'Space Grotesk', monospace;
          font-size: 21px;
          font-weight: 500;
          letter-spacing: -.045em;
        }
        .workorder-topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }
        .workorder-theme-toggle {
          display: flex;
          gap: 3px;
          padding: 3px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: var(--soft);
        }
        .workorder-theme-toggle button {
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 7px;
          color: var(--muted);
          background: transparent;
          cursor: pointer;
        }
        .workorder-theme-toggle button.is-active {
          color: var(--accent);
          background: var(--card-strong);
          box-shadow: 0 2px 6px rgba(69, 86, 121, .12);
        }
        .workorder-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }
        .workorder-page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }
        .workorder-page-head h2 {
          margin: 4px 0 7px;
          color: var(--text);
          font-family: 'Space Grotesk', monospace;
          font-size: 30px;
          font-weight: 500;
          letter-spacing: -.055em;
        }
        .workorder-page-head p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }
        .workorder-page-actions,
        .workorder-toolbar,
        .workorder-modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .workorder-panel,
        .workorder-metric-card,
        .workorder-table-panel {
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--card);
          box-shadow: var(--shadow);
          backdrop-filter: blur(28px) saturate(145%);
          -webkit-backdrop-filter: blur(28px) saturate(145%);
        }
        .workorder-panel {
          padding: 20px;
        }
        .workorder-metric-card {
          padding: 20px 18px;
        }
        .workorder-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .workorder-metric-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }
        .accent-indigo {
          color: var(--accent);
          background: rgba(84, 102, 217, .13);
        }
        .accent-amber {
          color: var(--warning);
          background: rgba(207, 153, 80, .14);
        }
        .accent-mint {
          color: var(--success);
          background: rgba(84, 170, 141, .14);
        }
        .accent-rose {
          color: var(--danger);
          background: rgba(202, 113, 128, .14);
        }
        .workorder-metric-value {
          margin-top: 14px;
          color: var(--text);
          font-family: 'Space Grotesk', monospace;
          font-size: 31px;
          font-weight: 600;
          letter-spacing: -.05em;
        }
        .workorder-metric-foot {
          margin-top: 6px;
          color: var(--muted);
          font-size: 11px;
        }
        .workorder-section-grid {
          display: grid;
          gap: 16px;
        }
        .workorder-stats-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-bottom: 20px;
        }
        .workorder-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, .75fr);
          gap: 16px;
        }
        .workorder-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }
        .workorder-panel-title {
          color: var(--text);
          font-size: 14px;
          font-weight: 700;
        }
        .workorder-panel-subtitle {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }
        .workorder-wo-list {
          display: grid;
        }
        .workorder-row {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(180px, 1.45fr) minmax(130px, 1fr) 100px 100px;
          align-items: center;
          gap: 14px;
          padding: 15px 0;
          border: 0;
          border-top: 1px solid var(--line);
          color: inherit;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }
        .workorder-row:hover {
          transform: translateX(3px);
        }
        .workorder-code {
          color: var(--accent);
          font-family: 'Space Grotesk', monospace;
          font-size: 11px;
          font-weight: 700;
        }
        .workorder-row-title {
          margin-top: 5px;
          color: var(--text);
          font-size: 13px;
          font-weight: 700;
        }
        .workorder-row-meta {
          margin-top: 5px;
          color: var(--muted);
          font-size: 11px;
        }
        .status,
        .priority {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 4px 9px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .02em;
          text-transform: uppercase;
        }
        .status-new {
          color: #3d78c9;
          background: #e7f0ff;
        }
        .status-assigned {
          color: #ad7725;
          background: #fff4d7;
        }
        .status-progress,
        .status-complete {
          color: #2e986f;
          background: #def6e9;
        }
        .status-hold {
          color: #bd6d35;
          background: #fff0e3;
        }
        .status-closed {
          color: var(--muted);
          background: rgba(141, 155, 176, .15);
        }
        .priority-urgent {
          color: #c94c59;
          background: #ffe4e7;
        }
        .priority-high {
          color: #bd6d35;
          background: #fff0e3;
        }
        .priority-medium {
          color: #ad7725;
          background: #fff4d7;
        }
        .priority-low {
          color: #2e986f;
          background: #def6e9;
        }
        .workorder-primary-button,
        .workorder-secondary-button,
        .workorder-danger-button,
        .workorder-icon-button,
        .workorder-link-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          font-family: inherit;
          cursor: pointer;
        }
        .workorder-primary-button {
          padding: 10px 15px;
          border: 1px solid transparent;
          color: #ffffff;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          box-shadow: 0 10px 24px rgba(84, 102, 217, .22);
          font-size: 12px;
          font-weight: 700;
        }
        .workorder-primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(84, 102, 217, .3);
        }
        .workorder-secondary-button {
          padding: 9px 13px;
          border: 1px solid var(--line);
          color: var(--text);
          background: var(--soft);
          font-size: 12px;
          font-weight: 700;
        }
        .workorder-secondary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: var(--card-strong);
        }
        .workorder-danger-button {
          padding: 10px 15px;
          border: 1px solid transparent;
          color: #ffffff;
          background: var(--danger);
          font-size: 12px;
          font-weight: 700;
        }
        .workorder-icon-button {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid var(--line);
          color: var(--muted);
          background: var(--soft);
        }
        .workorder-icon-button:hover {
          color: var(--accent);
          background: var(--card-strong);
        }
        .workorder-link-button {
          padding: 0;
          border: 0;
          color: var(--accent);
          background: transparent;
          font-size: 12px;
          font-weight: 700;
        }
        .workorder-search {
          position: relative;
          flex: 1;
          max-width: 340px;
        }
        .workorder-search svg {
          position: absolute;
          top: 50%;
          left: 13px;
          color: var(--muted);
          transform: translateY(-50%);
        }
        .workorder-input,
        .workorder-select,
        .workorder-textarea {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid var(--line);
          border-radius: 12px;
          outline: none;
          color: var(--text);
          background: var(--input);
        }
        .workorder-input:focus,
        .workorder-select:focus,
        .workorder-textarea:focus {
          border-color: rgba(84, 102, 217, .68);
          box-shadow: 0 0 0 4px rgba(84, 102, 217, .12);
        }
        .workorder-search .workorder-input {
          padding-left: 39px;
        }
        .workorder-toolbar {
          margin-bottom: 16px;
        }
        .workorder-table-panel {
          overflow: hidden;
        }
        .workorder-table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        .workorder-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }
        .workorder-table th {
          padding: 12px 16px;
          color: var(--muted);
          background: var(--soft);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .06em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .workorder-table td {
          padding: 14px 16px;
          border-top: 1px solid var(--line);
          color: var(--body);
          font-size: 12px;
          vertical-align: middle;
        }
        .workorder-table tbody tr:hover {
          background: var(--soft);
        }
        .workorder-table-empty {
          height: 180px;
          color: var(--muted) !important;
          text-align: center !important;
        }
        .workorder-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(30, 41, 59, .2);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
        }
        .workorder-modal {
          width: min(100%, 480px);
          max-height: calc(100dvh - 40px);
          overflow-y: auto;
          padding: 26px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card-strong);
          box-shadow: var(--shadow);
        }
        .workorder-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 22px;
        }
        .workorder-modal-head h3 {
          margin: 0;
          color: var(--text);
          font-family: 'Space Grotesk', monospace;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -.045em;
        }
        .workorder-modal-head p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }
        .workorder-form {
          display: grid;
          gap: 15px;
        }
        .workorder-form-grid {
          display: grid;
          gap: 14px;
        }
        .workorder-form-grid.two {
          grid-template-columns: 1fr 1fr;
        }
        .workorder-form-label {
          display: grid;
          gap: 7px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
        }
        .workorder-textarea {
          min-height: 100px;
          resize: vertical;
        }
        .workorder-modal-actions {
          justify-content: flex-end;
          margin-top: 22px;
        }
        .workorder-detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(270px, .65fr);
          gap: 16px;
        }
        .workorder-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 24px;
        }
        .workorder-detail-stat {
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 13px;
          background: var(--soft);
        }
        .workorder-detail-stat span,
        .workorder-detail-stat strong {
          display: block;
        }
        .workorder-detail-stat span {
          color: var(--muted);
          font-size: 10px;
        }
        .workorder-detail-stat strong {
          margin-top: 6px;
          color: var(--text);
          font-size: 12px;
        }
        .workorder-detail-hero h2 {
          margin: 7px 0 9px;
          color: var(--text);
          font-family: 'Space Grotesk', monospace;
          font-size: 24px;
          font-weight: 500;
          letter-spacing: -.045em;
        }
        .workorder-detail-hero p {
          margin: 0;
          color: var(--body);
          font-size: 13px;
          line-height: 1.65;
        }
        .workorder-detail-statuses {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }
        .workorder-timeline {
          display: grid;
          gap: 18px;
        }
        .workorder-timeline-item {
          display: flex;
          gap: 12px;
        }
        .workorder-timeline-dot {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          color: #ffffff;
          background: var(--success);
        }
        .workorder-timeline-item strong {
          color: var(--text);
          font-size: 13px;
        }
        .workorder-timeline-item p {
          margin: 7px 0 0;
          color: var(--body);
          font-size: 12px;
          line-height: 1.5;
        }
        .workorder-muted {
          color: var(--muted);
          font-size: 11px;
        }
        .workorder-empty {
          padding: 54px 20px;
          color: var(--muted);
          text-align: center;
        }
        .workorder-empty-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin: 0 auto 13px;
          border-radius: 14px;
          color: var(--accent);
          background: rgba(84, 102, 217, .12);
        }
        .workorder-empty h3 {
          margin: 0 0 6px;
          color: var(--text);
          font-size: 15px;
        }
        .workorder-empty p {
          margin: 0;
          font-size: 12px;
        }
        .workorder-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          border: 1px solid var(--line);
          border-radius: 14px;
          color: var(--success);
          background: var(--card-strong);
          box-shadow: var(--shadow);
          font-size: 12px;
          font-weight: 700;
        }
        @media (max-width: 1050px) {
          .workorder-sidebar {
            width: 218px;
            flex-basis: 218px;
          }
          .workorder-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .workorder-dashboard-grid,
          .workorder-detail-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 760px) {
          .workorder-shell {
            overflow-y: auto;
          }
          .workorder-workspace {
            min-height: 100dvh;
            height: auto;
          }
          .workorder-sidebar {
            width: 74px;
            flex-basis: 74px;
            padding: 18px 9px;
          }
          .workorder-sidebar-brand {
            justify-content: center;
            padding: 0;
          }
          .workorder-sidebar-brand > span:last-child,
          .workorder-nav-button > span:last-child,
          .workorder-nav-label,
          .workorder-sidebar-footer {
            display: none;
          }
          .workorder-nav-button {
            justify-content: center;
            padding: 10px 7px;
          }
          .workorder-content {
            padding: 18px 14px 30px;
          }
          .workorder-topbar {
            padding: 0 16px;
          }
          .workorder-page-head {
            flex-direction: column;
          }
          .workorder-topbar-actions .workorder-secondary-button,
          .workorder-topbar-actions .workorder-primary-button {
            padding: 8px;
          }
          .workorder-topbar-actions .workorder-secondary-button span,
          .workorder-topbar-actions .workorder-primary-button span {
            display: none;
          }
          .workorder-row {
            grid-template-columns: minmax(170px, 1.4fr) 110px;
          }
          .workorder-row > div:nth-child(3),
          .workorder-row > div:nth-child(4) {
            display: none;
          }
          .workorder-form-grid.two,
          .workorder-detail-grid {
            grid-template-columns: 1fr;
          }
          .workorder-toolbar {
            flex-wrap: wrap;
          }
          .workorder-search {
            max-width: none;
            flex-basis: 100%;
          }
        }
      `}</style>
      <div className="workorder-shell" data-theme={theme}>
        <div className="workorder-workspace">
          <aside className="workorder-sidebar">
            <div className="workorder-sidebar-brand">
              <span className="workorder-brand-mark">
                <HardHat size={18} />
              </span>
              <span>Keystone</span>
            </div>
            {(() => {
  const filtered = navItems.filter(item => {
    if (role === 'CUSTOMER') return ['dashboard','workorders'].includes(item.id);
    if (role === 'TECHNICIAN') return ['dashboard','workorders','timelogs','parts'].includes(item.id);
    if (role === 'DISPATCHER') return ['dashboard','workorders','customers','sites','sla'].includes(item.id);
    return true;
  });
  return filtered.map((item) => {
    const Icon = item.icon;
    const originalIndex = navItems.indexOf(item);
    return (
      <div key={item.id}>
        {originalIndex === 4 && (role === 'MANAGER' || role === 'DISPATCHER') && (
          <div className="workorder-nav-label">Reports</div>
        )}
        {originalIndex === 7 && role === 'MANAGER' && (
          <div className="workorder-nav-label">Workspace</div>
        )}
        <button
          type="button"
          className={[
            'workorder-nav-button',
            page === item.id ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={navButtonStyle}
          onClick={() => navigateTo(item.id)}
        >
          <Icon
            size={17}
            strokeWidth={page === item.id ? 2.3 : 1.8}
          />
          <span>{item.label}</span>
        </button>
      </div>
    );
  });
})()}
            <div className="workorder-sidebar-footer">
              <div className="workorder-profile">
                <div className="workorder-avatar">{profileInitial}</div>
                <div className="workorder-profile-copy">
                  <strong>{email || 'Workspace user'}</strong>
                  <span>{role || 'Team member'}</span>
                </div>
                <button
                  type="button"
                  className="workorder-icon-button"
                  onClick={logout}
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </aside>
          <div className="workorder-main">
            <header className="workorder-topbar">
              <div className="workorder-topbar-title">
                <div className="workorder-eyebrow">
                  {organizationName || 'Keystone workspace'}
                </div>
                <h1>{pageTitle}</h1>
              </div>
              <div className="workorder-topbar-actions">
                <div className="workorder-theme-toggle">
                  <button
                    type="button"
                    className={theme === 'light' ? 'is-active' : ''}
                    onClick={() => setTheme('light')}
                    aria-label="Light mode"
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    type="button"
                    className={theme === 'dark' ? 'is-active' : ''}
                    onClick={() => setTheme('dark')}
                    aria-label="Dark mode"
                  >
                    <Moon size={14} />
                  </button>
                </div>
                {role === 'MANAGER' && inviteCode && (
                  <button
                    type="button"
                    className="workorder-secondary-button"
                    onClick={() => setShowInvite(true)}
                  >
                    <Copy size={14} />
                    <span>Invite</span>
                  </button>
                )}
                <button
                  type="button"
                  className="workorder-primary-button"
                  onClick={() => setShowCreateWO(true)}
                >
                  <Plus size={15} />
                  <span>New order</span>
                </button>
              </div>
            </header>
            <main className="workorder-content">
              {page === 'dashboard' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Overview</h2>
                      <p>
                        Track the work that keeps your operation moving.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="workorder-primary-button"
                      onClick={() => setShowCreateWO(true)}
                    >
                      <Plus size={16} />
                      Create work order
                    </button>
                  </div>
                  <div className="workorder-section-grid workorder-stats-grid">
                    <MetricCard
                      label="Active work"
                      value={activeWorkOrders}
                      foot="Across all sites"
                      icon={ClipboardList}
                      tone="indigo"
                    />
                    <MetricCard
                      label="At risk"
                      value={summary?.atRiskCount ?? 0}
                      foot="Needs attention"
                      icon={AlertTriangle}
                      tone="amber"
                    />
                    <MetricCard
                      label="Customers"
                      value={customers.length}
                      foot={`${sites.length} active sites`}
                      icon={Building2}
                      tone="mint"
                    />
                    <MetricCard
                      label="Completed"
                      value={summary?.completedCount ?? 0}
                      foot="Completed work"
                      icon={CheckCircle2}
                      tone="rose"
                    />
                  </div>
                  <div className="workorder-dashboard-grid">
                    <section className="workorder-panel">
                      <div className="workorder-panel-head">
                        <div>
                          <div className="workorder-panel-title">
                            Current work
                          </div>
                          <div className="workorder-panel-subtitle">
                            The latest jobs in your queue
                          </div>
                        </div>
                        <button
                          type="button"
                          className="workorder-link-button"
                          onClick={() => navigateTo('workorders')}
                        >
                          View all
                          <ArrowRight size={13} />
                        </button>
                      </div>
                      <div className="workorder-wo-list">
                        {workOrders.length === 0 ? (
                          <div className="workorder-empty">
                            <div className="workorder-empty-icon">
                              <ClipboardList size={21} />
                            </div>
                            <h3>
                              {loading.dashboard
                                ? 'Loading work orders'
                                : 'No work orders yet'}
                            </h3>
                            <p>
                              Create a work order when the next job comes in.
                            </p>
                          </div>
                        ) : (
                          workOrders
                            .slice(0, 5)
                            .map((order) => (
                              <WorkOrderRow
                                key={order.id}
                                order={order}
                                onClick={() => openWODetail(order)}
                              />
                            ))
                        )}
                      </div>
                    </section>
                    <section className="workorder-panel">
                      <div className="workorder-panel-title">
                        SLA pulse
                      </div>
                      <div className="workorder-panel-subtitle">
                        Current service level signal
                      </div>
                      <div className="workorder-metric-value">
                        {summary?.breachedCount ?? 0}
                      </div>
                      <div className="workorder-muted">
                        breached work orders
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          marginTop: 24,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="status status-progress">
                          On track:{' '}
                          {Math.max(
                            0,
                            activeWorkOrders -
                              (summary?.atRiskCount ?? 0) -
                              (summary?.breachedCount ?? 0),
                          )}
                        </span>
                        <span className="status status-assigned">
                          At risk: {summary?.atRiskCount ?? 0}
                        </span>
                        <span className="status status-hold">
                          Breached: {summary?.breachedCount ?? 0}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="workorder-link-button"
                        style={{ marginTop: 28 }}
                        onClick={() => navigateTo('sla')}
                      >
                        Open SLA health
                        <ArrowRight size={13} />
                      </button>
                    </section>
                  </div>
                </>
              )}
              {page === 'workorders' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Work orders</h2>
                      <p>
                        {workOrders.length} jobs in your operating queue.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="workorder-primary-button"
                      onClick={() => setShowCreateWO(true)}
                    >
                      <Plus size={16} />
                      New work order
                    </button>
                  </div>
                  <div className="workorder-toolbar">
                    <div className="workorder-search">
                      <Search size={16} />
                      <input
                        className="workorder-input"
                        value={woSearch}
                        onChange={(event) =>
                          setWoSearch(event.target.value)
                        }
                        placeholder="Search code, title, customer or site"
                      />
                    </div>
                    <button
                      type="button"
                      className="workorder-secondary-button"
                    >
                      <ListFilter size={15} />
                      Filter
                    </button>
                  </div>
                  <section className="workorder-table-panel">
                    <Table
                      columns={[
                        'Work order',
                        'Customer / site',
                        'Status',
                        'Priority',
                        'SLA due',
                        'Owner',
                      ]}
                      empty={
                        loading.workorders
                          ? 'Loading work orders…'
                          : 'No work orders found'
                      }
                      rows={filteredWorkOrders.map((order) => [
                        <button
                          type="button"
                          className="workorder-link-button"
                          onClick={() => openWODetail(order)}
                        >
                          <span>
                            <strong>{order.code}</strong>
                            <span
                              style={{
                                display: 'block',
                                marginTop: 5,
                                color: 'var(--text)',
                              }}
                            >
                              {order.title}
                            </span>
                          </span>
                        </button>,
                        <span>
                          {order.customerName || '—'}
                          <small
                            style={{
                              display: 'block',
                              marginTop: 5,
                              color: 'var(--muted)',
                            }}
                          >
                            {order.siteName || '—'}
                          </small>
                        </span>,
                        <StatusPill status={order.status} />,
                        <PriorityPill priority={order.priority} />,
                        <span>
                          <SlaPill value={order.slaStatus} />
                          <small
                            style={{
                              display: 'block',
                              marginTop: 5,
                              color: 'var(--muted)',
                            }}
                          >
                            {formatDateTime(order.slaDueAt)}
                          </small>
                        </span>,
                        order.assignedToName || 'Unassigned',
                      ])}
                    />
                  </section>
                </>
              )}
              {page === 'customers' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Customers</h2>
                      <p>
                        Every account, with the context your team needs.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="workorder-primary-button"
                      onClick={() => setShowCreateCustomer(true)}
                    >
                      <Plus size={16} />
                      Add customer
                    </button>
                  </div>
                  <section className="workorder-table-panel">
                    <Table
                      columns={[
                        'Customer',
                        'Primary contact',
                        'Created',
                        'Action',
                      ]}
                      empty={
                        loading.customers
                          ? 'Loading customers…'
                          : 'No customers found'
                      }
                      rows={customers.map((customer) => [
                        <strong style={{ color: 'var(--text)' }}>
                          {customer.name}
                        </strong>,
                        customer.contactEmail || 'No contact added',
                        formatDate(customer.createdAt),
                        <button
                          type="button"
                          className="workorder-link-button"
                          onClick={() => navigateTo('sites')}
                        >
                          View sites
                          <ArrowRight size={13} />
                        </button>,
                      ])}
                    />
                  </section>
                </>
              )}
              {page === 'sites' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Sites</h2>
                      <p>
                        Know where the work happens and who is responsible for
                        it.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="workorder-primary-button"
                      onClick={() => setShowCreateSite(true)}
                    >
                      <Plus size={16} />
                      Add site
                    </button>
                  </div>
                  <div className="workorder-toolbar">
                    <select
                      className="workorder-select"
                      style={{ maxWidth: 240 }}
                      value={siteCustomerFilter}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSiteCustomerFilter(value);
                        loadSites(value);
                      }}
                    >
                      <option value="all">All customers</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="workorder-section-grid"
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(260px, 1fr))',
                    }}
                  >
                    {sites.length === 0 ? (
                      <section
                        className="workorder-panel workorder-empty"
                        style={{ gridColumn: '1 / -1' }}
                      >
                        <div className="workorder-empty-icon">
                          <MapPinIcon size={21} />
                        </div>
                        <h3>
                          {loading.sites
                            ? 'Loading sites'
                            : 'No sites found'}
                        </h3>
                        <p>
                          Add a site to give dispatch a physical destination.
                        </p>
                      </section>
                    ) : (
                      sites.map((site) => (
                        <section
                          className="workorder-panel"
                          key={site.id}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              display: 'grid',
                              placeItems: 'center',
                              borderRadius: 12,
                              color: 'var(--accent)',
                              background: 'rgba(84, 102, 217, .12)',
                            }}
                          >
                            <MapPinIcon size={18} />
                          </div>
                          <h3
                            style={{
                              margin: '20px 0 6px',
                              color: 'var(--text)',
                              fontFamily: "'Space Grotesk', monospace",
                              fontSize: 19,
                              fontWeight: 500,
                              letterSpacing: '-.04em',
                            }}
                          >
                            {site.name}
                          </h3>
                          <p
                            className="workorder-muted"
                            style={{ minHeight: 32 }}
                          >
                            {site.address || 'No address added'}
                          </p>
                          <div
                            style={{
                              marginTop: 18,
                              paddingTop: 13,
                              borderTop: '1px solid var(--line)',
                              color: 'var(--muted)',
                              fontSize: 11,
                            }}
                          >
                            {site.customerName || 'Customer not available'}
                          </div>
                        </section>
                      ))
                    )}
                  </div>
                </>
              )}
              {page === 'sla' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>SLA health</h2>
                      <p>
                        Stay ahead of jobs that need a little more attention.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="workorder-secondary-button"
                    >
                      <CalendarClock size={15} />
                      Current view
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="workorder-section-grid workorder-stats-grid">
                    <MetricCard
                      label="On track"
                      value={
                        slaOrders.filter(
                          (order) => order.slaStatus === 'ON_TRACK',
                        ).length
                      }
                      foot="In a healthy window"
                      icon={ShieldCheck}
                      tone="mint"
                    />
                    <MetricCard
                      label="At risk"
                      value={
                        slaOrders.filter(
                          (order) => order.slaStatus === 'AT_RISK',
                        ).length
                      }
                      foot="Needs monitoring"
                      icon={AlertTriangle}
                      tone="amber"
                    />
                    <MetricCard
                      label="Breached"
                      value={
                        slaOrders.filter(
                          (order) => order.slaStatus === 'BREACHED',
                        ).length
                      }
                      foot="Requires escalation"
                      icon={Zap}
                      tone="rose"
                    />
                    <MetricCard
                      label="Total tracked"
                      value={slaOrders.length}
                      foot="Current work orders"
                      icon={BarChart3}
                      tone="indigo"
                    />
                  </div>
                  <section className="workorder-table-panel">
                    <Table
                      columns={[
                        'Work order',
                        'Priority',
                        'SLA due',
                        'SLA status',
                        'Current status',
                      ]}
                      empty={
                        loading.sla
                          ? 'Loading SLA data…'
                          : 'No SLA records found'
                      }
                      rows={slaOrders
                        .filter(
                          (order) =>
                            !TERMINAL_STATUSES.includes(order.status),
                        )
                        .map((order) => [
                          <button
                            type="button"
                            className="workorder-link-button"
                            onClick={() => openWODetail(order)}
                          >
                            {order.code} · {order.title}
                          </button>,
                          <PriorityPill priority={order.priority} />,
                          formatDateTime(order.slaDueAt),
                          <SlaPill value={order.slaStatus} />,
                          <StatusPill status={order.status} />,
                        ])}
                    />
                  </section>
                </>
              )}
              {page === 'timelogs' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Time logs</h2>
                      <p>
                        Capture the shape of the day, one visit at a time.
                      </p>
                    </div>
                  </div>
                  <section
                    className="workorder-panel workorder-empty"
                    style={{ minHeight: 360 }}
                  >
                    <div className="workorder-empty-icon">
                      <Clock3 size={22} />
                    </div>
                    <h3>Time logs will appear here</h3>
                    <p>
                      Open a work order to review technician time and service
                      visits.
                    </p>
                  </section>
                </>
              )}
              {page === 'parts' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Parts inventory</h2>
                      <p>Keep the right material close to the work.</p>
                    </div>
                    <button
                      type="button"
                      className="workorder-primary-button"
                      onClick={() => setShowCreatePart(true)}
                    >
                      <Plus size={16} />
                      Add part
                    </button>
                  </div>
                  <section className="workorder-table-panel">
                    <Table
                      columns={[
                        'Part',
                        'SKU',
                        'Unit cost',
                        'Stock',
                        'Status',
                        'Action',
                      ]}
                      empty={
                        loading.parts
                          ? 'Loading parts inventory…'
                          : 'No parts found'
                      }
                      rows={partsInventory.map((part) => [
                        <strong style={{ color: 'var(--text)' }}>
                          {part.name}
                        </strong>,
                        <span className="workorder-code">{part.sku}</span>,
                        `$${Number(part.unitCost || 0).toFixed(2)}`,
                        `${part.stockQty} units`,
                        <PartStatusPill status={part.status} />,
                        <button
                          type="button"
                          className="workorder-icon-button"
                          title={`Delete ${part.name}`}
                          aria-label={`Delete ${part.name}`}
                          onClick={() => setPartToDelete(part)}
                        >
                          <Trash2 size={15} />
                        </button>,
                      ])}
                    />
                  </section>
                </>
              )}
              {page === 'team' && (
                <>
                  <div className="workorder-page-head">
                    <div>
                      <div className="workorder-eyebrow">
                        {pageSubtitle}
                      </div>
                      <h2>Team & settings</h2>
                      <p>Keep access clear as the operation grows.</p>
                    </div>
                    {role === 'MANAGER' && inviteCode && (
                      <button
                        type="button"
                        className="workorder-primary-button"
                        onClick={copyInvite}
                      >
                        <Copy size={15} />
                        {copied ? 'Copied' : 'Copy invite'}
                      </button>
                    )}
                  </div>
                  <div className="workorder-dashboard-grid">
                    <section className="workorder-panel">
                      <div className="workorder-panel-title">
                        Current workspace member
                      </div>
                      <div className="workorder-panel-subtitle">
                        Your authenticated workspace identity
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginTop: 22,
                        }}
                      >
                        <div className="workorder-avatar">
                          {profileInitial}
                        </div>
                        <div>
                          <strong
                            style={{
                              display: 'block',
                              color: 'var(--text)',
                              fontSize: 13,
                            }}
                          >
                            {email || 'Workspace user'}
                          </strong>
                          <span
                            style={{
                              display: 'block',
                              marginTop: 4,
                              color: 'var(--muted)',
                              fontSize: 11,
                            }}
                          >
                            {role || 'Team member'}
                          </span>
                        </div>
                      </div>
                    </section>
                    <section className="workorder-panel">
                      <div className="workorder-panel-title">
                        Workspace invite
                      </div>
                      <div className="workorder-panel-subtitle">
                        Share access with approved team members.
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          marginTop: 20,
                        }}
                      >
                        <input
                          className="workorder-input"
                          value={role === 'MANAGER' ? inviteCode || '' : ''}
                          readOnly
                          placeholder="Invite code unavailable"
                        />
                        {role === 'MANAGER' && inviteCode && (
                          <button
                            type="button"
                            className="workorder-secondary-button"
                            onClick={copyInvite}
                            aria-label="Copy invite code"
                          >
                            <Copy size={15} />
                          </button>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              )}
              {page === 'wo-detail' && selectedWO && (
                <>
                  <button
                    type="button"
                    className="workorder-link-button"
                    style={{ marginBottom: 18 }}
                    onClick={() => navigateTo('workorders')}
                  >
                    <ArrowLeft size={14} />
                    Back to work orders
                  </button>
                  <div className="workorder-detail-layout">
                    <div className="workorder-section-grid">
                      <section className="workorder-panel workorder-detail-hero">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <div>
                            <div className="workorder-code">
                              {selectedWO.code}
                            </div>
                            <h2>{selectedWO.title}</h2>
                            <p>
                              {selectedWO.description ||
                                'No description provided.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="workorder-icon-button"
                            aria-label="More work order actions"
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </div>
                        <div className="workorder-detail-statuses">
                          <StatusPill status={selectedWO.status} />
                          <SlaPill value={selectedWO.slaStatus} />
                          <PriorityPill priority={selectedWO.priority} />
                        </div>
                        <div className="workorder-detail-grid">
                          <div className="workorder-detail-stat">
                            <span>Customer</span>
                            <strong>
                              {selectedWO.customerName || '—'}
                            </strong>
                          </div>
                          <div className="workorder-detail-stat">
                            <span>Site</span>
                            <strong>{selectedWO.siteName || '—'}</strong>
                          </div>
                          <div className="workorder-detail-stat">
                            <span>Assigned to</span>
                            <strong>
                              {selectedWO.assignedToName || 'Unassigned'}
                            </strong>
                          </div>
                          <div className="workorder-detail-stat">
                            <span>SLA due</span>
                            <strong>
                              {formatDateTime(selectedWO.slaDueAt)}
                            </strong>
                          </div>
                          <div className="workorder-detail-stat">
                            <span>Created</span>
                            <strong>
                              {formatDateTime(selectedWO.createdAt)}
                            </strong>
                          </div>
                          <div className="workorder-detail-stat">
                            <span>Updated</span>
                            <strong>
                              {formatDateTime(selectedWO.updatedAt)}
                            </strong>
                          </div>
                        </div>
                      </section>
                      <section className="workorder-panel">
                        <div className="workorder-panel-head">
                          <div>
                            <div className="workorder-panel-title">
                              Status history
                            </div>
                            <div className="workorder-panel-subtitle">
                              A clear handoff trail for the whole team
                            </div>
                          </div>
                        </div>
                        {woHistory.length === 0 ? (
                          <div className="workorder-empty">
                            <div className="workorder-empty-icon">
                              <Clock3 size={20} />
                            </div>
                            <h3>No history available</h3>
                            <p>
                              Status changes will appear here as the job moves
                              forward.
                            </p>
                          </div>
                        ) : (
                          <div className="workorder-timeline">
                            {woHistory.map((history, index) => (
                              <div
                                className="workorder-timeline-item"
                                key={`${history.changedAt}-${index}`}
                              >
                                <div className="workorder-timeline-dot">
                                  <Check size={14} />
                                </div>
                                <div>
                                  <strong>
                                    {formatStatus(history.toStatus)}
                                  </strong>
                                  <div className="workorder-muted">
                                    {history.changedByName || 'System'} ·{' '}
                                    {formatDateTime(history.changedAt)}
                                  </div>
                                  {history.note && <p>{history.note}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                    <div className="workorder-section-grid">
                      <section className="workorder-panel">
                        <div className="workorder-panel-head">
                          <div>
                            <div className="workorder-panel-title">
                              Parts used
                            </div>
                            <div className="workorder-panel-subtitle">
                              Materials logged against this job
                            </div>
                          </div>
                          <Package size={18} color="var(--muted-2)" />
                        </div>
                        {woParts.length === 0 ? (
                          <div className="workorder-empty">
                            <h3>No parts logged</h3>
                            <p>
                              Materials used on this work order will appear
                              here.
                            </p>
                          </div>
                        ) : (
                          woParts.map((part) => (
                            <div
                              key={`${part.partName}-${part.qtyUsed}`}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                                padding: '13px 0',
                                borderTop: '1px solid var(--line)',
                              }}
                            >
                              <div>
                                <strong
                                  style={{
                                    display: 'block',
                                    color: 'var(--text)',
                                    fontSize: 12,
                                  }}
                                >
                                  {part.partName}
                                </strong>
                                <span className="workorder-muted">
                                  {part.qtyUsed} units
                                </span>
                              </div>
                              <span className="workorder-code">
                                ${Number(part.totalCost || 0).toFixed(2)}
                              </span>
                            </div>
                          ))
                        )}
                      </section>
                      <section className="workorder-panel">
                        <div className="workorder-panel-title">
                          Service signal
                        </div>
                        <div className="workorder-panel-subtitle">
                          Current SLA state
                        </div>
                        <div style={{ marginTop: 18 }}>
                          <SlaPill value={selectedWO.slaStatus} />
                        </div>
                        <div
                          style={{
                            marginTop: 16,
                            color: 'var(--muted)',
                            fontSize: 12,
                            lineHeight: 1.6,
                          }}
                        >
                          Keep the customer and assigned team informed as this
                          work order progresses.
                        </div>
                      </section>
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
        {showInvite && (
          <Modal
            title="Workspace invite code"
            description="Share this code only with approved dispatchers and technicians."
            onClose={() => setShowInvite(false)}
          >
            <div
              style={{
                padding: 18,
                border: '1px solid var(--line)',
                borderRadius: 14,
                color: 'var(--accent)',
                background: 'var(--soft)',
                fontFamily: "'Space Grotesk', monospace",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 4,
                textAlign: 'center',
              }}
            >
              {inviteCode}
            </div>
            <div className="workorder-modal-actions">
              <button
                type="button"
                className="workorder-primary-button"
                onClick={copyInvite}
              >
                <Copy size={15} />
                {copied ? 'Copied' : 'Copy code'}
              </button>
            </div>
          </Modal>
        )}
        {showCreateWO && (
          <Modal
            title="Create work order"
            description="Give dispatch the information needed for the first assignment."
            onClose={() => setShowCreateWO(false)}
            onSubmit={createWorkOrder}
            submitLabel="Create work order"
          >
            <div className="workorder-form">
              <label className="workorder-form-label">
                Title
                <input
                  className="workorder-input"
                  value={woForm.title}
                  onChange={(event) =>
                    setWoForm({
                      ...woForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Work order title"
                />
              </label>
              <label className="workorder-form-label">
                Description
                <textarea
                  className="workorder-textarea"
                  value={woForm.description}
                  onChange={(event) =>
                    setWoForm({
                      ...woForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Add the context a technician will need"
                />
              </label>
              <div className="workorder-form-grid two">
                <label className="workorder-form-label">
                  Priority
                  <select
                    className="workorder-select"
                    value={woForm.priority}
                    onChange={(event) =>
                      setWoForm({
                        ...woForm,
                        priority: event.target.value,
                      })
                    }
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </label>
                <label className="workorder-form-label">
                  Customer
                  <select
                    className="workorder-select"
                    value={woForm.customerId}
                    onChange={(event) =>
                      setWoForm({
                        ...woForm,
                        customerId: event.target.value,
                        siteId: '',
                      })
                    }
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="workorder-form-label">
                Site
                <select
                  className="workorder-select"
                  value={woForm.siteId}
                  onChange={(event) =>
                    setWoForm({
                      ...woForm,
                      siteId: event.target.value,
                    })
                  }
                  disabled={!woForm.customerId}
                >
                  <option value="">
                    {woForm.customerId
                      ? 'Select site'
                      : 'Choose a customer first'}
                  </option>
                  {sitesForWorkOrderCustomer.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Modal>
        )}
        {showCreateCustomer && (
          <Modal
            title="Add customer"
            description="Create a customer record for your service team."
            onClose={() => setShowCreateCustomer(false)}
            onSubmit={createCustomer}
            submitLabel="Add customer"
          >
            <div className="workorder-form">
              <label className="workorder-form-label">
                Company name
                <input
                  className="workorder-input"
                  value={custForm.name}
                  onChange={(event) =>
                    setCustForm({
                      ...custForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Company name"
                />
              </label>
              <label className="workorder-form-label">
                Contact email
                <input
                  className="workorder-input"
                  type="email"
                  value={custForm.contactEmail}
                  onChange={(event) =>
                    setCustForm({
                      ...custForm,
                      contactEmail: event.target.value,
                    })
                  }
                  placeholder="Contact email"
                />
              </label>
            </div>
          </Modal>
        )}
        {showCreateSite && (
          <Modal
            title="Add site"
            description="Connect a service location to an existing customer."
            onClose={() => setShowCreateSite(false)}
            onSubmit={createSite}
            submitLabel="Add site"
          >
            <div className="workorder-form">
              <label className="workorder-form-label">
                Customer
                <select
                  className="workorder-select"
                  value={siteForm.customerId}
                  onChange={(event) =>
                    setSiteForm({
                      ...siteForm,
                      customerId: event.target.value,
                    })
                  }
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="workorder-form-label">
                Site name
                <input
                  className="workorder-input"
                  value={siteForm.name}
                  onChange={(event) =>
                    setSiteForm({
                      ...siteForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Site name"
                />
              </label>
              <label className="workorder-form-label">
                Address
                <input
                  className="workorder-input"
                  value={siteForm.address}
                  onChange={(event) =>
                    setSiteForm({
                      ...siteForm,
                      address: event.target.value,
                    })
                  }
                  placeholder="Site address"
                />
              </label>
            </div>
          </Modal>
        )}
        {showCreatePart && (
          <Modal
            title="Add inventory part"
            description="Track stock before the next dispatch."
            onClose={() => setShowCreatePart(false)}
            onSubmit={createPart}
            submitLabel="Add to inventory"
          >
            <div className="workorder-form">
              <div className="workorder-form-grid two">
                <label className="workorder-form-label">
                  SKU
                  <input
                    className="workorder-input"
                    value={partForm.sku}
                    onChange={(event) =>
                      setPartForm({
                        ...partForm,
                        sku: event.target.value,
                      })
                    }
                    placeholder="Part SKU"
                  />
                </label>
                <label className="workorder-form-label">
                  Part name
                  <input
                    className="workorder-input"
                    value={partForm.name}
                    onChange={(event) =>
                      setPartForm({
                        ...partForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Part name"
                  />
                </label>
              </div>
              <div className="workorder-form-grid two">
                <label className="workorder-form-label">
                  Unit cost
                  <input
                    className="workorder-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={partForm.unitCost}
                    onChange={(event) =>
                      setPartForm({
                        ...partForm,
                        unitCost: event.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </label>
                <label className="workorder-form-label">
                  Stock quantity
                  <input
                    className="workorder-input"
                    type="number"
                    min="0"
                    step="1"
                    value={partForm.stockQty}
                    onChange={(event) =>
                      setPartForm({
                        ...partForm,
                        stockQty: event.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </label>
              </div>
            </div>
          </Modal>
        )}
        {partToDelete && (
          <Modal
            title="Delete inventory item?"
            description="This action cannot be undone."
            onClose={() => {
              if (!deletingPart) {
                setPartToDelete(null);
              }
            }}
          >
            <div
              style={{
                padding: 16,
                border: '1px solid var(--line)',
                borderRadius: 14,
                color: 'var(--body)',
                background: 'var(--soft)',
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Delete{' '}
              <strong style={{ color: 'var(--text)' }}>
                {partToDelete.name}
              </strong>{' '}
              ({partToDelete.sku}) permanently?
            </div>
            <div className="workorder-modal-actions">
              <button
                type="button"
                className="workorder-secondary-button"
                disabled={deletingPart}
                onClick={() => setPartToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="workorder-danger-button"
                disabled={deletingPart}
                onClick={deletePart}
              >
                <Trash2 size={15} />
                {deletingPart ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </Modal>
        )}
        {toast && (
          <div className="workorder-toast" role="status">
            <CheckCircle2 size={16} />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}