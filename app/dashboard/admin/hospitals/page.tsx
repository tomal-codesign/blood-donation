// app/dashboard/admin/hospitals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { 
  Hospital, 
  Search, 
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Calendar,
  Users,
  Droplet,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface HospitalType {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  registration_number: string;
  blood_bank_license: string;
  verified: boolean;
  created_at: string;
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

export default function AdminHospitalsPage() {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState<HospitalType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hospital_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    address: '',
    registration_number: '',
    blood_bank_license: '',
    verified: true
  });

  const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [searchTerm, filterVerified, hospitals]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals || []);
      } else {
        toast.error('Failed to load hospitals');
        setHospitals([]);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to load hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];
    
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterVerified !== 'all') {
      filtered = filtered.filter(h => h.verified === (filterVerified === 'verified'));
    }
    
    setFilteredHospitals(filtered);
  };

  const toggleVerification = async (hospitalId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals/${hospitalId}/verify`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ verified: !currentStatus })
        }
      );

      if (response.ok) {
        toast.success(`Hospital ${currentStatus ? 'unverified' : 'verified'} successfully`);
        await fetchHospitals();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update verification');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const deleteHospital = async (hospitalId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals/${hospitalId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Hospital deleted successfully');
        await fetchHospitals();
        setShowDeleteConfirm(false);
        setSelectedHospital(null);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete hospital');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.hospital_name,
            phone: formData.phone,
            city: formData.city,
            address: formData.address || '',
            registration_number: formData.registration_number || '',
            blood_bank_license: formData.blood_bank_license || '',
            verified: formData.verified,
            role: 'hospital'
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Hospital created successfully!');
        setDialogOpen(false);
        setFormData({
          hospital_name: '',
          email: '',
          password: '',
          phone: '',
          city: '',
          address: '',
          registration_number: '',
          blood_bank_license: '',
          verified: true
        });
        await fetchHospitals();
      } else {
        toast.error(data.message || 'Failed to create hospital');
      }
    } catch (error) {
      console.error('Error creating hospital:', error);
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStats = () => {
    const total = hospitals.length;
    const verified = hospitals.filter(h => h.verified).length;
    const unverified = hospitals.filter(h => !h.verified).length;
    return { total, verified, unverified };
  };

  const stats = getStats();

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
          <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-500 mt-1">Manage all registered hospitals</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchHospitals}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Plus className="h-4 w-4" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Hospital</DialogTitle>
                <DialogDescription>
                  Create a hospital account directly. The hospital will be able to login and manage their blood bank.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddHospital} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Hospital Name *</Label>
                    <Input
                      required
                      placeholder="Dhaka Medical Hospital"
                      value={formData.hospital_name}
                      onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Email *</Label>
                    <Input
                      type="email"
                      required
                      placeholder="hospital@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Password *</Label>
                    <Input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Phone *</Label>
                    <Input
                      required
                      placeholder="01712345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">City *</Label>
                    <Select 
                      value={formData.city} 
                      onValueChange={(value) => setFormData({...formData, city: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Address</Label>
                    <Input
                      placeholder="123, Hospital Road"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Registration Number</Label>
                    <Input
                      placeholder="HOSP-2024-001"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Blood Bank License</Label>
                    <Input
                      placeholder="BB-2024-001"
                      value={formData.blood_bank_license}
                      onChange={(e) => setFormData({...formData, blood_bank_license: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Checkbox 
                    id="verified" 
                    checked={formData.verified}
                    onCheckedChange={(checked) => setFormData({...formData, verified: checked as boolean})}
                  />
                  <Label htmlFor="verified" className="text-sm font-medium cursor-pointer">
                    Mark as Verified (Hospital can login immediately)
                  </Label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Hospital
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard label="Total Hospitals" value={stats.total} color="blue" />
        <StatsCard label="Verified" value={stats.verified} color="green" />
        <StatsCard label="Unverified" value={stats.unverified} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by hospital name, email or city..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select 
            className="w-full px-4 py-2 border rounded-lg"
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
          >
            <option value="all">All Hospitals</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Hospital List */}
      {filteredHospitals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Hospital className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hospitals found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-gray-900">{hospital.full_name}</p>
                        {hospital.verified ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {hospital.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {hospital.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {hospital.city}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>🏥 Reg: {hospital.registration_number || 'N/A'}</span>
                        <span>📋 License: {hospital.blood_bank_license || 'N/A'}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(hospital.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      variant={hospital.verified ? "outline" : "default"}
                      className={hospital.verified ? "" : "bg-green-600 hover:bg-green-700"}
                      onClick={() => toggleVerification(hospital.id, hospital.verified)}
                    >
                      {hospital.verified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
                      className="text-purple-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedHospital(hospital);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedHospital?.id === hospital.id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium">{hospital.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registration Number</p>
                        <p className="text-sm font-medium">{hospital.registration_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Blood Bank License</p>
                        <p className="text-sm font-medium">{hospital.blood_bank_license || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="text-sm font-medium">{new Date(hospital.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedHospital && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Hospital</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{selectedHospital.full_name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedHospital(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => deleteHospital(selectedHospital.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
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