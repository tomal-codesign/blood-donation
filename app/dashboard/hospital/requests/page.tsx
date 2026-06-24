// app/dashboard/hospital/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import {
    Package,
    Droplet,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    RefreshCw,
    Eye,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Define types
interface Request {
    id: string;
    blood_group: string;
    units_needed: number;
    patient_name: string;
    status: string;
    created_at: string;
    priority: string;
    hospital_name: string;
    requester_id: string;
}

type StatusColorType = 'blue' | 'yellow' | 'green' | 'red';

const statusColors: Record<StatusColorType, string> = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700'
};

export default function HospitalRequestsPage() {
    const { user, token } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
            } else {
                // Fallback mock data
                setRequests([
                    {
                        id: '1',
                        blood_group: 'O-',
                        units_needed: 2,
                        patient_name: 'Rahman Ahmed',
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        priority: 'critical',
                        hospital_name: user?.full_name || 'Hospital',
                        requester_id: 'user-1'
                    },
                    {
                        id: '2',
                        blood_group: 'A+',
                        units_needed: 1,
                        patient_name: 'Fatema Begum',
                        status: 'matched',
                        created_at: new Date(Date.now() - 3600000).toISOString(),
                        priority: 'moderate',
                        hospital_name: user?.full_name || 'Hospital',
                        requester_id: 'user-2'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchRequests();
        setRefreshing(false);
        toast.success('Requests refreshed');
    };

    const updateRequestStatus = async (requestId: string, status: string) => {
        setProcessingId(requestId);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            if (response.ok) {
                toast.success(`Request ${status} successfully`);
                await fetchRequests();
            } else {
                toast.error('Failed to update request');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.blood_group?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700">⏳ Pending</Badge>;
            case 'matched':
                return <Badge className="bg-blue-100 text-blue-700">🔄 Matched</Badge>;
            case 'fulfilled':
                return <Badge className="bg-green-100 text-green-700">✅ Fulfilled</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-700">❌ Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical':
                return <Badge className="bg-red-600 text-white">🚨 CRITICAL</Badge>;
            case 'moderate':
                return <Badge className="bg-orange-500 text-white">⚠️ MODERATE</Badge>;
            default:
                return <Badge className="bg-blue-500 text-white">ℹ️ NORMAL</Badge>;
        }
    };

    const getStatusCount = (status: string) => {
        return requests.filter(r => r.status === status).length;
    };

    // Helper function to get color for status card
    const getStatusColor = (label: string): StatusColorType => {
        switch (label) {
            case 'Total':
                return 'blue';
            case 'Pending':
                return 'yellow';
            case 'Matched':
                return 'blue';
            case 'Fulfilled':
                return 'green';
            default:
                return 'blue';
        }
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
                    <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
                    <p className="text-gray-500 mt-1">Manage all blood requests</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/dashboard/hospital/requests/new">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Status Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusCard label="Total" value={requests.length} color="blue" />
                <StatusCard label="Pending" value={getStatusCount('pending')} color="yellow" />
                <StatusCard label="Matched" value={getStatusCount('matched')} color="blue" />
                <StatusCard label="Fulfilled" value={getStatusCount('fulfilled')} color="green" />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by patient or blood group..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="matched">Matched</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-16">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No requests found</p>
                        <Link href="/dashboard/hospital/requests/new">
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Request
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredRequests.map((request) => (
                        <Card key={request.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <Droplet className="h-5 w-5 text-red-500" />
                                            <span className="text-lg font-bold text-gray-900">
                                                Blood {request.blood_group}
                                            </span>
                                            {getPriorityBadge(request.priority)}
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="font-medium text-gray-800">{request.patient_name || 'Patient'}</p>
                                        <p className="text-sm text-gray-500">{request.hospital_name}</p>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span>{request.units_needed} units needed</span>
                                            <span>•</span>
                                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {request.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => updateRequestStatus(request.id, 'matched')}
                                                    disabled={processingId === request.id}
                                                >
                                                    {processingId === request.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                                    onClick={() => updateRequestStatus(request.id, 'cancelled')}
                                                    disabled={processingId === request.id}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        {request.status === 'matched' && (
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                                onClick={() => updateRequestStatus(request.id, 'fulfilled')}
                                                disabled={processingId === request.id}
                                            >
                                                {processingId === request.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                )}
                                                Fulfill
                                            </Button>
                                        )}
                                        <Link href={`/dashboard/hospital/requests/${request.id}`}>
                                            <Button size="sm" variant="ghost">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// StatusCard Component with proper typing
interface StatusCardProps {
    label: string;
    value: number;
    color: StatusColorType;
}

function StatusCard({ label, value, color }: StatusCardProps) {
    return (
        <Card className={statusColors[color]}>
            <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs">{label}</p>
            </CardContent>
        </Card>
    );
}