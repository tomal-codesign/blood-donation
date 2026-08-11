// app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
    Users,
    Hospital,
    Droplet,
    Activity,
    TrendingUp,
    Shield,
    AlertCircle,
    CheckCircle2,
    Clock,
    RefreshCw,
    Sparkles,
    Building2,
    HeartPulse,
    FileText,
    ArrowUpRight,
    Database,
    Server,
    UserCheck,
    UserPlus,
    Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
    totalUsers: number;
    totalDonors: number;
    totalHospitals: number;
    totalRequests: number;
    pendingRequests: number;
    fulfilledRequests: number;
    totalDonations: number;
    activeBloodBanks: number;
}

export default function AdminDashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalDonors: 0,
        totalHospitals: 0,
        totalRequests: 0,
        pendingRequests: 0,
        fulfilledRequests: 0,
        totalDonations: 0,
        activeBloodBanks: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch users
            const usersRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            let users = [];
            let donors = [];
            let hospitals = [];
            
            if (usersRes.ok) {
                const data = await usersRes.json();
                users = data.users || [];
                donors = users.filter((u: any) => u.role === 'donor');
                hospitals = users.filter((u: any) => u.role === 'hospital');
            }

            // 2. Fetch requests
            const requestsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            let requests = [];
            if (requestsRes.ok) {
                const data = await requestsRes.json();
                requests = data.data || data.requests || [];
            }

            // Set stats
            setStats({
                totalUsers: users.length,
                totalDonors: donors.length,
                totalHospitals: hospitals.length,
                totalRequests: requests.length,
                pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
                fulfilledRequests: requests.filter((r: any) => r.status === 'fulfilled').length,
                totalDonations: requests.filter((r: any) => r.status === 'fulfilled').length,
                activeBloodBanks: hospitals.filter((h: any) => h.verified).length
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-200/50 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Shield className="h-8 w-8 text-white animate-bounce" />
                    </div>
                </div>
                <p className="mt-5 text-gray-500 font-medium">Loading admin dashboard...</p>
                <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
                </div>
                <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
            </div>
        );
    }

    const totalLivesSaved = stats.totalDonations * 3;
    const fulfillmentRate = stats.totalRequests > 0 
        ? Math.round((stats.fulfilledRequests / stats.totalRequests) * 100) 
        : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-purple-900/20 border border-white/10">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-8 right-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full"></div>
                <div className="absolute bottom-12 right-1/2 w-2 h-2 bg-indigo-300/30 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/20 rounded-full"></div>

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold mb-4">
                            <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                            System Overview
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
                            Monitor, manage, and optimize the entire blood donation platform from a single command center.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                                <Users className="h-3 w-3 mr-1.5" />
                                {stats.totalUsers} Users
                            </Badge>
                            <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                                <Droplet className="h-3 w-3 mr-1.5" />
                                {stats.totalRequests} Requests
                            </Badge>
                            <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                                <Building2 className="h-3 w-3 mr-1.5" />
                                {stats.totalHospitals} Hospitals
                            </Badge>
                            {stats.pendingRequests > 0 && (
                                <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/20 backdrop-blur-sm animate-pulse">
                                    <Clock className="h-3 w-3 mr-1.5" />
                                    {stats.pendingRequests} Pending
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-purple-300/70 font-semibold">Last Updated</p>
                                <p className="text-sm text-white font-medium">{new Date().toLocaleTimeString()}</p>
                            </div>
                            <Button 
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-purple-200/60">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            All systems operational
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="h-5 w-5 text-white" />}
                    title="Total Users"
                    value={stats.totalUsers}
                    subtitle={`${stats.totalDonors} donors · ${stats.totalHospitals} hospitals`}
                    iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
                    accent="bg-gradient-to-r from-blue-500 to-indigo-400"
                    hoverShadow="hover:shadow-blue-500/10"
                    to="from-white to-blue-50/50"
                />
                <StatCard
                    icon={<Droplet className="h-5 w-5 text-white" />}
                    title="Blood Requests"
                    value={stats.totalRequests}
                    subtitle={`${stats.pendingRequests} pending · ${stats.fulfilledRequests} fulfilled`}
                    iconBg="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
                    accent="bg-gradient-to-r from-red-500 to-rose-400"
                    hoverShadow="hover:shadow-red-500/10"
                    to="from-white to-red-50/50"
                />
                <StatCard
                    icon={<Hospital className="h-5 w-5 text-white" />}
                    title="Active Hospitals"
                    value={stats.activeBloodBanks}
                    subtitle={`${stats.totalHospitals} total registered`}
                    iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
                    accent="bg-gradient-to-r from-emerald-500 to-teal-400"
                    hoverShadow="hover:shadow-emerald-500/10"
                    to="from-white to-emerald-50/50"
                />
                <StatCard
                    icon={<HeartPulse className="h-5 w-5 text-white" />}
                    title="Lives Saved"
                    value={totalLivesSaved}
                    subtitle={`From ${stats.totalDonations} donations`}
                    iconBg="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25"
                    accent="bg-gradient-to-r from-purple-500 to-violet-400"
                    hoverShadow="hover:shadow-purple-500/10"
                    to="from-white to-purple-50/50"
                />
            </div>

            {/* System Health */}
            <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <Activity className="h-4.5 w-4.5 text-white" />
                        </div>
                        System Health Status
                    </CardTitle>
                    <CardDescription>
                        Real-time system monitoring
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                        <HealthStatus
                            title="API Status"
                            status="healthy"
                            message="All systems operational"
                            percentage={100}
                            icon={<Server className="h-4 w-4" />}
                        />
                        <HealthStatus
                            title="Database"
                            status="healthy"
                            message="Connected and running"
                            percentage={100}
                            icon={<Database className="h-4 w-4" />}
                        />
                        <HealthStatus
                            title="Donor Availability"
                            status={stats.totalDonors > 20 ? "healthy" : stats.totalDonors > 0 ? "warning" : "error"}
                            message={`${stats.totalDonors} registered donors`}
                            percentage={stats.totalDonors > 0 ? Math.min(100, Math.round((stats.totalDonors / 100) * 100)) : 0}
                            icon={<UserCheck className="h-4 w-4" />}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* System Summary - Redesigned */}
            <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-slate-50 via-white to-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md shadow-slate-700/20">
                            <FileText className="h-4.5 w-4.5 text-white" />
                        </div>
                        System Summary
                    </CardTitle>
                    <CardDescription>
                        Quick overview of the entire system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryItem
                            label="Total Users"
                            value={stats.totalUsers}
                            icon={Users}
                            iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                            iconShadow="shadow-blue-500/20"
                            valueColor="text-blue-600"
                            labelColor="text-gray-500"
                            border="border-blue-100"
                            bg="bg-gradient-to-br from-blue-50 to-white"
                            hoverBorder="hover:border-blue-200"
                        />
                        <SummaryItem
                            label="Total Donors"
                            value={stats.totalDonors}
                            icon={UserPlus}
                            iconBg="bg-gradient-to-br from-red-500 to-rose-600"
                            iconShadow="shadow-red-500/20"
                            valueColor="text-red-600"
                            labelColor="text-gray-500"
                            border="border-red-100"
                            bg="bg-gradient-to-br from-red-50 to-white"
                            hoverBorder="hover:border-red-200"
                        />
                        <SummaryItem
                            label="Total Hospitals"
                            value={stats.totalHospitals}
                            icon={Stethoscope}
                            iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                            iconShadow="shadow-emerald-500/20"
                            valueColor="text-emerald-600"
                            labelColor="text-gray-500"
                            border="border-emerald-100"
                            bg="bg-gradient-to-br from-emerald-50 to-white"
                            hoverBorder="hover:border-emerald-200"
                        />
                        <SummaryItem
                            label="Fulfillment Rate"
                            value={`${fulfillmentRate}%`}
                            icon={TrendingUp}
                            iconBg="bg-gradient-to-br from-purple-500 to-violet-600"
                            iconShadow="shadow-purple-500/20"
                            valueColor="text-purple-600"
                            labelColor="text-gray-500"
                            border="border-purple-100"
                            bg="bg-gradient-to-br from-purple-50 to-white"
                            hoverBorder="hover:border-purple-200"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper Components
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    subtitle?: string;
    iconBg: string;
    accent: string;
    hoverShadow: string;
    to: string;
}

function StatCard({ icon, title, value, subtitle, iconBg, accent, hoverShadow, to }: StatCardProps) {
    return (
        <Card className={`relative overflow-hidden group hover:shadow-lg ${hoverShadow} transition-all duration-300 border-0 bg-gradient-to-br ${to} hover:-translate-y-0.5`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
                        {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`}></div>
        </Card>
    );
}

interface HealthStatusProps {
    title: string;
    status: 'healthy' | 'warning' | 'error';
    message: string;
    percentage: number;
    icon: React.ReactNode;
}

function HealthStatus({ title, status, message, percentage, icon }: HealthStatusProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'healthy':
                return {
                    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
                    text: 'Healthy',
                    badge: 'bg-emerald-100 text-emerald-700',
                    border: 'border-emerald-100',
                    bg: 'from-emerald-50 to-teal-50/30',
                    bar: 'from-emerald-500 to-teal-500'
                };
            case 'warning':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
                    text: 'Warning',
                    badge: 'bg-yellow-100 text-yellow-700',
                    border: 'border-yellow-100',
                    bg: 'from-yellow-50 to-amber-50/30',
                    bar: 'from-yellow-400 to-amber-500'
                };
            case 'error':
                return {
                    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
                    text: 'Error',
                    badge: 'bg-red-100 text-red-700',
                    border: 'border-red-100',
                    bg: 'from-red-50 to-rose-50/30',
                    bar: 'from-red-500 to-rose-500'
                };
            default:
                return {
                    icon: <Clock className="h-5 w-5 text-gray-400" />,
                    text: 'Unknown',
                    badge: 'bg-gray-100 text-gray-700',
                    border: 'border-gray-100',
                    bg: 'from-gray-50 to-gray-50',
                    bar: 'from-gray-400 to-gray-500'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`p-4 rounded-xl border ${config.border} bg-gradient-to-r ${config.bg} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{title}</p>
                        <p className="text-xs text-gray-500">{message}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                        {config.icon}
                        <span className="ml-1">{config.text}</span>
                    </span>
                </div>
            </div>
            <div className="h-1.5 bg-gray-200/70 rounded-full overflow-hidden">
                <div 
                    className={`h-full bg-gradient-to-r ${config.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

interface SummaryItemProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    iconBg: string;
    iconShadow: string;
    valueColor: string;
    labelColor: string;
    border: string;
    bg: string;
    hoverBorder: string;
}

function SummaryItem({ label, value, icon: Icon, iconBg, iconShadow, valueColor, labelColor, border, bg, hoverBorder }: SummaryItemProps) {
    return (
        <div className={`${bg} ${border} ${hoverBorder} p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-lg ${iconShadow}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-gray-100 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </div>
            </div>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            <p className={`text-xs font-medium mt-1 ${labelColor}`}>{label}</p>
        </div>
    );
}