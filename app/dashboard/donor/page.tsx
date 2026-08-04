// app/dashboard/donor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { donorAPI } from '@/lib/api';
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

// Helper Components
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
