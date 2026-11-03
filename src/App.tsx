import React, { useState } from 'react';
import { AuthProvider, useAuth, ProtectedRoute } from './AuthContext';
import { Navbar, Sidebar } from './Navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { LoginPageComponent } from './pages/LoginPage';
import {
  AdminDashboard,
  DoctorDashboard,
  StaffDashboard,
  OwnerDashboard,
} from './pages/Dashboards';
import {
  PetManagement,
  BookingBoarding,
  FeedingScheduleView,
  MedicationManagement,
  VaccinationManagement,
  GroomingManagement,
  MedicalRecordsView,
  SmartCareMonitor,
  InvoicesPayments,
  ReportsAnalytics,
  UserManagement,
  NotificationsView,
} from './pages/Modules';

function renderRoute(path: string, userRole?: string | null) {
  switch (path) {
    case '/admin/dashboard':
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      );
    case '/doctor/dashboard':
      return (
        <ProtectedRoute allowedRoles={['doctor', 'admin']}>
          <DoctorDashboard />
        </ProtectedRoute>
      );
    case '/staff/dashboard':
      return (
        <ProtectedRoute allowedRoles={['staff', 'admin']}>
          <StaffDashboard />
        </ProtectedRoute>
      );
    case '/owner/dashboard':
      return (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <OwnerDashboard />
        </ProtectedRoute>
      );
    case '/pets':
      return (
        <ProtectedRoute>
          <PetManagement />
        </ProtectedRoute>
      );
    case '/boarding':
      return (
        <ProtectedRoute>
          <BookingBoarding />
        </ProtectedRoute>
      );
    case '/feeding':
      return (
        <ProtectedRoute>
          <FeedingScheduleView />
        </ProtectedRoute>
      );
    case '/medications':
      return (
        <ProtectedRoute>
          <MedicationManagement />
        </ProtectedRoute>
      );
    case '/vaccinations':
      return (
        <ProtectedRoute>
          <VaccinationManagement />
        </ProtectedRoute>
      );
    case '/grooming':
      return (
        <ProtectedRoute>
          <GroomingManagement />
        </ProtectedRoute>
      );
    case '/records':
      return (
        <ProtectedRoute allowedRoles={['admin', 'doctor', 'staff']}>
          <MedicalRecordsView />
        </ProtectedRoute>
      );
    case '/smart-monitor':
      return (
        <ProtectedRoute>
          <SmartCareMonitor />
        </ProtectedRoute>
      );
    case '/invoices':
      return (
        <ProtectedRoute>
          <InvoicesPayments />
        </ProtectedRoute>
      );
    case '/reports':
      return (
        <ProtectedRoute allowedRoles={['admin', 'doctor', 'staff']}>
          <ReportsAnalytics />
        </ProtectedRoute>
      );
    case '/users':
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          <UserManagement />
        </ProtectedRoute>
      );
    case '/notifications':
      return (
        <ProtectedRoute>
          <NotificationsView />
        </ProtectedRoute>
      );
    case '/':
    default:
      if (userRole === 'admin') {
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        );
      }
      if (userRole === 'doctor') {
        return (
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            <DoctorDashboard />
          </ProtectedRoute>
        );
      }
      if (userRole === 'staff') {
        return (
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        );
      }
      if (userRole === 'owner') {
        return (
          <ProtectedRoute allowedRoles={['owner', 'admin']}>
            <OwnerDashboard />
          </ProtectedRoute>
        );
      }
      return <LoginPageComponent portalKey="universal" />;
  }
}

function AppContent() {
  const { currentPath, user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Normalize path removing trailing slashes or query params
  const path = currentPath ? currentPath.split('?')[0].replace(/\/+$/, '') || '/' : '/login';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading PetCare System...</span>
        </div>
      </div>
    );
  }

  // Standalone Login / Portal Pages without sidebar/navbar chrome
  if (path === '/admin/login') {
    return <LoginPageComponent portalKey="admin" />;
  }
  if (path === '/doctor/login') {
    return <LoginPageComponent portalKey="doctor" />;
  }
  if (path === '/staff/login') {
    return <LoginPageComponent portalKey="staff" />;
  }
  if (path === '/owner/login') {
    return <LoginPageComponent portalKey="owner" />;
  }
  if (path === '/login' || (!isAuthenticated && path === '/')) {
    return <LoginPageComponent portalKey="universal" />;
  }

  // Authenticated workspace with Navbar, responsive Sidebar, and content
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} isSidebarOpen={sidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {renderRoute(path, user?.role)}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
