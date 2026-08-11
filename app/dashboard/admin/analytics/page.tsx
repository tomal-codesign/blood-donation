// app/dashboard/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Users, 
  Droplet, 
  Hospital, 
  Loader2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Clock,
  Activity,
  UserCheck,
  Heart,
  Sparkles,
  Building2,
  Shield,
  UserPlus,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalUsers: number;
  totalDonors: number;
  totalHospitals: number;
  totalAdmins: number;
  activeDonors: number;
  inactiveDonors: number;
  totalRequests: number;
  pendingRequests: number;
  matchedRequests: number;
  fulfilledRequests: number;
  cancelledRequests: number;
  criticalRequests: number;
  fulfillmentRate: number;
  totalDonations: number;
  totalUnitsDonated: number;
  livesSaved: number;
  monthlyRequests: number[];
  monthlyDonors: number[];
  bloodGroupDistribution: Record<string, number>;
  verifiedHospitals: number;
  unverifiedHospitals: number;
}

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalDonors: 0,
    totalHospitals: 0,
    totalAdmins: 0,
    activeDonors: 0,
    inactiveDonors: 0,
    totalRequests: 0,
    pendingRequests: 0,
    matchedRequests: 0,
    fulfilledRequests: 0,
    cancelledRequests: 0,
    criticalRequests: 0,
    fulfillmentRate: 0,
    totalDonations: 0,
    totalUnitsDonated: 0,
    livesSaved: 0,
    monthlyRequests: [],
    monthlyDonors: [],
    bloodGroupDistribution: {},
    verifiedHospitals: 0,
    unverifiedHospitals: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch users
      const usersRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      let users: any[] = [];
      if (usersRes.ok) {
        const data = await usersRes.json();
        users = data.users || [];
      }

      // 2. Fetch requests
      const requestsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      let requests: any[] = [];
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        requests = data.data || data.requests || [];
      }

      // 3. Fetch hospitals
      const hospitalsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      let hospitals: any[] = [];
      if (hospitalsRes.ok) {
        const data = await hospitalsRes.json();
        hospitals = data.hospitals || [];
      }

      // 4. Fetch inventory for blood distribution
      let allInventory: any[] = [];
      for (const hospital of hospitals) {
        const inventoryRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${hospital.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (inventoryRes.ok) {
          const data = await inventoryRes.json();
          const inventory = data.inventory || [];
          allInventory = [...allInventory, ...inventory];
        }
      }

      // Calculate stats
      const donors = users.filter((u: any) => u.role === 'donor');
      const hospitalsList = users.filter((u: any) => u.role === 'hospital');
      const admins = users.filter((u: any) => u.role === 'admin');
      const activeDonors = donors.filter((d: any) => d.is_available === true);
      const inactiveDonors = donors.filter((d: any) => d.is_available === false);
      
      const pending = requests.filter((r: any) => r.status === 'pending');
      const matched = requests.filter((r: any) => r.status === 'matched');
      const fulfilled = requests.filter((r: any) => r.status === 'fulfilled');
      const cancelled = requests.filter((r: any) => r.status === 'cancelled');
      const critical = requests.filter((r: any) => r.priority === 'critical');
      
      const fulfillmentRate = requests.length > 0 
        ? Math.round((fulfilled.length / requests.length) * 100) 
        : 0;

      // Blood group distribution
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const distribution: Record<string, number> = {};
      bloodGroups.forEach(bg => distribution[bg] = 0);
      
      allInventory.forEach((item: any) => {
        if (distribution[item.blood_group] !== undefined) {
          distribution[item.blood_group] += item.units_available || 0;
        }
      });

      // Monthly trends (last 6 months)
      const monthlyRequests = [];
      const monthlyDonors = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = date.toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
        
        const monthRequests = requests.filter((r: any) => 
          r.created_at >= monthStart && r.created_at <= monthEnd
        ).length;
        
        const monthNewDonors = donors.filter((d: any) => 
          d.created_at >= monthStart && d.created_at <= monthEnd
        ).length;
        
        monthlyRequests.push(monthRequests);
        monthlyDonors.push(monthNewDonors);
      }

      setData({
        totalUsers: users.length,
        totalDonors: donors.length,
        totalHospitals: hospitalsList.length,
        totalAdmins: admins.length,
        activeDonors: activeDonors.length,
        inactiveDonors: inactiveDonors.length,
        totalRequests: requests.length,
        pendingRequests: pending.length,
        matchedRequests: matched.length,
        fulfilledRequests: fulfilled.length,
        cancelledRequests: cancelled.length,
        criticalRequests: critical.length,
        fulfillmentRate,
        totalDonations: fulfilled.length,
        totalUnitsDonated: fulfilled.reduce((sum: number, r: any) => sum + (r.units_needed || 1), 0),
        livesSaved: fulfilled.length * 3,
        monthlyRequests,
        monthlyDonors,
        bloodGroupDistribution: distribution,
        verifiedHospitals: hospitals.filter((h: any) => h.verified).length,
        unverifiedHospitals: hospitals.filter((h: any) => !h.verified).length
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const getGroupColor = (group: string): string => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-500',
      'A-': 'bg-red-400',
      'B+': 'bg-blue-500',
      'B-': 'bg-blue-400',
      'AB+': 'bg-purple-500',
      'AB-': 'bg-purple-400',
      'O+': 'bg-green-500',
      'O-': 'bg-green-400'
    };
    return colors[group] || 'bg-gray-500';
  };

  const getMaxValue = (obj: Record<string, number>): number => {
    const values = Object.values(obj);
    return values.length > 0 ? Math.max(...values) : 1;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <BarChart3 className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading analytics...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  const donationRate = data.totalRequests > 0 ? Math.round((data.fulfilledRequests / data.totalRequests) * 100) : 0;
  const verificationRate = data.totalHospitals > 0 ? Math.round((data.verifiedHospitals / data.totalHospitals) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-purple-900/20 border border-white/10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-8 right-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full"></div>
        <div className="absolute bottom-12 right-1/2 w-2 h-2 bg-indigo-300/30 rounded-full"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              System Analytics
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
              Complete system performance metrics and insights at a glance.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Users className="h-3 w-3 mr-1.5" />
                {data.totalUsers} Users
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Droplet className="h-3 w-3 mr-1.5" />
                {data.totalRequests} Requests
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Building2 className="h-3 w-3 mr-1.5" />
                {data.totalHospitals} Hospitals
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <HeartPulse className="h-3 w-3 mr-1.5" />
                {data.livesSaved} Lives Saved
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-purple-300/70 font-semibold">Last Updated</p>
                <p className="text-sm text-white font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {data.fulfillmentRate}% fulfillment rate
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Fulfillment Rate"
          value={`${data.fulfillmentRate}%`}
          icon={<Target className="h-5 w-5 text-white" />}
          trend={data.fulfillmentRate > 70 ? 'up' : 'down'}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
          accent="bg-gradient-to-r from-emerald-500 to-teal-400"
          to="from-white to-emerald-50/50"
        />
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          icon={<Users className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
          accent="bg-gradient-to-r from-blue-500 to-indigo-400"
          to="from-white to-blue-50/50"
        />
        <MetricCard
          title="Lives Saved"
          value={data.livesSaved}
          icon={<Heart className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
          accent="bg-gradient-to-r from-red-500 to-rose-400"
          to="from-white to-red-50/50"
        />
        <MetricCard
          title="Donation Rate"
          value={`${donationRate}%`}
          icon={<Activity className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25"
          accent="bg-gradient-to-r from-purple-500 to-violet-400"
          to="from-white to-purple-50/50"
        />
      </div>

      {/* User & Request Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Users className="h-4.5 w-4.5 text-white" />
              </div>
              User Statistics
            </CardTitle>
            <CardDescription>Overview of all user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <StatRow label="Total Users" value={data.totalUsers} icon={<Users className="h-4 w-4 text-blue-500" />} />
              <StatRow label="Donors" value={data.totalDonors} icon={<Droplet className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Hospitals" value={data.totalHospitals} icon={<Hospital className="h-4 w-4 text-indigo-500" />} />
              <StatRow label="Admins" value={data.totalAdmins} icon={<Shield className="h-4 w-4 text-purple-500" />} />
              <StatRow label="Active Donors" value={data.activeDonors} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Inactive Donors" value={data.inactiveDonors} icon={<XCircle className="h-4 w-4 text-red-500" />} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
                <Droplet className="h-4.5 w-4.5 text-white" />
              </div>
              Request Statistics
            </CardTitle>
            <CardDescription>Blood request status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <StatRow label="Total Requests" value={data.totalRequests} icon={<Droplet className="h-4 w-4 text-red-500" />} />
              <StatRow label="Pending" value={data.pendingRequests} icon={<Clock className="h-4 w-4 text-yellow-500" />} />
              <StatRow label="Matched" value={data.matchedRequests} icon={<UserCheck className="h-4 w-4 text-blue-500" />} />
              <StatRow label="Fulfilled" value={data.fulfilledRequests} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Cancelled" value={data.cancelledRequests} icon={<XCircle className="h-4 w-4 text-red-500" />} />
              <StatRow label="Critical" value={data.criticalRequests} icon={<AlertTriangle className="h-4 w-4 text-red-600" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <LineChart className="h-4.5 w-4.5 text-white" />
            </div>
            Monthly Trends
          </CardTitle>
          <CardDescription>Last 6 months performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Droplet className="h-4 w-4 text-blue-500" />
                Requests per Month
              </h4>
              <div className="flex items-end gap-2 h-32">
                {data.monthlyRequests.map((count, index) => {
                  const max = Math.max(...data.monthlyRequests, 1);
                  const height = (count / max) * 100;
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="w-full bg-blue-100 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t transition-all duration-500 group-hover:from-blue-600 group-hover:to-indigo-500"
                          style={{ height: `${height}%` }}
                        >
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                            {count}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{months[monthIndex]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-500" />
                New Donors per Month
              </h4>
              <div className="flex items-end gap-2 h-32">
                {data.monthlyDonors.map((count, index) => {
                  const max = Math.max(...data.monthlyDonors, 1);
                  const height = (count / max) * 100;
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="w-full bg-emerald-100 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all duration-500 group-hover:from-emerald-600 group-hover:to-teal-500"
                          style={{ height: `${height}%` }}
                        >
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                            {count}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{months[monthIndex]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blood Group Distribution & Hospital Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
                <PieChart className="h-4.5 w-4.5 text-white" />
              </div>
              Blood Group Distribution
            </CardTitle>
            <CardDescription>Available units by blood group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.bloodGroupDistribution).map(([group, units]) => (
                <div key={group} className="flex items-center gap-3 group">
                  <span className="w-12 font-bold text-sm text-gray-900">{group}</span>
                  <div className="flex-1 bg-gray-200/70 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getGroupColor(group)} transition-all duration-500`}
                      style={{ width: `${Math.min((units / getMaxValue(data.bloodGroupDistribution)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right text-gray-900">{units}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              Hospital Status
            </CardTitle>
            <CardDescription>Verification overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <StatRow label="Total Hospitals" value={data.totalHospitals} icon={<Hospital className="h-4 w-4 text-blue-500" />} />
              <StatRow label="Verified" value={data.verifiedHospitals} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Unverified" value={data.unverifiedHospitals} icon={<XCircle className="h-4 w-4 text-amber-500" />} />
              <StatRow label="Verification Rate" value={`${verificationRate}%`} icon={<TrendingUp className="h-4 w-4 text-purple-500" />} />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Verification Progress</span>
                <span className="text-xs font-semibold text-emerald-600">{verificationRate}%</span>
              </div>
              <div className="h-2 bg-gray-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${verificationRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  iconBg: string;
  accent: string;
  to: string;
}

function MetricCard({ title, value, icon, trend, iconBg, accent, to }: MetricCardProps) {
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${to} hover:-translate-y-0.5`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend === 'up' ? 'Improving' : 'Needs attention'}
            </span>
          </div>
        )}
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`}></div>
    </Card>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatRow({ label, value, icon }: StatRowProps) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
