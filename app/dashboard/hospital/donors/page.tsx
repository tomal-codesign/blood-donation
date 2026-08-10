// app/dashboard/hospital/donors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  HeartPulse,
  Award,
  Activity,
  TrendingUp,
  ShieldCheck,
  Gift,
  HandHeart,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Donor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  division: string;
  district: string;
  blood_group: string;
  is_available: boolean;
  total_donations: number;
  last_donation_date: string | null;
  created_at: string;
  donated_to_hospital: boolean;
  donation_count: number;
}

const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalDonorsPage() {
  const { user, token } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            division: 'Dhaka',
            district: 'Dhaka',
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
            division: 'Dhaka',
            district: 'Dhaka',
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

  const getDonorTier = (donations: number) => {
    if (donations >= 10) return { label: 'Platinum Donor', icon: Award, color: 'from-violet-500 to-purple-600 shadow-purple-500/25' };
    if (donations >= 5) return { label: 'Gold Donor', icon: BadgeCheck, color: 'from-amber-400 to-yellow-500 shadow-amber-500/25' };
    if (donations >= 2) return { label: 'Silver Donor', icon: ShieldCheck, color: 'from-slate-400 to-gray-500 shadow-slate-500/25' };
    return { label: 'New Donor', icon: Sparkles, color: 'from-red-500 to-rose-600 shadow-red-500/25' };
  };

  const totalDonations = donors.reduce((sum, d) => sum + (d.donation_count || 0), 0);
  const availableDonors = donors.filter(d => d.is_available).length;
  const activeDonors = donors.filter(d => d.total_donations > 0).length;
  const donationRate = donors.length > 0 ? Math.round((activeDonors / donors.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Users className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading your donor list...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 sm:p-8 shadow-xl shadow-blue-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>
        <div className="absolute bottom-6 right-40 w-8 h-8 bg-white/10 rounded-lg rotate-45"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Donor Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Hospital Donors</h1>
            <p className="text-blue-50 mt-1.5 text-sm sm:text-base max-w-md">
              Donors who have donated to your hospital. Build lasting relationships with your lifesavers!
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-none">
                <Users className="h-3 w-3 mr-1" />
                {donors.length} Donors
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <HeartPulse className="h-3 w-3 mr-1" />
                {totalDonations} Donations
              </Badge>
              {availableDonors > 0 && (
                <Badge className="bg-emerald-500/30 text-emerald-100 border-none">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {availableDonors} Available
                </Badge>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Donors */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Donors</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{donors.length}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">in your network</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        </Card>

        {/* Available */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Available</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">{availableDonors}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">ready to donate</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>

        {/* Total Donations */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Donations</p>
                <p className="text-2xl font-bold text-purple-600 mt-0.5">{totalDonations}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">to your hospital</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Gift className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-400"></div>
        </Card>

        {/* Donation Rate */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Donation Rate</p>
                <p className="text-2xl font-bold text-amber-600 mt-0.5">{donationRate}%</p>
                <p className="text-[11px] text-gray-400 mt-0.5">active donors</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email or phone..."
                className="pl-9 h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select onValueChange={setFilterBloodGroup} value={filterBloodGroup}>
                <SelectTrigger className="h-11 rounded-xl border-gray-200">
                  <Droplet className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="All Blood Groups" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map(bg => (
                    <SelectItem key={bg} value={bg}>
                      {bg === 'all' ? 'All Blood Groups' : bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donor List */}
      {filteredDonors.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
          <CardContent className="py-16 text-center">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-60"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center border border-blue-100">
                <Users className="h-10 w-10 text-blue-300" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No donors found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              {searchTerm || filterBloodGroup !== 'all'
                ? 'No donors match your search criteria. Try adjusting your filters.'
                : 'Donors who donate to your hospital will appear here.'}
            </p>
            {!searchTerm && filterBloodGroup === 'all' && (
              <Link href="/dashboard/hospital/find-donors">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 shadow-lg shadow-blue-500/25">
                  <Search className="h-4 w-4 mr-2" />
                  Find Donors
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonors.map((donor) => {
            const tier = getDonorTier(donor.donation_count || 0);
            const TierIcon = tier.icon;
            const isAvailable = donor.is_available;

            const location = [donor.district, donor.division].filter(Boolean).join(', ') || 'Location N/A';

            return (
              <Card
                key={donor.id}
                className={`group relative border-0 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 overflow-hidden rounded-2xl ${
                  isAvailable ? 'ring-1 ring-emerald-200/60' : 'ring-1 ring-gray-200/60'
                }`}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isAvailable ? 'from-emerald-400 via-teal-400 to-cyan-400' : 'from-gray-300 via-gray-400 to-gray-300'}`}></div>

                <CardContent className="p-4 pt-5">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-md`}>
                        <span className="text-white font-bold text-lg">
                          {donor.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        {isAvailable && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
                          {donor.full_name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <TierIcon className="h-3 w-3 text-amber-500 flex-shrink-0" />
                          <span className="text-[11px] text-amber-600 font-medium truncate">{tier.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Donation Count */}
                    <div className="flex-shrink-0 text-center">
                      <p className={`text-xl font-bold leading-none ${isAvailable ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {donor.donation_count || 0}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">donations</p>
                    </div>
                  </div>

                  {/* Blood Group & Status */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <Badge className={`border ${getBloodGroupColor(donor.blood_group)} font-bold gap-1 px-2 py-0.5 text-xs`}>
                      <Droplet className="h-3 w-3" />
                      {donor.blood_group || 'N/A'}
                    </Badge>
                    {isAvailable ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold gap-1 px-2 py-0.5 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Available
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-semibold gap-1 px-2 py-0.5 text-xs">
                        <XCircle className="h-3 w-3" />
                        Unavailable
                      </Badge>
                    )}
                    {donor.donated_to_hospital && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold gap-1 px-2 py-0.5 text-xs">
                        <HandHeart className="h-3 w-3" />
                        Donated Here
                      </Badge>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 rounded-lg bg-gray-50/80 border border-gray-100 px-3 py-2">
                    <div className="flex items-center gap-2 text-xs min-w-0">
                      <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{donor.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs min-w-0">
                      <Phone className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{donor.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Last Donation */}
                  {donor.last_donation_date && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 flex items-center gap-1 min-w-0 truncate">
                        <Calendar className="h-3 w-3 text-red-400 flex-shrink-0" />
                        <span className="font-medium text-gray-500 flex-shrink-0">Last:</span>
                        <span className="truncate">{new Date(donor.last_donation_date).toLocaleDateString()}</span>
                      </span>
                      <span className="text-gray-400 flex items-center gap-1 flex-shrink-0 ml-2">
                        <Activity className="h-3 w-3 text-blue-400" />
                        <span className="font-medium text-gray-500">{donor.total_donations || 0}</span>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Impact Message */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-transparent shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your Donor Network</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Your hospital has <span className="font-bold text-blue-600">{donors.length}</span> dedicated donor{donors.length !== 1 ? 's' : ''} who have made{' '}
                <span className="font-bold text-blue-600">{totalDonations}</span> donation{totalDonations !== 1 ? 's' : ''},
                helping save <span className="font-bold text-blue-600">{totalDonations * 3}</span> lives.
                Nurture these relationships! 🏥
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}