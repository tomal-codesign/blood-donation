// app/dashboard/admin/hospitals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Sparkles,
  Shield,
  AlertTriangle,
  FileText,
  KeyRound,
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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Hospital className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading hospitals...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-purple-900/20 border border-white/10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-8 right-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full"></div>
        <div className="absolute bottom-12 right-1/2 w-2 h-2 bg-indigo-300/30 rounded-full"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              Hospital Management
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Manage Hospitals
            </h1>
            <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
              Verify, manage, and monitor all registered hospitals and blood banks.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Building2 className="h-3 w-3 mr-1.5" />
                {stats.total} Total
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <CheckCircle className="h-3 w-3 mr-1.5" />
                {stats.verified} Verified
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <XCircle className="h-3 w-3 mr-1.5" />
                {stats.unverified} Unverified
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchHospitals}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {stats.verified} verified hospitals
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard 
          label="Total Hospitals" 
          value={stats.total} 
          icon={<Building2 className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
          accent="bg-gradient-to-r from-blue-500 to-indigo-400"
          to="from-white to-blue-50/50"
        />
        <StatsCard 
          label="Verified" 
          value={stats.verified} 
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
          accent="bg-gradient-to-r from-emerald-500 to-teal-400"
          to="from-white to-emerald-50/50"
        />
        <StatsCard 
          label="Unverified" 
          value={stats.unverified} 
          icon={<XCircle className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/25"
          accent="bg-gradient-to-r from-amber-400 to-orange-400"
          to="from-white to-amber-50/50"
        />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by hospital name, email or city..."
                className="pl-9 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 bg-white"
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
              >
                <option value="all">All Hospitals</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hospital List */}
      {filteredHospitals.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
              <Hospital className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No hospitals found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="font-semibold text-gray-900 text-base">{hospital.full_name}</p>
                        {hospital.verified ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 border">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {hospital.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {hospital.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {hospital.city}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <FileText className="h-3 w-3" />
                          Reg: {hospital.registration_number || 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          <KeyRound className="h-3 w-3" />
                          License: {hospital.blood_bank_license || 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(hospital.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm"
                      variant={hospital.verified ? "outline" : "default"}
                      className={hospital.verified ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"}
                      onClick={() => toggleVerification(hospital.id, hospital.verified)}
                    >
                      {hospital.verified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
                      className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
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
                  <div className="mt-4 pt-4 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent rounded-xl p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm font-medium text-gray-900">{hospital.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Registration Number</p>
                        <p className="text-sm font-medium text-gray-900">{hospital.registration_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Blood Bank License</p>
                        <p className="text-sm font-medium text-gray-900">{hospital.blood_bank_license || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Joined</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(hospital.created_at).toLocaleDateString()}</p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Hospital</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedHospital.full_name}</span>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedHospital(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20"
                onClick={() => deleteHospital(selectedHospital.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  to: string;
}

function StatsCard({ label, value, icon, iconBg, accent, to }: StatsCardProps) {
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${to} hover:-translate-y-0.5`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`}></div>
    </Card>
  );
}