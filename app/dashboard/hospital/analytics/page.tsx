// app/dashboard/hospital/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
    TrendingUp,
    Droplet,
    Users,
    Package,
    Calendar,
    Loader2,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Award,
    Clock,
    CheckCircle,
    AlertCircle,
    BarChart3,
    PieChart
} from 'lucide-react';
import { toast } from 'sonner';

// Define color types
type MetricColorType = 'green' | 'blue' | 'red' | 'purple';
type RequestColorType = 'blue' | 'green' | 'yellow' | 'red';

const metricColors: Record<MetricColorType, string> = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50'
};

const requestColors: Record<RequestColorType, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50'
};

export default function HospitalAnalyticsPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [analytics, setAnalytics] = useState({
        totalRequests: 0,
        fulfilledRequests: 0,
        pendingRequests: 0,
        cancelledRequests: 0,
        totalDonors: 0,
        totalUnits: 0,
        criticalStock: 0,
        monthlyRequests: 0,
        fulfillmentRate: 0,
        bloodGroupDistribution: {} as Record<string, number>,
        monthlyTrend: [] as number[]
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch requests
            const requestsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            let requests = [];
            if (requestsRes.ok) {
                const data = await requestsRes.json();
                requests = data.requests || [];
            }

            // Fetch inventory
            const inventoryRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${user?.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            let inventory = [];
            if (inventoryRes.ok) {
                const data = await inventoryRes.json();
                inventory = data.inventory || [];
            }

            // Fetch donors
            const donorsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?role=donor`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            let donors = [];
            if (donorsRes.ok) {
                const data = await donorsRes.json();
                donors = data.users || [];
            }

            const totalRequests = requests.length;
            const fulfilledRequests = requests.filter((r: any) => r.status === 'fulfilled').length;
            const pendingRequests = requests.filter((r: any) => r.status === 'pending').length;
            const cancelledRequests = requests.filter((r: any) => r.status === 'cancelled').length;
            const totalUnits = inventory.reduce((sum: number, item: any) => sum + item.units_available, 0);
            const criticalStock = inventory.filter((item: any) => item.units_available < 10).length;

            // Blood group distribution
            const distribution: Record<string, number> = {};
            inventory.forEach((item: any) => {
                distribution[item.blood_group] = item.units_available;
            });

            // Last 30 days requests
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const monthlyRequests = requests.filter((r: any) =>
                new Date(r.created_at) >= thirtyDaysAgo
            ).length;

            // Monthly trend (last 6 months)
            const monthlyTrend = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                const count = requests.filter((r: any) => {
                    const created = new Date(r.created_at);
                    return created >= monthStart && created <= monthEnd;
                }).length;
                monthlyTrend.push(count);
            }

            const fulfillmentRate = totalRequests > 0
                ? Math.round((fulfilledRequests / totalRequests) * 100)
                : 0;

            setAnalytics({
                totalRequests,
                fulfilledRequests,
                pendingRequests,
                cancelledRequests,
                totalDonors: donors.length,
                totalUnits,
                criticalStock,
                monthlyRequests,
                fulfillmentRate,
                bloodGroupDistribution: distribution,
                monthlyTrend
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-500 mt-1">View your hospital performance metrics</p>
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

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Fulfillment Rate"
                    value={`${analytics.fulfillmentRate}%`}
                    icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                    trend={analytics.fulfillmentRate > 70 ? 'up' : 'down'}
                    color="green"
                />
                <MetricCard
                    title="Monthly Requests"
                    value={analytics.monthlyRequests}
                    icon={<Calendar className="h-5 w-5 text-blue-500" />}
                    color="blue"
                />
                <MetricCard
                    title="Total Units"
                    value={analytics.totalUnits}
                    icon={<Droplet className="h-5 w-5 text-red-500" />}
                    color="red"
                />
                <MetricCard
                    title="Active Donors"
                    value={analytics.totalDonors}
                    icon={<Users className="h-5 w-5 text-purple-500" />}
                    color="purple"
                />
            </div>

            {/* Request Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <RequestStatCard
                    title="Total Requests"
                    value={analytics.totalRequests}
                    icon={<Package className="h-6 w-6 text-blue-500" />}
                    color="blue"
                />
                <RequestStatCard
                    title="Fulfilled"
                    value={analytics.fulfilledRequests}
                    icon={<CheckCircle className="h-6 w-6 text-green-500" />}
                    color="green"
                />
                <RequestStatCard
                    title="Pending"
                    value={analytics.pendingRequests}
                    icon={<Clock className="h-6 w-6 text-yellow-500" />}
                    color="yellow"
                />
                <RequestStatCard
                    title="Cancelled"
                    value={analytics.cancelledRequests}
                    icon={<AlertCircle className="h-6 w-6 text-red-500" />}
                    color="red"
                />
            </div>

            {/* Blood Group Distribution */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Blood Group Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {Object.entries(analytics.bloodGroupDistribution).map(([group, units]) => (
                            <div key={group} className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-sm font-bold text-gray-900">{group}</p>
                                <p className="text-2xl font-bold text-blue-600">{units}</p>
                                <p className="text-xs text-gray-500">units</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Monthly Request Trend</h3>
                    <div className="flex items-end gap-2 h-40">
                        {analytics.monthlyTrend.map((count, index) => {
                            const max = Math.max(...analytics.monthlyTrend, 1);
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
                </CardContent>
            </Card>

            {/* Critical Stock Alert */}
            {analytics.criticalStock > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-800">Critical Stock Alert</p>
                                <p className="text-sm text-red-600">
                                    {analytics.criticalStock} blood group(s) have less than 10 units available.
                                    Please restock immediately.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// MetricCard Component with proper typing
interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    color: MetricColorType;
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
                    <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center`}>
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

// RequestStatCard Component with proper typing
interface RequestStatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: RequestColorType;
}

function RequestStatCard({ title, value, icon, color }: RequestStatCardProps) {
    return (
        <Card>
            <CardContent className={`p-4 text-center ${requestColors[color]}`}>
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-2`}>
                    {icon}
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{title}</p>
            </CardContent>
        </Card>
    );
}