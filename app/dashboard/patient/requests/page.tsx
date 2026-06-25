// app/dashboard/patient/requests/page.tsx
'use client';

import { useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
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
} from 'lucide-react';
import { format } from 'date-fns';

interface BloodRequest {
  id: string;
  blood_group: string;
  units_needed: number;
  priority: 'critical' | 'moderate' | 'normal';
  status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
  hospital_name: string;
  location_lat: number;
  location_lng: number;
  city: string;
  patient_condition: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  requester_id: string;
}

export default function PatientRequestsPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // New Request Form State
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    units_needed: 1,
    priority: 'normal',
    hospital_name: '',
    city: '',
    patient_condition: '',
    contact_phone: '',
    location_lat: 23.8103,
    location_lng: 90.4125,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];
  const priorities = ['normal', 'moderate', 'critical'];

  // ✅ Redirect to login if no user
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ✅ Fetch requests only when user is available
  useEffect(() => {
    if (user && !authLoading) {
      fetchRequests();
    }
  }, [user, authLoading]);

  // ✅ API Call: Get all requests for current user
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
      
      // ✅ 401 Unauthorized -> logout
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

  // ✅ API Call: Create new blood request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        units_needed: parseInt(formData.units_needed.toString()),
        requester_id: user?.id,
      };

      const response = await api.post('/api/requests', payload);
      
      if (response.data.success) {
        toast.success('Blood request created successfully!');
        setIsNewRequestOpen(false);
        resetForm();
        fetchRequests();
      } else {
        toast.error(response.data.message || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('Create request error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        logout();
        router.push('/login');
        return;
      }
      
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ API Call: Delete/Cancel request
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

  // ✅ API Call: Refresh requests
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
    toast.success('Requests refreshed');
  };

  const resetForm = () => {
    setFormData({
      blood_group: '',
      units_needed: 1,
      priority: 'normal',
      hospital_name: '',
      city: '',
      patient_condition: '',
      contact_phone: '',
      location_lat: 23.8103,
      location_lng: 90.4125,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: '⏳ Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      matched: { label: '🔄 Matched', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      fulfilled: { label: '✅ Fulfilled', className: 'bg-green-100 text-green-800 border-green-200' },
      cancelled: { label: '❌ Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string }> = {
      critical: { label: '🚨 CRITICAL', className: 'bg-red-600 text-white' },
      moderate: { label: '⚠️ MODERATE', className: 'bg-orange-500 text-white' },
      normal: { label: 'ℹ️ NORMAL', className: 'bg-blue-500 text-white' },
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.blood_group.includes(searchTerm.toUpperCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Format date safely
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

  // ✅ Loading state
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="mt-4 text-gray-500">Loading user...</p>
      </div>
    );
  }

  // ✅ If no user, return null (will redirect)
  if (!user) {
    return null;
  }

  // ✅ Data loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
        <p className="mt-4 text-gray-500">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Blood Requests</h2>
          <p className="text-gray-500">Track and manage your blood requests</p>
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
          <Button
            onClick={() => setIsNewRequestOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard label="Total" value={requests.length} color="blue" />
        <StatusCard label="Pending" value={requests.filter(r => r.status === 'pending').length} color="yellow" />
        <StatusCard label="Matched" value={requests.filter(r => r.status === 'matched').length} color="blue" />
        <StatusCard label="Fulfilled" value={requests.filter(r => r.status === 'fulfilled').length} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by hospital, city, or blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Droplet className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-4">
                {requests.length === 0 
                  ? "You haven't created any blood requests yet." 
                  : "No requests match your search criteria."}
              </p>
              <Button onClick={() => setIsNewRequestOpen(true)} variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first request
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-red-600" />
                        {request.blood_group}
                      </div>
                    </TableCell>
                    <TableCell>{request.units_needed} unit{request.units_needed > 1 ? 's' : ''}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>{request.hospital_name}</TableCell>
                    <TableCell>{request.city || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(request.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === 'pending' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">New Blood Request</DialogTitle>
            <DialogDescription>
              Fill in the details to request blood for yourself or a patient
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_group">Blood Group *</Label>
                <Select
                  required
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="units_needed">Units Needed *</Label>
                <Input
                  id="units_needed"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.units_needed}
                  onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  required
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  required
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="hospital_name">Hospital Name *</Label>
                <Input
                  id="hospital_name"
                  placeholder="Enter hospital name"
                  required
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  placeholder="Enter phone number"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="patient_condition">Patient Condition</Label>
                <Textarea
                  id="patient_condition"
                  placeholder="Describe patient's condition (optional)"
                  value={formData.patient_condition}
                  onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewRequestOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the blood request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Blood Group</Label>
                  <p className="font-semibold flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-red-600" />
                    {selectedRequest.blood_group}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Units Needed</Label>
                  <p className="font-semibold">{selectedRequest.units_needed}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Priority</Label>
                  <div>{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Hospital</Label>
                  <p className="font-semibold flex items-center gap-2">
                    <HospitalIcon className="h-4 w-4 text-gray-400" />
                    {selectedRequest.hospital_name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">City</Label>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedRequest.city || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Contact</Label>
                  <p className="font-semibold">{selectedRequest.contact_phone || 'N/A'}</p>
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
            <DialogTitle>Cancel Request</DialogTitle>
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

// StatusCard Component
interface StatusCardProps {
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'red';
}

function StatusCard({ label, value, color }: StatusCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="p-4 text-center">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}