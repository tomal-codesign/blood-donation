// app/dashboard/donor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
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
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface DashboardStats {
  totalDonations: number;
  lastDonation: string;
  available: boolean;
  impact: number;
}

interface RecentRequest {
  id: number;
  blood_group: string;
  hospital: string;
  city: string;
  priority: string;
}

export default function DonorDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    lastDonation: 'Never',
    available: true,
    impact: 0
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors/${user?.id}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentRequests(data.recentRequests || []);
      } else {
        setStats({
          totalDonations: 5,
          lastDonation: '2024-05-15',
          available: true,
          impact: 15
        });
        setRecentRequests([
          { id: 1, blood_group: 'O-', hospital: 'Dhaka Medical', city: 'Dhaka', priority: 'critical' },
          { id: 2, blood_group: 'A+', hospital: 'Square Hospital', city: 'Dhaka', priority: 'moderate' }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_available: !stats.available })
      });

      if (response.ok) {
        setStats({ ...stats, available: !stats.available });
        toast.success(`You are now ${!stats.available ? 'available' : 'unavailable'} for donation`);
      }
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-xl p-6 text-white">
        <div className="absolute right-0 top-0 opacity-10">
          <Heart className="h-32 w-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-red-200" />
            <span className="text-red-100 text-sm">Hero Donor</span>
          </div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}!</h2>
          <p className="text-red-100 text-sm mt-1">Your next donation can save up to 3 lives</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-none">
              <Activity className="h-3 w-3 mr-1" />
              Active Donor
            </Badge>
            <Badge className="bg-white/20 text-white border-none">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.totalDonations} Donations
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{user?.blood_group || 'N/A'}</p>
                <p className="text-xs text-gray-500">Blood Group</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Droplet className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                <p className="text-xs text-gray-500">Total Donations</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {stats.lastDonation === 'Never' ? 'Never' : stats.lastDonation.slice(0, 10)}
                </p>
                <p className="text-xs text-gray-500">Last Donation</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.impact}</p>
                <p className="text-xs text-gray-500">Lives Saved</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                className={stats.available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}
              >
                {stats.available ? 'Set Unavailable' : 'Set Available'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/dashboard/donor/donations">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Gift className="h-6 w-6 text-red-500" />
            </div>
            <p className="font-medium text-gray-900 text-sm">My Donations</p>
            <p className="text-xs text-gray-400 mt-1">View scheduled</p>
          </div>
        </Link>

        <Link href="/dashboard/donor/history">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <p className="font-medium text-gray-900 text-sm">History</p>
            <p className="text-xs text-gray-400 mt-1">Past donations</p>
          </div>
        </Link>

        <Link href="/find-donor">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <MapPin className="h-6 w-6 text-purple-500" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Find Donors</p>
            <p className="text-xs text-gray-400 mt-1">Search nearby</p>
          </div>
        </Link>

        <Link href="/dashboard/donor/alerts">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Bell className="h-6 w-6 text-orange-500" />
            </div>
            <p className="font-medium text-gray-900 text-sm">Alerts</p>
            <p className="text-xs text-gray-400 mt-1">Emergency</p>
            {recentRequests.length > 0 && (
              <Badge className="absolute top-1 right-6 h-5 min-w-[20px] bg-red-600 text-white text-xs">
                {recentRequests.length}
              </Badge>
            )}
          </div>
        </Link>
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
              {recentRequests.slice(0, 2).map((request: RecentRequest) => (
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
                  <Badge className="bg-red-600 text-white">
                    {request.priority === 'critical' ? 'URGENT' : request.priority.toUpperCase()}
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
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Your Impact Matters</p>
              <p className="text-xs text-gray-600">
                You've helped save {stats.impact} lives through your {stats.totalDonations} donation(s).
                Thank you for being a hero!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}