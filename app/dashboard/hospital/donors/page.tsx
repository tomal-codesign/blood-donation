// app/dashboard/hospital/donors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Droplet,
  Search,
  Loader2,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Donor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  blood_group: string;
  is_available: boolean;
  total_donations: number;
  last_donation_date: string | null;
  created_at: string;
  donated_to_hospital: boolean;
  donation_count: number;
}

type StatColorType = 'blue' | 'green' | 'red' | 'purple';

const statColors: Record<StatColorType, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700'
};

export default function HospitalDonorsPage() {
  const { user, token } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [searchTerm, filterBloodGroup, donors]);

  const fetchDonors = async () => {
    try {
      // ✅ NEW: Fetch donors directly from hospital API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/hospitals/donors/${user?.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
      } else {
        // Fallback mock data
        setDonors([
          {
            id: '1',
            full_name: 'Rahman Ahmed',
            email: 'rahman@example.com',
            phone: '01712345678',
            city: 'Dhaka',
            blood_group: 'O+',
            is_available: true,
            total_donations: 5,
            last_donation_date: '2024-05-15',
            created_at: '2024-01-01',
            donated_to_hospital: true,
            donation_count: 3
          },
          {
            id: '2',
            full_name: 'Fatema Begum',
            email: 'fatema@example.com',
            phone: '01812345678',
            city: 'Dhaka',
            blood_group: 'A+',
            is_available: true,
            total_donations: 3,
            last_donation_date: '2024-04-20',
            created_at: '2024-02-15',
            donated_to_hospital: true,
            donation_count: 2
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast.error('Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
    setRefreshing(false);
    toast.success('Donor list refreshed');
  };

  const filterDonors = () => {
    let filtered = [...donors];

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone?.includes(searchTerm)
      );
    }

    if (filterBloodGroup !== 'all') {
      filtered = filtered.filter(d => d.blood_group === filterBloodGroup);
    }

    setFilteredDonors(filtered);
  };

  const getBloodGroupColor = (bg: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-700',
      'A-': 'bg-red-50 text-red-600',
      'B+': 'bg-blue-100 text-blue-700',
      'B-': 'bg-blue-50 text-blue-600',
      'AB+': 'bg-purple-100 text-purple-700',
      'AB-': 'bg-purple-50 text-purple-600',
      'O+': 'bg-green-100 text-green-700',
      'O-': 'bg-green-50 text-green-600'
    };
    return colors[bg] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-900">Hospital Donors</h1>
          <p className="text-gray-500 mt-1">Donors who have donated to your hospital</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge label="Total Donors" value={donors.length} color="blue" />
        <StatBadge label="Available" value={donors.filter(d => d.is_available).length} color="green" />
        <StatBadge label="Total Donations" value={donors.reduce((sum, d) => sum + d.donation_count, 0)} color="purple" />
        <StatBadge label="Active" value={donors.filter(d => d.total_donations > 0).length} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email or phone..."
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

      {/* Donor List */}
      {filteredDonors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No donors found for your hospital</p>
            <p className="text-sm text-gray-400 mt-1">Donors who donate to your hospital will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{donor.full_name || 'Unknown'}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={getBloodGroupColor(donor.blood_group)}>
                        <Droplet className="h-3 w-3 mr-1" />
                        {donor.blood_group || 'N/A'}
                      </Badge>
                      {donor.is_available ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {donor.donation_count || 0} donations
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{donor.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{donor.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{donor.city || 'N/A'}</span>
                  </div>
                </div>

                {donor.last_donation_date && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last donation: {new Date(donor.last_donation_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// StatBadge Component with proper typing
interface StatBadgeProps {
  label: string;
  value: number;
  color: StatColorType;
}

function StatBadge({ label, value, color }: StatBadgeProps) {
  return (
    <Card className={statColors[color]}>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs">{label}</p>
      </CardContent>
    </Card>
  );
}