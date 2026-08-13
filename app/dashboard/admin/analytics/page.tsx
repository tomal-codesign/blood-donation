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
  BarChart3,
  PieChart,
  LineChart,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HeartPulse,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart as ReAreaChart,
} from 'recharts';

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

interface DonorType {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  blood_group: string;
  is_available: boolean;
  last_donation_date: string | null;
  total_donations: number;
  weight: number | null;
  medical_conditions: string[];
  created_at: string;
}

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donors, setDonors] = useState<DonorType[]>([]);
  const [donorSearch, setDonorSearch] = useState('');
  const [donorFilter, setDonorFilter] = useState<'all' | 'active' | 'inactive'>('all');
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
    unverifiedHospitals: 0
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

      // 4. Fetch donors with availability info (from donors table)
      const donorsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/donors`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      let donorList: DonorType[] = [];
      if (donorsRes.ok) {
        const data = await donorsRes.json();
        donorList = data.donors || [];
      }
      setDonors(donorList);

      // Calculate stats
      const hospitalsList = users.filter((u: any) => u.role === 'hospital');
      const admins = users.filter((u: any) => u.role === 'admin');
      
      // Use donorList from donors table for accurate availability
      const activeDonors = donorList.filter((d: DonorType) => d.is_available === true);
      const inactiveDonorsList = donorList.filter((d: DonorType) => d.is_available === false);
      
      const pending = requests.filter((r: any) => r.status === 'pending');
      const matched = requests.filter((r: any) => r.status === 'matched');
      const cancelled = requests.filter((r: any) => r.status === 'cancelled');
      const critical = requests.filter((r: any) => r.priority === 'critical');
      
      // Matched is the final step in this system
      const completedRequests = matched.length;
      const fulfillmentRate = requests.length > 0 
        ? Math.round((completedRequests / requests.length) * 100) 
        : 0;

      // Blood group distribution (from donors table)
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const distribution: Record<string, number> = {};
      bloodGroups.forEach(bg => distribution[bg] = 0);
      
      donorList.forEach((d: DonorType) => {
        if (distribution[d.blood_group] !== undefined) {
          distribution[d.blood_group] += 1;
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
        
        const monthNewDonors = users.filter((u: any) => 
          u.role === 'donor' && u.created_at >= monthStart && u.created_at <= monthEnd
        ).length;
        
        monthlyRequests.push(monthRequests);
        monthlyDonors.push(monthNewDonors);
      }

      setData({
        totalUsers: users.length,
        totalDonors: donorList.length,
        totalHospitals: hospitalsList.length,
        totalAdmins: admins.length,
        activeDonors: activeDonors.length,
        inactiveDonors: inactiveDonorsList.length,
        totalRequests: requests.length,
        pendingRequests: pending.length,
        matchedRequests: matched.length,
        cancelledRequests: cancelled.length,
        criticalRequests: critical.length,
        fulfillmentRate,
        totalDonations: matched.length,
        totalUnitsDonated: matched.reduce((sum: number, r: any) => sum + (r.units_needed || 1), 0),
        livesSaved: matched.length * 3,
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

  // Build monthly trend data for charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrendData = data.monthlyRequests.map((count, index) => {
    const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12;
    return {
      month: months[monthIndex],
      requests: count,
      donors: data.monthlyDonors[index] || 0,
    };
  });

  // Filter donors for the donor management section
  const filteredDonors = donors.filter(d => {
    const matchesSearch = !donorSearch || 
      d.full_name?.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.phone?.includes(donorSearch) ||
      d.blood_group?.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.division?.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.district?.toLowerCase().includes(donorSearch.toLowerCase());
    
    const matchesFilter = 
      donorFilter === 'all' ||
      (donorFilter === 'active' && d.is_available) ||
      (donorFilter === 'inactive' && !d.is_available);
    
    return matchesSearch && matchesFilter;
  });

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

  const donationRate = data.totalRequests > 0 ? Math.round((data.matchedRequests / data.totalRequests) * 100) : 0;
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
              {data.fulfillmentRate}% match rate
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Match Rate"
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
              <StatRow label="Available Donors" value={data.activeDonors} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Unavailable Donors" value={data.inactiveDonors} icon={<XCircle className="h-4 w-4 text-red-500" />} />
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
              <StatRow label="Matched (Final)" value={data.matchedRequests} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Cancelled" value={data.cancelledRequests} icon={<XCircle className="h-4 w-4 text-red-500" />} />
              <StatRow label="Critical" value={data.criticalRequests} icon={<AlertTriangle className="h-4 w-4 text-red-600" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donor Management Section */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <UserCheck className="h-4.5 w-4.5 text-white" />
            </div>
            Donor Management
          </CardTitle>
          <CardDescription>
            View all donors and their availability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Donor Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.totalDonors}</p>
                <p className="text-xs text-gray-500 font-medium">Total Donors</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{data.activeDonors}</p>
                <p className="text-xs text-gray-500 font-medium">Available Donors</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-500">{data.inactiveDonors}</p>
                <p className="text-xs text-gray-500 font-medium">Unavailable Donors</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <XCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          {/* Donor Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, blood group, division or district..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 bg-white"
                value={donorSearch}
                onChange={(e) => setDonorSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 bg-white"
                value={donorFilter}
                onChange={(e) => setDonorFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Donors</option>
                <option value="active">Available Donors</option>
                <option value="inactive">Unavailable Donors</option>
              </select>
            </div>
          </div>

          {/* Donor List */}
          {filteredDonors.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3">
                <Users className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No donors found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDonors.map((donor) => (
                <div key={donor.id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 ${
                      donor.is_available 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/20'
                    }`}>
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{donor.full_name}</p>
                        <Badge className={`border ${getGroupColor(donor.blood_group)} text-white border-transparent`}>
                          {donor.blood_group}
                        </Badge>
                        {donor.is_available ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                            Available
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {donor.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {donor.district || donor.division || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplet className="h-3 w-3 text-gray-400" />
                          {donor.total_donations} donations
                        </span>
                        {donor.last_donation_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            Last: {new Date(donor.last_donation_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ReAreaChart data={monthlyTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="donorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconSize={10}
                  iconType="circle"
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  name="Requests" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="url(#requestsGradient)"
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="donors" 
                  name="New Donors" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#donorsGradient)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </ReAreaChart>
            </ResponsiveContainer>
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
            <CardDescription>Donor count by blood group</CardDescription>
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
