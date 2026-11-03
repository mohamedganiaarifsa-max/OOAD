import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { DemoCredentialsModal } from '../Navigation';
import { UserRole } from '../types';
import {
  PawPrint,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Shield,
  Stethoscope,
  Users,
  HeartHandshake,
  UserPlus,
  LogIn,
  Phone,
  User as UserIcon,
} from 'lucide-react';

interface PortalConfig {
  expectedRole?: UserRole;
  portalTitle: string;
  portalSubtitle: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  icon: React.ReactNode;
  defaultEmail: string;
  defaultPassword: string;
}

const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  admin: {
    expectedRole: 'admin',
    portalTitle: 'Administrator Portal',
    portalSubtitle: 'Restricted administrative access for hospital managers and system controllers.',
    badge: 'Admin Security Level 1',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    gradient: 'from-rose-600 to-slate-900',
    icon: <Shield className="w-5 h-5 text-rose-400" />,
    defaultEmail: 'admin@petcare.com',
    defaultPassword: 'admin123',
  },
  doctor: {
    expectedRole: 'doctor',
    portalTitle: 'Veterinary Doctor Portal',
    portalSubtitle: 'Clinical diagnostics, medical records, vital signs, and prescription management.',
    badge: 'Clinical Staff Access',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-600 to-slate-900',
    icon: <Stethoscope className="w-5 h-5 text-emerald-400" />,
    defaultEmail: 'doctor@petcare.com',
    defaultPassword: 'doctor123',
  },
  staff: {
    expectedRole: 'staff',
    portalTitle: 'Care Staff Portal',
    portalSubtitle: 'Boarding intake, feeding checklists, medication administration, and salon grooming.',
    badge: 'Operations & Boarding Staff',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    gradient: 'from-blue-600 to-slate-900',
    icon: <Users className="w-5 h-5 text-blue-400" />,
    defaultEmail: 'staff@petcare.com',
    defaultPassword: 'staff123',
  },
  owner: {
    expectedRole: 'owner',
    portalTitle: 'Pet Owner Portal',
    portalSubtitle: 'Track your pet’s boarding stay, real-time biometrics, vaccinations, and invoices.',
    badge: 'Pet Parent Community',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-600 to-slate-900',
    icon: <HeartHandshake className="w-5 h-5 text-amber-400" />,
    defaultEmail: 'owner@petcare.com',
    defaultPassword: 'owner123',
  },
  universal: {
    expectedRole: undefined,
    portalTitle: 'Universal Sign-In',
    portalSubtitle: 'Sign in to access your designated role workspace and manage smart pet care.',
    badge: 'Unified Multi-Role Gateway',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    gradient: 'from-teal-600 to-slate-900',
    icon: <PawPrint className="w-5 h-5 text-teal-300" />,
    defaultEmail: 'admin@petcare.com',
    defaultPassword: 'admin123',
  },
};

export const LoginPageComponent: React.FC<{
  portalKey?: 'admin' | 'doctor' | 'staff' | 'owner' | 'universal';
}> = ({ portalKey = 'universal' }) => {
  const config = PORTAL_CONFIGS[portalKey] || PORTAL_CONFIGS.universal;
  const { login, register, user, isAuthenticated, navigate } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(config.defaultEmail);
  const [password, setPassword] = useState(config.defaultPassword);
  const [showPass, setShowPass] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password, config.expectedRole);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      if (!res.success) {
        setError(res.error || 'Failed to complete registration.');
      } else {
        setSuccess('Account registered successfully! Welcome to PetCare.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 mb-6">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2.5 mb-3 group transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <PawPrint className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-tight leading-none block">
              PetCare <span className="text-xs uppercase font-extrabold text-teal-300">Smart</span>
            </span>
            <span className="text-[11px] text-slate-400">Management System</span>
          </div>
        </button>

        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide backdrop-blur-xs shadow-xs">
          <span className={`px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
            {config.badge}
          </span>
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight mt-3">{config.portalTitle}</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
          {config.portalSubtitle}
        </p>

        {/* Role Portal Switcher */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              navigate('/login');
              setMode('login');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              portalKey === 'universal' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Universal
          </button>
          <button
            onClick={() => {
              navigate('/admin/login');
              setMode('login');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              portalKey === 'admin' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => {
              navigate('/doctor/login');
              setMode('login');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              portalKey === 'doctor' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => {
              navigate('/staff/login');
              setMode('login');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              portalKey === 'staff' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => {
              navigate('/owner/login');
              setMode('login');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              portalKey === 'owner' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          {/* Tab Switcher: Sign In vs Register */}
          <div className="flex border-b border-slate-100 pb-3 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Create New Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{success}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@petcare.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Demo format: role123</span>
                </div>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 text-xs tracking-wider uppercase mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : `Sign In to ${config.portalTitle}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTRATION FORM (Pet Owner Only) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Pet Owner Registration:</strong> Public account creation is exclusively for pet parents.
                  Staff & Doctor credentials are issued by Hospital Administration.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Jennifer Lawrence"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jennifer@example.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 345-6789"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="block w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 text-xs tracking-wider uppercase mt-3 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering Account...' : 'Register as Pet Owner'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Demo Helper Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Test Accounts:</span>
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Logins</span>
            </button>
          </div>
        </div>
      </div>

      <DemoCredentialsModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onSelect={(demEmail, demPass) => {
          setEmail(demEmail);
          setPassword(demPass);
          setMode('login');
        }}
      />
    </div>
  );
};

export const UniversalLoginPage: React.FC = () => <LoginPageComponent portalKey="universal" />;
export const AdminLoginPage: React.FC = () => <LoginPageComponent portalKey="admin" />;
export const DoctorLoginPage: React.FC = () => <LoginPageComponent portalKey="doctor" />;
export const StaffLoginPage: React.FC = () => <LoginPageComponent portalKey="staff" />;
export const OwnerLoginPage: React.FC = () => <LoginPageComponent portalKey="owner" />;
export const LoginPage = UniversalLoginPage;
