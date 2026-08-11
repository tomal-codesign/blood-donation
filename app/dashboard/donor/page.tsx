// app/dashboard/donor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { donorAPI, default as api } from '@/lib/api';
import {
  Droplet,
  Heart,
  Calendar,
  Bell,
  Award,
  Clock,
  TrendingUp,
  Shield,
  Activity,
  Gift,
  ChevronRight,
  Loader2,
  Sparkles,
  HeartPulse,
  CheckCircle2,
  XCircle,
  Building2,
  History,
  Search,
  FileText,
  Plus,
  AlertTriangle,
  Users,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface DashboardStats {
  totalDonations: number;
  lastDonation: string;
  available: boolean;
  impact: number;
  nextEligible: string;
}

interface RecentRequest {
  id: number;
  blood_group: string;
  hospital: string;
  division?: string;
  district?: string;
  priority: string;
}

export default function DonorDashboard() {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'donor' | 'patient'>('donor');
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    lastDonation: 'Never',
    available: true,
    impact: 0,
    nextEligible: 'Ready now'
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch donor stats from real API
      const statsResponse = await donorAPI.getStats(user?.id || '');
      if (statsResponse.data.success) {
        const data = statsResponse.data.stats;
        setStats({
          totalDonations: data.totalDonations || 0,
          lastDonation: data.lastDonation || 'Never',
          available: data.isAvailable !== undefined ? data.isAvailable : true,
          impact: data.livesSaved || 0,
          nextEligible: data.nextEligible || 'Ready now'
        });
      }

      // Fetch recent blood requests
      const requestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests?limit=3`
      );
      if (requestsResponse.ok) {
        const data = await requestsResponse.json();
        setRecentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback to mock data
      setStats({
        totalDonations: 5,
        lastDonation: '2024-05-15',
        available: true,
        impact: 15,
        nextEligible: 'Ready now'
      });
      setRecentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const response = await donorAPI.toggleAvailability({
        user_id: user?.id,
        is_available: !stats.available
      });

      if (response.data.success) {
        setStats({ ...stats, available: !stats.available });
        updateUser({ is_available: !stats.available });
        toast.success(`You are now ${!stats.available ? 'available' : 'unavailable'} for donation`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Droplet className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading your dashboard...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  // Ensure impact is a number before toString
  const impactValue = stats?.impact ?? 0;
  const totalDonations = stats?.totalDonations ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tab Switcher */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('donor')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'donor'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="h-4 w-4" />
          Donor Dashboard
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'patient'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="h-4 w-4" />
          Patient Dashboard
        </button>
      </div>

      {activeTab === 'donor' ? (
        <DonorDashboardView
          user={user}
          stats={stats}
          totalDonations={totalDonations}
          impactValue={impactValue}
          recentRequests={recentRequests}
          toggling={toggling}
          toggleAvailability={toggleAvailability}
        />
      ) : (
        <PatientDashboardView user={user} />
      )}
    </div>
  );
}

// ==================== DONOR DASHBOARD VIEW ====================
function DonorDashboardView({
  user,
  stats,
  totalDonations,
  impactValue,
  recentRequests,
  toggling,
  toggleAvailability,
}: {
  user: any;
  stats: DashboardStats;
  totalDonations: number;
  impactValue: number;
  recentRequests: RecentRequest[];
  toggling: boolean;
  toggleAvailability: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-6 sm:p-8 shadow-xl shadow-red-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Hero Donor Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Donor'}!
            </h1>
            <p className="text-red-50 mt-1.5 text-sm sm:text-base max-w-md">
              Your next donation can save up to 3 lives. Keep up the amazing work!
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-none">
                <Activity className="h-3 w-3 mr-1" />
                Active Donor
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <TrendingUp className="h-3 w-3 mr-1" />
                {totalDonations} Donations
              </Badge>
              {stats.nextEligible !== 'Ready now' && (
                <Badge className="bg-yellow-500/30 text-yellow-100 border-none">
                  <Clock className="h-3 w-3 mr-1" />
                  Eligible: {stats.nextEligible}
                </Badge>
              )}
            </div>
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-3">
            <div className={`text-center px-5 py-3 rounded-2xl backdrop-blur-sm border ${stats.available ? 'bg-emerald-500/20 border-emerald-300/30' : 'bg-gray-500/20 border-gray-300/30'}`}>
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center shadow-lg mb-1.5 ${stats.available ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-gray-500 shadow-gray-500/30'}`}>
                {stats.available ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <XCircle className="h-5 w-5 text-white" />
                )}
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${stats.available ? 'text-emerald-100' : 'text-gray-200'}`}>
                {stats.available ? 'Available' : 'Unavailable'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Blood Group */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Blood Group</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{user?.blood_group || 'N/A'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">your type</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                <Droplet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
        </Card>

        {/* Total Donations */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalDonations}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">lifetime count</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>

        {/* Last Donation */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Last Donation</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {stats.lastDonation === 'Never' ? 'Never' : stats.lastDonation}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">most recent</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400"></div>
        </Card>

        {/* Lives Saved */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Lives Saved</p>
                <p className="text-2xl font-bold text-purple-600 mt-0.5">{impactValue}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">your impact</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-400"></div>
        </Card>
      </div>

      {/* Availability Status Card */}
      <Card className={`overflow-hidden transition-all border-0 shadow-sm ${stats.available ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50' : 'bg-gradient-to-r from-gray-50 to-gray-100/50'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${stats.available ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25' : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/25'}`}>
                {stats.available ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <Clock className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {stats.available ? 'Available for Donation' : 'Currently Unavailable'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.available
                    ? 'You will receive donation requests from nearby hospitals'
                    : 'You will not receive any donation requests'}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`h-11 rounded-xl font-semibold ${stats.available ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-lg shadow-emerald-500/25' : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 shadow-lg shadow-gray-500/25'}`}
            >
              {toggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : stats.available ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Set Unavailable
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Set Available
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction
          href="/dashboard/donor/donations"
          icon={<Gift className="h-6 w-6 text-red-500" />}
          label="My Donations"
          subLabel="View scheduled"
          color="red"
        />
        <QuickAction
          href="/dashboard/donor/history"
          icon={<History className="h-6 w-6 text-blue-500" />}
          label="History"
          subLabel="Past donations"
          color="blue"
        />
        <QuickAction
          href="/dashboard/donor/find-donors"
          icon={<Search className="h-6 w-6 text-purple-500" />}
          label="Find Donors"
          subLabel="Search nearby"
          color="purple"
        />
      </div>

      {/* Recent Emergency Requests */}
      {recentRequests.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Emergency Requests Near You</h3>
              </div>
              <Link href="/dashboard/donor/alerts">
                <Button variant="ghost" size="sm" className="text-red-600 gap-1 hover:bg-red-50">
                  View All
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20">
                      <Droplet className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Blood {request.blood_group}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {request.hospital}
                      </p>
                    </div>
                  </div>
                  <Badge className={request.priority === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'}>
                    {request.priority === 'critical' ? '🚨 URGENT' : request.priority.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Message */}
      <Card className="border-0 bg-gradient-to-br from-red-50 via-orange-50/50 to-transparent shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 animate-pulse">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your Impact Matters</p>
              <p className="text-sm text-gray-600 mt-0.5">
                You've helped save <span className="font-bold text-red-600">{impactValue}</span> lives through your{' '}
                <span className="font-bold text-red-600">{totalDonations}</span> donation(s).
                Thank you for being a hero! 🦸
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== PATIENT DASHBOARD VIEW ====================
interface PatientRequest {
  id: string;
  blood_group: string;
  units_needed: number;
  priority: 'critical' | 'moderate' | 'normal';
  status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
  hospital_name: string;
  division?: string;
  district?: string;
  patient_condition?: string;
  created_at: string;
}

function PatientDashboardView({ user }: { user: any }) {
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPatientRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/requests/my-requests');

      if (response.data.success) {
        setRequests(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load requests');
        setRequests([]);
      }
    } catch (error: any) {
      console.error('Fetch patient requests error:', error);
      toast.error(error.response?.data?.message || 'Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats from real data
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled' || r.status === 'matched').length;
  const cancelledCount = requests.filter(r => r.status === 'cancelled').length;
  const criticalCount = requests.filter(r => r.priority === 'critical').length;

  // Sort: critical first, then pending, then by date
  const sortedRequests = [...requests].sort((a, b) => {
    const priorityOrder: Record<string, number> = { critical: 0, moderate: 1, normal: 2 };
    const statusOrder: Record<string, number> = { pending: 0, matched: 1, fulfilled: 2, cancelled: 3 };
    const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    if (pDiff !== 0) return pDiff;
    const sDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (sDiff !== 0) return sDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const recentRequests = sortedRequests.slice(0, 3);

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-green-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-green-500/30">
            <HeartPulse className="h-7 w-7 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading patient dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 p-6 sm:p-8 shadow-xl shadow-green-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <HeartPulse className="h-3.5 w-3.5" />
              Patient Care Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome, {user?.full_name?.split(' ')[0] || 'Patient'}!
            </h1>
            <p className="text-green-50 mt-1.5 text-sm sm:text-base max-w-md">
              Request blood and track your requests in real-time. We're here to help.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-none">
                <Activity className="h-3 w-3 mr-1" />
                Active Patient
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <FileText className="h-3 w-3 mr-1" />
                {totalRequests} Total Requests
              </Badge>
              {pendingCount > 0 && (
                <Badge className="bg-yellow-500/30 text-yellow-100 border-none">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingCount} Pending
                </Badge>
              )}
              {criticalCount > 0 && (
                <Badge className="bg-red-500/30 text-red-100 border-none animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {criticalCount} Critical
                </Badge>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-2xl backdrop-blur-sm border bg-emerald-500/20 border-emerald-300/30">
              <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center shadow-lg mb-1.5 bg-emerald-500 shadow-emerald-500/30">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Requests */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalRequests}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">all time</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400"></div>
        </Card>

        {/* Pending */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-yellow-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-0.5">{pendingCount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">awaiting response</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-amber-400"></div>
        </Card>

        {/* Fulfilled */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Fulfilled</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">{fulfilledCount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">completed</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>

        {/* Cancelled */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-red-600 mt-0.5">{cancelledCount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">not completed</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                <XCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
        </Card>
      </div>

      {/* Quick Actions + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/20">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/patient/new-request" className="block">
              <Button
                className="w-full h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25 rounded-xl font-semibold"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Request
              </Button>
            </Link>
            <Link href="/dashboard/patient/new-request" className="block">
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-xl font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Blood Request
              </Button>
            </Link>
            <Link href="/dashboard/patient/requests" className="block">
              <Button
                variant="ghost"
                className="w-full h-12 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
              >
                <History className="mr-2 h-4 w-4" />
                View All Requests
              </Button>
            </Link>
            <div className="pt-2">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-green-500/20">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Need help?</p>
                  <p className="text-xs text-gray-500">Contact our support team anytime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <History className="h-4 w-4 text-white" />
              </div>
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="relative mx-auto w-16 h-16 mb-3">
                  <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center border border-green-100">
                    <Droplet className="h-8 w-8 text-green-300" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4">No blood requests yet</p>
                <Link href="/dashboard/patient/new-request">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 shadow-lg shadow-green-500/25">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first request
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    bloodGroup={request.blood_group}
                    status={request.status}
                    date={formatTimeAgo(request.created_at)}
                    hospital={request.hospital_name}
                    priority={request.priority}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impact Message */}
      <Card className="border-0 bg-gradient-to-br from-green-50 via-emerald-50/50 to-transparent shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 animate-pulse">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">We're Here For You</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Your health matters. Our network of <span className="font-bold text-green-600">500+ donors</span> is ready
                to help when you need it most. 💚
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== SHARED HELPER COMPONENTS ====================
function RequestItem({ bloodGroup, status, date, hospital, priority }: any) {
  const statusConfig: Record<string, { icon: any; text: string; color: string }> = {
    pending: { icon: <Clock className="h-4 w-4 text-yellow-600" />, text: 'Pending', color: 'bg-yellow-50' },
    matched: { icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, text: 'Matched', color: 'bg-green-50' },
    fulfilled: { icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, text: 'Fulfilled', color: 'bg-green-50' },
    cancelled: { icon: <XCircle className="h-4 w-4 text-red-600" />, text: 'Cancelled', color: 'bg-red-50' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  const isCritical = priority === 'critical';

  return (
    <div className={`p-3 rounded-lg ${config.color} ${isCritical ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Blood Group {bloodGroup}</span>
            {isCritical && (
              <Badge className="bg-red-600 text-white border-none text-[10px] px-2 py-0.5 animate-pulse">
                🚨 URGENT
              </Badge>
            )}
          </div>
          {hospital && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" />
              {hospital}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{date}</p>
        </div>
        <div className="flex items-center space-x-1">
          {config.icon}
          <span className="text-sm">{config.text}</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, subLabel, color }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  subLabel: string; 
  color: string;
}) {
  const colors = {
    red: 'bg-red-100 hover:bg-red-200',
    blue: 'bg-blue-100 hover:bg-blue-200',
    purple: 'bg-purple-100 hover:bg-purple-200'
  };

  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative">
        <div className={`w-12 h-12 ${colors[color as keyof typeof colors]} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
      </div>
    </Link>
  );
}