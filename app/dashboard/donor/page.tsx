// app/dashboard/donor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Heart, Calendar, MapPin, Award, Bell, Gift, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function DonorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [available, setAvailable] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    lastDonation: 'Never',
    nextEligible: 'Ready now',
    impact: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.full_name}! 👋</h2>
        <p className="text-red-100">Ready to save lives today? Your next donation could save up to 3 lives.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Droplet className="h-8 w-8 text-red-600" />}
          title="Blood Group"
          value={user.blood_group || 'O+'}
          color="bg-red-50"
        />
        <StatCard
          icon={<Heart className="h-8 w-8 text-green-600" />}
          title="Total Donations"
          value={stats.totalDonations}
          subtitle="Lives Saved"
          color="bg-green-50"
        />
        <StatCard
          icon={<Calendar className="h-8 w-8 text-blue-600" />}
          title="Last Donation"
          value={stats.lastDonation}
          subtitle={stats.nextEligible}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Award className="h-8 w-8 text-purple-600" />}
          title="Status"
          value={available ? "Available" : "Busy"}
          color="bg-purple-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Donation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${available ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-semibold">
                    {available ? 'Available for Donation' : 'Currently Unavailable'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {available 
                      ? 'You will receive requests from nearby patients' 
                      : 'You will not receive any donation requests'}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setAvailable(!available);
                    toast.success(`You are now ${!available ? 'available' : 'unavailable'}`);
                  }}
                  className={available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'}
                >
                  {available ? 'Set Unavailable' : 'Set Available'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Response</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
              <MapPin className="mr-2 h-4 w-4" />
              Set Emergency Radius (5 km)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No donation history yet. Be the first to save a life!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: any) {
  return (
    <Card className={color}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}