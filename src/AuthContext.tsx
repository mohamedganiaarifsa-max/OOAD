import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from './types';
import { AuthService } from './services';
import { ShieldAlert, Home, LogOut, Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: (redirectPath?: string) => void;
  resetDemoData: () => void;
  currentPath: string;
  navigate: (path: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/login');

  useEffect(() => {
    try {
      AuthService.initUsers();
      const session = AuthService.getCurrentSession();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }

    const handlePopState = () => setCurrentPath(window.location.pathname || '/login');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const login = useCallback(
    async (email: string, pass: string, expectedRole?: UserRole) => {
      const res = await AuthService.login(email, pass, expectedRole);
      if (res.success && res.user) {
        setUser(res.user);
        navigate(`/${res.user.role}/dashboard`);
      }
      return res;
    },
    [navigate]
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await AuthService.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        navigate('/owner/dashboard');
      }
      return res;
    },
    [navigate]
  );

  const logout = useCallback(
    (redirectPath?: string) => {
      const curRole = user?.role;
      AuthService.logout();
      setUser(null);
      if (redirectPath) {
        navigate(redirectPath);
      } else if (curRole) {
        navigate(`/${curRole}/login`);
      } else {
        navigate('/login');
      }
    },
    [user, navigate]
  );

  const resetDemoData = () => {
    AuthService.resetDemoAccounts();
    setUser(AuthService.getCurrentSession());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetDemoData,
        currentPath,
        navigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const Unauthorized: React.FC<{ requiredRole?: UserRole | UserRole[] }> = ({ requiredRole }) => {
  const { user, logout, navigate } = useAuth();
  const reqStr = Array.isArray(requiredRole)
    ? requiredRole.map((r) => r.toUpperCase()).join(' or ')
    : (requiredRole || 'AUTHORIZED').toUpperCase();

  const roleTitles: Record<UserRole, string> = {
    admin: 'Administrator',
    doctor: 'Veterinary Doctor',
    staff: 'Care Staff',
    owner: 'Pet Owner',
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-rose-100 p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-1">Access Restricted</h1>
        <p className="text-xs text-slate-500 mb-4">
          Signed in as <strong>{user?.name || user?.email}</strong>
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 mb-4 text-left space-y-1">
          <div>
            Current Role:{' '}
            <span className="uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {user?.role ? roleTitles[user.role] || user.role : 'Guest'}
            </span>
          </div>
          <div>
            Required Role:{' '}
            <span className="uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {reqStr}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mb-6">
          You do not have permission to access this module. Please return to your role workspace or sign in with an authorized account.
        </p>
        <div className="space-y-2">
          {user && (
            <button
              onClick={() => navigate(`/${user.role}/dashboard`)}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <Home className="w-4 h-4" /> Go to {roleTitles[user.role] || 'My'} Dashboard
            </button>
          )}
          <button
            onClick={() => logout()}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" /> Switch Role / Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProtectedRoute: React.FC<{ children: ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading, navigate, currentPath } = useAuth();

  const target = !isAuthenticated
    ? currentPath.startsWith('/admin')
      ? '/admin/login'
      : currentPath.startsWith('/doctor')
      ? '/doctor/login'
      : currentPath.startsWith('/staff')
      ? '/staff/login'
      : currentPath.startsWith('/owner')
      ? '/owner/login'
      : '/login'
    : null;

  useEffect(() => {
    if (!isLoading && target) navigate(target);
  }, [isLoading, target, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Unauthorized requiredRole={allowedRoles} />;
  }

  return <>{children}</>;
};
