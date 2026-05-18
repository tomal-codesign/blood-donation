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
  Bell,
  User,
  ChevronDown,
  Activity,
  Package,
  FileText,
  TrendingUp,
  Shield,
  Search,
  AlertTriangle,
  Plus,
  Clock,
  Download,
  Gift,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Auth hook with role check
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          id: parsedUser.id || '',
          email: parsedUser.email || '',
          role: parsedUser.role || 'donor',
          full_name: parsedUser.full_name || 'User',
          phone: parsedUser.phone || '',
          city: parsedUser.city || '',
          blood_group: parsedUser.blood_group || 'O+',
          ...parsedUser
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return { user, loading, logout };
};

// Role-based navigation items
const getNavItems = (role: string) => {
  const roleConfig: Record<string, any> = {
    donor: {
      icon: Heart,
      gradient: 'from-red-600 to-red-500',
      badgeColor: 'bg-red-100 text-red-800',
      items: [
        { name: 'Dashboard', href: '/dashboard/donor', icon: LayoutDashboard },
        { name: 'My Donations', href: '/dashboard/donor/donations', icon: Gift },
        { name: 'Donation History', href: '/dashboard/donor/history', icon: Calendar },
        { name: 'Find Requests', href: '/dashboard/donor/requests', icon: Search },
        { name: 'Emergency Alerts', href: '/dashboard/donor/alerts', icon: Bell },
        { name: 'My Profile', href: '/dashboard/donor/profile', icon: User },
      ]
    },
    hospital: {
      icon: Hospital,
      gradient: 'from-blue-600 to-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800',
      items: [
        { name: 'Dashboard', href: '/dashboard/hospital', icon: LayoutDashboard },
        { name: 'Blood Inventory', href: '/dashboard/hospital/inventory', icon: Package },
        { name: 'Blood Requests', href: '/dashboard/hospital/requests', icon: FileText },
        { name: 'Donor List', href: '/dashboard/hospital/donors', icon: Users },
        { name: 'Analytics', href: '/dashboard/hospital/analytics', icon: TrendingUp },
        { name: 'Stock Alerts', href: '/dashboard/hospital/alerts', icon: AlertTriangle },
        { name: 'Profile', href: '/dashboard/hospital/profile', icon: User },
      ]
    },
    admin: {
      icon: Shield,
      gradient: 'from-purple-600 to-purple-500',
      badgeColor: 'bg-purple-100 text-purple-800',
      items: [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
        { name: 'Hospital Management', href: '/dashboard/admin/hospitals', icon: Hospital },
        { name: 'Blood Banks', href: '/dashboard/admin/blood-banks', icon: Droplet },
        { name: 'Blood Requests', href: '/dashboard/admin/requests', icon: FileText },
        { name: 'System Analytics', href: '/dashboard/admin/analytics', icon: Activity },
        { name: 'AI Monitoring', href: '/dashboard/admin/ai-monitor', icon: Shield },
        { name: 'Reports', href: '/dashboard/admin/reports', icon: Download },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
      ]
    },
    patient: {
      icon: User,
      gradient: 'from-green-600 to-green-500',
      badgeColor: 'bg-green-100 text-green-800',
      items: [
        { name: 'Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
        { name: 'My Requests', href: '/dashboard/patient/requests', icon: FileText },
        { name: 'New Request', href: '/dashboard/patient/new-request', icon: Plus },
        { name: 'Emergency Request', href: '/dashboard/patient/emergency', icon: AlertTriangle },
        { name: 'Request History', href: '/dashboard/patient/history', icon: Clock },
        { name: 'My Profile', href: '/dashboard/patient/profile', icon: User },
      ]
    }
  };

  return roleConfig[role] || roleConfig.donor;
};

const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') return 'U';
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Role-based access control - redirect if wrong dashboard
  useEffect(() => {
    if (user) {
      const pathRole = pathname?.split('/')[2];
      if (pathRole && pathRole !== user.role) {
        toast.error(`Access denied. You are not authorized to access ${pathRole} dashboard.`);
        router.push(`/dashboard/${user.role}`);
      }
    }
  }, [user, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleConfig = getNavItems(user.role);
  const navItems = roleConfig.items;
  const currentPage = navItems.find(item => item.href === pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 z-50 w-72 h-full bg-white shadow-lg animate-in slide-in-from-left">
            <SidebarContent
              user={user}
              navItems={navItems}
              pathname={pathname}
              roleConfig={roleConfig}
              onNavigate={() => setSidebarOpen(false)}
              getInitials={getInitials}
              logout={logout}
            />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 z-30 w-72 h-full bg-white shadow-lg hidden lg:block">
        <SidebarContent
          user={user}
          navItems={navItems}
          pathname={pathname}
          roleConfig={roleConfig}
          getInitials={getInitials}
          logout={logout}
        />
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{currentPage}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-3"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">
                    {getInitials(user.full_name)}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                    <button
                      onClick={() => {
                        router.push(`/dashboard/${user.role}/profile`);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="inline mr-2 h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push(`/dashboard/${user.role}/settings`);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="inline mr-2 h-4 w-4" />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="inline mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

// Sidebar Component
function SidebarContent({ user, navItems, pathname, roleConfig, onNavigate, getInitials, logout }: any) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <Droplet className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">BloodDonation</span>
        </Link>
      </div>

      {/* User Info */}
      <div className={`p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r ${roleConfig.gradient}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{getInitials(user.full_name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-xs text-white/80 truncate">{user.email}</p>
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 bg-white/20 text-white`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <button
                key={item.href}
                onClick={() => {
                  if (onNavigate) onNavigate();
                  router.push(item.href);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-red-600' : 'text-gray-500'}`} />
                <span className="flex-1 text-left font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}