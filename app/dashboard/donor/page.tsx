// app/dashboard/donor/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplet, Heart, Calendar, MapPin, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function DonorDashboardPage() {
  const { user } = useAuth();

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
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.full_name}! 👋</h2>
        <p className="text-red-100">Ready to save lives today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Droplet className="h-8 w-8 text-red-600" />}
          title="Blood Group"
          value={user.blood_group || 'Not set'}
          color="bg-red-50"
        />
        <StatCard
          icon={<Heart className="h-8 w-8 text-green-600" />}
          title="Total Donations"
          value="0"
          color="bg-green-50"
        />
        <StatCard
          icon={<Calendar className="h-8 w-8 text-blue-600" />}
          title="Last Donation"
          value="Never"
          color="bg-blue-50"
        />
        <StatCard
          icon={<Award className="h-8 w-8 text-purple-600" />}
          title="Status"
          value="Available"
          color="bg-purple-50"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => toast.info('Coming soon')}
          >
            Find Donors
          </Button>
          <Button 
            variant="outline"
            onClick={() => toast.info('Coming soon')}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Emergency Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  return (
    <Card className={color}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}