// app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDonors: 0,
        totalHospitals: 0,
        totalRequests: 0,
        pendingRequests: 0,
        fulfilledRequests: 0,
        totalDonations: 0,
        activeBloodBanks: 0
    });

    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data (connect to your backend later)
        setTimeout(() => {
            setStats({
                totalUsers: 1250,
                totalDonors: 890,
                totalHospitals: 45,
                totalRequests: 342,
                pendingRequests: 23,
                fulfilledRequests: 289,
                totalDonations: 567,
                activeBloodBanks: 38
            });

            setRecentActivities([
                { id: 1, action: 'New donor registered', user: 'John Doe', time: '2 minutes ago', type: 'donor' },
                { id: 2, action: 'Blood request fulfilled', user: 'City Hospital', time: '15 minutes ago', type: 'request' },
                { id: 3, action: 'Emergency alert sent', user: 'Dhaka Medical', time: '1 hour ago', type: 'emergency' },
                { id: 4, action: 'Inventory updated', user: 'Square Hospital', time: '3 hours ago', type: 'inventory' },
                { id: 5, action: 'New hospital registered', user: 'Labaid Hospital', time: '5 hours ago', type: 'hospital' },
            ]);

            setLoading(false);
        }, 1000);
    }, []);

    const bloodGroupData = [
        { group: 'A+', units: 45, status: 'good' },
        { group: 'A-', units: 12, status: 'low' },
        { group: 'B+', units: 38, status: 'good' },
        { group: 'B-', units: 8, status: 'critical' },
        { group: 'AB+', units: 15, status: 'low' },
        { group: 'AB-', units: 3, status: 'critical' },
        { group: 'O+', units: 52, status: 'good' },
        { group: 'O-', units: 18, status: 'low' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-purple-100">System overview and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="h-8 w-8 text-blue-600" />}
                    title="Total Users"
                    value={stats.totalUsers}
                    subtitle={`${stats.totalDonors} donors, ${stats.totalHospitals} hospitals`}
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<Droplet className="h-8 w-8 text-red-600" />}
                    title="Blood Requests"
                    value={stats.totalRequests}
                    subtitle={`${stats.pendingRequests} pending, ${stats.fulfilledRequests} fulfilled`}
                    color="bg-red-50"
                />
                <StatCard
                    icon={<Hospital className="h-8 w-8 text-green-600" />}
                    title="Active Hospitals"
                    value={stats.activeBloodBanks}
                    subtitle="Blood banks & hospitals"
                    color="bg-green-50"
                />
                <StatCard
                    icon={<Activity className="h-8 w-8 text-purple-600" />}
                    title="Total Donations"
                    value={stats.totalDonations}
                    subtitle="Lives saved: 1,701"
                    color="bg-purple-50"
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
                        {bloodGroupData.map((bg) => (
                            <BloodStockCard key={bg.group} {...bg} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>
                            Latest system activities and updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                            View All Activities
                        </Button>
                    </CardContent>
                </Card>

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
                            <QuickActionButton
                                icon={<Users className="h-5 w-5" />}
                                title="Manage Users"
                                description="Add, edit or remove users"
                                onClick={() => toast.info('User management coming soon')}
                            />
                            <QuickActionButton
                                icon={<Hospital className="h-5 w-5" />}
                                title="Manage Hospitals"
                                description="Verify hospital accounts"
                                onClick={() => toast.info('Hospital management coming soon')}
                            />
                            <QuickActionButton
                                icon={<Shield className="h-5 w-5" />}
                                title="AI Monitoring"
                                description="View AI predictions"
                                onClick={() => toast.info('AI monitoring coming soon')}
                            />
                            <QuickActionButton
                                icon={<TrendingUp className="h-5 w-5" />}
                                title="Analytics"
                                description="View detailed reports"
                                onClick={() => toast.info('Analytics coming soon')}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Health */}
            <Card>
                <CardHeader>
                    <CardTitle>System Health Status</CardTitle>
                    <CardDescription>
                        Real-time system monitoring
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            title="AI Service"
                            status="warning"
                            message="High load detected"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper Components
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

function BloodStockCard({ group, units, status }: any) {
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

function ActivityItem({ activity }: any) {
    const getActivityIcon = () => {
        switch (activity.type) {
            case 'donor': return <Users className="h-4 w-4 text-green-600" />;
            case 'hospital': return <Hospital className="h-4 w-4 text-blue-600" />;
            case 'request': return <Droplet className="h-4 w-4 text-red-600" />;
            case 'emergency': return <AlertCircle className="h-4 w-4 text-orange-600" />;
            default: return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon()}
                </div>
                <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">{activity.time}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function QuickActionButton({ icon, title, description, onClick }: any) {
    return (
        <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center space-y-1 hover:border-purple-500 hover:bg-purple-50"
            onClick={onClick}
        >
            {icon}
            <span className="font-medium text-sm">{title}</span>
            <span className="text-xs text-gray-500">{description}</span>
        </Button>
    );
}

function HealthStatus({ title, status, message }: any) {
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