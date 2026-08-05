// app/dashboard/hospital/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Hospital,
  Droplet,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw,
  Sparkles,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
  ShieldCheck,
  HeartPulse,
  ChevronRight,
  Bell,
  FileText,
  Search,
  Database,
  UserRound,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface InventoryItem {
  blood_group: string;
  units_available: number;
}

interface Request {
  id: string;
  blood_group: string;
  units_needed: number;
  patient_name: string;
  status: string;
  created_at: string;
  priority: string;
  hospital_name?: string;
  patient_condition?: string;
  contact_phone?: string;
  profiles?: {
    full_name: string;
    phone: string;
    division: string;
    district: string;
  };
}

// Priority styling config
const priorityConfig: Record<string, { label: string; badge: string; border: string; icon: any }> = {
  critical: {
    label: 'CRITICAL',
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-l-red-500',
    icon: Flame,
  },
  moderate: {
    label: 'MODERATE',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    border: 'border-l-orange-400',
    icon: Activity,
  },
  normal: {
    label: 'NORMAL',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-l-blue-400',
    icon: Clock,
  },
};

export default function HospitalDashboard() {
  const { user, token } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const inventoryRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${user?.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setInventory(data.inventory || []);
      }

      const requestsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const totalUnits = inventory.reduce((sum, item) => sum + item.units_available, 0);
  const criticalStock = inventory.filter(item => item.units_available < 10).length;
  const lowStock = inventory.filter(item => item.units_available >= 10 && item.units_available < 20).length;
  const goodStock = inventory.filter(item => item.units_available >= 20).length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const matchedRequests = requests.filter(r => r.status === 'matched').length;
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;
  const criticalRequests = requests.filter(r => r.priority === 'critical' && r.status === 'pending').length;
  const fulfillmentRate = requests.length > 0 ? Math.round((fulfilledRequests / requests.length) * 100) : 0;

  // Sort requests - critical first
  const sortedRequests = [...requests].sort((a, b) => {
    const priorityOrder: Record<string, number> = { critical: 0, moderate: 1, normal: 2 };
    return (priorityOrder[a.priority?.toLowerCase()] ?? 2) - (priorityOrder[b.priority?.toLowerCase()] ?? 2);
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority?.toLowerCase()] || priorityConfig.normal;
  };

  const getPriorityBadge = (priority: string) => {
    const config = getPriorityConfig(priority);
    const Icon = config.icon;
    return (
      <Badge className={`border ${config.badge} font-semibold gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStockStatus = (units: number) => {
    if (units >= 20) return { label: 'Good', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 };
    if (units >= 10) return { label: 'Low', color: 'text-amber-600 bg-amber-50', icon: AlertCircle };
    return { label: 'Critical', color: 'text-red-600 bg-red-50', icon: XCircle };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Hospital className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading your hospital dashboard...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 sm:p-8 shadow-xl shadow-blue-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>
        <div className="absolute bottom-6 right-40 w-8 h-8 bg-white/10 rounded-lg rotate-45"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Hospital Admin Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Hospital'}!
            </h1>
            <p className="text-blue-50 mt-1.5 text-sm sm:text-base max-w-md">
              Manage your blood bank inventory and requests efficiently. Every unit counts!
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-none">
                <Building2 className="h-3 w-3 mr-1" />
                Verified Hospital
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <Activity className="h-3 w-3 mr-1" />
                {totalUnits} Units in Stock
              </Badge>
              {criticalRequests > 0 && (
                <Badge className="bg-red-500/30 text-red-100 border-none animate-pulse">
                  <Flame className="h-3 w-3 mr-1" />
                  {criticalRequests} Critical Request{criticalRequests > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Units */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalUnits}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">across all blood groups</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Droplet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        </Card>

        {/* Pending Requests */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{pendingRequests}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">awaiting response</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
        </Card>

        {/* Fulfilled */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Fulfilled</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{fulfilledRequests}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">successfully completed</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>

        {/* Fulfillment Rate */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Fulfillment Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-0.5">{fulfillmentRate}%</p>
                <p className="text-[11px] text-gray-400 mt-0.5">overall success</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-400"></div>
        </Card>
      </div>

      {/* Inventory Status Card */}
      <Card className={`overflow-hidden transition-all border-0 shadow-sm ${criticalStock > 0 ? 'bg-gradient-to-r from-red-50 to-orange-50/50' : 'bg-gradient-to-r from-emerald-50 to-teal-50/50'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${criticalStock > 0 ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/25' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'}`}>
                {criticalStock > 0 ? (
                  <AlertCircle className="h-6 w-6 text-white" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {criticalStock > 0 ? `${criticalStock} Blood Group${criticalStock > 1 ? 's' : ''} at Critical Level` : 'Blood Inventory Healthy'}
                </p>
                <p className="text-sm text-gray-500">
                  {criticalStock > 0
                    ? 'Some blood groups need immediate attention. Consider running a donation drive.'
                    : 'All blood groups have sufficient stock levels. Great job!'}
                </p>
              </div>
            </div>
            <Link href="/dashboard/hospital/inventory">
              <Button className={`h-11 rounded-xl font-semibold ${criticalStock > 0 ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 shadow-lg shadow-red-500/25' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-lg shadow-emerald-500/25'}`}>
                <Database className="h-4 w-4 mr-2" />
                Manage Inventory
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction
          href="/dashboard/hospital/inventory"
          icon={<Droplet className="h-6 w-6 text-blue-500" />}
          label="Inventory"
          subLabel="Manage stock"
          color="blue"
        />
        <QuickAction
          href="/dashboard/hospital/requests"
          icon={<FileText className="h-6 w-6 text-amber-500" />}
          label="Requests"
          subLabel="View & manage"
          color="amber"
        />
        <QuickAction
          href="/dashboard/hospital/donors"
          icon={<Users className="h-6 w-6 text-emerald-500" />}
          label="Donors"
          subLabel="View donors"
          color="emerald"
        />
        <QuickAction
          href="/dashboard/hospital/find-donors"
          icon={<Search className="h-6 w-6 text-purple-500" />}
          label="Find Donors"
          subLabel="Search nearby"
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Overview */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Droplet className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Inventory Overview</h3>
              </div>
              <Link href="/dashboard/hospital/inventory">
                <Button variant="ghost" size="sm" className="text-blue-600 gap-1 hover:bg-blue-50">
                  View All
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-10">
                <div className="relative mx-auto w-16 h-16 mb-3">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center border border-blue-100">
                    <Droplet className="h-8 w-8 text-blue-300" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm">No inventory items yet</p>
                <p className="text-xs text-gray-400 mt-1">Add blood stock to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {inventory.map((item) => {
                  const status = getStockStatus(item.units_available);
                  const StatusIcon = status.icon;
                  return (
                    <div key={item.blood_group} className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-gray-900">{item.blood_group}</p>
                        <StatusIcon className={`h-3.5 w-3.5 ${status.color.split(' ')[0]}`} />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{item.units_available}</p>
                      <p className="text-[10px] text-gray-400">units available</p>
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.units_available >= 20
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              : item.units_available >= 10
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                : 'bg-gradient-to-r from-red-400 to-rose-500'
                          }`}
                          style={{ width: `${Math.min((item.units_available / 30) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Recent Requests</h3>
              </div>
              <Link href="/dashboard/hospital/requests">
                <Button variant="ghost" size="sm" className="text-blue-600 gap-1 hover:bg-blue-50">
                  View All
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-10">
                <div className="relative mx-auto w-16 h-16 mb-3">
                  <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center border border-amber-100">
                    <FileText className="h-8 w-8 text-amber-300" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm">No requests yet</p>
                <p className="text-xs text-gray-400 mt-1">Blood requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedRequests.slice(0, 4).map((request) => {
                  const priority = getPriorityConfig(request.priority);
                  const PriorityIcon = priority.icon;
                  return (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between p-3 rounded-xl border-l-4 ${priority.border} bg-gray-50 hover:bg-gray-100/70 transition-colors group`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                          request.priority?.toLowerCase() === 'critical'
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                            : request.priority?.toLowerCase() === 'moderate'
                              ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-500/20'
                              : 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-500/20'
                        }`}>
                          <Droplet className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              Blood {request.blood_group}
                            </p>
                            <PriorityIcon className={`h-3 w-3 ${priority.badge.split(' ')[1]}`} />
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <UserRound className="h-3 w-3 flex-shrink-0" />
                            {request.profiles?.full_name || request.patient_name || 'Patient'}
                            <span className="text-gray-300">•</span>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {formatTime(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600">{request.units_needed} unit{request.units_needed > 1 ? 's' : ''}</span>
                        <Badge className={
                          request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            request.status === 'matched' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              request.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                'bg-gray-100 text-gray-600 border-gray-200'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impact Message */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-transparent shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your Impact Matters</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Your hospital has fulfilled <span className="font-bold text-blue-600">{fulfilledRequests}</span> blood request{fulfilledRequests !== 1 ? 's' : ''},
                helping save <span className="font-bold text-blue-600">{fulfilledRequests * 3}</span> lives through your blood bank.
                Thank you for being a lifeline! 🏥
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function QuickAction({ href, icon, label, subLabel, color }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 hover:bg-blue-200',
    amber: 'bg-amber-100 hover:bg-amber-200',
    emerald: 'bg-emerald-100 hover:bg-emerald-200',
    purple: 'bg-purple-100 hover:bg-purple-200'
  };

  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative">
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
      </div>
    </Link>
  );
}