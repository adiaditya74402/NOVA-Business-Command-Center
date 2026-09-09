import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowDown, ArrowUp, ArrowUpRight, BarChart3, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download,
  FileText, Filter, Gauge, Home, Info, LayoutDashboard,
  ListFilter, Menu,
  Moon, Plus, Radio, RefreshCw, Search, Settings, Sparkles, Sun, Target,
  Trash2, TrendingUp, Users, WalletCards, X, Zap,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie,
  PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis,
} from 'recharts';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Campaign = {
  id: number;
  name: string;
  channel: string;
  leads: number;
  conversion: number;
  revenue: number;
  status: 'Active' | 'Completed' | 'Draft';
  period: 'Today' | 'This Week' | 'This Month' | 'This Quarter';
};

type ProfileAction = 'profile' | 'settings' | 'preferences' | 'help' | 'logout';
type Theme = 'light' | 'dark';
type Preferences = {
  emailAlerts: boolean;
  weeklySummary: boolean;
  compactView: boolean;
};

const seedCampaigns: Campaign[] = [
  { id: 1, name: 'Summer Launch', channel: 'Instagram', leads: 2840, conversion: 9.8, revenue: 420000, status: 'Active', period: 'This Month' },
  { id: 2, name: 'Growth Sprint', channel: 'Google', leads: 1920, conversion: 7.4, revenue: 360000, status: 'Active', period: 'This Month' },
  { id: 3, name: 'Email Revival', channel: 'Email', leads: 1240, conversion: 12.2, revenue: 280000, status: 'Completed', period: 'This Month' },
  { id: 4, name: 'Creator Boost', channel: 'YouTube', leads: 3140, conversion: 8.9, revenue: 510000, status: 'Active', period: 'This Month' },
  { id: 5, name: 'Founder Notes', channel: 'LinkedIn', leads: 860, conversion: 6.7, revenue: 196000, status: 'Draft', period: 'This Week' },
  { id: 6, name: 'Holiday Retarget', channel: 'Google', leads: 2260, conversion: 10.4, revenue: 398000, status: 'Completed', period: 'This Month' },
  { id: 7, name: 'Product Stories', channel: 'Instagram', leads: 1760, conversion: 8.2, revenue: 249000, status: 'Active', period: 'This Week' },
  { id: 8, name: 'Partner Pulse', channel: 'LinkedIn', leads: 740, conversion: 5.9, revenue: 134000, status: 'Draft', period: 'This Quarter' },
  { id: 9, name: 'Welcome Series', channel: 'Email', leads: 1480, conversion: 13.6, revenue: 324000, status: 'Active', period: 'This Month' },
  { id: 10, name: 'Search Intent', channel: 'Google', leads: 2980, conversion: 11.2, revenue: 452000, status: 'Active', period: 'This Week' },
  { id: 11, name: 'Studio Tour', channel: 'YouTube', leads: 1020, conversion: 7.1, revenue: 168000, status: 'Completed', period: 'Today' },
  { id: 12, name: 'Community Week', channel: 'Instagram', leads: 1210, conversion: 9.2, revenue: 225000, status: 'Draft', period: 'This Quarter' },
];

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, target: 'overview' },
  { label: 'Analytics', icon: BarChart3, target: 'analytics' },
  { label: 'Customers', icon: Users, target: 'insights' },
  { label: 'Campaigns', icon: Radio, target: 'campaigns' },
  { label: 'Reports', icon: FileText, target: 'analytics' },
  { label: 'Tasks', icon: ListFilter, target: 'help' },
  { label: 'Settings', icon: Settings, target: 'builder' },
];

const revenueByChannel = [
  { name: 'Instagram', revenue: 674 }, { name: 'Google', revenue: 1210 },
  { name: 'Email', revenue: 604 }, { name: 'YouTube', revenue: 678 },
  { name: 'LinkedIn', revenue: 330 },
];
const revenueGrowth = [
  { month: 'Oct', revenue: 13.8 }, { month: 'Nov', revenue: 15.1 }, { month: 'Dec', revenue: 16.6 },
  { month: 'Jan', revenue: 18.2 }, { month: 'Feb', revenue: 20.9 }, { month: 'Mar', revenue: 24.8 },
];
const customerDistribution = [
  { name: 'New', value: 36, color: '#5eead4' }, { name: 'Returning', value: 31, color: '#a78bfa' },
  { name: 'Premium', value: 19, color: '#f5bd72' }, { name: 'Inactive', value: 14, color: '#607089' },
];
const searchItems = ['Summer Launch', 'Growth Sprint', 'Revenue report', 'Customer segments', 'Campaign approvals'];

function currency(value: number) {
  return `₹${(value / 100000).toFixed(1)}L`;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'teal' | 'violet' | 'amber' | 'slate' | 'red' }) {
  const styles = {
    teal: 'bg-teal-400/10 text-teal-200 border-teal-300/20',
    violet: 'bg-violet-400/10 text-violet-200 border-violet-300/20',
    amber: 'bg-amber-300/10 text-amber-200 border-amber-300/20',
    red: 'bg-red-400/10 text-red-200 border-red-300/20',
    slate: 'bg-slate-400/10 text-slate-300 border-slate-300/15',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[tone]}`}>{children}</span>;
}

function IconButton({ label, children, onClick, className = '' }: { label: string; children: ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" aria-label={label} title={label} data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={onClick} className={`rounded-xl p-2 text-slate-400 transition hover:bg-white/[.06] hover:text-slate-100 ${className}`}>{children}</button>;
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return <button
    type="button"
    data-testid="button-theme-toggle"
    aria-label={`Switch to ${nextTheme} mode`}
    aria-pressed={theme === 'dark'}
    title={`Switch to ${nextTheme} mode`}
    onClick={onToggle}
    className="group inline-flex h-9 items-center gap-2 rounded-xl border border-white/[.1] bg-white/[.035] px-2.5 text-[11px] font-medium text-slate-400 transition hover:border-teal-300/40 hover:bg-white/[.07] hover:text-slate-100"
  >
    <span className="grid h-5 w-5 place-items-center rounded-lg bg-teal-300/10 text-teal-300 transition group-hover:bg-teal-300/20">{theme === 'dark' ? <Moon size={13} /> : <Sun size={14} />}</span>
    <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
  </button>;
}

function ToastStack({ messages, onDismiss }: { messages: string[]; onDismiss: (message: string) => void }) {
  return <div className="fixed bottom-5 right-5 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
    {messages.map((message) => <div key={message} className="nova-card flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-100">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-300/15 text-teal-200"><Check size={14} /></span>
      <span className="flex-1">{message}</span><IconButton label="Dismiss toast" onClick={() => onDismiss(message)}><X size={15} /></IconButton>
    </div>)}
  </div>;
}

function Sidebar({ active, setActive, open, setOpen }: { active: string; setActive: (x: string) => void; open: boolean; setOpen: (x: boolean) => void }) {
  const navigate = (target: string) => {
    setActive(target);
    setOpen(false);
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <>
    {open && <button aria-label="Close mobile navigation" data-testid="button-close-mobile-nav" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/70 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-white/[.07] bg-[#0b1221]/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-3 px-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-300 text-[#0b1221] shadow-[0_0_22px_rgba(94,234,212,.2)]"><Zap size={18} fill="currentColor" /></div>
        <div><p className="font-serif text-[22px] leading-none tracking-wide text-slate-100">NOVA</p><p className="mt-1 text-[9px] uppercase tracking-[.2em] text-slate-500">Command center</p></div>
      </div>
      <div className="mt-10 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Workspace</div>
      <nav className="mt-3 flex-1 space-y-1" aria-label="Primary navigation">
        {navItems.map(({ label, icon: NavIcon, target }) => <button key={label} type="button" data-testid={`nav-${label.toLowerCase()}`} onClick={() => navigate(target)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active === target ? 'bg-teal-300/[.12] text-teal-200 shadow-inner shadow-teal-200/[.03]' : 'text-slate-400 hover:bg-white/[.04] hover:text-slate-100'}`}>
          <NavIcon size={17} strokeWidth={active === target ? 2.2 : 1.7} /><span>{label}</span>{active === target && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-300" />}
        </button>)}
      </nav>
      <div className="rounded-2xl border border-white/[.07] bg-white/[.035] p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300"><Gauge size={14} className="text-violet-300" /> Workspace health</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700/70"><div className="h-full w-[82%] rounded-full bg-gradient-to-r from-teal-300 to-violet-300" /></div>
        <p className="mt-2 text-[11px] text-slate-500">82% of data synced</p>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-white/[.06] px-2 pt-4">
         <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-300/15 text-xs font-semibold text-violet-200">NO</div>
         <div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">Workspace operator</p><p className="truncate text-[10px] text-slate-500">Operator account</p></div>
        <IconButton label="Open settings" onClick={() => navigate('builder')}><Settings size={15} /></IconButton>
      </div>
    </aside>
  </>;
}

function ProfileDialog({ mode, preferences, onPreferenceChange, onClose, onToast, onLogout }: { mode: ProfileAction; preferences: Preferences; onPreferenceChange: (key: keyof Preferences) => void; onClose: () => void; onToast: (message: string) => void; onLogout: () => void }) {
  const isLogout = mode === 'logout';
  const copy = {
    profile: { eyebrow: 'Workspace identity', title: 'My Profile', description: 'Your NOVA operator profile for this workspace.' },
    settings: { eyebrow: 'Workspace controls', title: 'Account Settings', description: 'Manage the controls that shape your command center experience.' },
    preferences: { eyebrow: 'Personalize NOVA', title: 'Preferences', description: 'Choose how NOVA keeps you informed and presents your workspace.' },
    help: { eyebrow: 'Support', title: 'Help Center', description: 'Find guidance for the most common NOVA workflows.' },
    logout: { eyebrow: 'Session control', title: 'Sign out of NOVA?', description: 'You can return to this demo workspace whenever you are ready.' },
  }[mode];

  const settingRows = [
    { key: 'emailAlerts' as const, label: 'Email alerts', description: 'Get notified about campaign approvals and important changes.' },
    { key: 'weeklySummary' as const, label: 'Weekly summary', description: 'Receive a concise performance recap at the end of each week.' },
    { key: 'compactView' as const, label: 'Compact cards', description: 'Use a denser layout when reviewing dashboard metrics.' },
  ];

  return <div role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" className="fixed inset-0 z-[65] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div className="nova-card w-full max-w-lg rounded-2xl p-6 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-teal-300/80">{copy.eyebrow}</p><h2 id="profile-dialog-title" className="mt-2 text-xl font-semibold text-slate-100">{copy.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{copy.description}</p></div>
        <IconButton label="Close profile dialog" onClick={onClose}><X size={18} /></IconButton>
      </div>

      {mode === 'profile' && <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[['Role', 'Operator'], ['Workspace', 'Command center'], ['Status', 'Active']].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.08] bg-white/[.03] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-slate-600">{label}</p><p className="mt-2 text-sm font-medium text-slate-200">{value}</p></div>)}
        <div className="sm:col-span-3 rounded-xl border border-teal-300/15 bg-teal-300/[.06] p-4"><p className="text-sm font-medium text-teal-100">Workspace operator</p><p className="mt-1 text-xs leading-5 text-slate-400">This demo profile is ready to manage campaigns, reports, and business insights.</p></div>
      </div>}

      {mode === 'settings' && <div className="mt-6 space-y-3">
        <button type="button" data-testid="button-settings-sync" onClick={() => onToast('Workspace sync is up to date.')} className="flex w-full items-center justify-between rounded-xl border border-white/[.08] bg-white/[.03] p-4 text-left transition hover:bg-white/[.06]"><span><span className="block text-sm font-medium text-slate-200">Workspace data sync</span><span className="mt-1 block text-xs text-slate-500">Last checked moments ago</span></span><RefreshCw size={16} className="text-teal-300" /></button>
        <button type="button" data-testid="button-settings-builder" onClick={() => { onClose(); document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' }); onToast('Campaign settings opened below.'); }} className="flex w-full items-center justify-between rounded-xl border border-white/[.08] bg-white/[.03] p-4 text-left transition hover:bg-white/[.06]"><span><span className="block text-sm font-medium text-slate-200">Campaign defaults</span><span className="mt-1 block text-xs text-slate-500">Review channel, audience, and budget defaults.</span></span><ChevronRight size={16} className="text-slate-500" /></button>
      </div>}

      {mode === 'preferences' && <div className="mt-6 space-y-3">
        {settingRows.map(({ key, label, description }) => <button type="button" key={key} data-testid={`toggle-profile-${key}`} aria-pressed={preferences[key]} onClick={() => onPreferenceChange(key)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/[.08] bg-white/[.03] p-4 text-left transition hover:bg-white/[.06]"><span><span className="block text-sm font-medium text-slate-200">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span><span className={`relative h-6 w-11 shrink-0 rounded-full transition ${preferences[key] ? 'bg-teal-300' : 'bg-slate-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-[#0b1221] transition-transform ${preferences[key] ? 'translate-x-6' : 'translate-x-1'}`} /></span></button>)}
      </div>}

      {mode === 'help' && <div className="mt-6 rounded-xl border border-violet-300/15 bg-violet-300/[.06] p-4"><p className="text-sm font-medium text-violet-100">Need a walkthrough?</p><p className="mt-1 text-xs leading-5 text-slate-400">Use the Help section at the bottom of the dashboard for workflow guidance and campaign answers.</p><button type="button" data-testid="button-profile-help-scroll" onClick={() => { onClose(); document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-4 rounded-lg bg-violet-300/15 px-3 py-2 text-xs font-medium text-violet-100 hover:bg-violet-300/25">Open help guide</button></div>}

      {isLogout && <div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[.06] p-4"><p className="text-sm text-amber-100">Your current dashboard state will remain saved in this session.</p><p className="mt-2 text-xs leading-5 text-slate-500">Sign out is simulated for this front-end demo because no authentication service is connected.</p></div>}

      <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" data-testid="button-close-profile-dialog" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[.05]">{isLogout ? 'Stay signed in' : 'Close'}</button>
        {isLogout && <button type="button" data-testid="button-confirm-logout" onClick={onLogout} className="rounded-xl bg-amber-300/15 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-300/25">Sign out</button>}
      </div>
    </div>
  </div>;
}

function Header({ setMobileOpen, onNotify, notificationsOpen, unreadCount, markNotificationsRead, profileOpen, setProfileOpen, onProfileAction, search, onSearch, searchResults, onSearchSelect, theme, onThemeToggle }: { setMobileOpen: () => void; onNotify: () => void; notificationsOpen: boolean; unreadCount: number; markNotificationsRead: () => void; profileOpen: boolean; setProfileOpen: (x: boolean) => void; onProfileAction: (action: ProfileAction) => void; search: string; onSearch: (value: string) => void; searchResults: string[]; onSearchSelect: (result: string) => void; theme: Theme; onThemeToggle: () => void }) {
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [setProfileOpen]);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);
  return <header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#0e1626]/85 backdrop-blur-xl">
    <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3"><IconButton label="Open navigation" onClick={setMobileOpen} className="md:hidden"><Menu size={20} /></IconButton><div className="hidden text-xs text-slate-500 sm:block">Workspace <span className="mx-2 text-slate-700">/</span> <span className="text-slate-300">Command center</span></div><div className="sm:hidden font-serif text-xl tracking-wide text-slate-100">NOVA</div></div>
      <div className="flex items-center gap-1 sm:gap-3">
        <div className="relative hidden w-[230px] lg:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
           <input ref={searchRef} aria-label="Quick search" data-testid="input-quick-search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search anything..." className="h-9 w-full rounded-xl border border-white/[.08] bg-white/[.035] pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-teal-300/50" />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-slate-600">⌘ K</kbd>
           {search && <div className="absolute left-0 right-0 top-11 z-50 rounded-xl border border-white/[.1] bg-[#111b2d] p-1 shadow-xl">{searchResults.length ? searchResults.map((result) => <button type="button" key={result} onClick={() => onSearchSelect(result)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/[.05]"><Search size={13} className="text-teal-300" />{result}<ArrowUpRight size={13} className="ml-auto text-slate-600" /></button>) : <p className="px-3 py-3 text-xs text-slate-500">No matching records.</p>}</div>}
        </div>
         <ThemeToggle theme={theme} onToggle={onThemeToggle} />
         <div className="relative">
           <IconButton label="View notifications" onClick={onNotify}><Bell size={18} />{unreadCount > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-teal-300" />}</IconButton>
          {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-white/[.1] bg-[#111b2d] p-2 shadow-2xl">
             <div className="flex items-center justify-between px-3 py-2"><p className="text-sm font-medium text-slate-100">Notifications</p><Badge tone={unreadCount > 0 ? 'teal' : 'slate'}>{unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}</Badge></div>
             {['Revenue increased by 18% this month.', 'Growth Sprint reached 90% of its target.', 'You have 3 pending campaign approvals.'].map((n, i) => <button key={n} type="button" data-testid={`notification-${i}`} onClick={markNotificationsRead} className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[.05]"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-teal-300' : 'bg-violet-300'}`} /><span className="text-xs leading-5 text-slate-300">{n}<span className="mt-1 block text-[10px] text-slate-600">{i + 2} min ago</span></span></button>)}
             <button type="button" data-testid="button-mark-notifications-read" onClick={markNotificationsRead} className="w-full border-t border-white/[.06] py-2 text-xs text-teal-200 hover:text-teal-100">Mark all as read</button>
          </div>}
        </div>
        <div ref={profileRef} className="relative">
           <button type="button" data-testid="button-profile-menu" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-white/[.06]"><span className="grid h-8 w-8 place-items-center rounded-full bg-violet-300/15 text-xs font-bold text-violet-200">NO</span><ChevronDown size={14} className="hidden text-slate-500 sm:block" /></button>
           {profileOpen && <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-white/[.1] bg-[#111b2d] p-2 shadow-2xl">{([{ label: 'My Profile', action: 'profile' }, { label: 'Account Settings', action: 'settings' }, { label: 'Preferences', action: 'preferences' }, { label: 'Help Center', action: 'help' }, { label: 'Log Out', action: 'logout' }] as const).map(({ label, action }) => <button type="button" key={label} data-testid={`profile-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => onProfileAction(action)} className="flex w-full rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/[.05] hover:text-slate-100">{label}</button>)}</div>}
        </div>
      </div>
    </div>
  </header>;
}

function KpiCard({ label, value, change, icon: KpiIcon, spark, tone }: { label: string; value: string; change: string; icon: any; spark: string; tone: string }) {
  return <div className="nova-card group relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-teal-200/20">
    <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${tone}`} />
    <div className="relative flex items-start justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className="rounded-lg bg-white/[.06] p-2 text-slate-300"><KpiIcon size={16} /></span></div>
    <div className="relative mt-5 flex items-end justify-between"><div><p className="font-mono text-2xl font-bold tracking-tight text-slate-100">{value}</p><p className="mt-2 flex items-center gap-1 text-xs text-teal-200"><ArrowUp size={13} />{change}<span className="text-slate-600">vs last month</span></p></div><svg viewBox="0 0 86 32" className="h-9 w-20 overflow-visible"><path d={spark} fill="none" stroke="hsl(174 70% 55%)" strokeWidth="2" strokeLinecap="round" /></svg></div>
  </div>;
}

function CampaignTable({ campaigns, onDelete }: { campaigns: Campaign[]; onDelete: (campaign: Campaign) => void }) {
  const [status, setStatus] = useState('All Campaigns');
  const [channel, setChannel] = useState('All Channels');
  const [period, setPeriod] = useState('This Month');
  const [sort, setSort] = useState('Revenue');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 5;
  const filtered = useMemo(() => {
    const high = (c: Campaign) => c.conversion >= 10 || c.revenue >= 400000;
    const periodRank = { Today: 1, 'This Week': 2, 'This Month': 3, 'This Quarter': 4 };
    return campaigns.filter((c) => {
      const statusOk = status === 'All Campaigns' || (status === 'High Performing' ? high(c) : c.status === status);
      const periodOk = period === 'This Quarter' || periodRank[c.period] <= periodRank[period as keyof typeof periodRank];
      return statusOk && periodOk && (channel === 'All Channels' || c.channel === channel) && c.name.toLowerCase().includes(search.toLowerCase());
    }).sort((a, b) => {
      if (sort === 'Campaign Name') return a.name.localeCompare(b.name);
      if (sort === 'Leads') return b.leads - a.leads;
      if (sort === 'Conversion') return b.conversion - a.conversion;
      return b.revenue - a.revenue;
    });
  }, [campaigns, channel, period, search, sort, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > pageCount) setPage(1); }, [page, pageCount]);
  const update = (setter: (x: string) => void, value: string) => { setter(value); setPage(1); };
  return <section id="campaigns" className="nova-appear nova-delay-2 nova-card rounded-2xl p-4 sm:p-6">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-teal-300/80">Campaign controls</p><h2 className="mt-2 text-xl font-semibold text-slate-100">Recent Campaign Performance</h2><p className="mt-1 text-xs text-slate-500">A live view across your active acquisition mix.</p></div>
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-[180px] flex-1 sm:flex-none"><Search size={14} className="pointer-events-none absolute left-3 top-3 text-slate-500" /><input aria-label="Search campaigns" data-testid="input-campaign-search" value={search} onChange={(e) => update(setSearch, e.target.value)} placeholder="Search campaigns" className="h-9 w-full rounded-lg border border-white/[.09] bg-white/[.035] pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-teal-300/50" /></label>
        <label className="relative"><Filter size={13} className="pointer-events-none absolute left-3 top-3 text-slate-500" /><select aria-label="Filter campaigns" data-testid="select-campaign-filter" value={status} onChange={(e) => update(setStatus, e.target.value)} className="h-9 appearance-none rounded-lg border border-white/[.09] bg-[#121d30] pl-8 pr-8 text-xs text-slate-300 outline-none focus:border-teal-300/50"><option>All Campaigns</option><option>Active</option><option>Completed</option><option>Draft</option><option>High Performing</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-slate-500" /></label>
        <select aria-label="Marketing channel" data-testid="select-marketing-channel" value={channel} onChange={(e) => update(setChannel, e.target.value)} className="h-9 rounded-lg border border-white/[.09] bg-[#121d30] px-3 text-xs text-slate-300 outline-none focus:border-teal-300/50"><option>All Channels</option><option>Instagram</option><option>Google</option><option>Email</option><option>LinkedIn</option><option>YouTube</option></select>
        <select aria-label="Time period" data-testid="select-time-period" value={period} onChange={(e) => update(setPeriod, e.target.value)} className="h-9 rounded-lg border border-white/[.09] bg-[#121d30] px-3 text-xs text-slate-300 outline-none focus:border-teal-300/50"><option>Today</option><option>This Week</option><option>This Month</option><option>This Quarter</option></select>
        <label className="flex h-9 items-center gap-2 rounded-lg border border-white/[.09] bg-[#121d30] px-3 text-xs text-slate-400"><ArrowDown size={13} /><select aria-label="Sort campaigns" data-testid="select-campaign-sort" value={sort} onChange={(e) => update(setSort, e.target.value)} className="bg-transparent text-xs text-slate-300 outline-none"><option>Revenue</option><option>Conversion</option><option>Leads</option><option>Campaign Name</option></select></label>
      </div>
    </div>
    <div className="nova-scrollbar mt-6 overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left"><thead><tr className="border-y border-white/[.07] text-[10px] uppercase tracking-[.13em] text-slate-600"><th className="px-3 py-3 font-medium">Campaign</th><th className="px-3 py-3 font-medium">Channel</th><th className="px-3 py-3 font-medium">Leads</th><th className="px-3 py-3 font-medium">Conversion</th><th className="px-3 py-3 font-medium">Revenue</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Actions</th></tr></thead>
      <tbody>{visible.map((campaign) => <tr key={campaign.id} data-testid={`row-campaign-${campaign.id}`} className="border-b border-white/[.05] text-sm transition hover:bg-white/[.025]"><td className="px-3 py-4 font-medium text-slate-200">{campaign.name}</td><td className="px-3 py-4 text-slate-400">{campaign.channel}</td><td className="px-3 py-4 font-mono text-xs text-slate-300">{campaign.leads.toLocaleString('en-IN')}</td><td className="px-3 py-4 font-mono text-xs text-teal-200">{campaign.conversion.toFixed(1)}%</td><td className="px-3 py-4 font-mono text-xs text-slate-200">{currency(campaign.revenue)}</td><td className="px-3 py-4"><Badge tone={campaign.status === 'Active' ? 'teal' : campaign.status === 'Completed' ? 'violet' : 'slate'}>{campaign.status}</Badge></td><td className="px-3 py-4"><IconButton label={`Delete ${campaign.name}`} onClick={() => onDelete(campaign)}><Trash2 size={15} /></IconButton></td></tr>)}</tbody>
    </table>{visible.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No campaigns match these controls.</div>}</div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span>Showing {visible.length} of {filtered.length} campaigns <span className="text-slate-700">· {period}</span></span><div className="flex items-center gap-1"><button type="button" aria-label="Previous page" data-testid="button-previous-page" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))} className="rounded-lg border border-white/[.08] p-2 text-slate-400 disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/[.05]"><ChevronLeft size={14} /></button>{Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => <button key={number} type="button" data-testid={`button-page-${number}`} onClick={() => setPage(number)} className={`h-8 min-w-8 rounded-lg text-xs ${page === number ? 'bg-teal-300 text-[#0b1221]' : 'text-slate-400 hover:bg-white/[.05]'}`}>{number}</button>)}<button type="button" aria-label="Next page" data-testid="button-next-page" disabled={page === pageCount} onClick={() => setPage(Math.min(pageCount, page + 1))} className="rounded-lg border border-white/[.08] p-2 text-slate-400 disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/[.05]"><ChevronRight size={14} /></button></div></div>
  </section>;
}

function ChartCard({ title, children, className = '', action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  const showDetails = () => window.dispatchEvent(new CustomEvent('nova-toast', { detail: `${title} details opened.` }));
  return <div className={`nova-card rounded-2xl p-5 ${className}`}><div className="mb-5 flex items-start justify-between"><div><h3 className="text-sm font-semibold text-slate-100">{title}</h3><p className="mt-1 text-[11px] text-slate-500">Updated 5 minutes ago</p></div><div className="flex items-center gap-2"><IconButton label={`View ${title} details`} onClick={showDetails}><Info size={15} /></IconButton>{action}</div></div>{children}</div>;
}

function Analytics() {
  return <section id="analytics" className="nova-appear nova-delay-3"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300/80">Chart</p><h2 className="mt-2 text-xl font-semibold text-slate-100">Performance Analytics</h2></div><button type="button" data-testid="button-download-report" onClick={() => window.dispatchEvent(new CustomEvent('nova-toast', { detail: 'Report downloaded successfully.' }))} className="hidden items-center gap-2 rounded-lg border border-white/[.09] px-3 py-2 text-xs text-slate-300 hover:bg-white/[.05] sm:flex"><Download size={14} /> Download report</button></div>
     <div className="grid gap-4 xl:grid-cols-[1.12fr_1fr_1fr]"><ChartCard title="Revenue by Channel"><ResponsiveContainer width="100%" height={235}><BarChart data={revenueByChannel} barSize={22}><CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#748198', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#748198', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}k`} /><ChartTooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--popover-border))', color: 'hsl(var(--popover-foreground))', borderRadius: 10, fontSize: 11 }} formatter={(value) => [`₹${value}k`, 'Revenue']} /><Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
       <ChartCard title="Revenue Growth"><ResponsiveContainer width="100%" height={235}><LineChart data={revenueGrowth}><CartesianGrid stroke="rgba(148,163,184,.1)" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#748198', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#748198', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} /><ChartTooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--popover-border))', color: 'hsl(var(--popover-foreground))', borderRadius: 10, fontSize: 11 }} formatter={(value) => [`₹${value}L`, 'Revenue']} /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 3 }} /></LineChart></ResponsiveContainer></ChartCard>
       <ChartCard title="Customer Distribution"><ResponsiveContainer width="100%" height={235}><PieChart><Pie data={customerDistribution} innerRadius={55} outerRadius={82} paddingAngle={4} dataKey="value" stroke="none">{customerDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><ChartTooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--popover-border))', color: 'hsl(var(--popover-foreground))', borderRadius: 10, fontSize: 11 }} formatter={(value) => [`${value}%`, 'Customers']} /><Legend verticalAlign="bottom" iconType="circle" iconSize={7} formatter={(value) => <span className="text-[10px] text-slate-400">{value}</span>} /></PieChart></ResponsiveContainer></ChartCard>
    </div>
  </section>;
}

function Insights() {
  const [tab, setTab] = useState('Overview');
  const content: Record<string, { metric: string; title: string; body: string; points: string[] }> = {
    Overview: { metric: '82.4', title: 'Momentum is building', body: 'The business is compounding across acquisition and retention, with a healthy mix of paid and owned channels.', points: ['Revenue is 18.4% ahead of last month', 'Returning customers now represent 31% of orders'] },
    Revenue: { metric: '₹24.8L', title: 'Revenue quality is improving', body: 'Email and search intent are producing the strongest conversion efficiency while Instagram keeps the top of funnel full.', points: ['Email conversion is 13.6%', '₹6.4L remains to reach the monthly target'] },
    Customers: { metric: '12,842', title: 'Retention has room to run', body: 'The returning base is growing steadily. A focused post-purchase experience could turn more first orders into repeat revenue.', points: ['Premium segment is 19% of customers', '11% more returning customers this month'] },
    Marketing: { metric: '4.8x', title: 'The channel mix is balanced', body: 'Google captures high-intent demand while creator and social stories create efficient discovery.', points: ['Search Intent is the highest revenue campaign', 'Three approvals are ready for review'] },
  };
  const current = content[tab];
  return <section id="insights" className="nova-card rounded-2xl p-5 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-amber-200/80">Business insights</p><h2 className="mt-2 text-xl font-semibold text-slate-100">A clearer read on the week</h2></div><div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[.07] bg-white/[.025] p-1">{Object.keys(content).map((item) => <button key={item} type="button" data-testid={`tab-${item.toLowerCase()}`} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs transition ${tab === item ? 'bg-white/[.1] text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>{item}</button>)}</div></div><div className="mt-8 grid gap-6 md:grid-cols-[180px_1fr_1fr] md:items-center"><div className="border-r border-white/[.07] pr-6"><p className="font-mono text-3xl font-bold text-teal-200">{current.metric}</p><p className="mt-2 text-xs text-slate-500">Signal score</p></div><div><h3 className="text-base font-semibold text-slate-100">{current.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{current.body}</p></div><ul className="space-y-3">{current.points.map((point) => <li key={point} className="flex gap-2 text-xs text-slate-300"><Check size={15} className="mt-0.5 shrink-0 text-teal-300" />{point}</li>)}</ul></div></section>;
}

function CampaignBuilder({ onPublish, pushToast }: { onPublish: (campaign: Campaign) => void; pushToast: (message: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [goal, setGoal] = useState('Awareness');
  const [audiences, setAudiences] = useState<string[]>(['New Customers']);
  const [date, setDate] = useState('2026-03-24');
  const [budget, setBudget] = useState(50000);
  const [optimization, setOptimization] = useState(true);
  const [live, setLive] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirm(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  const toggleAudience = (value: string) => setAudiences((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const validate = () => { if (!name.trim()) { setError('Campaign name is required.'); return; } if (description.trim().length < 12) { setError('Add a short description of at least 12 characters.'); return; } if (!audiences.length) { setError('Select at least one target audience.'); return; } setError(''); setConfirm(true); };
  const publish = () => { onPublish({ id: Date.now(), name: name.trim(), channel, leads: 0, conversion: 0, revenue: 0, status: live ? 'Active' : 'Draft', period: 'This Month' }); setConfirm(false); setName(''); setDescription(''); setAudiences(['New Customers']); pushToast('Campaign created successfully.'); };
  return <section id="builder" className="nova-card rounded-2xl p-5 sm:p-6"><div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300/80">Form · input field · radio · checkbox · date picker</p><h2 className="mt-2 text-xl font-semibold text-slate-100">Campaign Builder</h2><p className="mt-1 text-xs text-slate-500">Turn a clear intention into the next growth experiment.</p></div><Badge tone={live ? 'teal' : 'slate'}>{live ? 'Ready to publish' : 'Saved as draft'}</Badge></div>
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2"><label className="block text-xs text-slate-400">Campaign name <span className="text-teal-300">*</span><input aria-label="Campaign name" data-testid="input-campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter campaign name" className={`mt-2 h-11 w-full rounded-xl border bg-white/[.035] px-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-teal-300/60 ${error && !name ? 'border-red-300/50' : 'border-white/[.1]'}`} /></label>
      <label className="block text-xs text-slate-400">Marketing channel<select aria-label="Builder marketing channel" data-testid="select-builder-channel" value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.1] bg-[#121d30] px-3 text-sm text-slate-200 outline-none focus:border-teal-300/60"><option>Instagram</option><option>Google</option><option>Email</option><option>LinkedIn</option><option>YouTube</option></select></label>
      <label className="block text-xs text-slate-400 lg:col-span-2">Campaign description<textarea aria-label="Campaign description" data-testid="textarea-campaign-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What change should this campaign create?" className="mt-2 min-h-[92px] w-full resize-y rounded-xl border border-white/[.1] bg-white/[.035] p-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-teal-300/60" /></label>
      <fieldset><legend className="text-xs text-slate-400">What is your main campaign goal?</legend><div className="mt-3 flex flex-wrap gap-2">{['Awareness', 'Conversion', 'Retention'].map((item) => <label key={item} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition ${goal === item ? 'border-teal-300/50 bg-teal-300/10 text-teal-100' : 'border-white/[.1] text-slate-400 hover:bg-white/[.04]'}`}><input type="radio" name="goal" value={item} checked={goal === item} onChange={() => setGoal(item)} className="accent-teal-300" />{item}</label>)}</div></fieldset>
      <fieldset><legend className="text-xs text-slate-400">Target audience</legend><div className="mt-3 flex flex-wrap gap-2">{['New Customers', 'Existing Customers', 'Premium Customers', 'Business Owners'].map((item) => <label key={item} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition ${audiences.includes(item) ? 'border-violet-300/50 bg-violet-300/10 text-violet-100' : 'border-white/[.1] text-slate-400 hover:bg-white/[.04]'}`}><input type="checkbox" checked={audiences.includes(item)} onChange={() => toggleAudience(item)} className="accent-violet-300" />{item}</label>)}</div></fieldset>
      <label className="block text-xs text-slate-400">Campaign date<input aria-label="Campaign date" data-testid="input-campaign-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/[.1] bg-white/[.035] px-3 text-sm text-slate-200 outline-none focus:border-teal-300/60" /></label>
      <div><div className="flex items-center justify-between text-xs text-slate-400"><label htmlFor="budget-slider">Campaign budget</label><span className="font-mono text-teal-200">₹{budget.toLocaleString('en-IN')}</span></div><input id="budget-slider" aria-label="Campaign budget" data-testid="input-budget-slider" type="range" min="10000" max="500000" step="5000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-4 h-2 w-full cursor-pointer accent-teal-300" /><div className="mt-2 flex justify-between text-[10px] text-slate-600"><span>₹10,000</span><span>₹5,00,000</span></div></div>
      <div className="flex items-start justify-between rounded-xl border border-white/[.08] bg-white/[.025] p-3 lg:col-span-2"><div><label htmlFor="auto-optimize" className="text-xs font-medium text-slate-300">Enable automatic campaign optimization</label>{optimization && <p className="mt-1 text-[11px] leading-5 text-slate-500">NOVA will rebalance spend toward your best-converting audience.</p>}</div><button id="auto-optimize" type="button" role="switch" aria-checked={optimization} data-testid="toggle-auto-optimization" onClick={() => setOptimization(!optimization)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${optimization ? 'bg-teal-300' : 'bg-slate-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-[#0b1221] transition-transform ${optimization ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
      <div className="flex items-center justify-between gap-4 lg:col-span-2"><div><p className="text-xs text-slate-400">Campaign status</p><button type="button" role="switch" aria-checked={live} data-testid="toggle-campaign-status" onClick={() => setLive(!live)} className={`mt-2 flex items-center gap-2 text-xs ${live ? 'text-teal-200' : 'text-slate-500'}`}><span className={`relative h-5 w-9 rounded-full ${live ? 'bg-teal-300' : 'bg-slate-700'}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-[#0b1221] transition-transform ${live ? 'translate-x-5' : 'translate-x-1'}`} /></span>{live ? 'Active on publish' : 'Save as draft'}</button></div><button type="button" data-testid="button-create-campaign" onClick={validate} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-300 px-5 text-sm font-semibold text-[#0b1221] transition hover:bg-teal-200"><Plus size={16} /> Create Campaign</button></div>
      {error && <p role="alert" data-testid="form-error" className="lg:col-span-2 rounded-lg border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">{error}</p>}
    </div>
    {confirm && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" onKeyDown={(e) => e.key === 'Escape' && setConfirm(false)}><div className="nova-card w-full max-w-md rounded-2xl p-6 shadow-2xl"><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-300/15 text-teal-200"><Sparkles size={19} /></div><IconButton label="Close publish modal" onClick={() => setConfirm(false)}><X size={18} /></IconButton></div><h3 className="mt-6 text-xl font-semibold text-slate-100">Ready to launch?</h3><p className="mt-2 text-sm leading-6 text-slate-400">Review your campaign details before publishing. <span className="text-slate-200">{name || 'Untitled campaign'}</span> will run on {channel} with a ₹{budget.toLocaleString('en-IN')} budget.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" data-testid="button-cancel-publish" onClick={() => setConfirm(false)} className="rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-white/[.05]">Cancel</button><button type="button" data-testid="button-publish-campaign" onClick={publish} className="rounded-xl bg-teal-300 px-4 py-3 text-sm font-semibold text-[#0b1221] hover:bg-teal-200">Publish Campaign</button></div></div></div>}
  </section>;
}

function GoalAndHelp({ pushToast }: { pushToast: (message: string) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const questions = [
    ['What does NOVA track?', 'NOVA brings sales, campaign, customer, and channel signals into one operating view so your team can choose what to do next.'],
    ['How are conversion rates calculated?', 'Conversion rate is completed orders divided by attributed leads for the selected period, expressed as a percentage.'],
    ['Can I export my reports?', 'Yes. Use Download report in Performance Analytics to export the current view as a shareable report.'],
    ['How do I create a campaign?', 'Fill in the Campaign Builder, choose your audience and budget, then select Create Campaign to review and publish.'],
  ];
  return <div id="help" className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]"><div className="nova-card rounded-2xl p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-teal-300/80">Monthly business goal</p><h2 className="mt-2 text-xl font-semibold text-slate-100">Keep the signal moving</h2></div><Target className="text-teal-300" size={21} /></div><div className="mt-10 flex items-end justify-between"><div><p className="font-mono text-3xl font-bold text-slate-100">₹18.6L <span className="text-sm font-normal text-slate-500">/ ₹25L</span></p><p className="mt-2 text-xs text-slate-500">₹6.4L remaining to reach your target.</p></div><p className="font-mono text-xl text-teal-200">74%</p></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-700/60"><div className="h-full w-[74%] rounded-full bg-gradient-to-r from-teal-300 to-violet-300 transition-all duration-700" /></div><div className="mt-6 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white/[.035] p-3"><p className="font-mono text-sm text-slate-200">₹4.2L</p><p className="mt-1 text-[10px] text-slate-600">this week</p></div><div className="rounded-xl bg-white/[.035] p-3"><p className="font-mono text-sm text-slate-200">+18.4%</p><p className="mt-1 text-[10px] text-slate-600">momentum</p></div><button type="button" data-testid="button-refresh-goal" onClick={() => pushToast('Goal progress refreshed.')} className="rounded-xl bg-white/[.035] p-3 text-xs text-slate-400 hover:bg-white/[.06]"><RefreshCw size={14} className="mx-auto mb-1" />Refresh</button></div></div>
    <div className="nova-card rounded-2xl p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300/80">Accordion</p><h2 className="mt-2 text-xl font-semibold text-slate-100">Need Help?</h2></div><CircleHelp className="text-violet-300" size={21} /></div><div className="mt-5 divide-y divide-white/[.07]">{questions.map(([question, answer], index) => <div key={question}><button type="button" data-testid={`accordion-${index}`} aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm text-slate-300 hover:text-slate-100"><span>{question}</span><ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <p className="max-w-xl pb-4 text-xs leading-5 text-slate-500">{answer}</p>}</div>)}</div></div></div>;
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDialog, setProfileDialog] = useState<ProfileAction | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({ emailAlerts: true, weeklySummary: true, compactView: false });
  const [greeting, setGreeting] = useState(getTimeGreeting);
  const [date, setDate] = useState('2026-03-24');
  const [search, setSearch] = useState('');
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [toasts, setToasts] = useState<string[]>([]);
  const [briefExpanded, setBriefExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('nova-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const pushToast = (message: string) => { setToasts((current) => [...current.filter((item) => item !== message), message]); window.setTimeout(() => setToasts((current) => current.filter((item) => item !== message)), 4200); };
  useEffect(() => { const handler = (event: Event) => pushToast((event as CustomEvent<string>).detail); window.addEventListener('nova-toast', handler); return () => window.removeEventListener('nova-toast', handler); }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('nova-theme', theme);
  }, [theme]);
  useEffect(() => { const timer = window.setInterval(() => setGreeting(getTimeGreeting()), 60000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMobileOpen(false); setNotificationsOpen(false); setProfileOpen(false); setProfileDialog(null); setDeleteTarget(null); } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, []);
  const handleProfileAction = (action: ProfileAction) => { setProfileOpen(false); setProfileDialog(action); };
  const togglePreference = (key: keyof Preferences) => { setPreferences((current) => ({ ...current, [key]: !current[key] })); pushToast('Preference updated.'); };
  const removeCampaign = () => { if (!deleteTarget) return; setCampaigns((current) => current.filter((item) => item.id !== deleteTarget.id)); setDeleteTarget(null); pushToast('Campaign deleted.'); };
  const searchResults = useMemo(() => searchItems.filter((item) => item.toLowerCase().includes(search.toLowerCase())).slice(0, 5), [search]);
    return <div className="min-h-[100dvh] overflow-x-hidden text-slate-100"><div className="nova-grid pointer-events-none fixed inset-0 z-0 opacity-25" /><Sidebar active={active} setActive={setActive} open={mobileOpen} setOpen={setMobileOpen} /><div className="relative z-10 md:pl-[248px]"><Header setMobileOpen={() => setMobileOpen(true)} onNotify={() => setNotificationsOpen(!notificationsOpen)} notificationsOpen={notificationsOpen} unreadCount={unreadNotifications} markNotificationsRead={() => setUnreadNotifications(0)} profileOpen={profileOpen} setProfileOpen={setProfileOpen} onProfileAction={handleProfileAction} search={search} onSearch={setSearch} searchResults={searchResults} onSearchSelect={(result) => { setSearch(''); pushToast(`Opened ${result}.`); }} theme={theme} onThemeToggle={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
       <main className="mx-auto max-w-[1520px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10"><div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div id="overview" className="scroll-mt-28"><div className="flex items-center gap-2 text-[11px] text-slate-500"><Home size={13} /> Dashboard <ChevronRight size={12} /> <span className="text-slate-300">Campaign performance</span></div><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">{greeting}, operator</h1><p className="mt-2 max-w-lg text-sm text-slate-500">Here’s what’s happening with your business today.</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" data-testid="button-explore-dashboard" onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-teal-300 px-4 text-xs font-semibold text-[#0b1221] transition hover:bg-teal-200">Explore Dashboard <ArrowUpRight size={14} /></button><button type="button" data-testid="button-view-reports" onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[.1] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[.05]">View Reports <FileText size={14} /></button></div></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative min-w-0 flex-1 sm:w-[280px]"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" /><input aria-label="Search customers, campaigns, reports" data-testid="input-dashboard-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers, campaigns, reports…" className="h-10 w-full rounded-xl border border-white/[.1] bg-white/[.035] pl-9 pr-3 text-xs text-slate-100 outline-none placeholder:text-slate-600 focus:border-teal-300/60" />{search && <div className="absolute left-0 right-0 top-12 z-40 rounded-xl border border-white/[.1] bg-[#111b2d] p-1 shadow-xl">{searchResults.length ? searchResults.map((result) => <button type="button" key={result} data-testid={`search-result-${result.toLowerCase().replaceAll(' ', '-')}`} onClick={() => { setSearch(''); pushToast(`Opened ${result}.`); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/[.05]"><Search size={13} className="text-teal-300" />{result}<ArrowUpRight size={13} className="ml-auto text-slate-600" /></button>) : <p className="px-3 py-3 text-xs text-slate-500">No matching records.</p>}</div>}</div><label className="relative flex h-10 items-center gap-2 rounded-xl border border-white/[.1] bg-white/[.035] px-3 text-xs text-slate-400"><CalendarDays size={15} className="text-teal-300" /><input aria-label="Reporting date" data-testid="input-reporting-date" type="date" value={date} onChange={(e) => { setDate(e.target.value); pushToast('Reporting date updated.'); }} className="w-[125px] bg-transparent text-xs text-slate-300 outline-none" /></label></div></div>
      <section aria-label="Performance overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Revenue" value="₹24.8L" change="+18.4%" icon={WalletCards} tone="bg-teal-300/10" spark="M0 26 C12 26 14 22 24 24 S37 15 46 19 S57 10 66 14 S77 3 86 5" /><KpiCard label="Customers" value="12,842" change="+12.7%" icon={Users} tone="bg-violet-300/10" spark="M0 25 C12 21 16 24 26 18 S39 21 48 12 S59 14 68 8 S79 10 86 3" /><KpiCard label="Conversion rate" value="8.64%" change="+2.3%" icon={TrendingUp} tone="bg-amber-300/10" spark="M0 27 C10 24 18 26 26 20 S42 23 48 16 S64 19 71 10 S80 12 86 4" /><KpiCard label="Active campaigns" value="24" change="+6.1%" icon={Radio} tone="bg-blue-300/10" spark="M0 25 C12 23 18 17 27 21 S39 13 48 17 S59 7 69 12 S78 6 86 6" /></section>
      <div className="mt-6"><div className="nova-card relative overflow-hidden rounded-2xl border-teal-300/10 p-5 sm:p-6"><div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-teal-300/[.06] to-transparent" /><div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><span className="status-dot h-2 w-2 rounded-full bg-teal-300" /><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-teal-200/80">AI Business Brief</p></div><p className={`mt-4 max-w-3xl text-base leading-7 text-slate-200 ${briefExpanded ? '' : 'line-clamp-2'}`}>Your business is trending upward this month. Revenue is up 18.4%, while Instagram is currently your highest-performing acquisition channel. Returning customers have increased by 11%, and the current mix is giving you room to invest in higher-intent search.</p><p className="mt-3 flex items-center gap-2 text-[11px] text-slate-600"><Clock3 size={12} /> Analysis updated 5 minutes ago</p></div><button type="button" data-testid="button-expand-brief" onClick={() => setBriefExpanded(!briefExpanded)} className="shrink-0 self-start rounded-lg border border-white/[.1] px-3 py-2 text-xs text-slate-300 hover:bg-white/[.05]">{briefExpanded ? 'Show less' : 'Read full brief'}</button></div></div></div>
      <div className="mt-6"><CampaignTable campaigns={campaigns} onDelete={setDeleteTarget} /></div><div className="mt-8"><Analytics /></div><div className="mt-8"><Insights /></div><div className="mt-8"><CampaignBuilder onPublish={(campaign) => setCampaigns((current) => [campaign, ...current])} pushToast={pushToast} /></div><div className="mt-8"><GoalAndHelp pushToast={pushToast} /></div>
      <footer className="mt-14 flex flex-col gap-5 border-t border-white/[.07] py-8 text-xs text-slate-500 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-serif text-2xl tracking-wide text-slate-200">NOVA</p><p className="mt-1">Smarter decisions. Better business.</p><p className="mt-5 text-[11px] text-slate-600">© 2026 NOVA Analytics</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end"><button type="button" data-testid="footer-dashboard" onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-teal-200">Dashboard</button><button type="button" data-testid="footer-analytics" onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-teal-200">Analytics</button><button type="button" data-testid="footer-reports" onClick={() => pushToast('Reports are ready in Performance Analytics.')} className="hover:text-teal-200">Reports</button><button type="button" data-testid="footer-help" onClick={() => document.getElementById('help')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-teal-200">Help</button><button type="button" data-testid="footer-privacy" onClick={() => pushToast('Privacy controls are managed by your workspace administrator.')} className="hover:text-teal-200">Privacy</button><button type="button" data-testid="footer-terms" onClick={() => pushToast('NOVA Terms of Service opened.')} className="hover:text-teal-200">Terms</button></div></footer>
     </main></div>
    {deleteTarget && <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/85 p-4"><div className="w-full max-w-sm rounded-2xl border border-red-300/20 bg-[#171522] p-6 shadow-2xl"><div className="grid h-10 w-10 place-items-center rounded-xl bg-red-400/10 text-red-200"><Trash2 size={18} /></div><h3 className="mt-5 text-lg font-semibold text-slate-100">Delete Campaign?</h3><p className="mt-2 text-sm leading-6 text-slate-400">Are you sure you want to delete <span className="text-slate-200">{deleteTarget.name}</span>? This action cannot be undone.</p><div className="mt-6 flex justify-end gap-2"><button type="button" data-testid="button-cancel-delete" onClick={() => setDeleteTarget(null)} className="rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[.05]">Cancel</button><button type="button" data-testid="button-confirm-delete" onClick={removeCampaign} className="rounded-xl bg-red-400/15 px-4 py-2.5 text-sm font-medium text-red-200 hover:bg-red-400/25">Delete</button></div></div></div>}
     {profileDialog && <ProfileDialog mode={profileDialog} preferences={preferences} onPreferenceChange={togglePreference} onClose={() => setProfileDialog(null)} onToast={pushToast} onLogout={() => { setProfileDialog(null); pushToast('Signed out of this demo workspace.'); }} />}
    <ToastStack messages={toasts} onDismiss={(message) => setToasts((current) => current.filter((item) => item !== message))} />
  </div>;
}

function Router() {
  return <Switch><Route path="/" component={AppShell} /><Route component={() => <div className="grid min-h-[100dvh] place-items-center bg-[#0e1626] text-slate-200">NOVA workspace not found.</div>} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;