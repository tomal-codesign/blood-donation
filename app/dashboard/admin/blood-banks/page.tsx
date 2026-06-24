// app/dashboard/admin/blood-banks/page.tsx
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
  Droplet, 
  Search, 
  Loader2,
  RefreshCw,
  Hospital,
  MapPin,
  Eye,
  Calendar,
  X,
  Building2,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface BloodBank {
  id: string;
  hospital_id: string;
  hospital_name: string;
  city: string;
  blood_group: string;
  units_available: number;
  updated_at: string;
}

interface HospitalDetail {
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

export default function AdminBloodBanksPage() {
  const { token } = useAuth();
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [filteredBloodBanks, setFilteredBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetail | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    filterBloodBanks();
  }, [searchTerm, filterBloodGroup, bloodBanks]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      
      const hospitalsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      let allBloodBanks: BloodBank[] = [];
      
      if (hospitalsRes.ok) {
        const hospitalsData = await hospitalsRes.json();
        const hospitals = hospitalsData.hospitals || [];
        
        for (const hospital of hospitals) {
          const inventoryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${hospital.id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (inventoryRes.ok) {
            const inventoryData = await inventoryRes.json();
            const inventory = inventoryData.inventory || [];
            
            const hospitalBanks = inventory.map((item: any) => ({
              id: item.id,
              hospital_id: hospital.id,
              hospital_name: hospital.full_name || 'Unknown Hospital',
              city: hospital.city || 'N/A',
              blood_group: item.blood_group,
              units_available: item.units_available,
              updated_at: item.updated_at || new Date().toISOString()
            }));
            
            allBloodBanks = [...allBloodBanks, ...hospitalBanks];
          }
        }
      } else {
        toast.error('Failed to load hospitals');
      }
      
      setBloodBanks(allBloodBanks);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      toast.error('Failed to load blood banks');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalDetails = async (hospitalId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hospitals/${hospitalId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setHospitalDetails(data.hospital);
        setShowHospitalDetails(true);
      } else {
        toast.error('Failed to load hospital details');
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      toast.error('Network error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const filterBloodBanks = () => {
    let filtered = [...bloodBanks];
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.blood_group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterBloodGroup !== 'all') {
      filtered = filtered.filter(b => b.blood_group === filterBloodGroup);
    }
    
    setFilteredBloodBanks(filtered);
  };

  const getStockStatus = (units: number) => {
    if (units >= 20) return { label: 'Good', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    if (units >= 10) return { label: 'Low', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle };
    return { label: 'Critical', color: 'bg-red-100 text-red-700', icon: AlertCircle };
  };

  const getStats = () => {
    const total = bloodBanks.length;
    const totalUnits = bloodBanks.reduce((sum, b) => sum + b.units_available, 0);
    const critical = bloodBanks.filter(b => b.units_available < 10).length;
    const hospitals = new Set(bloodBanks.map(b => b.hospital_id)).size;
    return { total, totalUnits, critical, hospitals };
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
          <h1 className="text-2xl font-bold text-gray-900">Blood Banks</h1>
          <p className="text-gray-500 mt-1">Monitor all blood banks across hospitals</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchBloodBanks}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Entries" value={stats.total} color="blue" />
        <StatsCard label="Total Units" value={stats.totalUnits} color="green" />
        <StatsCard label="Critical Stock" value={stats.critical} color="red" />
        <StatsCard label="Hospitals" value={stats.hospitals} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by hospital, city or blood group..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select 
            className="w-full px-4 py-2 border rounded-lg"
            value={filterBloodGroup}
            onChange={(e) => setFilterBloodGroup(e.target.value)}
          >
            {bloodGroups.map(bg => (
              <option key={bg} value={bg}>
                {bg === 'all' ? 'All Blood Groups' : bg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blood Bank List */}
      {filteredBloodBanks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No blood bank entries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBloodBanks.map((bank) => {
            const status = getStockStatus(bank.units_available);
            const StatusIcon = status.icon;
            const isSelected = selectedBank?.id === bank.id;
            
            return (
              <Card key={bank.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.color}`}>
                        <Droplet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-lg text-gray-900">{bank.blood_group}</span>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1 inline" />
                            {status.label}
                          </Badge>
                          <span className="text-sm font-medium text-gray-600">
                            {bank.units_available} units
                          </span>
                        </div>
                        <p className="font-medium text-gray-800">{bank.hospital_name}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {bank.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Updated: {new Date(bank.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedBank(isSelected ? null : bank);
                          if (!isSelected) {
                            fetchHospitalDetails(bank.hospital_id);
                          }
                        }}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Hospital Details Modal */}
      <Dialog open={showHospitalDetails} onOpenChange={setShowHospitalDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-purple-600" />
              Hospital Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the hospital and its blood bank
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : hospitalDetails ? (
            <div className="space-y-4">
              {/* Hospital Info */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{hospitalDetails.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={hospitalDetails.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {hospitalDetails.verified ? '✅ Verified' : '⏳ Unverified'}
                      </Badge>
                      <span className="text-sm text-gray-500">ID: {hospitalDetails.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailItem 
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={hospitalDetails.email || 'N/A'}
                />
                <DetailItem 
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={hospitalDetails.phone || 'N/A'}
                />
                <DetailItem 
                  icon={<MapPin className="h-4 w-4" />}
                  label="City"
                  value={hospitalDetails.city || 'N/A'}
                />
                <DetailItem 
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={hospitalDetails.address || 'N/A'}
                />
                <DetailItem 
                  icon={<Hospital className="h-4 w-4" />}
                  label="Registration Number"
                  value={hospitalDetails.registration_number || 'N/A'}
                />
                <DetailItem 
                  icon={<Droplet className="h-4 w-4" />}
                  label="Blood Bank License"
                  value={hospitalDetails.blood_bank_license || 'N/A'}
                />
                <DetailItem 
                  icon={<Calendar className="h-4 w-4" />}
                  label="Joined"
                  value={new Date(hospitalDetails.created_at).toLocaleDateString()}
                />
                <DetailItem 
                  icon={<Users className="h-4 w-4" />}
                  label="Status"
                  value={hospitalDetails.verified ? 'Active' : 'Pending Verification'}
                />
              </div>

              {/* Blood Bank Stock for this Hospital */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-red-500" />
                  Blood Stock
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {bloodBanks
                    .filter(b => b.hospital_id === hospitalDetails.id)
                    .map((bank) => (
                      <div key={bank.id} className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="font-bold text-sm">{bank.blood_group}</p>
                        <p className="text-lg font-bold text-blue-600">{bank.units_available}</p>
                        <p className="text-xs text-gray-500">units</p>
                      </div>
                    ))
                  }
                  {bloodBanks.filter(b => b.hospital_id === hospitalDetails.id).length === 0 && (
                    <p className="text-gray-500 text-sm col-span-4 text-center py-4">
                      No blood stock available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load hospital details
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