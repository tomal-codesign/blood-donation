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
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw
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
}

type ColorType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

const colorStyles: Record<ColorType, string> = {
  red: 'border-l-red-500 bg-red-50',
  orange: 'border-l-orange-500 bg-orange-50',
  yellow: 'border-l-yellow-500 bg-yellow-50',
  green: 'border-l-green-500 bg-green-50',
  blue: 'border-l-blue-500 bg-blue-50',
  purple: 'border-l-purple-500 bg-purple-50'
};

const iconColors: Record<ColorType, string> = {
  red: 'bg-red-100',
  orange: 'bg-orange-100',
  yellow: 'bg-yellow-100',
  green: 'bg-green-100',
  blue: 'bg-blue-100',
  purple: 'bg-purple-100'
};

const quickActionColors: Record<ColorType, string> = {
  red: 'bg-red-100 hover:bg-red-200',
  orange: 'bg-orange-100 hover:bg-orange-200',
  yellow: 'bg-yellow-100 hover:bg-yellow-200',
  green: 'bg-green-100 hover:bg-green-200',
  blue: 'bg-blue-100 hover:bg-blue-200',
  purple: 'bg-purple-100 hover:bg-purple-200'
};

export default function HospitalDashboard() {
  const { user, token } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
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
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;
  const fulfillmentRate = requests.length > 0 ? Math.round((fulfilledRequests / requests.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.full_name || 'Hospital'}!</h2>
            <p className="text-blue-100 mt-1">Manage your blood bank and requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-none">
              <Hospital className="h-4 w-4 mr-1" />
              Hospital Admin
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/30 text-gray-800 hover:bg-white/90"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={totalUnits}
          icon={<Droplet className="h-5 w-5 text-red-500" />}
          color="red"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          color="yellow"
        />
        <StatCard
          title="Fulfilled"
          value={fulfilledRequests}
          icon={<Package className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Fulfillment Rate"
          value={`${fulfillmentRate}%`}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction
          href="/dashboard/hospital/inventory"
          icon={<Droplet className="h-6 w-6 text-red-500" />}
          label="Inventory"
          subLabel="Manage stock"
          color="red"
        />
        <QuickAction
          href="/dashboard/hospital/requests"
          icon={<Package className="h-6 w-6 text-blue-500" />}
          label="Requests"
          subLabel="View & manage"
          color="blue"
        />
        <QuickAction
          href="/dashboard/hospital/donors"
          icon={<Users className="h-6 w-6 text-green-500" />}
          label="Donors"
          subLabel="View donors"
          color="green"
        />
        <QuickAction
          href="/dashboard/hospital/profile"
          icon={<Hospital className="h-6 w-6 text-purple-500" />}
          label="Profile"
          subLabel="Update info"
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Inventory Overview</h3>
              <Link href="/dashboard/hospital/inventory">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </Link>
            </div>
            {inventory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No inventory items</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {inventory.slice(0, 4).map((item) => (
                  <div key={item.blood_group} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{item.blood_group}</p>
                    <p className="text-2xl font-bold text-blue-600">{item.units_available}</p>
                    <p className="text-xs text-gray-500">units available</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Requests</h3>
              <Link href="/dashboard/hospital/requests">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                </Button>
              </Link>
            </div>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No requests yet</p>
            ) : (
              <div className="space-y-2">
                {requests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Blood {request.blood_group}</p>
                      <p className="text-sm text-gray-500">{request.patient_name || 'Patient'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{request.units_needed} units</span>
                      <Badge className={
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          request.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                            request.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: ColorType;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className={`border-l-4 ${colorStyles[color]} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  color: ColorType;
}

function QuickAction({ href, icon, label, subLabel, color }: QuickActionProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
        <div className={`w-12 h-12 ${quickActionColors[color]} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
      </div>
    </Link>
  );
}