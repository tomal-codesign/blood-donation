// app/dashboard/admin/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { 
  Package, 
  Droplet, 
  Search, 
  Loader2,
  RefreshCw,
  Eye,
  Calendar,
  MapPin,
  Hospital,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface RequestType {
  id: string;
  blood_group: string;
  units_needed: number;
  patient_name: string;
  hospital_name: string;
  city: string;
  priority: string;
  status: string;
  created_at: string;
  requester_id: string;
}

type StatsColorType = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

const statsColors: Record<StatsColorType, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-yellow-50 text-yellow-700'
};

export default function AdminRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, filterStatus, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        toast.error('Failed to load requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blood_group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">⏳ Pending</Badge>;
      case 'matched':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">🔄 Matched</Badge>;
      case 'fulfilled':
        return <Badge className="bg-green-100 text-green-700 border-green-200">✅ Fulfilled</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200">❌ Cancelled</Badge>;
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

  const getStats = () => {
    const total = requests.length;
    const pending = getStatusCount('pending');
    const matched = getStatusCount('matched');
    const fulfilled = getStatusCount('fulfilled');
    const cancelled = getStatusCount('cancelled');
    const critical = requests.filter(r => r.priority === 'critical').length;
    return { total, pending, matched, fulfilled, cancelled, critical };
  };

  const stats = getStats();

  const viewRequestDetails = async (requestId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSelectedRequest(data);
        setShowDetails(true);
      } else {
        toast.error('Failed to load request details');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Network error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ Approve Request (Pending → Matched)
  const approveRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'matched' })
        }
      );

      if (response.ok) {
        toast.success('Request approved successfully! Donor will be notified.');
        await fetchRequests();
        setShowDetails(false);
      } else {
        toast.error('Failed to approve request');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Cancel Request (Pending → Cancelled)
  const cancelRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'cancelled' })
        }
      );

      if (response.ok) {
        toast.success('Request cancelled successfully');
        await fetchRequests();
        setShowDetails(false);
      } else {
        toast.error('Failed to cancel request');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Mark as Fulfilled (Matched → Fulfilled)
  const fulfillRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'fulfilled' })
        }
      );

      if (response.ok) {
        toast.success('Request marked as fulfilled! 🎉');
        await fetchRequests();
        setShowDetails(false);
      } else {
        toast.error('Failed to mark as fulfilled');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ View Hospital
  const viewHospital = (hospitalName: string) => {
    setShowDetails(false);
    toast.info(`Navigating to ${hospitalName} dashboard`);
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
          <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-500 mt-1">View and manage all blood requests</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchRequests}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Total" value={stats.total} color="blue" />
        <StatsCard label="Pending" value={stats.pending} color="yellow" />
        <StatsCard label="Matched" value={stats.matched} color="blue" />
        <StatsCard label="Fulfilled" value={stats.fulfilled} color="green" />
        <StatsCard label="Cancelled" value={stats.cancelled} color="red" />
        <StatsCard label="Critical" value={stats.critical} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient, hospital, blood group or city..."
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
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Droplet className="h-5 w-5 text-red-500" />
                      <span className="text-lg font-bold text-gray-900">
                        Blood {request.blood_group}
                      </span>
                      {getPriorityBadge(request.priority)}
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                      <p className="font-medium text-gray-800 flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {request.patient_name || 'Patient'}
                      </p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Hospital className="h-3.5 w-3.5 text-gray-400" />
                        {request.hospital_name}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {request.city}
                      </p>
                      <p className="text-gray-500 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-gray-400" />
                        {request.units_needed} units needed
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(request.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewRequestDetails(request.id)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request Details Modal with Working Buttons */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-purple-600" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the blood request
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : selectedRequest ? (
            <div className="space-y-4">
              {/* Request Summary */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xl font-bold text-gray-900">
                        Blood {selectedRequest.blood_group}
                      </span>
                      {getPriorityBadge(selectedRequest.priority)}
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <p className="font-medium text-gray-800">
                      <User className="h-4 w-4 inline mr-1 text-gray-400" />
                      {selectedRequest.patient_name || 'Patient'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Request ID</p>
                    <p className="text-xs font-mono text-gray-400">{selectedRequest.id.slice(0, 12)}...</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem 
                  icon={<Hospital className="h-4 w-4" />}
                  label="Hospital"
                  value={selectedRequest.hospital_name}
                />
                <DetailItem 
                  icon={<MapPin className="h-4 w-4" />}
                  label="City"
                  value={selectedRequest.city}
                />
                <DetailItem 
                  icon={<Droplet className="h-4 w-4" />}
                  label="Blood Group"
                  value={selectedRequest.blood_group}
                />
                <DetailItem 
                  icon={<Package className="h-4 w-4" />}
                  label="Units Needed"
                  value={selectedRequest.units_needed.toString()}
                />
                <DetailItem 
                  icon={<User className="h-4 w-4" />}
                  label="Requester ID"
                  value={selectedRequest.requester_id ? selectedRequest.requester_id.slice(0, 12) + '...' : 'N/A'}
                />
                <DetailItem 
                  icon={<Calendar className="h-4 w-4" />}
                  label="Created At"
                  value={new Date(selectedRequest.created_at).toLocaleString()}
                />
                <DetailItem 
                  icon={<Clock className="h-4 w-4" />}
                  label="Status"
                  value={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                />
                <DetailItem 
                  icon={<AlertCircle className="h-4 w-4" />}
                  label="Priority"
                  value={selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                />
              </div>

              {/* Request Timeline */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Request Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Request Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedRequest.status === 'matched' && (
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Donor Matched</p>
                        <p className="text-xs text-gray-500">Donor found for this request</p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.status === 'fulfilled' && (
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Request Fulfilled</p>
                        <p className="text-xs text-gray-500">Blood donation completed</p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.status === 'cancelled' && (
                    <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Request Cancelled</p>
                        <p className="text-xs text-gray-500">Request was cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions with Working Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 flex-1"
                      onClick={() => approveRequest(selectedRequest.id)}
                      disabled={actionLoading === selectedRequest.id}
                    >
                      {actionLoading === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve Request
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 flex-1"
                      onClick={() => cancelRequest(selectedRequest.id)}
                      disabled={actionLoading === selectedRequest.id}
                    >
                      {actionLoading === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Cancel Request
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'matched' && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                    onClick={() => fulfillRequest(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                  >
                    {actionLoading === selectedRequest.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Mark as Fulfilled
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load request details
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// StatsCard Component
interface StatsCardProps {
  label: string;
  value: number;
  color: StatsColorType;
}

function StatsCard({ label, value, color }: StatsCardProps) {
  return (
    <Card className={statsColors[color]}>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs">{label}</p>
      </CardContent>
    </Card>
  );
}

// Detail Item Component
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}