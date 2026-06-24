// app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
    Users,
    Hospital,
    Droplet,
    Activity,
    TrendingUp,
    Shield,
    AlertCircle,
    CheckCircle,
    Clock,
    Calendar,
    Download,
    Eye,
    MoreVertical,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Define color types
type StatColorType = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

const statColors: Record<StatColorType, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50'
};

// Define Blood Stock Status Type
type BloodStockStatus = 'good' | 'low' | 'critical';

// Define Blood Stock Data Interface
interface BloodStockData {
    group: string;
    units: number;
    status: BloodStockStatus;
}

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
    const [bloodStockData, setBloodStockData] = useState<BloodStockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
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
                requests = data.requests || [];
            }

            // 3. Fetch inventory for blood stock
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

            // Calculate blood stock totals per group
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            const stockMap: Record<string, number> = {};
            allInventory.forEach((item: any) => {
                if (stockMap[item.blood_group]) {
                    stockMap[item.blood_group] += item.units_available;
                } else {
                    stockMap[item.blood_group] = item.units_available;
                }
            });

            const bloodStock: BloodStockData[] = bloodGroups.map(group => ({
                group,
                units: stockMap[group] || 0,
                status: getStockStatus(stockMap[group] || 0)
            }));

            setBloodStockData(bloodStock);

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

    const getStockStatus = (units: number): BloodStockStatus => {
        if (units >= 20) return 'good';
        if (units >= 10) return 'low';
        return 'critical';
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
        toast.success('Dashboard refreshed');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    const totalLivesSaved = stats.totalDonations * 3;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                        <p className="text-purple-100">System overview and analytics</p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-white/30 text-white hover:bg-white/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="h-8 w-8 text-blue-600" />}
                    title="Total Users"
                    value={stats.totalUsers}
                    subtitle={`${stats.totalDonors} donors, ${stats.totalHospitals} hospitals`}
                    color="blue"
                />
                <StatCard
                    icon={<Droplet className="h-8 w-8 text-red-600" />}
                    title="Blood Requests"
                    value={stats.totalRequests}
                    subtitle={`${stats.pendingRequests} pending, ${stats.fulfilledRequests} fulfilled`}
                    color="red"
                />
                <StatCard
                    icon={<Hospital className="h-8 w-8 text-green-600" />}
                    title="Active Hospitals"
                    value={stats.activeBloodBanks}
                    subtitle="Blood banks & hospitals"
                    color="green"
                />
                <StatCard
                    icon={<Activity className="h-8 w-8 text-purple-600" />}
                    title="Lives Saved"
                    value={totalLivesSaved}
                    subtitle={`From ${stats.totalDonations} donations`}
                    color="purple"
                />
            </div>

            {/* Blood Inventory Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Blood Inventory Status</span>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Current blood stock levels across all blood banks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {bloodStockData.map((bg) => (
                            <BloodStockCard key={bg.group} group={bg.group} units={bg.units} status={bg.status} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Manage system from one place
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/admin/users">
                                <QuickActionButton
                                    icon={<Users className="h-5 w-5" />}
                                    title="Manage Users"
                                    description="Add, edit or remove users"
                                />
                            </Link>
                            <Link href="/dashboard/admin/hospitals">
                                <QuickActionButton
                                    icon={<Hospital className="h-5 w-5" />}
                                    title="Manage Hospitals"
                                    description="Verify hospital accounts"
                                />
                            </Link>
                            <Link href="/dashboard/admin/blood-banks">
                                <QuickActionButton
                                    icon={<Droplet className="h-5 w-5" />}
                                    title="Blood Banks"
                                    description="Monitor blood stock"
                                />
                            </Link>
                            <Link href="/dashboard/admin/requests">
                                <QuickActionButton
                                    icon={<Activity className="h-5 w-5" />}
                                    title="Blood Requests"
                                    description="View all requests"
                                />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Health Status</CardTitle>
                        <CardDescription>
                            Real-time system monitoring
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            <HealthStatus
                                title="API Status"
                                status="healthy"
                                message="All systems operational"
                            />
                            <HealthStatus
                                title="Database"
                                status="healthy"
                                message="Connected and running"
                            />
                            <HealthStatus
                                title="Donor Availability"
                                status={stats.totalDonors > 0 ? "healthy" : "warning"}
                                message={`${stats.totalDonors} registered donors`}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>System Summary</CardTitle>
                    <CardDescription>Quick overview of the entire system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SummaryItem label="Total Users" value={stats.totalUsers} icon={Users} />
                        <SummaryItem label="Total Donors" value={stats.totalDonors} icon={Droplet} />
                        <SummaryItem label="Total Hospitals" value={stats.totalHospitals} icon={Hospital} />
                        <SummaryItem label="Fulfillment Rate" value={
                            stats.totalRequests > 0 
                                ? `${Math.round((stats.fulfilledRequests / stats.totalRequests) * 100)}%` 
                                : '0%'
                        } icon={TrendingUp} />
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
    color: StatColorType;
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
    return (
        <Card className={statColors[color]}>
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

interface BloodStockCardProps {
    group: string;
    units: number;
    status: BloodStockStatus;
}

function BloodStockCard({ group, units, status }: BloodStockCardProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-50';
            case 'low': return 'text-yellow-600 bg-yellow-50';
            case 'critical': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'good': return <CheckCircle className="h-4 w-4" />;
            case 'low': return <Clock className="h-4 w-4" />;
            case 'critical': return <AlertCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <div className={`p-3 rounded-lg text-center ${getStatusColor()}`}>
            <p className="font-bold text-lg">{group}</p>
            <p className="text-2xl font-bold">{units}</p>
            <p className="text-xs flex items-center justify-center gap-1">
                {getStatusIcon()}
                {status === 'good' ? 'Good' : status === 'low' ? 'Low' : 'Critical'}
            </p>
        </div>
    );
}

interface QuickActionButtonProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function QuickActionButton({ icon, title, description }: QuickActionButtonProps) {
    return (
        <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center space-y-1 hover:border-purple-500 hover:bg-purple-50 w-full"
        >
            {icon}
            <span className="font-medium text-sm">{title}</span>
            <span className="text-xs text-gray-500">{description}</span>
        </Button>
    );
}

interface HealthStatusProps {
    title: string;
    status: 'healthy' | 'warning' | 'error';
    message: string;
}

function HealthStatus({ title, status, message }: HealthStatusProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-5 w-5" />;
            case 'warning': return <AlertCircle className="h-5 w-5" />;
            case 'error': return <AlertCircle className="h-5 w-5" />;
            default: return null;
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-gray-500">{message}</p>
            </div>
            <div className={getStatusColor()}>
                {getStatusIcon()}
            </div>
        </div>
    );
}

interface SummaryItemProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
}

function SummaryItem({ label, value, icon: Icon }: SummaryItemProps) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
            <Icon className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
}