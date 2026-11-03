import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from './services';
import { UserRole } from './types';
import {
  PawPrint,
  Bell,
  LogOut,
  KeyRound,
  Shield,
  Stethoscope,
  Users,
  HeartHandshake,
  Menu,
  X,
  RotateCcw,
  LayoutDashboard,
  Home,
  UtensilsCrossed,
  Pill,
  Syringe,
  Scissors,
  FileText,
  Activity,
  CreditCard,
  BarChart3,
  Users2,
  Download,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const DemoCredentialsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (e: string, p: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const { login, resetDemoData } = useAuth();
  if (!isOpen) return null;

  const demoAccounts = [
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      email: 'admin@petcare.com',
      pass: 'admin123',
      portalPath: '/admin/login',
      desc: 'Hospital admin & full system permissions',
      icon: <Shield className="w-4 h-4 text-rose-600" />,
      color: 'border-rose-200 bg-rose-50/50',
    },
    {
      role: 'doctor' as UserRole,
      title: 'Veterinary Doctor',
      email: 'doctor@petcare.com',
      pass: 'doctor123',
      portalPath: '/doctor/login',
      desc: 'Clinical diagnosis, vitals & prescriptions',
      icon: <Stethoscope className="w-4 h-4 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/50',
    },
    {
      role: 'staff' as UserRole,
      title: 'Care Staff',
      email: 'staff@petcare.com',
      pass: 'staff123',
      portalPath: '/staff/login',
      desc: 'Feeding rounds, meds delivery & grooming',
      icon: <Users className="w-4 h-4 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/50',
    },
    {
      role: 'owner' as UserRole,
      title: 'Pet Owner',
      email: 'owner@petcare.com',
      pass: 'owner123',
      portalPath: '/owner/login',
      desc: 'Pet parent portal with read-only care access',
      icon: <HeartHandshake className="w-4 h-4 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/50',
    },
  ];

  const handlePick = async (e: string, p: string) => {
    if (onSelect) {
      onSelect(e, p);
    } else {
      await login(e, p);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-800">Verified Demo Accounts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Select any verified demo role account to log in instantly, or test individual login portals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {demoAccounts.map((d) => (
            <div
              key={d.role}
              className={`p-3.5 rounded-2xl border ${d.color} flex flex-col justify-between transition hover:shadow-xs`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {d.icon}
                  <span className="font-bold text-xs text-slate-900">{d.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2 leading-tight">{d.desc}</p>
                <div className="text-[11px] font-mono text-slate-700 bg-white/80 p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                  <div className="truncate font-semibold">{d.email}</div>
                  <div className="text-slate-500">Pass: <span className="text-slate-900 font-bold">{d.pass}</span></div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePick(d.email, d.pass)}
                className="mt-3 w-full py-2 bg-slate-900 hover:bg-teal-600 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Log In as {d.role.toUpperCase()}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset default demo accounts and restore original sample records? User-created accounts will be preserved.')) {
                  resetDemoData();
                  DataService.resetAllData();
                  alert('Default demo data and accounts successfully restored (user accounts preserved).');
                  onClose();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
            </button>
          </div>

          <a
            href="/petcare-project.zip"
            download="petcare-project.zip"
            className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 px-2.5 py-1 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
          >
            <Download className="w-3.5 h-3.5" /> Download Project ZIP
          </a>
        </div>
      </div>
    </div>
  );
};

export const Navbar: React.FC<{ onToggleSidebar?: () => void; isSidebarOpen?: boolean }> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, role, logout, navigate } = useAuth();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const notifications = DataService.getNotifications().filter(
    (n) => n.targetRole === 'all' || !role || n.targetRole === role
  );
  const unread = notifications.filter((n) => !n.isRead).length;

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    admin: { title: 'Admin', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    doctor: { title: 'Doctor / Vet', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    staff: { title: 'Care Staff', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    owner: { title: 'Pet Owner', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => (role ? navigate(`/${role}/dashboard`) : navigate('/login'))}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <PawPrint className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-base text-slate-800 tracking-tight block leading-tight">
                  PetCare <span className="text-[10px] uppercase font-black text-teal-600">Smart</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium">Management System</span>
              </div>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Credentials quick access */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden md:inline">Demo Credentials</span>
              <span className="md:hidden">Demo</span>
            </button>

            {/* Download project ZIP */}
            <a
              href="/petcare-project.zip"
              download="petcare-project.zip"
              title="Download full project ZIP archive"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Project ZIP</span>
            </a>

            {/* Active Role Indicator */}
            {role && (
              <span
                className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${roleLabels[role]?.color}`}
              >
                {roleLabels[role]?.title || role}
              </span>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-slate-800 text-sm">Notifications ({notifications.length})</span>
                    </div>
                    <button
                      onClick={() => DataService.markAllNotificationsRead()}
                      className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">No active alerts at this time.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl border transition ${
                            n.isRead
                              ? 'bg-slate-50/60 border-slate-100 opacity-75'
                              : 'bg-teal-50/40 border-teal-100'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
                />
                <div className="hidden lg:block text-left text-xs leading-none">
                  <div className="font-bold text-slate-800 truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <DemoCredentialsModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </>
  );
};

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { role, currentPath, navigate, logout, user } = useAuth();

  // Role-specific navigation links
  const links = [
    {
      label: `${role ? role.charAt(0).toUpperCase() + role.slice(1) : ''} Dashboard`,
      path: `/${role || 'admin'}/dashboard`,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: role === 'owner' ? 'My Registered Pets' : 'Pet Management',
      path: '/pets',
      icon: <PawPrint className="w-4 h-4" />,
    },
    {
      label: role === 'owner' ? 'Boarding Stays' : 'Booking & Boarding',
      path: '/boarding',
      icon: <Home className="w-4 h-4" />,
      ownerBadge: 'Read-Only',
    },
    {
      label: 'Feeding Schedules',
      path: '/feeding',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      ownerBadge: 'Read-Only',
    },
    {
      label: 'Medications',
      path: '/medications',
      icon: <Pill className="w-4 h-4" />,
      ownerBadge: 'Read-Only',
    },
    {
      label: 'Vaccinations',
      path: '/vaccinations',
      icon: <Syringe className="w-4 h-4" />,
    },
    {
      label: 'Grooming Salon',
      path: '/grooming',
      icon: <Scissors className="w-4 h-4" />,
      ownerBadge: 'Read-Only',
    },
    // Clinical Medical Records strictly restricted to Admin, Doctor, and Staff (hidden from Owners)
    ...(role !== 'owner'
      ? [{ label: 'Clinical Medical Records', path: '/records', icon: <FileText className="w-4 h-4" /> }]
      : []),
    {
      label: 'Smart Care Monitor',
      path: '/smart-monitor',
      icon: <Activity className="w-4 h-4" />,
      badge: 'LIVE',
    },
    {
      label: role === 'owner' ? 'My Invoices & Payments' : 'Invoices & Billing',
      path: '/invoices',
      icon: <CreditCard className="w-4 h-4" />,
    },
    // Reports accessible to Admin, Doctor, and Staff (Hidden from Owners)
    ...(role === 'admin' || role === 'doctor' || role === 'staff'
      ? [{ label: 'Reports & Analytics', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> }]
      : []),
    // User management restricted strictly to Admin
    ...(role === 'admin'
      ? [{ label: 'User Management', path: '/users', icon: <Users2 className="w-4 h-4" /> }]
      : []),
    {
      label: 'Notifications',
      path: '/notifications',
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  const handleNav = (p: string) => {
    navigate(p);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {role ? `${role.toUpperCase()} Workspace` : 'Workspace Menu'}
            </span>
            {role === 'owner' && (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Owner Access
              </span>
            )}
          </div>

          {links.map((it) => {
            const active = currentPath === it.path;
            return (
              <button
                key={it.path}
                onClick={() => handleNav(it.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={active ? 'text-teal-600' : 'text-slate-400'}>{it.icon}</span>
                  <span className="truncate">{it.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {it.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                      {it.badge}
                    </span>
                  )}
                  {role === 'owner' && it.ownerBadge && (
                    <span className="text-[8px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                      {it.ownerBadge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with user info & logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="mb-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate font-semibold">{user?.name}</span>
            <span className="uppercase text-[9px] font-bold text-teal-700">{user?.role}</span>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs text-rose-600 hover:bg-rose-50 font-semibold rounded-xl border border-rose-200/60 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
