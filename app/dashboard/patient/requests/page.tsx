// app/dashboard/patient/requests/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    PlusCircle,
    Search,
    Filter,
    Eye,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MapPin,
    Calendar,
    Droplet,
    Hospital as HospitalIcon,
    Loader2,
    RefreshCw,
    AlertTriangle,
    Activity,
    Shield,
    Sparkles,
    Phone,
    FileText,
    HeartPulse,
    Building2,
    UserRound,
} from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BloodRequest {
    id: string;
    blood_group: string;
    units_needed: number;
    priority: 'critical' | 'moderate' | 'normal';
    status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
    hospital_name: string;
    location_lat: number;
    location_lng: number;
    division: string;
    district: string;
    patient_condition: string;
    contact_phone: string;
    created_at: string;
    updated_at: string;
    requester_id: string;
}

// Status config
const statusConfig: Record<string, { label: string; className: string; icon: any; dot: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, dot: 'bg-yellow-500' },
    matched: { label: 'Matched', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, dot: 'bg-green-500' },
    fulfilled: { label: 'Fulfilled', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, dot: 'bg-green-500' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, dot: 'bg-red-500' },
};

// Priority config
const priorityConfig: Record<string, { label: string; className: string; icon: any; border: string; glow: string }> = {
    critical: { label: 'CRITICAL', className: 'bg-red-600 text-white', icon: AlertTriangle, border: 'border-l-red-500', glow: 'shadow-red-500/20' },
    moderate: { label: 'MODERATE', className: 'bg-orange-500 text-white', icon: Activity, border: 'border-l-orange-400', glow: 'shadow-orange-500/20' },
    normal: { label: 'NORMAL', className: 'bg-blue-500 text-white', icon: Shield, border: 'border-l-blue-400', glow: 'shadow-blue-500/20' },
};

export default function PatientRequestsPage() {
    const { user, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && !authLoading) {
            fetchRequests();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    const fetchRequests = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/api/requests/my-requests');

            if (response.data.success) {
                setRequests(response.data.data || []);
            } else {
                toast.error(response.data.message || 'Failed to load requests');
                setRequests([]);
            }
        } catch (error: any) {
            console.error('Fetch requests error:', error);

            if (error.response?.status === 401) {
                toast.error('Your session has expired. Please login again.');
                logout();
                router.push('/login');
                return;
            }

            toast.error(error.response?.data?.message || 'Failed to load requests');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = async () => {
        if (!selectedRequest) return;

        try {
            const response = await api.delete(`/api/requests/${selectedRequest.id}`);

            if (response.data.success) {
                toast.success('Request cancelled successfully');
                setIsDeleteDialogOpen(false);
                setSelectedRequest(null);
                fetchRequests();
            } else {
                toast.error(response.data.message || 'Failed to cancel request');
            }
        } catch (error: any) {
            console.error('Delete request error:', error);

            if (error.response?.status === 401) {
                toast.error('Your session has expired. Please login again.');
                logout();
                router.push('/login');
                return;
            }

            toast.error(error.response?.data?.message || 'Failed to cancel request');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRequests();
        setRefreshing(false);
        toast.success('Requests refreshed');
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <Badge className={`${config.className} flex items-center gap-1 px-3 py-1 border`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const config = priorityConfig[priority] || priorityConfig.normal;
        const Icon = config.icon;
        return (
            <Badge className={`${config.className} flex items-center gap-1 px-3 py-1`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const filteredRequests = requests.filter((request) => {
    const matchesSearch =
        request.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.division?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.blood_group.includes(searchTerm.toUpperCase());

        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const emergencyCount = requests.filter(r => r.priority === 'critical').length;

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP pp');
        } catch {
            return 'Invalid date';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes} min ago`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            return formatDate(dateString);
        } catch {
            return 'Invalid date';
        }
    };

    // Derived stats
    const stats = useMemo(() => {
        const pending = requests.filter(r => r.status === 'pending').length;
        const matched = requests.filter(r => r.status === 'matched').length;
        const cancelled = requests.filter(r => r.status === 'cancelled').length;
        const critical = requests.filter(r => r.priority === 'critical').length;
        const totalUnits = requests.reduce((sum, r) => sum + (r.units_needed || 1), 0);
        return { total: requests.length, pending, matched, cancelled, critical, totalUnits };
    }, [requests]);

    // Sort: critical first, then pending
    const sortedRequests = useMemo(() => {
        const priorityOrder: Record<string, number> = { critical: 0, moderate: 1, normal: 2 };
        const statusOrder: Record<string, number> = { pending: 0, matched: 1, cancelled: 2 };
        return [...filteredRequests].sort((a, b) => {
            const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
            if (pDiff !== 0) return pDiff;
            return (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
        });
    }, [filteredRequests]);

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Droplet className="h-8 w-8 text-white animate-bounce" />
                    </div>
                </div>
                <p className="mt-5 text-gray-500 font-medium">Loading user...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Droplet className="h-8 w-8 text-white animate-bounce" />
                    </div>
                </div>
                <p className="mt-5 text-gray-500 font-medium">Loading your requests...</p>
                <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
                </div>
                <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-6 sm:p-8 shadow-xl shadow-red-500/20">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
                <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            Request Management
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Blood Requests</h1>
                        <p className="text-red-50 mt-1.5 text-sm sm:text-base max-w-md">
                            Track, manage, and monitor your blood requests in one place
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 hover:text-white"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Link href="/dashboard/patient/new-request">
                            <Button className="bg-white text-red-600 hover:bg-red-50 shadow-lg shadow-red-900/20 font-semibold">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Emergency Alert Banner */}
            {emergencyCount > 0 && (
                <Card className="border-l-4 border-l-red-500 border-red-100 bg-gradient-to-r from-red-50 to-orange-50/50 overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                                    <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-red-800">
                                    🚨 {emergencyCount} Emergency Request{emergencyCount > 1 ? 's' : ''} Pending
                                </p>
                                <p className="text-sm text-red-700">
                                    Critical blood requests need immediate attention. Donors have been notified.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{stats.totalUnits} units needed</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
                </Card>

                {/* Pending */}
                <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-yellow-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-yellow-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-0.5">{stats.pending}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">awaiting donors</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:scale-110 transition-transform">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-amber-400"></div>
                </Card>

                {/* Matched (Success) */}
                <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Matched</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.matched}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">donation successful</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                                <HeartPulse className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                </Card>

                {/* Cancelled */}
                <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Cancelled</p>
                                <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.cancelled}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">not completed</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                                <XCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by hospital, division, district, or blood group..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 h-11 rounded-xl border-gray-200">
                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40 h-11 rounded-xl border-gray-200">
                        <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="critical">🚨 Critical</SelectItem>
                        <SelectItem value="moderate">⚠️ Moderate</SelectItem>
                        <SelectItem value="normal">ℹ️ Normal</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary row */}
            {sortedRequests.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{sortedRequests.length}</span> request{sortedRequests.length !== 1 ? 's' : ''}
                        {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' ? ' (filtered)' : ''}
                    </p>
                    <Badge className="bg-red-50 text-red-600 border-red-100 px-3 py-1.5 gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        {stats.pending} Pending
                    </Badge>
                </div>
            )}

            {/* Requests List */}
            {sortedRequests.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
                    <CardContent className="py-16 text-center">
                        <div className="relative mx-auto w-20 h-20 mb-4">
                            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-60"></div>
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center border border-red-100">
                                <Droplet className="h-10 w-10 text-red-300" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
                        </h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                            {requests.length === 0
                                ? "You haven't created any blood requests yet. When you need blood, create a request and donors in your area will be notified."
                                : "No requests match your current search or filter criteria. Try adjusting them."}
                        </p>
                        {requests.length === 0 && (
                            <Link href="/dashboard/patient/new-request">
                                <Button className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Create your first request
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {sortedRequests.map((request) => {
                        const priority = priorityConfig[request.priority] || priorityConfig.normal;
                        const status = statusConfig[request.status] || statusConfig.pending;
                        const isCritical = request.priority === 'critical';

                        return (
                            <Card
                                key={request.id}
                                className={`group overflow-hidden border-l-4 ${priority.border} hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300 relative`}
                            >
                                <CardContent className="p-0">
                                    <div className="relative p-5 sm:p-6">
                                        <div className="flex items-start justify-between flex-wrap gap-3">
                                            {/* Left - Blood info */}
                                            <div className="flex items-start gap-4">
                                                <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${isCritical ? 'from-red-500 to-rose-600 shadow-red-500/30' : request.priority === 'moderate' ? 'from-orange-400 to-amber-500 shadow-orange-500/30' : 'from-rose-400 to-pink-600 shadow-pink-500/30'} flex items-center justify-center shadow-lg`}>
                                                    <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                                                    <Droplet className="h-7 w-7 text-white relative" />
                                                    {isCritical && (
                                                        <span className="absolute -inset-1 rounded-2xl bg-red-500/20 animate-ping"></span>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-xl font-bold text-gray-900">
                                                            {request.blood_group}
                                                        </span>
                                                        {getPriorityBadge(request.priority)}
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <p className="font-medium text-gray-700 flex items-center gap-1.5">
                                                        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{request.hospital_name}</span>
                                                    </p>

                                                    {/* Meta row */}
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                            {formatTimeAgo(request.created_at)}
                                                        </span>
                                                        {(request.division || request.district) && (
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                                {[request.district, request.division].filter(Boolean).join(', ')}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1.5">
                                                            <Droplet className="h-3.5 w-3.5 text-gray-400" />
                                                            {request.units_needed} unit{request.units_needed > 1 ? 's' : ''} needed
                                                        </span>
                                                        {request.patient_condition && (
                                                            <span className="flex items-center gap-1.5">
                                                                <HeartPulse className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="italic truncate max-w-[180px]">{request.patient_condition}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsViewDialogOpen(true);
                                                    }}
                                                    className="border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-600 hover:bg-red-50 font-medium"
                                                >
                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                    View
                                                </Button>
                                                {request.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status progress indicator */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                                <span className="font-medium uppercase tracking-wide">Request Progress</span>
                                                <span className="font-semibold text-gray-600">{status.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {['pending', 'matched'].map((step, idx) => {
                                                    const stepOrder: Record<string, number> = { pending: 0, matched: 1 };
                                                    const currentStep = stepOrder[request.status] ?? 0;
                                                    const isActive = idx <= currentStep;
                                                    const isCurrent = idx === currentStep;
                                                    const stepConfig = statusConfig[step];
                                                    const StepIcon = stepConfig.icon;
                                                    return (
                                                        <div key={step} className="flex items-center flex-1">
                                                            <div className={`flex items-center gap-1.5 ${isActive ? 'text-emerald-600' : 'text-gray-300'}`}>
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-emerald-100' : 'bg-gray-100'} ${isCurrent ? 'ring-2 ring-emerald-300' : ''}`}>
                                                                    <StepIcon className="h-3.5 w-3.5" />
                                                                </div>
                                                                <span className="text-[11px] font-medium capitalize hidden sm:inline">{step}</span>
                                                            </div>
                                                            {idx < 1 && (
                                                                <div className={`flex-1 h-0.5 mx-2 rounded-full ${idx < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* View Request Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Droplet className="h-5 w-5 text-red-600" />
                            Request Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed information about the blood request
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            {/* Summary header */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50/50 border border-red-100">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                                    <Droplet className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">Blood {selectedRequest.blood_group}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {getPriorityBadge(selectedRequest.priority)}
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-500">Units Needed</Label>
                                    <p className="font-semibold">{selectedRequest.units_needed} unit{selectedRequest.units_needed > 1 ? 's' : ''}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Contact</Label>
                                    <p className="font-semibold flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {selectedRequest.contact_phone || 'N/A'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-gray-500">Hospital</Label>
                                    <p className="font-semibold flex items-center gap-2">
                                        <HospitalIcon className="h-4 w-4 text-gray-400" />
                                        {selectedRequest.hospital_name}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Division</Label>
                                    <p className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {selectedRequest.division || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">District</Label>
                                    <p className="font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {selectedRequest.district || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Requester</Label>
                                    <p className="font-semibold flex items-center gap-2">
                                        <UserRound className="h-4 w-4 text-gray-400" />
                                        {user?.full_name || 'You'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-gray-500">Patient Condition</Label>
                                    <p className="text-gray-700">{selectedRequest.patient_condition || 'Not specified'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Created</Label>
                                    <p className="text-sm text-gray-600">
                                        {formatDateTime(selectedRequest.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Last Updated</Label>
                                    <p className="text-sm text-gray-600">
                                        {formatDateTime(selectedRequest.updated_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Cancel Request
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this blood request? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Keep Request
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRequest}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}