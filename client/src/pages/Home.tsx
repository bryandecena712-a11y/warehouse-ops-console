import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  FileBarChart,
  Filter,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  PackageCheck,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Truck,
  UserRound,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import FileLibrary from "@/components/FileLibrary";

type View =
  | "overview"
  | "inventory"
  | "receiving"
  | "orders"
  | "movements"
  | "reports"
  | "files";
type StockStatus = "In stock" | "Low stock" | "Out of stock";
type OrderStatus = "Pending" | "Picking" | "Ready" | "Completed";
type MovementType = "Received" | "Released" | "Transferred" | "Adjusted";

type Product = {
  id: string;
  name: string;
  category: string;
  qty: number;
  reorder: number;
  location: string;
  status: StockStatus;
  supplier: string;
  unit: string;
};

type Order = {
  id: string;
  customer: string;
  lines: {
    productId: string;
    name: string;
    qty: number;
    location: string;
    picked: boolean;
    available: number;
  }[];
  status: OrderStatus;
  age: string;
  priority: "Standard" | "Expedite";
};

type Movement = {
  id: string;
  time: string;
  product: string;
  sku: string;
  type: MovementType;
  before: number;
  delta: number;
  after: number;
  user: string;
  reference: string;
};

const navItems: {
  id: View;
  label: string;
  icon: typeof LayoutDashboard;
  count?: string;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Boxes, count: "248" },
  { id: "receiving", label: "Receiving", icon: Truck, count: "3" },
  {
    id: "orders",
    label: "Orders & picking",
    icon: ClipboardCheck,
    count: "18",
  },
  { id: "movements", label: "Stock movements", icon: RefreshCw },
  { id: "reports", label: "Reports & alerts", icon: FileBarChart, count: "5" },
  { id: "files", label: "File storage", icon: FolderOpen },
];

const initialProducts: Product[] = [
  {
    id: "HM-104",
    name: "Harbor mug",
    category: "Kitchen",
    qty: 184,
    reorder: 60,
    location: "A-14-03",
    status: "In stock",
    supplier: "Northstar Supply",
    unit: "each",
  },
  {
    id: "LS-220",
    name: "Linen set / sand",
    category: "Textiles",
    qty: 12,
    reorder: 24,
    location: "B-02-18",
    status: "Low stock",
    supplier: "Loom & Co.",
    unit: "set",
  },
  {
    id: "BX-508",
    name: "Shipping box / medium",
    category: "Packaging",
    qty: 640,
    reorder: 160,
    location: "C-08-01",
    status: "In stock",
    supplier: "PackRight",
    unit: "case",
  },
  {
    id: "CT-731",
    name: "Canvas tote / natural",
    category: "Accessories",
    qty: 0,
    reorder: 40,
    location: "B-09-04",
    status: "Out of stock",
    supplier: "Field Goods",
    unit: "each",
  },
  {
    id: "GL-411",
    name: "Glass carafe",
    category: "Kitchen",
    qty: 38,
    reorder: 30,
    location: "A-18-10",
    status: "In stock",
    supplier: "Northstar Supply",
    unit: "each",
  },
  {
    id: "ST-811",
    name: "Stackable tray",
    category: "Storage",
    qty: 19,
    reorder: 40,
    location: "D-01-06",
    status: "Low stock",
    supplier: "ModuHome",
    unit: "each",
  },
  {
    id: "PC-220",
    name: "Packing tape / clear",
    category: "Packaging",
    qty: 91,
    reorder: 35,
    location: "C-04-07",
    status: "In stock",
    supplier: "PackRight",
    unit: "roll",
  },
];

const initialOrders: Order[] = [
  {
    id: "SO-10482",
    customer: "Acme Retail",
    lines: [
      {
        productId: "HM-104",
        name: "Harbor mug",
        qty: 12,
        location: "A-14-03",
        picked: true,
        available: 184,
      },
      {
        productId: "LS-220",
        name: "Linen set / sand",
        qty: 6,
        location: "B-02-18",
        picked: true,
        available: 12,
      },
      {
        productId: "GL-411",
        name: "Glass carafe",
        qty: 4,
        location: "A-18-10",
        picked: false,
        available: 38,
      },
      {
        productId: "BX-508",
        name: "Shipping box / medium",
        qty: 2,
        location: "C-08-01",
        picked: false,
        available: 640,
      },
    ],
    status: "Picking",
    age: "1h 24m",
    priority: "Expedite",
  },
  {
    id: "SO-10477",
    customer: "Westwood Market",
    lines: [
      {
        productId: "CT-731",
        name: "Canvas tote / natural",
        qty: 8,
        location: "B-09-04",
        picked: false,
        available: 0,
      },
      {
        productId: "HM-104",
        name: "Harbor mug",
        qty: 24,
        location: "A-14-03",
        picked: false,
        available: 184,
      },
    ],
    status: "Pending",
    age: "2h 06m",
    priority: "Standard",
  },
  {
    id: "SO-10463",
    customer: "Goodland Co.",
    lines: [
      {
        productId: "ST-811",
        name: "Stackable tray",
        qty: 10,
        location: "D-01-06",
        picked: true,
        available: 19,
      },
      {
        productId: "PC-220",
        name: "Packing tape / clear",
        qty: 4,
        location: "C-04-07",
        picked: true,
        available: 91,
      },
    ],
    status: "Ready",
    age: "3h 14m",
    priority: "Standard",
  },
  {
    id: "SO-10461",
    customer: "Juniper Studio",
    lines: [
      {
        productId: "GL-411",
        name: "Glass carafe",
        qty: 8,
        location: "A-18-10",
        picked: true,
        available: 38,
      },
    ],
    status: "Completed",
    age: "5h 42m",
    priority: "Standard",
  },
];

const initialMovements: Movement[] = [
  {
    id: "m1",
    time: "09:42",
    product: "Harbor mug",
    sku: "HM-104",
    type: "Received",
    before: 136,
    delta: 48,
    after: 184,
    user: "M. Chen",
    reference: "RC-00918",
  },
  {
    id: "m2",
    time: "09:18",
    product: "Linen set / sand",
    sku: "LS-220",
    type: "Released",
    before: 18,
    delta: -6,
    after: 12,
    user: "J. Patel",
    reference: "SO-10482",
  },
  {
    id: "m3",
    time: "08:55",
    product: "Stackable tray",
    sku: "ST-811",
    type: "Adjusted",
    before: 23,
    delta: -4,
    after: 19,
    user: "M. Chen",
    reference: "ADJ-0041",
  },
  {
    id: "m4",
    time: "08:41",
    product: "Glass carafe",
    sku: "GL-411",
    type: "Transferred",
    before: 38,
    delta: 0,
    after: 38,
    user: "R. Diaz",
    reference: "TR-0028",
  },
  {
    id: "m5",
    time: "08:24",
    product: "Packing tape / clear",
    sku: "PC-220",
    type: "Received",
    before: 71,
    delta: 20,
    after: 91,
    user: "M. Chen",
    reference: "RC-00916",
  },
  {
    id: "m6",
    time: "Yesterday",
    product: "Canvas tote / natural",
    sku: "CT-731",
    type: "Released",
    before: 8,
    delta: -8,
    after: 0,
    user: "J. Patel",
    reference: "SO-10451",
  },
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={cx(
        "relative flex shrink-0 items-center justify-center rounded-[10px] bg-[#f2684b] text-white shadow-lg shadow-[#f2684b]/20",
        small ? "h-8 w-8" : "h-9 w-9"
      )}
    >
      <Warehouse size={small ? 16 : 18} strokeWidth={2.6} />
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#f5c15f] ring-2 ring-[#111821]" />
    </div>
  );
}

function StatusBadge({
  status,
  compact = false,
}: {
  status: StockStatus | OrderStatus | MovementType;
  compact?: boolean;
}) {
  const styles: Record<string, string> = {
    "In stock": "bg-[#e8f6ee] text-[#24764d]",
    "Low stock": "bg-[#fff4df] text-[#9b6718]",
    "Out of stock": "bg-[#fde9e9] text-[#a6444a]",
    Pending: "bg-[#eef1f5] text-[#657184]",
    Picking: "bg-[#e9f0ff] text-[#4669b2]",
    Ready: "bg-[#e6f6f0] text-[#24764d]",
    Completed: "bg-[#eff1f5] text-[#596576]",
    Received: "bg-[#e6f6f0] text-[#24764d]",
    Released: "bg-[#fff0ee] text-[#b05445]",
    Transferred: "bg-[#e9f0ff] text-[#4669b2]",
    Adjusted: "bg-[#fff4df] text-[#9b6718]",
  };
  const dot: Record<string, string> = {
    "In stock": "bg-[#2fa36b]",
    "Low stock": "bg-[#e9a23b]",
    "Out of stock": "bg-[#d95c5c]",
    Pending: "bg-[#9da8b7]",
    Picking: "bg-[#5c8dff]",
    Ready: "bg-[#2fa36b]",
    Completed: "bg-[#98a3b2]",
    Received: "bg-[#2fa36b]",
    Released: "bg-[#d95c5c]",
    Transferred: "bg-[#5c8dff]",
    Adjusted: "bg-[#e9a23b]",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]",
        styles[status]
      )}
    >
      <span className={cx("status-dot", dot[status])} />
      {status}
    </span>
  );
}

function IconButton({
  label,
  children,
  onClick,
  className = "",
  badge,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  badge?: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#667489] transition hover:bg-[#eef2f7] hover:text-[#263447]",
        className
      )}
    >
      {children}
      {badge ? (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f2684b] px-1 text-[9px] font-bold text-white ring-2 ring-[#f7f8fa]">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  icon,
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f2684b] px-4 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(242,104,75,0.2)] transition hover:bg-[#dc5a40] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function QuietButton({
  children,
  onClick,
  icon,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "btn-press inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce3eb] bg-white px-4 text-[12px] font-bold text-[#405066] transition hover:border-[#becada] hover:bg-[#f9fafc]",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a96a7]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f2684b]" />
          {eyebrow}
        </div>
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.04em] text-[#1f2938]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#788598]">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {secondaryAction}
        {action}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  trend,
  icon,
  tone = "coral",
  onClick,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: string;
  icon: ReactNode;
  tone?: "coral" | "blue" | "amber" | "green";
  onClick?: () => void;
}) {
  const bg = {
    coral: "bg-[#fff0ec] text-[#f2684b]",
    blue: "bg-[#edf2ff] text-[#5c8dff]",
    amber: "bg-[#fff4df] text-[#c28527]",
    green: "bg-[#e9f7f0] text-[#2fa36b]",
  }[tone];
  return (
    <button
      onClick={onClick}
      className="soft-card soft-card-hover group w-full rounded-2xl p-4 text-left"
    >
      <div className="flex items-start justify-between">
        <div
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            bg
          )}
        >
          {icon}
        </div>
        {trend ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#2fa36b]">
            <ArrowUpRight size={12} />
            {trend}
          </span>
        ) : null}
      </div>
      <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.11em] text-[#8995a6]">
        {label}
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="font-display text-[27px] font-bold tracking-[-0.04em] text-[#202a38]">
          {value}
        </div>
        <span className="pb-1 text-[11px] font-medium text-[#8995a6] transition group-hover:text-[#f2684b]">
          {detail}
        </span>
      </div>
    </button>
  );
}

function Shell({
  view,
  onView,
  children,
  onLogout,
  onSearch,
  onShowNotifications,
  notificationsOpen,
  onCloseNotifications,
  unread,
}: {
  view: View;
  onView: (view: View) => void;
  children: ReactNode;
  onLogout: () => void;
  onSearch: (value: string) => void;
  onShowNotifications: () => void;
  notificationsOpen: boolean;
  onCloseNotifications: () => void;
  unread: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = (next: View) => {
    onView(next);
    setMobileOpen(false);
  };
  return (
    <div className="app-shell flex min-h-screen">
      <aside
        className={cx(
          "sidebar-shell fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-2">
          <LogoMark />
          <div>
            <div className="font-display text-[15px] font-bold tracking-[-0.03em] text-white">
              Warehouse Ops
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8390a2]">
              Northstar / DC-01
            </div>
          </div>
        </div>
        <div className="mt-10 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#677487]">
          Workspace
        </div>
        <nav className="mt-3 flex flex-1 flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cx(
                  "sidebar-link flex h-11 items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold",
                  view === item.id ? "active" : ""
                )}
              >
                <Icon size={17} strokeWidth={view === item.id ? 2.5 : 2} />
                <span className="flex-1">{item.label}</span>
                {item.count ? (
                  <span
                    className={cx(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      view === item.id
                        ? "bg-white/20 text-white"
                        : "bg-[#26303f] text-[#94a0b0]"
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
          <div className="my-4 border-t border-white/8" />
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="sidebar-link flex h-11 items-center gap-3 rounded-xl px-3 text-left text-[12px] font-semibold"
          >
            <Settings2 size={17} />
            <span className="flex-1">Workspace settings</span>
            <ChevronRight size={14} className="text-[#677487]" />
          </button>
        </nav>
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#273445] text-[#e9b268]">
              <Zap size={15} fill="currentColor" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#dfe6ef]">
                Shift pulse
              </div>
              <div className="mt-0.5 text-[10px] text-[#7f8b9b]">
                On track · 86% packed
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#26303d]">
            <div className="h-full w-[86%] rounded-full bg-[#f2b45f]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-white/8 px-2 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce7ff] text-[12px] font-bold text-[#4669b2]">
            MC
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-bold text-white">
              Maya Chen
            </div>
            <div className="truncate text-[10px] text-[#7f8b9b]">
              Inventory manager
            </div>
          </div>
          <IconButton
            label="Sign out"
            onClick={onLogout}
            className="h-8 w-8 text-[#8591a1] hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
          </IconButton>
        </div>
      </aside>
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[#111821]/60 lg:hidden"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <header className="topbar-blur sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-[#e6eaf0] px-4 md:px-8">
          <IconButton
            label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden"
          >
            <Menu size={20} />
          </IconButton>
          <div className="hidden items-center gap-2 text-[11px] font-semibold text-[#8995a6] md:flex">
            <span>Northstar DC-01</span>
            <ChevronRight size={13} />
            <span className="font-bold text-[#435066]">
              {navItems.find(item => item.id === view)?.label}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="input-shell hidden h-10 w-[260px] items-center gap-2 rounded-xl px-3 md:flex">
              <Search size={15} className="text-[#9aa6b6]" />
              <input
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  onSearch(event.target.value);
                }}
                onKeyDown={event => {
                  if (event.key === "Enter") onSearch(search);
                }}
                placeholder="Search workspace"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#263447] outline-none placeholder:text-[#a2adbc]"
              />
              <kbd className="rounded-md border border-[#dce3eb] bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#a0abba]">
                ⌘ K
              </kbd>
            </div>
            <IconButton
              label="Notifications"
              onClick={onShowNotifications}
              badge={unread.toString()}
            >
              <Bell size={18} />
            </IconButton>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="ml-1 flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-[#eef2f7]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce7ff] text-[12px] font-bold text-[#4669b2]">
                MC
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-bold text-[#334155]">
                  Maya Chen
                </div>
                <div className="text-[10px] text-[#8a96a7]">Ops manager</div>
              </div>
              <ChevronDown
                size={14}
                className="hidden text-[#98a4b3] sm:block"
              />
            </button>
            {profileOpen ? (
              <div className="absolute right-5 top-[66px] z-30 w-52 rounded-2xl border border-[#e2e7ee] bg-white p-2 shadow-[0_18px_50px_rgba(28,39,54,0.16)]">
                <div className="border-b border-[#eef1f4] px-3 py-2">
                  <div className="text-[12px] font-bold text-[#253246]">
                    Maya Chen
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#8a96a7]">
                    maya.chen@northstar.co
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold text-[#b05445] hover:bg-[#fff2ef]"
                >
                  <LogOut size={14} /> Sign out of workspace
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-7 md:px-8 lg:px-10">
          {children}
        </main>
      </div>
      {notificationsOpen ? (
        <NotificationTray onClose={onCloseNotifications} onView={onView} />
      ) : null}
    </div>
  );
}

function NotificationTray({
  onClose,
  onView,
}: {
  onClose: () => void;
  onView: (view: View) => void;
}) {
  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 bg-[#111821]/20"
      onClick={onClose}
    >
      <aside
        onClick={event => event.stopPropagation()}
        className="drawer-enter absolute right-0 top-0 h-full w-full max-w-[390px] overflow-y-auto bg-[#fbfcfd] p-5 shadow-[-18px_0_55px_rgba(17,24,33,0.15)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a96a7]">
              Attention center
            </div>
            <h2 className="mt-1 font-display text-[22px] font-bold tracking-[-0.03em] text-[#202a38]">
              Notifications <span className="text-[#f2684b]">· 5 new</span>
            </h2>
          </div>
          <IconButton label="Close notifications" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="mt-6 space-y-3">
          {[
            {
              tone: "critical",
              title: "Canvas tote is out of stock",
              body: "CT-731 needs replenishment before SO-10477 can ship.",
              time: "8 min ago",
              view: "inventory" as View,
            },
            {
              tone: "warning",
              title: "3 orders aging past 4 hours",
              body: "Review the picking queue to protect today’s dispatch window.",
              time: "21 min ago",
              view: "orders" as View,
            },
            {
              tone: "info",
              title: "Delivery RC-00918 received",
              body: "48 units of Harbor mug are now available in A-14-03.",
              time: "42 min ago",
              view: "receiving" as View,
            },
            {
              tone: "success",
              title: "Order SO-10463 is ready",
              body: "All lines have been picked and staged for dispatch.",
              time: "1 hr ago",
              view: "orders" as View,
            },
          ].map(item => (
            <button
              key={item.title}
              onClick={() => {
                onView(item.view);
                onClose();
              }}
              className="group w-full rounded-2xl border border-[#e2e7ee] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#cbd6e4] hover:shadow-[0_8px_22px_rgba(34,46,62,0.07)]"
            >
              <div className="flex gap-3">
                <div
                  className={cx(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                    item.tone === "critical"
                      ? "bg-[#fde9e9] text-[#d95c5c]"
                      : item.tone === "warning"
                        ? "bg-[#fff4df] text-[#c28527]"
                        : item.tone === "success"
                          ? "bg-[#e9f7f0] text-[#2fa36b]"
                          : "bg-[#edf2ff] text-[#5c8dff]"
                  )}
                >
                  {item.tone === "critical" ? (
                    <AlertTriangle size={15} />
                  ) : item.tone === "warning" ? (
                    <Clock3 size={15} />
                  ) : item.tone === "success" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Truck size={15} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[12px] font-bold text-[#2a3748]">
                      {item.title}
                    </div>
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2684b]" />
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-[#7e8a9b]">
                    {item.body}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-[#a0abba]">
                    <span>{item.time}</span>
                    <span className="text-[#5c8dff] opacity-0 transition group-hover:opacity-100">
                      View module{" "}
                      <ArrowRight size={11} className="ml-0.5 inline" />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#cad4df] py-3 text-[11px] font-bold text-[#748195] hover:bg-[#f3f6f9]"
        >
          <Check size={14} /> Mark all as read
        </button>
      </aside>
    </div>
  );
}

function Overview({
  onView,
  onSelectProduct,
  onOpenReceiving,
}: {
  onView: (view: View) => void;
  onSelectProduct: (product: Product) => void;
  onOpenReceiving: () => void;
}) {
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Saturday, Sep 26 · Morning shift"
        title="Good morning, Maya"
        subtitle="Here’s the operational pulse for Northstar Distribution Center. Three items need attention before 11:00."
        action={
          <PrimaryButton onClick={onOpenReceiving} icon={<Plus size={16} />}>
            Receive stock
          </PrimaryButton>
        }
        secondaryAction={
          <QuietButton
            onClick={() => onView("orders")}
            icon={<ClipboardCheck size={15} />}
          >
            View picking queue
          </QuietButton>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total products"
          value="248"
          detail="Catalog SKUs"
          trend="+6 this week"
          icon={<Boxes size={19} />}
          tone="coral"
          onClick={() => onView("inventory")}
        />
        <MetricCard
          label="Available stock"
          value="12,480"
          detail="units on hand"
          trend="+8.4%"
          icon={<PackageOpen size={19} />}
          tone="blue"
        />
        <MetricCard
          label="Low-stock items"
          value="18"
          detail="need review"
          icon={<AlertTriangle size={19} />}
          tone="amber"
          onClick={() => onView("inventory")}
        />
        <MetricCard
          label="Orders to pick"
          value="18"
          detail="6 in progress"
          trend="2 ready"
          icon={<ClipboardCheck size={19} />}
          tone="green"
          onClick={() => onView("orders")}
        />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="soft-card rounded-2xl p-5 fade-up fade-up-delay-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[16px] font-bold tracking-[-0.025em] text-[#253246]">
                  Low-stock attention
                </h2>
                <span className="rounded-full bg-[#fff4df] px-2 py-1 text-[10px] font-bold text-[#9b6718]">
                  3 urgent
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8a96a7]">
                Replenish or review before the next dispatch wave.
              </p>
            </div>
            <button
              onClick={() => onView("inventory")}
              className="text-[11px] font-bold text-[#5c8dff] hover:text-[#4669b2]"
            >
              View inventory <ArrowRight size={12} className="ml-1 inline" />
            </button>
          </div>
          <div className="mt-5 divide-y divide-[#eef1f4]">
            {initialProducts
              .filter(p => p.status !== "In stock")
              .map(product => (
                <button
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"
                >
                  <div
                    className={cx(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      product.status === "Out of stock"
                        ? "bg-[#fde9e9] text-[#d95c5c]"
                        : "bg-[#fff4df] text-[#c28527]"
                    )}
                  >
                    <PackageOpen size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-medium text-[#8a96a7]">
                        {product.id}
                      </span>
                      <span className="truncate text-[12px] font-bold text-[#334155]">
                        {product.name}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-[#8a96a7]">
                      {product.location} · reorder at {product.reorder}{" "}
                      {product.unit}s
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[15px] font-bold text-[#263447]">
                      {product.qty}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#9aa6b6]">
                      on hand
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-[#b3bdc9] transition group-hover:translate-x-0.5 group-hover:text-[#5c8dff]"
                  />
                </button>
              ))}
          </div>
        </div>
        <div className="soft-card rounded-2xl p-5 fade-up fade-up-delay-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[16px] font-bold tracking-[-0.025em] text-[#253246]">
                Incoming deliveries
              </h2>
              <p className="mt-1 text-[11px] text-[#8a96a7]">
                Expected today · 3 deliveries
              </p>
            </div>
            <button
              onClick={onOpenReceiving}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0ec] text-[#f2684b] hover:bg-[#ffe4de]"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {[
              {
                id: "RC-00920",
                supplier: "Loom & Co.",
                eta: "10:30",
                units: "84 units",
                status: "Arriving",
              },
              {
                id: "RC-00921",
                supplier: "PackRight",
                eta: "12:15",
                units: "240 cases",
                status: "Scheduled",
              },
              {
                id: "RC-00922",
                supplier: "Northstar Supply",
                eta: "14:40",
                units: "120 units",
                status: "Scheduled",
              },
            ].map((delivery, index) => (
              <div
                key={delivery.id}
                className="flex items-center gap-3 rounded-xl border border-[#eef1f4] bg-[#fbfcfd] px-3 py-3"
              >
                <div
                  className={cx(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    index === 0
                      ? "bg-[#e9f0ff] text-[#5c8dff]"
                      : "bg-[#eef1f5] text-[#7d8999]"
                  )}
                >
                  <Truck size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-medium text-[#7d8999]">
                      {delivery.id}
                    </span>
                    <span
                      className={cx(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        index === 0
                          ? "bg-[#e9f0ff] text-[#4669b2]"
                          : "bg-[#eef1f5] text-[#778395]"
                      )}
                    >
                      {delivery.status}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-[11px] font-bold text-[#334155]">
                    {delivery.supplier}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] font-bold text-[#455469]">
                    {delivery.eta}
                  </div>
                  <div className="mt-1 text-[10px] text-[#9aa6b6]">
                    {delivery.units}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onOpenReceiving}
            className="mt-4 flex w-full items-center justify-center gap-1 text-[11px] font-bold text-[#5c8dff] hover:text-[#4669b2]"
          >
            Open receiving workspace <ArrowRight size={12} />
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.35fr]">
        <div className="soft-card rounded-2xl p-5 fade-up fade-up-delay-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[16px] font-bold tracking-[-0.025em] text-[#253246]">
                Recent activity
              </h2>
              <p className="mt-1 text-[11px] text-[#8a96a7]">
                Latest changes across the floor
              </p>
            </div>
            <button
              onClick={() => onView("movements")}
              className="text-[11px] font-bold text-[#5c8dff]"
            >
              View log
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {[
              {
                icon: <PackageCheck size={14} />,
                title: "48 Harbor mugs received",
                body: "Maya Chen · RC-00918",
                time: "9:42 AM",
                color: "bg-[#e9f7f0] text-[#2fa36b]",
              },
              {
                icon: <ClipboardCheck size={14} />,
                title: "SO-10482 moved to Picking",
                body: "Jordan Patel · 4 line items",
                time: "9:18 AM",
                color: "bg-[#edf2ff] text-[#5c8dff]",
              },
              {
                icon: <RefreshCw size={14} />,
                title: "Stackable tray stock adjusted",
                body: "Maya Chen · -4 units",
                time: "8:55 AM",
                color: "bg-[#fff4df] text-[#c28527]",
              },
            ].map(activity => (
              <div key={activity.title} className="flex items-start gap-3">
                <div
                  className={cx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    activity.color
                  )}
                >
                  {activity.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-[#334155]">
                    {activity.title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#8a96a7]">
                    {activity.body}
                  </div>
                </div>
                <div className="text-[10px] font-medium text-[#a0abba]">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="soft-card rounded-2xl p-5 fade-up fade-up-delay-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[16px] font-bold tracking-[-0.025em] text-[#253246]">
                  Shift pulse
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-[#e9f7f0] px-2 py-1 text-[10px] font-bold text-[#24764d]">
                  <span className="status-dot bg-[#2fa36b]" />
                  On track
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#8a96a7]">
                Throughput vs. plan · Saturday shift
              </p>
            </div>
            <button
              onClick={() => onView("reports")}
              className="text-[11px] font-bold text-[#5c8dff]"
            >
              Open reports
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#fbfcfd] p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9aa6b6]">
                Picked
              </div>
              <div className="mt-1 font-display text-[22px] font-bold text-[#263447]">
                86%
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[#2fa36b]">
                +12% vs plan
              </div>
            </div>
            <div className="rounded-xl bg-[#fbfcfd] p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9aa6b6]">
                Received
              </div>
              <div className="mt-1 font-display text-[22px] font-bold text-[#263447]">
                64%
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[#c28527]">
                2 inbound
              </div>
            </div>
            <div className="rounded-xl bg-[#fbfcfd] p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9aa6b6]">
                Accuracy
              </div>
              <div className="mt-1 font-display text-[22px] font-bold text-[#263447]">
                99.2%
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[#2fa36b]">
                +0.4% this week
              </div>
            </div>
          </div>
          <div className="mt-4 flex h-[88px] items-end gap-2 rounded-xl bg-[#fbfcfd] px-4 pb-3 pt-4">
            <div className="flex h-full flex-1 items-end gap-1.5">
              {[35, 44, 37, 58, 49, 68, 61, 82, 75, 88, 78, 92].map(
                (height, index) => (
                  <div
                    key={index}
                    className={cx(
                      "flex-1 rounded-t-md transition hover:opacity-75",
                      index > 8 ? "bg-[#f2684b]" : "bg-[#cedcff]"
                    )}
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
          </div>
          <div className="mt-2 flex justify-between px-1 text-[9px] font-mono text-[#a2adbc]">
            <span>06:00</span>
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inventory({
  products,
  search,
  setSearch,
  onSelectProduct,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: {
  products: Product[];
  search: string;
  setSearch: (v: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}) {
  const [filter, setFilter] = useState<StockStatus | "All">("All");
  const filtered = products.filter(product => {
    const matchesSearch =
      `${product.id} ${product.name} ${product.category} ${product.location} ${product.supplier}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesFilter = filter === "All" || product.status === filter;
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Module 02 · Catalog health"
        title="Inventory"
        subtitle="Search every SKU, understand stock risk, and keep the catalog accurate."
        action={
          <PrimaryButton onClick={onAddProduct} icon={<Plus size={16} />}>
            Add product
          </PrimaryButton>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="soft-card rounded-xl px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
            Total catalog
          </div>
          <div className="mt-1 font-display text-[22px] font-bold text-[#263447]">
            {products.length === initialProducts.length
              ? "248"
              : products.length}
          </div>
          <div className="mt-1 text-[10px] text-[#8a96a7]">
            SKUs actively managed
          </div>
        </div>
        <div className="soft-card rounded-xl px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
            Low stock
          </div>
          <div className="mt-1 font-display text-[22px] font-bold text-[#c28527]">
            {products.filter(p => p.status === "Low stock").length +
              (products.length === initialProducts.length ? 16 : 0)}
          </div>
          <div className="mt-1 text-[10px] text-[#8a96a7]">
            below reorder point
          </div>
        </div>
        <div className="soft-card rounded-xl px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
            Out of stock
          </div>
          <div className="mt-1 font-display text-[22px] font-bold text-[#c94f55]">
            {products.filter(p => p.status === "Out of stock").length +
              (products.length === initialProducts.length ? 3 : 0)}
          </div>
          <div className="mt-1 text-[10px] text-[#8a96a7]">
            blocking availability
          </div>
        </div>
      </div>
      <div className="soft-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="input-shell flex h-10 flex-1 items-center gap-2 rounded-xl px-3">
            <Search size={15} className="text-[#9aa6b6]" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search SKU, product, location, supplier"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[#263447] outline-none placeholder:text-[#a2adbc]"
            />
            {search ? (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-[#9aa6b6]" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {(["All", "In stock", "Low stock", "Out of stock"] as const).map(
              status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cx(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold transition",
                    filter === status
                      ? "bg-[#202a38] text-white"
                      : "bg-[#f2f5f8] text-[#6d7a8d] hover:bg-[#e8edf3]"
                  )}
                >
                  {status}
                  {status !== "All" ? (
                    <span className="ml-1.5 opacity-60">
                      {status === "In stock"
                        ? 4
                        : status === "Low stock"
                          ? 2
                          : 1}
                    </span>
                  ) : null}
                </button>
              )
            )}
          </div>
          <QuietButton icon={<SlidersHorizontal size={14} />}>
            Columns
          </QuietButton>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#eef1f4] pt-3 text-[10px] font-semibold text-[#8a96a7]">
          <span>
            {filtered.length} products shown
            {search || filter !== "All" ? " · filters active" : ""}
          </span>
          <button className="flex items-center gap-1 text-[#5c8dff] hover:text-[#4669b2]">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>
      <div className="soft-card mt-4 overflow-hidden rounded-2xl">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead className="bg-[#fbfcfd]">
              <tr className="border-b border-[#eef1f4] text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995a6]">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all products"
                    className="h-4 w-4 rounded border-[#cbd4df] accent-[#f2684b]"
                  />
                </th>
                <th className="px-3 py-3">SKU / product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">On hand</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Supplier</th>
                <th className="w-16 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1f4]">
              {filtered.length ? (
                filtered.map(product => (
                  <tr
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="group cursor-pointer transition hover:bg-[#fbfcff]"
                  >
                    <td
                      className="px-4 py-4"
                      onClick={event => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select ${product.name}`}
                        className="h-4 w-4 rounded border-[#cbd4df] accent-[#f2684b]"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-mono text-[10px] font-medium text-[#8a96a7]">
                        {product.id}
                      </div>
                      <div className="mt-1 text-[12px] font-bold text-[#334155]">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-[11px] font-medium text-[#657184]">
                      {product.category}
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-display text-[15px] font-bold text-[#263447]">
                        {product.qty}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#9aa6b6]">
                        reorder {product.reorder}
                      </div>
                    </td>
                    <td className="px-3 py-4 font-mono text-[11px] font-medium text-[#657184]">
                      {product.location}
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={product.status} compact />
                    </td>
                    <td className="px-3 py-4 text-[11px] font-medium text-[#657184]">
                      {product.supplier}
                    </td>
                    <td
                      className="px-3 py-4"
                      onClick={event => event.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                        <IconButton
                          label="Edit product"
                          onClick={() => onEditProduct(product)}
                          className="h-8 w-8"
                        >
                          <Edit3 size={14} />
                        </IconButton>
                        <IconButton
                          label="Delete product"
                          onClick={() => onDeleteProduct(product)}
                          className="h-8 w-8 text-[#c94f55] hover:bg-[#fde9e9] hover:text-[#a6444a]"
                        >
                          <X size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2f7] text-[#7d8999]">
                      <Search size={20} />
                    </div>
                    <div className="mt-3 text-[13px] font-bold text-[#334155]">
                      No products match
                    </div>
                    <p className="mt-1 text-[11px] text-[#8a96a7]">
                      Try a different search or clear the filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setFilter("All");
                      }}
                      className="mt-3 text-[11px] font-bold text-[#5c8dff]"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductDrawer({
  product,
  onClose,
  onEdit,
  onAdjust,
}: {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
  onAdjust: () => void;
}) {
  return (
    <div
      className="modal-backdrop fixed inset-0 z-40 bg-[#111821]/20"
      onClick={onClose}
    >
      <aside
        onClick={event => event.stopPropagation()}
        className="drawer-enter absolute right-0 top-0 h-full w-full max-w-[480px] overflow-y-auto bg-[#fbfcfd] p-5 shadow-[-18px_0_55px_rgba(17,24,33,0.15)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[11px] font-medium text-[#8a96a7]">
              {product.id}
            </div>
            <h2 className="mt-1 font-display text-[23px] font-bold tracking-[-0.04em] text-[#202a38]">
              {product.name}
            </h2>
            <div className="mt-3">
              <StatusBadge status={product.status} />
            </div>
          </div>
          <IconButton label="Close product details" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#202a38] p-4 text-white">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ba8b8]">
              On hand
            </div>
            <div className="mt-2 font-display text-[32px] font-bold tracking-[-0.04em]">
              {product.qty}
            </div>
            <div className="mt-1 text-[10px] text-[#a9b4c1]">
              {product.unit}s available
            </div>
          </div>
          <div className="rounded-2xl border border-[#e2e7ee] bg-white p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a96a7]">
              Reorder point
            </div>
            <div className="mt-2 font-display text-[32px] font-bold tracking-[-0.04em] text-[#263447]">
              {product.reorder}
            </div>
            <div className="mt-1 text-[10px] text-[#8a96a7]">
              {product.qty <= product.reorder
                ? `${product.reorder - product.qty} below target`
                : `${product.qty - product.reorder} above target`}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#e2e7ee] bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa6b6]">
              Warehouse bin
            </div>
            <div className="mt-2 font-mono text-[13px] font-bold text-[#334155]">
              {product.location}
            </div>
            <div className="mt-1 text-[10px] text-[#8a96a7]">
              Zone {product.location[0]} · Aisle {product.location.slice(2, 4)}
            </div>
          </div>
          <div className="rounded-xl border border-[#e2e7ee] bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa6b6]">
              Supplier
            </div>
            <div className="mt-2 text-[12px] font-bold text-[#334155]">
              {product.supplier}
            </div>
            <div className="mt-1 text-[10px] text-[#8a96a7]">
              Avg. lead time · 4 days
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <PrimaryButton onClick={onAdjust} icon={<RefreshCw size={15} />}>
            Adjust stock
          </PrimaryButton>
          <QuietButton onClick={onEdit} icon={<Edit3 size={14} />}>
            Edit product
          </QuietButton>
        </div>
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-[15px] font-bold text-[#263447]">
                Recent movements
              </h3>
              <p className="mt-1 text-[11px] text-[#8a96a7]">
                Last 30 days for this SKU
              </p>
            </div>
            <button className="text-[11px] font-bold text-[#5c8dff]">
              View all
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {initialMovements
              .filter(
                movement =>
                  movement.sku === product.id || product.id === "LS-220"
              )
              .slice(0, 3)
              .map(movement => (
                <div
                  key={movement.id}
                  className="flex items-center gap-3 rounded-xl border border-[#eef1f4] bg-white p-3"
                >
                  <div
                    className={cx(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      movement.delta >= 0
                        ? "bg-[#e9f7f0] text-[#2fa36b]"
                        : "bg-[#fff0ee] text-[#d95c5c]"
                    )}
                  >
                    {movement.delta >= 0 ? (
                      <ArrowUpRight size={15} />
                    ) : (
                      <ArrowDownRight size={15} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-[#334155]">
                      {movement.type} · {movement.reference}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#8a96a7]">
                      {movement.time} · {movement.user}
                    </div>
                  </div>
                  <div
                    className={cx(
                      "font-mono text-[12px] font-bold",
                      movement.delta >= 0 ? "text-[#2fa36b]" : "text-[#d95c5c]"
                    )}
                  >
                    {movement.delta > 0 ? "+" : ""}
                    {movement.delta}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-dashed border-[#cad4df] bg-[#f6f8fa] p-3 text-[10px] leading-5 text-[#7e8a9b]">
          <AlertTriangle size={13} className="mr-1 inline text-[#c28527]" />{" "}
          Changes are logged to the stock movement audit trail with your user
          identity.
        </div>
      </aside>
    </div>
  );
}

function Receiving({
  onComplete,
  showToast,
}: {
  onComplete: () => void;
  showToast: (message: string, tone?: "success" | "warning" | "error") => void;
}) {
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState("Harbor mug");
  const [delivery, setDelivery] = useState("RC-00923");
  const [quantity, setQuantity] = useState("48");
  const [condition, setCondition] = useState("Good");
  const [supplier, setSupplier] = useState("Northstar Supply");
  const [date, setDate] = useState("2026-09-26");
  const [reviewOpen, setReviewOpen] = useState(false);
  const steps = [
    { label: "What", helper: "Product" },
    { label: "How much", helper: "Quantity" },
    { label: "From whom", helper: "Supplier" },
    { label: "Review", helper: "Confirm" },
  ];
  const next = () => {
    if (step === 1 && !product) {
      showToast("Choose a product before continuing", "error");
      return;
    }
    if (step === 2 && (!quantity || Number(quantity) <= 0)) {
      showToast("Enter a quantity greater than zero", "error");
      return;
    }
    if (step < 4) setStep(step + 1);
    else setReviewOpen(true);
  };
  const renderStep = () => {
    if (step === 1) {
      return (
        <div>
          <StepIntro
            step="1"
            title="What are you receiving?"
            copy="Match the delivery paperwork to a catalog product so stock lands in the right place."
          />
          <Field label="Product" required>
            <div className="input-shell flex h-11 items-center gap-2 rounded-xl px-3">
              <PackageOpen size={15} className="text-[#9aa6b6]" />
              <select
                value={product}
                onChange={event => setProduct(event.target.value)}
                className="w-full bg-transparent text-[12px] font-semibold text-[#334155] outline-none"
              >
                <option>Harbor mug</option>
                <option>Linen set / sand</option>
                <option>Glass carafe</option>
                <option>Shipping box / medium</option>
              </select>
              <ChevronDown size={14} className="text-[#9aa6b6]" />
            </div>
          </Field>
          <Field
            label="Delivery number"
            required
            help="Use the reference printed on the supplier’s bill of lading."
          >
            <div className="input-shell flex h-11 items-center gap-2 rounded-xl px-3">
              <Truck size={15} className="text-[#9aa6b6]" />
              <input
                value={delivery}
                onChange={event => setDelivery(event.target.value)}
                className="w-full bg-transparent font-mono text-[12px] font-medium text-[#334155] outline-none"
              />
            </div>
          </Field>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div>
          <StepIntro
            step="2"
            title="How much arrived?"
            copy="Count the received units and capture any condition exception before posting."
          />
          <Field label="Quantity received" required>
            <div className="input-shell flex h-14 items-center gap-3 rounded-xl px-4">
              <PackageCheck size={17} className="text-[#2fa36b]" />
              <input
                autoFocus
                type="number"
                min="1"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
                className="w-full bg-transparent font-display text-[23px] font-bold text-[#263447] outline-none"
              />
              <span className="text-[11px] font-semibold text-[#8a96a7]">
                units
              </span>
            </div>
          </Field>
          <Field label="Condition assessment">
            <div className="grid grid-cols-3 gap-2">
              {["Good", "Partial", "Damaged"].map(option => (
                <button
                  key={option}
                  onClick={() => setCondition(option)}
                  className={cx(
                    "rounded-xl border px-3 py-3 text-[11px] font-bold transition",
                    condition === option
                      ? option === "Damaged"
                        ? "border-[#d95c5c] bg-[#fde9e9] text-[#a6444a]"
                        : "border-[#f2684b] bg-[#fff0ec] text-[#b05445]"
                      : "border-[#e2e7ee] bg-white text-[#7d8999] hover:border-[#cbd6e4]"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div>
          <StepIntro
            step="3"
            title="Who sent it, and when?"
            copy="Keep supplier attribution and receiving dates consistent for reporting."
          />
          <Field label="Supplier" required>
            <div className="input-shell flex h-11 items-center gap-2 rounded-xl px-3">
              <Building2 size={15} className="text-[#9aa6b6]" />
              <select
                value={supplier}
                onChange={event => setSupplier(event.target.value)}
                className="w-full bg-transparent text-[12px] font-semibold text-[#334155] outline-none"
              >
                <option>Northstar Supply</option>
                <option>Loom & Co.</option>
                <option>PackRight</option>
                <option>Field Goods</option>
              </select>
              <ChevronDown size={14} className="text-[#9aa6b6]" />
            </div>
          </Field>
          <Field label="Receipt date" required>
            <div className="input-shell flex h-11 items-center gap-2 rounded-xl px-3">
              <CalendarDays size={15} className="text-[#9aa6b6]" />
              <input
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
                className="w-full bg-transparent text-[12px] font-semibold text-[#334155] outline-none"
              />
            </div>
          </Field>
        </div>
      );
    }
    return (
      <div>
        <StepIntro
          step="4"
          title="Review before posting"
          copy="Check the summary. Posting will update on-hand stock and create an audit record."
        />
        <div className="rounded-2xl border border-[#e2e7ee] bg-[#fbfcfd] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Product", product],
              ["Delivery", delivery],
              ["Quantity", `${quantity} units`],
              ["Condition", condition],
              ["Supplier", supplier],
              ["Receipt date", date],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa6b6]">
                  {label}
                </div>
                <div className="mt-1 text-[12px] font-bold text-[#334155]">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#e9f7f0] p-3 text-[10px] leading-5 text-[#24764d]">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            Posting this receipt will move Harbor mug from 136 to{" "}
            <strong>{136 + (Number(quantity) || 0)} units</strong> in A-14-03.
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Module 03 · Inbound operations"
        title="Receive stock"
        subtitle="Turn an arriving delivery into accurate, traceable inventory in four short steps."
        action={
          <QuietButton
            onClick={() =>
              showToast(
                "Draft saved — you can safely leave and return later.",
                "success"
              )
            }
            icon={<Clock3 size={14} />}
          >
            Save draft
          </QuietButton>
        }
      />
      <div className="soft-card rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#eef1f4] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((item, index) => (
              <div key={item.label} className="flex items-center gap-2">
                <button
                  onClick={() => index + 1 <= step && setStep(index + 1)}
                  className={cx(
                    "flex items-center gap-2 whitespace-nowrap rounded-xl px-2 py-2 text-left transition",
                    step === index + 1 ? "bg-[#fff0ec]" : "hover:bg-[#f4f6f8]"
                  )}
                >
                  <span
                    className={cx(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold",
                      step > index + 1
                        ? "bg-[#e9f7f0] text-[#2fa36b]"
                        : step === index + 1
                          ? "bg-[#f2684b] text-white"
                          : "bg-[#eef1f5] text-[#8793a4]"
                    )}
                  >
                    {step > index + 1 ? <Check size={14} /> : index + 1}
                  </span>
                  <span>
                    <span
                      className={cx(
                        "block text-[11px] font-bold",
                        step === index + 1 ? "text-[#263447]" : "text-[#8793a4]"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="hidden text-[9px] text-[#a0abba] sm:block">
                      {item.helper}
                    </span>
                  </span>
                </button>
                {index < steps.length - 1 ? (
                  <div
                    className={cx(
                      "h-px w-5 sm:w-10",
                      step > index + 1 ? "bg-[#9bd4b5]" : "bg-[#e5e9ef]"
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_330px]">
          <div className="max-w-[650px]">
            {renderStep()}
            <div className="mt-8 flex items-center justify-between border-t border-[#eef1f4] pt-5">
              <QuietButton
                onClick={() => {
                  if (step > 1) setStep(step - 1);
                  else
                    showToast(
                      "Draft saved — you can safely leave and return later.",
                      "success"
                    );
                }}
                icon={step > 1 ? <ArrowLeft size={14} /> : <Clock3 size={14} />}
              >
                {step > 1 ? "Back" : "Save & exit"}
              </QuietButton>
              <PrimaryButton
                onClick={next}
                icon={
                  step === 4 ? (
                    <PackageCheck size={15} />
                  ) : (
                    <ArrowRight size={15} />
                  )
                }
              >
                {step === 4 ? "Review & confirm" : "Continue"}
              </PrimaryButton>
            </div>
          </div>
          <div className="rounded-2xl bg-[#202a38] p-5 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#f5c15f]">
                <Sparkles size={16} />
              </div>
              <div className="text-[12px] font-bold">Receipt summary</div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#94a1b2]">
                  Product
                </div>
                <div className="mt-1 text-[13px] font-bold">
                  {product || "Choose a product"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#94a1b2]">
                  Quantity
                </div>
                <div className="mt-1 font-display text-[27px] font-bold">
                  {quantity || "—"}{" "}
                  <span className="text-[12px] font-medium text-[#9da9b9]">
                    units
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[#94a1b2]">
                    Supplier
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-[#e4e9ef]">
                    {supplier}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[#94a1b2]">
                    Condition
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-[#e4e9ef]">
                    {condition}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-white/10 pt-4 text-[10px] leading-5 text-[#9da9b9]">
              Nothing is posted until you confirm the review step. You can save
              a draft and return without losing data.
            </div>
          </div>
        </div>
      </div>
      {reviewOpen ? (
        <ConfirmModal
          title="Post this inventory receipt?"
          description={`This will add ${quantity} units of ${product} to ${product === "Harbor mug" ? "A-14-03" : "the selected bin"} and create a stock movement record.`}
          confirmLabel="Post receipt"
          onCancel={() => setReviewOpen(false)}
          onConfirm={() => {
            setReviewOpen(false);
            showToast(
              `${quantity} units received successfully. Stock updated.`,
              "success"
            );
            onComplete();
          }}
          icon={<PackageCheck size={18} />}
        />
      ) : null}
    </div>
  );
}

function StepIntro({
  step,
  title,
  copy,
}: {
  step: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mb-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
        Step {step} of 4
      </div>
      <h2 className="mt-2 font-display text-[22px] font-bold tracking-[-0.03em] text-[#263447]">
        {title}
      </h2>
      <p className="mt-1 text-[12px] leading-5 text-[#8a96a7]">{copy}</p>
    </div>
  );
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[11px] font-bold text-[#4d5b6f]">
        {label} {required ? <span className="text-[#f2684b]">*</span> : null}
      </span>
      {children}
      {help ? (
        <span className="mt-1.5 block text-[10px] text-[#9aa6b6]">{help}</span>
      ) : null}
    </label>
  );
}

function Orders({
  orders,
  setOrders,
  showToast,
}: {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  showToast: (message: string, tone?: "success" | "warning" | "error") => void;
}) {
  const [selectedId, setSelectedId] = useState(orders[0].id);
  const [tab, setTab] = useState<OrderStatus | "All">("All");
  const selected = orders.find(order => order.id === selectedId) || orders[0];
  const filtered =
    tab === "All" ? orders : orders.filter(order => order.status === tab);
  const pickedCount = selected.lines.filter(line => line.picked).length;
  const canComplete = selected.lines.every(line => line.picked);
  const updateSelected = (changes: Partial<Order>) =>
    setOrders(
      orders.map(order =>
        order.id === selected.id ? { ...order, ...changes } : order
      )
    );
  const toggleLine = (productId: string) =>
    updateSelected({
      lines: selected.lines.map(line =>
        line.productId === productId ? { ...line, picked: !line.picked } : line
      ),
    });
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Module 04 · Outbound operations"
        title="Orders & picking"
        subtitle="Keep the queue moving with a focused pick list, explicit availability warnings, and clear status handoffs."
        action={
          <PrimaryButton
            onClick={() =>
              showToast(
                "Scan mode is ready — connect a barcode scanner to begin.",
                "success"
              )
            }
            icon={<Zap size={15} />}
          >
            Scan next order
          </PrimaryButton>
        }
      />
      <div className="soft-card rounded-2xl p-3">
        <div className="flex gap-1 overflow-x-auto">
          {(["All", "Pending", "Picking", "Ready", "Completed"] as const).map(
            item => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={cx(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold transition",
                  tab === item
                    ? "bg-[#202a38] text-white"
                    : "text-[#7a8798] hover:bg-[#f2f5f8]"
                )}
              >
                {item}
                <span
                  className={cx(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[9px]",
                    tab === item
                      ? "bg-white/15 text-white"
                      : "bg-[#eef1f5] text-[#8a96a7]"
                  )}
                >
                  {item === "All"
                    ? orders.length
                    : orders.filter(order => order.status === item).length}
                </span>
              </button>
            )
          )}
        </div>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[330px_1fr]">
        <div className="soft-card overflow-hidden rounded-2xl">
          <div className="border-b border-[#eef1f4] px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
                Work queue
              </div>
              <ListFilter size={15} className="text-[#9aa6b6]" />
            </div>
            <div className="mt-1 text-[12px] font-semibold text-[#526176]">
              {filtered.length} orders need attention
            </div>
          </div>
          <div className="scroll-thin max-h-[620px] overflow-y-auto p-2">
            {filtered.map(order => {
              const picked = order.lines.filter(line => line.picked).length;
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={cx(
                    "mb-1 w-full rounded-xl p-3 text-left transition",
                    order.id === selected.id
                      ? "bg-[#fff0ec]"
                      : "hover:bg-[#f7f9fb]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#56657a]">
                      {order.id}
                    </span>
                    <StatusBadge status={order.status} compact />
                  </div>
                  <div className="mt-2 truncate text-[12px] font-bold text-[#334155]">
                    {order.customer}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#8a96a7]">
                    <span>
                      {picked}/{order.lines.length} lines picked
                    </span>
                    <span>{order.age}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e9edf2]">
                    <div
                      className={cx(
                        "h-full rounded-full",
                        order.status === "Completed"
                          ? "bg-[#98a3b2]"
                          : "bg-[#f2684b]"
                      )}
                      style={{
                        width: `${(picked / order.lines.length) * 100}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="soft-card rounded-2xl p-5">
          <div className="flex flex-col gap-4 border-b border-[#eef1f4] pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#7d8999]">
                  {selected.id}
                </span>
                <StatusBadge status={selected.status} />
              </div>
              <h2 className="mt-2 font-display text-[22px] font-bold tracking-[-0.04em] text-[#253246]">
                {selected.customer}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-medium text-[#8a96a7]">
                <span>Created 8:18 AM</span>
                <span>·</span>
                <span>{selected.lines.length} line items</span>
                <span>·</span>
                <span
                  className={
                    selected.priority === "Expedite"
                      ? "font-bold text-[#b05445]"
                      : ""
                  }
                >
                  {selected.priority === "Expedite" ? "Expedite" : "Standard"}{" "}
                  priority
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <QuietButton
                onClick={() =>
                  showToast("Order details copied to clipboard.", "success")
                }
                icon={<ExternalLink size={14} />}
              >
                Share
              </QuietButton>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce3eb] text-[#7d8999] hover:bg-[#f4f6f8]">
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-[#fbfcfd] p-2">
            {(["Pending", "Picking", "Ready", "Completed"] as const).map(
              (status, index) => (
                <div
                  key={status}
                  className={cx(
                    "relative rounded-lg px-2 py-2 text-center",
                    selected.status === status ? "bg-white shadow-sm" : ""
                  )}
                >
                  <div
                    className={cx(
                      "mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      ["Pending", "Picking", "Ready", "Completed"].indexOf(
                        selected.status
                      ) >= index
                        ? "bg-[#e9f7f0] text-[#2fa36b]"
                        : "bg-[#eef1f5] text-[#99a5b4]"
                    )}
                  >
                    {["Pending", "Picking", "Ready", "Completed"].indexOf(
                      selected.status
                    ) > index ? (
                      <Check size={12} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-[9px] font-bold text-[#788598]">
                    {status}
                  </div>
                </div>
              )
            )}
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-[16px] font-bold text-[#263447]">
                  Pick list
                </h3>
                <p className="mt-1 text-[11px] text-[#8a96a7]">
                  {pickedCount} of {selected.lines.length} line items completed
                </p>
              </div>
              <div className="text-right">
                <div className="font-display text-[20px] font-bold text-[#263447]">
                  {Math.round((pickedCount / selected.lines.length) * 100)}%
                </div>
                <div className="text-[10px] text-[#8a96a7]">complete</div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eef1f5]">
              <div
                className="h-full rounded-full bg-[#2fa36b] transition-all"
                style={{
                  width: `${(pickedCount / selected.lines.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {selected.lines.map(line => (
                <div
                  key={line.productId}
                  className={cx(
                    "flex items-center gap-3 rounded-xl border p-3 transition",
                    line.picked
                      ? "border-[#cfe8da] bg-[#f4fbf7]"
                      : "border-[#e2e7ee] bg-white"
                  )}
                >
                  <button
                    onClick={() => toggleLine(line.productId)}
                    className={cx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition",
                      line.picked
                        ? "border-[#2fa36b] bg-[#2fa36b] text-white"
                        : "border-[#cbd5e0] text-transparent hover:border-[#f2684b]"
                    )}
                    aria-label={
                      line.picked
                        ? `Unmark ${line.name}`
                        : `Mark ${line.name} picked`
                    }
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cx(
                        "text-[12px] font-bold",
                        line.picked
                          ? "text-[#568067] line-through"
                          : "text-[#334155]"
                      )}
                    >
                      {line.name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-[#8a96a7]">
                      <span className="font-mono">{line.productId}</span>
                      <span>·</span>
                      <span>{line.qty} units</span>
                      <span>·</span>
                      <span className="font-mono">{line.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cx(
                        "font-display text-[16px] font-bold",
                        line.available >= line.qty
                          ? "text-[#2fa36b]"
                          : "text-[#d95c5c]"
                      )}
                    >
                      {line.available >= line.qty ? "Available" : "Short"}
                    </div>
                    <div className="mt-1 text-[10px] text-[#8a96a7]">
                      {line.available} on hand
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selected.lines.some(line => line.available < line.qty) ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#f2d397] bg-[#fff9eb] p-3 text-[11px] leading-5 text-[#8b641b]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <strong>Availability warning.</strong> One or more line items do
                not have enough stock. Resolve the shortage before completing
                this order.
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex flex-col justify-between gap-3 border-t border-[#eef1f4] pt-5 sm:flex-row sm:items-center">
            <div className="text-[10px] text-[#8a96a7]">
              Last updated just now by Maya Chen
            </div>
            <div className="flex gap-2">
              <QuietButton
                onClick={() => {
                  updateSelected({ status: "Picking" });
                  showToast(`${selected.id} is now being picked.`, "success");
                }}
                icon={<PackageOpen size={14} />}
              >
                Start picking
              </QuietButton>
              <PrimaryButton
                disabled={!canComplete || selected.status === "Completed"}
                onClick={() => {
                  if (selected.status === "Picking") {
                    updateSelected({ status: "Ready" });
                    showToast(`${selected.id} moved to Ready.`, "success");
                  } else {
                    updateSelected({ status: "Completed" });
                    showToast(
                      `${selected.id} completed and ready for dispatch.`,
                      "success"
                    );
                  }
                }}
                icon={
                  selected.status === "Ready" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <ArrowRight size={15} />
                  )
                }
              >
                {selected.status === "Ready"
                  ? "Complete order"
                  : "Move to ready"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Movements({
  showToast,
}: {
  showToast: (message: string, tone?: "success" | "warning" | "error") => void;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MovementType | "All">("All");
  const [selected, setSelected] = useState<Movement | null>(null);
  const filtered = initialMovements.filter(
    item =>
      `${item.product} ${item.sku} ${item.reference} ${item.user}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (type === "All" || item.type === type)
  );
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Module 05 · Audit trail"
        title="Stock movements"
        subtitle="Understand how stock changes, when it changed, and who performed the action."
        action={
          <QuietButton
            onClick={() =>
              showToast("Movement report prepared for export.", "success")
            }
            icon={<Download size={14} />}
          >
            Export log
          </QuietButton>
        }
      />
      <div className="soft-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="input-shell flex h-10 flex-1 items-center gap-2 rounded-xl px-3">
            <Search size={15} className="text-[#9aa6b6]" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search product, SKU, user, reference"
              className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#a2adbc]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {(
              [
                "All",
                "Received",
                "Released",
                "Transferred",
                "Adjusted",
              ] as const
            ).map(item => (
              <button
                key={item}
                onClick={() => setType(item)}
                className={cx(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold",
                  type === item
                    ? "bg-[#202a38] text-white"
                    : "bg-[#f2f5f8] text-[#6d7a8d]"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <QuietButton icon={<CalendarDays size={14} />}>
            Sep 20 — Sep 26
          </QuietButton>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#eef1f4] pt-3 text-[10px] font-semibold text-[#8a96a7]">
          <span>{filtered.length} movements shown · all times local</span>
          <button
            onClick={() => {
              setQuery("");
              setType("All");
            }}
            className="flex items-center gap-1 text-[#5c8dff]"
          >
            <Filter size={13} /> Clear filters
          </button>
        </div>
      </div>
      <div className="soft-card mt-4 overflow-hidden rounded-2xl">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#fbfcfd]">
              <tr className="border-b border-[#eef1f4] text-[10px] font-bold uppercase tracking-[0.1em] text-[#8995a6]">
                <th className="px-4 py-3">Time</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Movement</th>
                <th className="px-3 py-3">Before</th>
                <th className="px-3 py-3">Change</th>
                <th className="px-3 py-3">After</th>
                <th className="px-3 py-3">Performed by</th>
                <th className="px-3 py-3">Reference</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1f4]">
              {filtered.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group cursor-pointer hover:bg-[#fbfcff]"
                >
                  <td className="px-4 py-4 font-mono text-[10px] font-medium text-[#7d8999]">
                    {item.time}
                  </td>
                  <td className="px-3 py-4">
                    <div className="font-mono text-[10px] text-[#8a96a7]">
                      {item.sku}
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-[#334155]">
                      {item.product}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge status={item.type} compact />
                  </td>
                  <td className="px-3 py-4 font-mono text-[11px] font-medium text-[#6e7b8e]">
                    {item.before}
                  </td>
                  <td
                    className={cx(
                      "px-3 py-4 font-mono text-[12px] font-bold",
                      item.delta > 0
                        ? "text-[#2fa36b]"
                        : item.delta < 0
                          ? "text-[#d95c5c]"
                          : "text-[#8995a6]"
                    )}
                  >
                    {item.delta > 0 ? "+" : ""}
                    {item.delta}
                  </td>
                  <td className="px-3 py-4 font-mono text-[11px] font-bold text-[#334155]">
                    {item.after}
                  </td>
                  <td className="px-3 py-4 text-[11px] font-medium text-[#657184]">
                    {item.user}
                  </td>
                  <td className="px-3 py-4 font-mono text-[10px] font-medium text-[#5c8dff]">
                    {item.reference}
                  </td>
                  <td className="px-3 py-4">
                    <ChevronRight
                      size={14}
                      className="text-[#b3bdc9] transition group-hover:translate-x-0.5 group-hover:text-[#5c8dff]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected ? (
        <MovementDetail movement={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function MovementDetail({
  movement,
  onClose,
}: {
  movement: Movement;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop fixed inset-0 z-40 flex items-center justify-center bg-[#111821]/25 p-4"
      onClick={onClose}
    >
      <div
        onClick={event => event.stopPropagation()}
        className="modal-enter w-full max-w-[520px] rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-[0_24px_70px_rgba(17,24,33,0.2)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a96a7]">
              Movement detail
            </div>
            <h2 className="mt-1 font-display text-[21px] font-bold tracking-[-0.03em] text-[#253246]">
              {movement.product}
            </h2>
          </div>
          <IconButton label="Close movement detail" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#fbfcfd] p-4">
          <div>
            <div className="font-mono text-[10px] text-[#8a96a7]">
              {movement.reference}
            </div>
            <div className="mt-2">
              <StatusBadge status={movement.type} />
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[24px] font-bold text-[#263447]">
              {movement.before} <span className="text-[#a0abba]">→</span>{" "}
              {movement.after}
            </div>
            <div className="mt-1 text-[10px] text-[#8a96a7]">
              before / after stock
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Product SKU", movement.sku],
            [
              "Quantity moved",
              `${movement.delta > 0 ? "+" : ""}${movement.delta}`,
            ],
            ["Timestamp", `Sep 26 · ${movement.time}`],
            ["Actioned by", movement.user],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#e2e7ee] p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa6b6]">
                {label}
              </div>
              <div className="mt-1.5 text-[12px] font-bold text-[#334155]">
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-[#cad4df] p-3 text-[10px] leading-5 text-[#7e8a9b]">
          This audit record is immutable. Any correction should be recorded as a
          new adjustment rather than editing the original event.
        </div>
      </div>
    </div>
  );
}

function Reports({
  showToast,
  onView,
}: {
  showToast: (message: string, tone?: "success" | "warning" | "error") => void;
  onView: (view: View) => void;
}) {
  const [tab, setTab] = useState<"reports" | "notifications">("reports");
  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Module 06 · Intelligence"
        title="Reports & alerts"
        subtitle="Move from live work to operational trends, exceptions, and clear follow-up actions."
        action={
          <PrimaryButton
            onClick={() => showToast("Report exported as CSV.", "success")}
            icon={<Download size={15} />}
          >
            Export report
          </PrimaryButton>
        }
      />
      <div className="soft-card rounded-2xl p-2">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("reports")}
            className={cx(
              "rounded-xl px-4 py-2.5 text-[11px] font-bold",
              tab === "reports"
                ? "bg-[#202a38] text-white"
                : "text-[#7a8798] hover:bg-[#f2f5f8]"
            )}
          >
            Report dashboard
          </button>
          <button
            onClick={() => setTab("notifications")}
            className={cx(
              "rounded-xl px-4 py-2.5 text-[11px] font-bold",
              tab === "notifications"
                ? "bg-[#202a38] text-white"
                : "text-[#7a8798] hover:bg-[#f2f5f8]"
            )}
          >
            Notifications{" "}
            <span className="ml-1.5 rounded-full bg-[#f2684b] px-1.5 py-0.5 text-[9px] text-white">
              5
            </span>
          </button>
        </div>
      </div>
      {tab === "reports" ? (
        <div className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Inventory health",
                value: "92.4%",
                detail: "+2.8% vs last week",
                icon: <Boxes size={18} />,
                tone: "blue",
              },
              {
                label: "Order throughput",
                value: "186",
                detail: "orders completed",
                icon: <ClipboardCheck size={18} />,
                tone: "green",
              },
              {
                label: "Stock accuracy",
                value: "99.2%",
                detail: "+0.4% vs last week",
                icon: <CheckCircle2 size={18} />,
                tone: "coral",
              },
              {
                label: "Avg. pick time",
                value: "18m",
                detail: "−3m vs last week",
                icon: <Clock3 size={18} />,
                tone: "amber",
              },
            ].map(metric => (
              <div key={metric.label} className="soft-card rounded-2xl p-4">
                <div
                  className={cx(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    metric.tone === "blue"
                      ? "bg-[#edf2ff] text-[#5c8dff]"
                      : metric.tone === "green"
                        ? "bg-[#e9f7f0] text-[#2fa36b]"
                        : metric.tone === "coral"
                          ? "bg-[#fff0ec] text-[#f2684b]"
                          : "bg-[#fff4df] text-[#c28527]"
                  )}
                >
                  {metric.icon}
                </div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
                  {metric.label}
                </div>
                <div className="mt-1 font-display text-[25px] font-bold tracking-[-0.04em] text-[#263447]">
                  {metric.value}
                </div>
                <div className="mt-1 text-[10px] font-semibold text-[#2fa36b]">
                  {metric.detail}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
            <div className="soft-card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[16px] font-bold text-[#253246]">
                    Inventory movement trend
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8a96a7]">
                    Received vs. released units · past 7 days
                  </p>
                </div>
                <QuietButton icon={<CalendarDays size={14} />}>
                  Sep 20 — 26
                </QuietButton>
              </div>
              <div className="chart-grid relative mt-6 h-[230px] rounded-xl border border-[#eef1f4] bg-[#fbfcfd] p-4">
                <div className="absolute inset-x-4 bottom-8 top-4">
                  <svg
                    viewBox="0 0 700 220"
                    className="h-full w-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="areaBlue" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#5c8dff"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#5c8dff"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,178 C45,155 72,160 110,128 S170,146 216,108 S275,125 325,72 S370,105 415,83 S476,110 520,58 S575,72 610,44 S662,58 700,20 L700,220 L0,220 Z"
                      fill="url(#areaBlue)"
                    />
                    <path
                      d="M0,178 C45,155 72,160 110,128 S170,146 216,108 S275,125 325,72 S370,105 415,83 S476,110 520,58 S575,72 610,44 S662,58 700,20"
                      fill="none"
                      stroke="#5c8dff"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,195 C45,185 72,190 110,172 S170,176 216,162 S275,174 325,144 S370,158 415,146 S476,159 520,119 S575,135 610,102 S662,124 700,88"
                      fill="none"
                      stroke="#f2684b"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-mono text-[#a2adbc]">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold text-[#7d8999]">
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#5c8dff]" />
                  Received
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#f2684b]" />
                  Released
                </span>
              </div>
            </div>
            <div className="soft-card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[16px] font-bold text-[#253246]">
                    Saved reports
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8a96a7]">
                    Frequently used operational views
                  </p>
                </div>
                <button
                  onClick={() =>
                    showToast(
                      "Report builder opened — choose a metric to begin.",
                      "success"
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf2ff] text-[#5c8dff]"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="mt-5 space-y-2">
                {[
                  {
                    title: "Low-stock report",
                    detail: "18 items · updated 9:42 AM",
                    icon: <AlertTriangle size={15} />,
                    tone: "amber",
                  },
                  {
                    title: "Order throughput",
                    detail: "Past 30 days · updated today",
                    icon: <ClipboardCheck size={15} />,
                    tone: "blue",
                  },
                  {
                    title: "Stock movement report",
                    detail: "Sep 20 — Sep 26 · CSV",
                    icon: <RefreshCw size={15} />,
                    tone: "green",
                  },
                  {
                    title: "Inventory valuation",
                    detail: "All zones · updated yesterday",
                    icon: <Boxes size={15} />,
                    tone: "coral",
                  },
                ].map(report => (
                  <button
                    key={report.title}
                    onClick={() =>
                      showToast(
                        `${report.title} is ready to review.`,
                        "success"
                      )
                    }
                    className="flex w-full items-center gap-3 rounded-xl border border-[#eef1f4] p-3 text-left transition hover:border-[#cbd6e4] hover:bg-[#fbfcfd]"
                  >
                    <div
                      className={cx(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        report.tone === "amber"
                          ? "bg-[#fff4df] text-[#c28527]"
                          : report.tone === "blue"
                            ? "bg-[#edf2ff] text-[#5c8dff]"
                            : report.tone === "green"
                              ? "bg-[#e9f7f0] text-[#2fa36b]"
                              : "bg-[#fff0ec] text-[#f2684b]"
                      )}
                    >
                      {report.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[#334155]">
                        {report.title}
                      </div>
                      <div className="mt-1 truncate text-[10px] text-[#8a96a7]">
                        {report.detail}
                      </div>
                    </div>
                    <Download size={14} className="text-[#b3bdc9]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_330px]">
          <div className="soft-card rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-[16px] font-bold text-[#253246]">
                  Notification center
                </h2>
                <p className="mt-1 text-[11px] text-[#8a96a7]">
                  Prioritized by operational impact
                </p>
              </div>
              <button
                onClick={() =>
                  showToast("All notifications marked as read.", "success")
                }
                className="text-[11px] font-bold text-[#5c8dff]"
              >
                Mark all read
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {[
                {
                  title: "Canvas tote is out of stock",
                  detail:
                    "CT-731 needs replenishment before SO-10477 can ship.",
                  tone: "critical",
                  time: "8 min ago",
                  action: "View inventory",
                  target: "inventory" as View,
                },
                {
                  title: "3 orders aging past 4 hours",
                  detail:
                    "Review the picking queue to protect today’s dispatch window.",
                  tone: "warning",
                  time: "21 min ago",
                  action: "Open picking",
                  target: "orders" as View,
                },
                {
                  title: "Delivery RC-00918 received",
                  detail:
                    "48 units of Harbor mug are now available in A-14-03.",
                  tone: "info",
                  time: "42 min ago",
                  action: "View receipt",
                  target: "receiving" as View,
                },
                {
                  title: "Order SO-10463 is ready",
                  detail: "All lines picked and staged for dispatch.",
                  tone: "success",
                  time: "1 hr ago",
                  action: "View order",
                  target: "orders" as View,
                },
              ].map(notification => (
                <div
                  key={notification.title}
                  className="flex items-start gap-3 rounded-xl border border-[#eef1f4] p-4"
                >
                  <div
                    className={cx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      notification.tone === "critical"
                        ? "bg-[#fde9e9] text-[#d95c5c]"
                        : notification.tone === "warning"
                          ? "bg-[#fff4df] text-[#c28527]"
                          : notification.tone === "success"
                            ? "bg-[#e9f7f0] text-[#2fa36b]"
                            : "bg-[#edf2ff] text-[#5c8dff]"
                    )}
                  >
                    {notification.tone === "critical" ? (
                      <AlertTriangle size={16} />
                    ) : notification.tone === "warning" ? (
                      <Clock3 size={16} />
                    ) : notification.tone === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Truck size={16} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-[12px] font-bold text-[#334155]">
                        {notification.title}
                      </div>
                      <span className="whitespace-nowrap text-[10px] font-medium text-[#a0abba]">
                        {notification.time}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] leading-5 text-[#7e8a9b]">
                      {notification.detail}
                    </div>
                    <button
                      onClick={() => onView(notification.target)}
                      className="mt-3 text-[10px] font-bold text-[#5c8dff]"
                    >
                      {notification.action}{" "}
                      <ArrowRight size={11} className="ml-1 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="soft-card rounded-2xl p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4df] text-[#c28527]">
              <AlertTriangle size={18} />
            </div>
            <h2 className="mt-4 font-display text-[17px] font-bold text-[#253246]">
              5 items need review
            </h2>
            <p className="mt-2 text-[11px] leading-5 text-[#8a96a7]">
              Two critical stock exceptions and three aging orders are currently
              impacting the floor.
            </p>
            <div className="mt-5 space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#657184]">
                  <span>Critical</span>
                  <span className="text-[#d95c5c]">2</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#f3dddd]">
                  <div className="h-full w-[38%] rounded-full bg-[#d95c5c]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#657184]">
                  <span>Warning</span>
                  <span className="text-[#c28527]">3</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#f7edd5]">
                  <div className="h-full w-[62%] rounded-full bg-[#e9a23b]" />
                </div>
              </div>
            </div>
            <button
              onClick={() => onView("inventory")}
              className="mt-6 flex w-full items-center justify-center gap-1 rounded-xl bg-[#202a38] py-3 text-[11px] font-bold text-white hover:bg-[#2d3b4d]"
            >
              Resolve highest impact <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [form, setForm] = useState<Product>(
    product || {
      id: "",
      name: "",
      category: "Kitchen",
      qty: 0,
      reorder: 10,
      location: "A-01-01",
      status: "In stock",
      supplier: "Northstar Supply",
      unit: "each",
    }
  );
  const set = (key: keyof Product, value: string | number) =>
    setForm({ ...form, [key]: value });
  const invalid = !form.id.trim() || !form.name.trim() || !form.location.trim();
  return (
    <Modal
      title={product ? "Edit product" : "Add product"}
      description={
        product
          ? `Update catalog details for ${product.id}.`
          : "Create a new SKU and its initial operational details."
      }
      onClose={onClose}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            SKU <span className="text-[#f2684b]">*</span>
          </span>
          <input
            value={form.id}
            disabled={!!product}
            onChange={event => set("id", event.target.value.toUpperCase())}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] font-mono outline-none disabled:bg-[#f2f4f7]"
            placeholder="HM-104"
          />
          {!form.id.trim() ? (
            <span className="mt-1 block text-[10px] text-[#c94f55]">
              Required
            </span>
          ) : null}
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            Product name <span className="text-[#f2684b]">*</span>
          </span>
          <input
            value={form.name}
            onChange={event => set("name", event.target.value)}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] outline-none"
            placeholder="Harbor mug"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            Category
          </span>
          <select
            value={form.category}
            onChange={event => set("category", event.target.value)}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] outline-none"
          >
            <option>Kitchen</option>
            <option>Textiles</option>
            <option>Packaging</option>
            <option>Accessories</option>
            <option>Storage</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            Supplier
          </span>
          <select
            value={form.supplier}
            onChange={event => set("supplier", event.target.value)}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] outline-none"
          >
            <option>Northstar Supply</option>
            <option>Loom & Co.</option>
            <option>PackRight</option>
            <option>Field Goods</option>
            <option>ModuHome</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            On-hand quantity
          </span>
          <input
            type="number"
            min="0"
            value={form.qty}
            onChange={event => set("qty", Number(event.target.value))}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] outline-none"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            Reorder point
          </span>
          <input
            type="number"
            min="0"
            value={form.reorder}
            onChange={event => set("reorder", Number(event.target.value))}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] outline-none"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            Warehouse location <span className="text-[#f2684b]">*</span>
          </span>
          <input
            value={form.location}
            onChange={event =>
              set("location", event.target.value.toUpperCase())
            }
            className="input-shell h-10 w-full rounded-xl px-3 font-mono text-[12px] outline-none"
            placeholder="A-14-03"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-bold text-[#4d5b6f]">
            Unit
          </span>
          <select
            value={form.unit}
            onChange={event => set("unit", event.target.value)}
            className="input-shell h-10 w-full rounded-xl px-3 text-[12px] outline-none"
          >
            <option>each</option>
            <option>set</option>
            <option>case</option>
            <option>roll</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-[#eef1f4] pt-5">
        <QuietButton onClick={onClose}>Cancel</QuietButton>
        <PrimaryButton
          disabled={invalid}
          onClick={() =>
            onSave({
              ...form,
              status:
                form.qty === 0
                  ? "Out of stock"
                  : form.qty <= form.reorder
                    ? "Low stock"
                    : "In stock",
            })
          }
        >
          {product ? "Save changes" : "Add product"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  icon,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  icon: ReactNode;
}) {
  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-[#111821]/35 p-4">
      <div className="modal-enter w-full max-w-[430px] rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-[0_24px_70px_rgba(17,24,33,0.24)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0ec] text-[#f2684b]">
          {icon}
        </div>
        <h2 className="mt-4 font-display text-[20px] font-bold tracking-[-0.03em] text-[#253246]">
          {title}
        </h2>
        <p className="mt-2 text-[12px] leading-5 text-[#7e8a9b]">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <QuietButton onClick={onCancel}>Cancel</QuietButton>
          <PrimaryButton onClick={onConfirm}>{confirmLabel}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#111821]/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={event => event.stopPropagation()}
        className="modal-enter max-h-[90vh] w-full max-w-[650px] overflow-y-auto rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-[0_24px_70px_rgba(17,24,33,0.2)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[21px] font-bold tracking-[-0.03em] text-[#253246]">
              {title}
            </h2>
            <p className="mt-1 text-[11px] text-[#8a96a7]">{description}</p>
          </div>
          <IconButton label="Close modal" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("maya.chen@northstar.co");
  const [password, setPassword] = useState("northstar");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 550);
  };
  return (
    <div className="flex min-h-screen bg-[#111821] text-white">
      <div className="relative hidden w-[44%] overflow-hidden p-10 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(242,104,75,0.24),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(92,141,255,0.18),transparent_35%)]" />
        <div className="grain absolute inset-0 opacity-20" />
        <div className="relative flex items-center gap-3">
          <LogoMark />
          <div>
            <div className="font-display text-[15px] font-bold">
              Warehouse Ops
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#8692a3]">
              Northstar / DC-01
            </div>
          </div>
        </div>
        <div className="relative mt-auto max-w-[450px]">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2684b] text-white shadow-[0_16px_35px_rgba(242,104,75,0.26)]">
            <Boxes size={26} />
          </div>
          <h1 className="font-display text-[44px] font-bold leading-[1.03] tracking-[-0.055em]">
            Make every
            <br />
            <span className="text-[#f5c15f]">move count.</span>
          </h1>
          <p className="mt-5 max-w-[360px] text-[14px] leading-6 text-[#98a5b6]">
            A calmer way to keep stock accurate, orders moving, and every
            handoff visible.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="font-display text-[22px] font-bold">99.2%</div>
              <div className="mt-1 text-[10px] text-[#8995a6]">
                stock accuracy
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="font-display text-[22px] font-bold">18m</div>
              <div className="mt-1 text-[10px] text-[#8995a6]">
                avg. pick time
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="font-display text-[22px] font-bold">86%</div>
              <div className="mt-1 text-[10px] text-[#8995a6]">
                shift progress
              </div>
            </div>
          </div>
        </div>
        <div className="relative text-[10px] text-[#677487]">
          © 2026 Northstar Logistics · Secure workspace
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#f7f8fa] px-5 py-10 text-[#202733] sm:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <LogoMark />
          </div>
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#fff0ec] px-2.5 py-1 text-[10px] font-bold text-[#b05445]">
              <LockKeyhole size={12} /> Secure workspace
            </div>
            <h2 className="font-display text-[32px] font-bold tracking-[-0.05em] text-[#202a38]">
              Welcome back
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-[#7e8a9b]">
              Sign in to continue to the Northstar distribution center.
            </p>
          </div>
          <form onSubmit={submit} className="soft-card rounded-2xl p-5 sm:p-6">
            <label className="mb-4 block">
              <span className="mb-2 block text-[11px] font-bold text-[#4d5b6f]">
                Email or username <span className="text-[#f2684b]">*</span>
              </span>
              <div className="input-shell flex h-12 items-center gap-2 rounded-xl px-3">
                <UserRound size={16} className="text-[#9aa6b6]" />
                <input
                  autoComplete="username"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full bg-transparent text-[12px] outline-none"
                  placeholder="you@company.com"
                />
              </div>
            </label>
            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#4d5b6f]">
                  Password <span className="text-[#f2684b]">*</span>
                </span>
                <button
                  type="button"
                  className="text-[10px] font-bold text-[#5c8dff]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-shell flex h-12 items-center gap-2 rounded-xl px-3">
                <LockKeyhole size={16} className="text-[#9aa6b6]" />
                <input
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full bg-transparent text-[12px] outline-none"
                />
              </div>
            </label>
            <label className="mt-4 flex items-center gap-2 text-[11px] font-medium text-[#7e8a9b]">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-[#cbd4df] accent-[#f2684b]"
              />{" "}
              Remember this device
            </label>
            {error ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fde9e9] p-3 text-[11px] font-semibold text-[#a6444a]">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="btn-press mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2684b] text-[12px] font-bold text-white shadow-[0_10px_22px_rgba(242,104,75,0.2)] hover:bg-[#dc5a40] disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? "Signing in…" : "Sign in to workspace"}
            </button>
          </form>
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium text-[#9aa6b6]">
            <HelpCircle size={13} /> Need access? Contact your operations lead
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({
  message,
  tone,
  onClose,
}: {
  message: string;
  tone: "success" | "warning" | "error";
  onClose: () => void;
}) {
  return (
    <div className="modal-enter fixed bottom-5 right-5 z-[80] flex max-w-[370px] items-start gap-3 rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-[0_16px_40px_rgba(17,24,33,0.14)]">
      <div
        className={cx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          tone === "success"
            ? "bg-[#e9f7f0] text-[#2fa36b]"
            : tone === "warning"
              ? "bg-[#fff4df] text-[#c28527]"
              : "bg-[#fde9e9] text-[#d95c5c]"
        )}
      >
        {tone === "success" ? (
          <CheckCircle2 size={16} />
        ) : tone === "warning" ? (
          <AlertTriangle size={16} />
        ) : (
          <AlertTriangle size={16} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-bold text-[#334155]">
          {tone === "success"
            ? "Action completed"
            : tone === "warning"
              ? "Review needed"
              : "Couldn’t complete action"}
        </div>
        <div className="mt-1 text-[11px] leading-5 text-[#7e8a9b]">
          {message}
        </div>
      </div>
      <button onClick={onClose} className="text-[#a0abba] hover:text-[#334155]">
        <X size={14} />
      </button>
    </div>
  );
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModal, setProductModal] = useState<{
    open: boolean;
    product?: Product;
  }>({ open: false });
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "warning" | "error";
  } | null>(null);
  const showToast = (
    message: string,
    tone: "success" | "warning" | "error" = "success"
  ) => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 4200);
  };
  const selectView = (next: View) => {
    setView(next);
    if (next !== "inventory") setInventorySearch("");
  };
  const saveProduct = (product: Product) => {
    setProducts(current =>
      current.some(item => item.id === product.id)
        ? current.map(item => (item.id === product.id ? product : item))
        : [product, ...current]
    );
    setProductModal({ open: false });
    setSelectedProduct(null);
    showToast(`${product.name} saved to the catalog.`, "success");
  };
  const content = useMemo(() => {
    switch (view) {
      case "overview":
        return (
          <Overview
            onView={selectView}
            onSelectProduct={setSelectedProduct}
            onOpenReceiving={() => selectView("receiving")}
          />
        );
      case "inventory":
        return (
          <Inventory
            products={products}
            search={inventorySearch}
            setSearch={setInventorySearch}
            onSelectProduct={setSelectedProduct}
            onAddProduct={() => setProductModal({ open: true })}
            onEditProduct={product => setProductModal({ open: true, product })}
            onDeleteProduct={setDeleteProduct}
          />
        );
      case "receiving":
        return (
          <Receiving
            onComplete={() => selectView("overview")}
            showToast={showToast}
          />
        );
      case "orders":
        return (
          <Orders orders={orders} setOrders={setOrders} showToast={showToast} />
        );
      case "movements":
        return <Movements showToast={showToast} />;
      case "reports":
        return <Reports showToast={showToast} onView={selectView} />;
      case "files":
        return <FileLibrary showToast={showToast} />;
    }
  }, [view, products, inventorySearch, orders]);
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  return (
    <>
      <Shell
        view={view}
        onView={selectView}
        onLogout={() => setLoggedIn(false)}
        onSearch={query => {
          setInventorySearch(query);
          if (query) setView("inventory");
        }}
        onShowNotifications={() => setNotificationsOpen(true)}
        notificationsOpen={notificationsOpen}
        onCloseNotifications={() => setNotificationsOpen(false)}
        unread={5}
      >
        {content}
      </Shell>
      {selectedProduct ? (
        <ProductDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() =>
            setProductModal({ open: true, product: selectedProduct })
          }
          onAdjust={() => {
            setSelectedProduct(null);
            showToast("Stock adjustment opened for review.", "warning");
          }}
        />
      ) : null}
      {productModal.open ? (
        <ProductModal
          product={productModal.product}
          onClose={() => setProductModal({ open: false })}
          onSave={saveProduct}
        />
      ) : null}
      {deleteProduct ? (
        <ConfirmModal
          title={`Delete ${deleteProduct.name}?`}
          description="This removes the SKU from active catalog views. The audit trail remains preserved, and you can undo this action from the confirmation toast."
          confirmLabel="Delete product"
          onCancel={() => setDeleteProduct(null)}
          onConfirm={() => {
            const removed = deleteProduct.name;
            setProducts(current =>
              current.filter(item => item.id !== deleteProduct.id)
            );
            setDeleteProduct(null);
            showToast(
              `${removed} deleted. Undo is available in the activity log.`,
              "success"
            );
          }}
          icon={<AlertTriangle size={18} />}
        />
      ) : null}
      {toast ? (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
