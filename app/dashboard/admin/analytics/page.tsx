// app/dashboard/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Users, 
  Droplet, 
  Hospital, 
  Calendar,
  Loader2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  UserCheck,
  UserX,
  Heart
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
  recentActivity: any[];
}

type ColorType = 'green' | 'blue' | 'red' | 'purple' | 'yellow' | 'orange';

const metricColors: Record<ColorType, string> = {
  green: 'bg-green-50',
  blue: 'bg-blue-50',
  red: 'bg-red-50',
  purple: 'bg-purple-50',
  yellow: 'bg-yellow-50',
  orange: 'bg-orange-50'
};

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
        requests = data.requests || [];
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

      // Recent activity
      const recentActivity = [
        { id: 1, action: `${fulfilled.length} requests fulfilled`, time: 'Today', type: 'request' },
        { id: 2, action: `${pending.length} requests pending`, time: 'Today', type: 'pending' },
        { id: 3, action: `${activeDonors.length} donors available`, time: 'Today', type: 'donor' },
        { id: 4, action: `${hospitalsList.length} hospitals registered`, time: 'Today', type: 'hospital' },
        { id: 5, action: `${critical.length} critical requests`, time: 'Today', type: 'critical' },
      ];

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
        unverifiedHospitals: hospitals.filter((h: any) => !h.verified).length,
        recentActivity
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-500 mt-1">Complete system performance metrics</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Fulfillment Rate"
          value={`${data.fulfillmentRate}%`}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          trend={data.fulfillmentRate > 70 ? 'up' : 'down'}
          color="green"
        />
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <MetricCard
          title="Lives Saved"
          value={data.livesSaved}
          icon={<Heart className="h-5 w-5 text-red-500" />}
          color="red"
        />
        <MetricCard
          title="Donation Rate"
          value={`${data.totalRequests > 0 ? Math.round((data.fulfilledRequests / data.totalRequests) * 100) : 0}%`}
          icon={<Activity className="h-5 w-5 text-purple-500" />}
          color="purple"
        />
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow label="Total Users" value={data.totalUsers} icon={<Users className="h-4 w-4" />} />
              <StatRow label="Donors" value={data.totalDonors} icon={<Droplet className="h-4 w-4" />} />
              <StatRow label="Hospitals" value={data.totalHospitals} icon={<Hospital className="h-4 w-4" />} />
              <StatRow label="Admins" value={data.totalAdmins} icon={<UserCheck className="h-4 w-4" />} />
              <StatRow label="Active Donors" value={data.activeDonors} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
              <StatRow label="Inactive Donors" value={data.inactiveDonors} icon={<UserX className="h-4 w-4 text-red-500" />} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow label="Total Requests" value={data.totalRequests} icon={<Droplet className="h-4 w-4" />} />
              <StatRow label="Pending" value={data.pendingRequests} icon={<Clock className="h-4 w-4 text-yellow-500" />} />
              <StatRow label="Matched" value={data.matchedRequests} icon={<UserCheck className="h-4 w-4 text-blue-500" />} />
              <StatRow label="Fulfilled" value={data.fulfilledRequests} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
              <StatRow label="Cancelled" value={data.cancelledRequests} icon={<AlertCircle className="h-4 w-4 text-red-500" />} />
              <StatRow label="Critical" value={data.criticalRequests} icon={<AlertCircle className="h-4 w-4 text-red-600" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Requests per Month</h4>
              <div className="flex items-end gap-2 h-32">
                {data.monthlyRequests.map((count, index) => {
                  const max = Math.max(...data.monthlyRequests, 1);
                  const height = (count / max) * 100;
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-100 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                        <div 
                          className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-500"
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">New Donors per Month</h4>
              <div className="flex items-end gap-2 h-32">
                {data.monthlyDonors.map((count, index) => {
                  const max = Math.max(...data.monthlyDonors, 1);
                  const height = (count / max) * 100;
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-green-100 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                        <div 
                          className="absolute bottom-0 w-full bg-green-500 rounded-t transition-all duration-500"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blood Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.bloodGroupDistribution).map(([group, units]) => (
                <div key={group} className="flex items-center gap-3">
                  <span className="w-12 font-bold text-sm">{group}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getGroupColor(group)}`}
                      style={{ width: `${Math.min((units / getMaxValue(data.bloodGroupDistribution)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{units}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hospital Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatRow label="Total Hospitals" value={data.totalHospitals} icon={<Hospital className="h-4 w-4" />} />
              <StatRow label="Verified" value={data.verifiedHospitals} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
              <StatRow label="Unverified" value={data.unverifiedHospitals} icon={<AlertCircle className="h-4 w-4 text-red-500" />} />
              <StatRow label="Verification Rate" value={`${data.totalHospitals > 0 ? Math.round((data.verifiedHospitals / data.totalHospitals) * 100) : 0}%`} icon={<TrendingUp className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color: ColorType;
}

function MetricCard({ title, value, icon, trend, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className={`p-4 ${metricColors[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? 'Improving' : 'Needs attention'}
            </span>
          </div>
        )}
      </CardContent>
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
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}