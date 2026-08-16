// app/dashboard/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Droplet,
  Heart,
  Calendar,
  MapPin,
  Users,
  Hospital,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Activity,
  Package,
  FileText,
  TrendingUp,
  Shield,
  BarChart3,
  PlusCircle,
  AlertTriangle,
  Building2,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  ListChecks,
  Search,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Role-based access control
  useEffect(() => {
    if (user) {
      const pathRole = pathname?.split('/')[2];
      if (pathRole && !user.roles?.includes(pathRole)) {
        toast.error(`Access denied. You are not authorized to access ${pathRole} dashboard.`);
        const defaultRole = user.currentRole || user.roles?.[0] || 'donor';
        router.push(`/dashboard/${defaultRole}`);
      }
    }
  }, [user, pathname, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentRole = user.currentRole || user.roles?.[0] || 'donor';

  // ========== DONOR-PATIENT COMBINED MENU ==========
  const donorPatientNav = [
    { name: 'Dashboard', href: `/dashboard/${currentRole}`, icon: LayoutDashboard },
    { name: 'My Donations', href: '/dashboard/donor/donations', icon: Heart },
    { name: 'Donation History', href: '/dashboard/donor/history', icon: History },
    { name: 'Find Donors', href: '/dashboard/donor/find-donors', icon: Search },
    { name: 'New Request', href: '/dashboard/patient/new-request', icon: PlusCircle },
    { name: 'My Requests', href: '/dashboard/patient/requests', icon: FileText },
    { name: 'Profile', href: `/dashboard/${currentRole}/profile`, icon: User },
    { name: 'Settings', href: `/dashboard/${currentRole}/settings`, icon: Settings }
  ];

  // ========== HOSPITAL MENU ==========
  const hospitalNav = [
    { name: 'Dashboard', href: '/dashboard/hospital', icon: LayoutDashboard },
    { name: 'Blood Inventory', href: '/dashboard/hospital/inventory', icon: Package },
    { name: 'Blood Requests', href: '/dashboard/hospital/requests', icon: FileText },
    { name: 'New Request', href: '/dashboard/hospital/new-request', icon: PlusCircle },
    { name: 'Find Donors', href: '/dashboard/hospital/find-donors', icon: Search },
    { name: 'Donor List', href: '/dashboard/hospital/donors', icon: Users },
    { name: 'Analytics', href: '/dashboard/hospital/analytics', icon: TrendingUp },
    { name: 'Profile', href: '/dashboard/hospital/profile', icon: User },
    { name: 'Settings', href: '/dashboard/hospital/settings', icon: Settings }
  ];

  // ========== ADMIN MENU ==========
  const adminNav = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Hospitals', href: '/dashboard/admin/hospitals', icon: Building2 },
    // { name: 'Blood Banks', href: '/dashboard/admin/blood-banks', icon: Droplet },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: Activity },
    { name: 'AI Monitoring', href: '/dashboard/admin/ai-monitor', icon: Shield },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/admin/profile', icon: User },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings }
  ];

  // ========== MENU SELECTION BASED ON ROLE ==========
  const getNavItems = () => {
    switch (currentRole) {
      case 'donor':
      case 'patient':
        return donorPatientNav;
      case 'hospital':
        return hospitalNav;
      case 'admin':
        return adminNav;
      default:
        return donorPatientNav;
    }
  };

  const currentNav = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-white shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:shadow-sm`}
      >
        {/* Sidebar Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center">
              <img
                src="/logo-new.png"
                alt="Logo"
                className="h-9 w-auto"
              />
            </Link>
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shadow-red-200 flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {currentRole === 'donor' || currentRole === 'patient'
                  ? 'Donor / Patient'
                  : currentRole}
              </p>
              {/* {user.roles && user.roles.length > 1 && (
                <p className="text-[10px] text-gray-400 truncate">Roles: {user.roles.join(', ')}</p>
              )} */}
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable (takes remaining space) */}
        <nav className="flex-1 overflow-y-auto min-h-0 px-3 py-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="space-y-1.5">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-3">
          <button
            onClick={logout}
            className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {currentNav.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Welcome back, {user.full_name?.split(' ')[0] || 'User'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors group">
                <Bell className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shadow-red-200">
                <span className="text-white font-semibold text-xs">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}