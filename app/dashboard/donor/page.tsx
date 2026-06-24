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
  MapPin,
  Loader2
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
  city: string;
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests?city=${user?.city}&limit=3`
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
      setRecentRequests([
        { id: 1, blood_group: 'O-', hospital: 'Dhaka Medical', city: 'Dhaka', priority: 'critical' },
        { id: 2, blood_group: 'A+', hospital: 'Square Hospital', city: 'Dhaka', priority: 'moderate' }
      ]);
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  // Ensure impact is a number before toString
  const impactValue = stats?.impact ?? 0;
  const totalDonations = stats?.totalDonations ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 text-white">
        <div className="absolute right-0 top-0 opacity-10">
          <Heart className="h-32 w-32" />
        </div>
        <div className="absolute left-0 bottom-0 opacity-5">
          <Droplet className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-red-200" />
            <span className="text-red-100 text-sm">Hero Donor</span>
          </div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'Donor'}!</h2>
          <p className="text-red-100 text-sm mt-1">Your next donation can save up to 3 lives</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Blood Group"
          value={user?.blood_group || 'N/A'}
          icon={<Droplet className="h-5 w-5 text-red-500" />}
          color="red"
        />
        <StatCard
          title="Total Donations"
          value={totalDonations.toString()}
          icon={<Heart className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Last Donation"
          value={stats.lastDonation === 'Never' ? 'Never' : stats.lastDonation}
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="Lives Saved"
          value={impactValue.toString()}
          icon={<Award className="h-5 w-5 text-purple-500" />}
          color="purple"
        />
      </div>

      {/* Availability Status Card */}
      <Card className={`overflow-hidden transition-all ${stats.available ? 'border-green-200' : 'border-gray-200'}`}>
        <CardContent className="p-0">
          <div className={`p-4 ${stats.available ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.available ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {stats.available ? (
                    <Shield className="h-6 w-6 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-gray-500" />
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
                className={stats.available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}
              >
                {toggling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : stats.available ? (
                  'Set Unavailable'
                ) : (
                  'Set Available'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction
          href="/dashboard/donor/donations"
          icon={<Gift className="h-6 w-6 text-red-500" />}
          label="My Donations"
          subLabel="View scheduled"
          color="red"
        />
        <QuickAction
          href="/dashboard/donor/history"
          icon={<Clock className="h-6 w-6 text-blue-500" />}
          label="History"
          subLabel="Past donations"
          color="blue"
        />
        <QuickAction
          href="/find-donor"
          icon={<MapPin className="h-6 w-6 text-purple-500" />}
          label="Find Donors"
          subLabel="Search nearby"
          color="purple"
        />
        <QuickAction
          href="/dashboard/donor/alerts"
          icon={<Bell className="h-6 w-6 text-orange-500" />}
          label="Alerts"
          subLabel="Emergency"
          color="orange"
          badge={recentRequests.length > 0 ? recentRequests.length : undefined}
        />
      </div>

      {/* Recent Emergency Requests */}
      {recentRequests.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold text-gray-900">Emergency Requests Near You</h3>
              </div>
              <Link href="/find-donor">
                <Button variant="ghost" size="sm" className="text-red-600 gap-1">
                  View All
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Droplet className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Blood {request.blood_group}</p>
                      <p className="text-xs text-gray-500">{request.hospital}</p>
                    </div>
                  </div>
                  <Badge className={request.priority === 'critical' ? 'bg-red-600' : 'bg-orange-500'}>
                    {request.priority === 'critical' ? '🚨 URGENT' : request.priority.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Message */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Your Impact Matters</p>
              <p className="text-xs text-gray-600">
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
function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colors = {
    red: 'border-l-red-500 bg-red-50',
    green: 'border-l-green-500 bg-green-50',
    blue: 'border-l-blue-500 bg-blue-50',
    purple: 'border-l-purple-500 bg-purple-50'
  };

  return (
    <Card className={`border-l-4 ${colors[color as keyof typeof colors]} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, icon, label, subLabel, color, badge }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  subLabel: string; 
  color: string;
  badge?: number;
}) {
  const colors = {
    red: 'bg-red-100 hover:bg-red-200',
    blue: 'bg-blue-100 hover:bg-blue-200',
    purple: 'bg-purple-100 hover:bg-purple-200',
    orange: 'bg-orange-100 hover:bg-orange-200'
  };

  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative">
        <div className={`w-12 h-12 ${colors[color as keyof typeof colors]} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
        {badge && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] bg-red-600 text-white text-xs flex items-center justify-center">
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  );
}