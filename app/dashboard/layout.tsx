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
    { name: 'My Requests', href: '/dashboard/patient/requests', icon: FileText },
    { name: 'New Request', href: '/dashboard/patient/new-request', icon: PlusCircle },
    { name: 'Find Requests', href: '/dashboard/donor/requests', icon: Search },
    { name: 'Emergency Alerts', href: '/dashboard/donor/alerts', icon: AlertTriangle },
    { name: 'Emergency Request', href: '/dashboard/patient/emergency', icon: Bell },
    { name: 'Request Status', href: '/dashboard/patient/status', icon: ListChecks },
    { name: 'Profile', href: `/dashboard/${currentRole}/profile`, icon: User },
    { name: 'Settings', href: `/dashboard/${currentRole}/settings`, icon: Settings }
  ];

  // ========== HOSPITAL MENU ==========
  const hospitalNav = [
    { name: 'Dashboard', href: '/dashboard/hospital', icon: LayoutDashboard },
    { name: 'Blood Inventory', href: '/dashboard/hospital/inventory', icon: Package },
    { name: 'Stock Alerts', href: '/dashboard/hospital/alerts', icon: AlertTriangle },
    { name: 'Add Stock', href: '/dashboard/hospital/add-stock', icon: PlusCircle },
    { name: 'Blood Requests', href: '/dashboard/hospital/requests', icon: FileText },
    { name: 'Pending Requests', href: '/dashboard/hospital/pending', icon: Clock },
    { name: 'Approved Requests', href: '/dashboard/hospital/approved', icon: CheckCircle },
    { name: 'Rejected Requests', href: '/dashboard/hospital/rejected', icon: XCircle },
    { name: 'Donor List', href: '/dashboard/hospital/donors', icon: Users },
    { name: 'Find Donors', href: '/dashboard/hospital/find-donors', icon: Search },
    { name: 'Analytics', href: '/dashboard/hospital/analytics', icon: TrendingUp },
    { name: 'Profile', href: '/dashboard/hospital/profile', icon: User },
    { name: 'Settings', href: '/dashboard/hospital/settings', icon: Settings }
  ];

  // ========== ADMIN MENU ==========
  const adminNav = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Hospitals', href: '/dashboard/admin/hospitals', icon: Building2 },
    { name: 'Blood Banks', href: '/dashboard/admin/blood-banks', icon: Droplet },
    { name: 'Blood Requests', href: '/dashboard/admin/requests', icon: FileText },
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
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-30 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Droplet className="h-8 w-8 text-red-600" />
            <span className="font-bold text-xl">BloodDonation</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <User className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {currentRole === 'donor' || currentRole === 'patient'
                  ? 'Donor / Patient'
                  : currentRole}
              </p>
              {user.roles && user.roles.length > 1 && (
                <p className="text-xs text-gray-400">Roles: {user.roles.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4">
          {currentNav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${pathname === item.href
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="border-t my-4"></div>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 mt-1"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="text-xl font-semibold">
              {currentNav.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}