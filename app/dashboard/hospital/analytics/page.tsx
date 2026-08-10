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
    PieChart,
    Activity,
    Sparkles,
    HeartPulse,
    Flame,
    Target,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';

// Blood group theme colors
const BLOOD_THEMES: Record<string, { gradient: string; text: string; bar: string; glow: string }> = {
    'A+': { gradient: 'from-red-500 to-rose-600', text: 'text-red-600', bar: 'bg-red-500', glow: 'shadow-red-500/20' },
    'A-': { gradient: 'from-rose-400 to-pink-500', text: 'text-rose-500', bar: 'bg-rose-400', glow: 'shadow-rose-500/20' },
    'B+': { gradient: 'from-blue-500 to-indigo-600', text: 'text-blue-600', bar: 'bg-blue-500', glow: 'shadow-blue-500/20' },
    'B-': { gradient: 'from-sky-400 to-blue-500', text: 'text-sky-500', bar: 'bg-sky-400', glow: 'shadow-sky-500/20' },
    'AB+': { gradient: 'from-purple-500 to-violet-600', text: 'text-purple-600', bar: 'bg-purple-500', glow: 'shadow-purple-500/20' },
    'AB-': { gradient: 'from-fuchsia-400 to-purple-500', text: 'text-fuchsia-500', bar: 'bg-fuchsia-400', glow: 'shadow-fuchsia-500/20' },
    'O+': { gradient: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    'O-': { gradient: 'from-teal-400 to-emerald-500', text: 'text-teal-500', bar: 'bg-teal-400', glow: 'shadow-teal-500/20' },
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
                requests = data.data || data.requests || [];
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

            // Fetch monthly trend from dedicated API
            const trendRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/hospitals/analytics/monthly-trend/${user?.id}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            let monthlyTrend = [];
            if (trendRes.ok) {
                const trendData = await trendRes.json();
                monthlyTrend = trendData.trend?.map((m: any) => m.total) || [];
            } else {
                // Fallback to client-side calculation if API fails
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
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <BarChart3 className="h-8 w-8 text-white animate-bounce" />
                    </div>
                </div>
                <p className="mt-5 text-gray-500 font-medium">Loading analytics...</p>
                <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
                </div>
                <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
            </div>
        );
    }

    const maxTrend = Math.max(...analytics.monthlyTrend, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMonths = analytics.monthlyTrend.map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + i);
        return monthNames[d.getMonth()];
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ===== HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 sm:p-8 shadow-xl shadow-blue-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>
        <div className="absolute bottom-6 right-40 w-8 h-8 bg-white/10 rounded-lg rotate-45"></div>
                <div className="absolute top-6 right-32 w-8 h-8 bg-white/5 rounded-lg rotate-12"></div>
                <div className="absolute bottom-8 right-48 w-5 h-5 bg-white/5 rounded-full"></div>

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold mb-3">
                            <Sparkles className="h-3.5 w-3.5" />
                            Performance Overview
                        </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              Analytics Dashboard
            </h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base max-w-md">
                            Track your hospital's performance, blood stock health, and request fulfillment trends.
                        </p>

                        {/* Summary chips */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <Target className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-none">{analytics.fulfillmentRate}%</p>
                                    <p className="text-blue-100 text-[10px]">Fulfillment</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Calendar className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-none">{analytics.monthlyRequests}</p>
                                    <p className="text-blue-100 text-[10px]">30-Day Requests</p>
                                </div>
                            </div>
                            {analytics.criticalStock > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center animate-pulse">
                                        <Flame className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm leading-none">{analytics.criticalStock}</p>
                                        <p className="text-blue-100 text-[10px]">Critical Stock</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-white/15 text-white hover:bg-white/10 hover:text-white bg-white/5 self-start lg:self-auto"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* ===== KEY METRICS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Fulfillment Rate */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50/30 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Fulfillment Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.fulfillmentRate}%</p>
                                <div className="flex items-center gap-1 mt-1">
                                    {analytics.fulfillmentRate > 70 ? (
                                        <ArrowUp className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3 text-red-500" />
                                    )}
                                    <span className={`text-xs ${analytics.fulfillmentRate > 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {analytics.fulfillmentRate > 70 ? 'Excellent' : 'Needs attention'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                </Card>

                {/* Monthly Requests */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-cyan-50/30 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Monthly Requests</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.monthlyRequests}</p>
                                <p className="text-xs text-gray-400 mt-1">last 30 days</p>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                </Card>

                {/* Total Units */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 to-rose-50/30 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Units</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalUnits}</p>
                                <p className="text-xs text-gray-400 mt-1">in blood bank</p>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                                <Droplet className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
                </Card>

                {/* Active Donors */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-50/30 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Active Donors</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.totalDonors}</p>
                                <p className="text-xs text-gray-400 mt-1">in network</p>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-400"></div>
                </Card>
            </div>

            {/* ===== REQUEST STATUS ===== */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Package className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Request Status</h2>
                        <p className="text-xs text-gray-500">Overview of all blood requests</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 leading-none">{analytics.totalRequests}</p>
                                <p className="text-xs text-gray-500 mt-1">Total Requests</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fulfilled */}
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-600 leading-none">{analytics.fulfilledRequests}</p>
                                <p className="text-xs text-gray-500 mt-1">Fulfilled</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending */}
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600 leading-none">{analytics.pendingRequests}</p>
                                <p className="text-xs text-gray-500 mt-1">Pending</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cancelled */}
                    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600 leading-none">{analytics.cancelledRequests}</p>
                                <p className="text-xs text-gray-500 mt-1">Cancelled</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ===== BLOOD GROUP DISTRIBUTION ===== */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <PieChart className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Blood Group Distribution</h3>
                            <p className="text-xs text-gray-500">Current stock levels by blood type</p>
                        </div>
                    </div>

                    {Object.keys(analytics.bloodGroupDistribution).length === 0 ? (
                        <div className="text-center py-8">
                            <Droplet className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No inventory data available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(analytics.bloodGroupDistribution).map(([group, units]) => {
                                const theme = BLOOD_THEMES[group] || BLOOD_THEMES['O+'];
                                const pct = Math.min((units / 30) * 100, 100);
                                return (
                                    <div key={group} className={`rounded-xl border p-3 ${theme.gradient === 'from-red-500 to-rose-600' ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md ${theme.glow}`}>
                                                <Droplet className="h-4 w-4 text-white" />
                                            </div>
                                            <span className={`text-lg font-bold ${theme.text}`}>{units}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{group}</p>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                                            <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">units available</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ===== MONTHLY TREND ===== */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Monthly Request Trend</h3>
                            <p className="text-xs text-gray-500">Requests over the last 6 months</p>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 sm:gap-3 h-48">
                        {analytics.monthlyTrend.map((count, index) => {
                            const height = (count / maxTrend) * 100;
                            const isHighest = count === maxTrend && count > 0;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
                                    <span className={`text-xs font-bold mb-1 ${isHighest ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {count}
                                    </span>
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-500 ${
                                            isHighest
                                                ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/30'
                                                : 'bg-gradient-to-t from-blue-400 to-blue-300'
                                        }`}
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                    ></div>
                                    <span className="text-[11px] text-gray-500 mt-2">{trendMonths[index]}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ===== CRITICAL STOCK ALERT ===== */}
            {analytics.criticalStock > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50/50">
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-red-400/30 rounded-full blur-lg animate-pulse"></div>
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                            <AlertCircle className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-red-800">Critical Stock Alert</p>
                        <p className="text-sm text-red-700">
                            {analytics.criticalStock} blood group{analytics.criticalStock > 1 ? 's' : ''} have less than 10 units available.
                            Please restock immediately.
                        </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-red-200 flex-shrink-0">
                        <Flame className="h-3 w-3 mr-1" />
                        Urgent
                    </Badge>
                </div>
            )}

            {/* ===== IMPACT CARD ===== */}
            <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl overflow-hidden">
                <CardContent className="p-5 relative">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
                            <HeartPulse className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">Your Hospital's Impact</p>
                            <p className="text-sm text-gray-400 mt-1">
                                <span className="font-bold text-white">{analytics.fulfilledRequests}</span> requests fulfilled with{' '}
                                <span className="font-bold text-white">{analytics.totalUnits}</span> blood units —
                                helping save up to <span className="font-bold text-white">{analytics.totalUnits * 3}</span> lives. 🏥
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}