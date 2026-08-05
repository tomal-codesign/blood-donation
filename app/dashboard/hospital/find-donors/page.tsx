// app/dashboard/hospital/find-donors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Droplet,
  MapPin,
  Search,
  X,
  Heart,
  Phone,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Sparkles,
  Hospital,
  Users,
  ShieldCheck,
  BadgeCheck,
  HeartPulse,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Blood groups data
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalFindDonorsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Initialize search params from logged-in user's profile
  const [searchParams, setSearchParams] = useState({
    blood_group: user?.blood_group || '',
    division: user?.division || '',
    district: user?.district || ''
  });
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [filteredDonors, setFilteredDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [requestedDonorIds, setRequestedDonorIds] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Load divisions once on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data.divisions || []))
      .catch(() => toast.error('Failed to load divisions'));
  }, []);

  // Load districts whenever the selected division changes
  useEffect(() => {
    if (!searchParams.division) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions/${encodeURIComponent(searchParams.division)}/districts`)
      .then(res => res.json())
      .then(data => setDistricts(data.districts || []))
      .catch(() => toast.error('Failed to load districts'))
      .finally(() => setLoadingDistricts(false));
  }, [searchParams.division]);

  const handleSearch = async () => {
    if (!searchParams.blood_group) {
      toast.error('Please select a blood group');
      return;
    }
    if (!searchParams.division) {
      toast.error('Please select a division');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      // Call the backend API for AI donor matching
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blood_group: searchParams.blood_group,
          division: searchParams.division,
          district: searchParams.district,
          location_lat: user?.location_lat || 23.8103, // Use user's saved location or city center
          location_lng: user?.location_lng || 90.4125,
          units_needed: 1
        })
      });

      const data = await response.json();

      if (response.ok) {
        const matches = data.matches || [];
        const filtered = availabilityFilter === 'all'
          ? matches
          : matches.filter((donor: any) => donor.is_available === (availabilityFilter === 'available'));
        setFilteredDonors(filtered);
      } else {
        toast.error(data.error || 'Failed to search for donors');
        setFilteredDonors([]);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setFilteredDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      blood_group: '',
      division: '',
      district: ''
    });
    setAvailabilityFilter('all');
    setSearchPerformed(false);
    setFilteredDonors([]);
    setSelectedDonor(null);
  };

  // Mark a donor as requested so the button stays disabled with "Requested" text
  const handleDonorRequested = (donorId: string) => {
    setRequestedDonorIds(prev => prev.includes(donorId) ? prev : [...prev, donorId]);
  };

  const getEligibilityStatus = (lastDonationDate: string) => {
    if (!lastDonationDate) return 'Eligible';
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 90) return 'Eligible';
    return `Not eligible until ${new Date(lastDonation.setDate(lastDonation.getDate() + 90)).toLocaleDateString()}`;
  };

  const getDonorTier = (donations: number) => {
    if (donations >= 10) return { label: 'Platinum Donor', icon: Award, color: 'from-violet-500 to-purple-600 shadow-purple-500/25' };
    if (donations >= 5) return { label: 'Gold Donor', icon: BadgeCheck, color: 'from-amber-400 to-yellow-500 shadow-amber-500/25' };
    if (donations >= 2) return { label: 'Silver Donor', icon: ShieldCheck, color: 'from-slate-400 to-gray-500 shadow-slate-500/25' };
    return { label: 'New Donor', icon: Sparkles, color: 'from-red-500 to-rose-600 shadow-red-500/25' };
  };

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
              AI-Powered Donor Search
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Find Donors</h1>
            <p className="text-blue-50 mt-1.5 text-sm sm:text-base max-w-md">
              Search for blood donors using AI-powered matching. Find the best matches for your patients!
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-none">
                <Hospital className="h-3 w-3 mr-1" />
                {user?.full_name?.split(' ')[0] || 'Hospital'}
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <Users className="h-3 w-3 mr-1" />
                {filteredDonors.length} Matches
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Search className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Search Filters</CardTitle>
              <CardDescription>Find donors that match your blood group and location</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold">Blood Group *</Label>
              <Select
                value={searchParams.blood_group}
                onValueChange={(value) => setSearchParams({ ...searchParams, blood_group: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">Division *</Label>
              <Select
                value={searchParams.division}
                onValueChange={(value) => setSearchParams({ ...searchParams, division: value, district: '' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map(division => (
                    <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold">District</Label>
              <Select
                value={searchParams.district}
                onValueChange={(value) => setSearchParams({ ...searchParams, district: value })}
                disabled={!searchParams.division || loadingDistricts}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={!searchParams.division ? 'Select division first' : loadingDistricts ? 'Loading...' : 'Select district'} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(district => (
                    <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <Label className="text-sm font-semibold">Availability</Label>
            <div className="flex gap-2 mt-1">
              {(['all', 'available', 'unavailable'] as const).map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={availabilityFilter === filter ? 'default' : 'outline'}
                  className={availabilityFilter === filter
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 shadow-md shadow-blue-500/20'
                    : 'text-gray-600 hover:text-gray-900'}
                  onClick={() => setAvailabilityFilter(filter)}
                >
                  {filter === 'all' ? 'All' : filter === 'available' ? 'Available' : 'Unavailable'}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 shadow-lg shadow-blue-500/25 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Donors
                </>
              )}
            </Button>
            {(searchPerformed || searchParams.blood_group || searchParams.division) && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {searchPerformed && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Searching...' : `${filteredDonors.length} Donor${filteredDonors.length !== 1 ? 's' : ''} Found`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {searchParams.blood_group} blood group in {searchParams.district ? `${searchParams.district}, ` : ''}{searchParams.division}
              </p>
            </div>
            {!loading && filteredDonors.length > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
                <Heart className="h-3 w-3 mr-1" />
                AI Matched Donors
              </Badge>
            )}
          </div>

          {loading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for donors...</p>
              </CardContent>
            </Card>
          ) : filteredDonors.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
              <CardContent className="text-center py-12">
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center border border-blue-100">
                    <Droplet className="h-10 w-10 text-blue-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Donors Found</h3>
                <p className="text-gray-500 mb-4">
                  No {searchParams.blood_group} donors found in {searchParams.district ? `${searchParams.district}, ` : ''}{searchParams.division}.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500">Suggestions:</p>
                  <ul className="text-sm text-gray-500 list-disc list-inside inline-block text-left">
                    <li>Try a nearby district</li>
                    <li>Check other divisions</li>
                    <li>Create a blood request instead</li>
                  </ul>
                </div>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/hospital/requests')}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Blood Requests
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDonors.map((donor) => (
                <DonorCard
                  key={donor.donor_id}
                  donor={donor}
                  isSelected={selectedDonor?.donor_id === donor.donor_id}
                  onSelect={() => setSelectedDonor(donor)}
                  isRequested={requestedDonorIds.includes(donor.donor_id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Donor Details Modal */}
      <Dialog open={!!selectedDonor} onOpenChange={(open) => !open && setSelectedDonor(null)}>
        <DialogContent className="max-w-md border-0 bg-transparent shadow-none p-0">
          {selectedDonor && (
            <DonorDetails
              donor={selectedDonor}
              getEligibilityStatus={getEligibilityStatus}
              requestedDonorIds={requestedDonorIds}
              onRequested={handleDonorRequested}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Impact Message */}
      {!searchPerformed && (
        <Card className="border-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-transparent shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">AI-Powered Matching</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Our AI finds the most suitable donors based on blood group, location, donation history, and availability.
                  Find the best match for your patients in seconds! 🏥
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Donor Card Component
function DonorCard({ donor, isSelected, onSelect, isRequested }: any) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getDonorTier = (donations: number) => {
    if (donations >= 10) return { label: 'Platinum Donor', icon: Award, color: 'from-violet-500 to-purple-600 shadow-purple-500/25' };
    if (donations >= 5) return { label: 'Gold Donor', icon: BadgeCheck, color: 'from-amber-400 to-yellow-500 shadow-amber-500/25' };
    if (donations >= 2) return { label: 'Silver Donor', icon: ShieldCheck, color: 'from-slate-400 to-gray-500 shadow-slate-500/25' };
    return { label: 'New Donor', icon: Sparkles, color: 'from-red-500 to-rose-600 shadow-red-500/25' };
  };

  const tier = getDonorTier(donor.total_donations || 0);
  const TierIcon = tier.icon;

  return (
    <Card
      className={`group cursor-pointer transition-all border-0 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg hover:shadow-gray-900/5 ${
        isSelected ? 'ring-2 ring-blue-200 shadow-md shadow-gray-500/20' : 'hover:border-transparent'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <span className="text-white font-bold text-lg">
                {donor.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              {donor.is_available && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{donor.name}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TierIcon className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-gray-500">{tier.label}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-none">
                  <Droplet className="h-3 w-3 mr-1" />
                  {donor.blood_group}
                </Badge>
                {donor.is_available ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600">
                    Unavailable
                  </Badge>
                )}
                {isRequested && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Requested
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {donor.score && (
            <div className={`px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(donor.score)}`}>
              {donor.score}% Match
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-3 w-3 mr-1" />
            {donor.division}, {donor.district}
          </div>
          <div className="flex items-center text-gray-600">
            <Award className="h-3 w-3 mr-1" />
            {donor.total_donations} donations
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-3 w-3 mr-1" />
            {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Donor Details Component
function DonorDetails({ donor, getEligibilityStatus, requestedDonorIds, onRequested }: any) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const requested = requestedDonorIds?.includes(donor.donor_id) || false;

  // Send a targeted donation request to this donor
  const handleRequestBlood = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setRequesting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors/request-donation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requester_id: user.id,
          donor_id: donor.donor_id,
          blood_group: donor.blood_group,
          units_needed: 1,
          hospital_name: user.full_name || 'Local Hospital',
          location_lat: user?.location_lat || 23.8103,
          location_lng: user?.location_lng || 90.4125,
          division: user?.division || '',
          district: user?.district || '',
          patient_condition: 'Hospital requesting blood donation',
          contact_phone: user.phone || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Mark this donor as requested so the button becomes disabled with "Requested" text
        onRequested?.(donor.donor_id);
        toast.success('Donation request sent! The donor will be notified.');
      } else {
        toast.error(data.error || 'Failed to send donation request');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const getDonorTier = (donations: number) => {
    if (donations >= 10) return { label: 'Platinum Donor', icon: Award, color: 'from-violet-500 to-purple-600 shadow-purple-500/25' };
    if (donations >= 5) return { label: 'Gold Donor', icon: BadgeCheck, color: 'from-amber-400 to-yellow-500 shadow-amber-500/25' };
    if (donations >= 2) return { label: 'Silver Donor', icon: ShieldCheck, color: 'from-slate-400 to-gray-500 shadow-slate-500/25' };
    return { label: 'New Donor', icon: Sparkles, color: 'from-red-500 to-rose-600 shadow-red-500/25' };
  };

  const tier = getDonorTier(donor.total_donations || 0);
  const TierIcon = tier.icon;

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-xl shadow-gray-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md shadow-blue-500/20">
            <User className="h-4 w-4 text-white" />
          </div>
          Donor Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto shadow-lg`}>
            <span className="text-white font-bold text-3xl">
              {donor.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            {donor.is_available && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            )}
          </div>
          <h3 className="text-xl font-semibold mt-3">{donor.name}</h3>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <TierIcon className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-gray-500">{tier.label}</span>
          </div>
          <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-none">
            <Droplet className="h-3 w-3 mr-1" />
            Blood Group {donor.blood_group}
          </Badge>
        </div>

        <div className="space-y-3">
          <DetailItem label="Total Donations" value={`${donor.total_donations} times`} icon={<Award className="h-4 w-4" />} />
          <DetailItem label="Last Donation" value={donor.last_donation_date || 'Never'} icon={<Calendar className="h-4 w-4" />} />
          <DetailItem label="Eligibility" value={getEligibilityStatus(donor.last_donation_date)} icon={<Clock className="h-4 w-4" />} />
          <DetailItem label="Location" value={`${donor.division}, ${donor.district}`} icon={<MapPin className="h-4 w-4" />} />
          <DetailItem label="Availability" value={donor.is_available ? 'Available' : 'Unavailable'} icon={<CheckCircle2 className="h-4 w-4" />} />
          {/* Contact info visible directly */}
          {donor.phone && (
            <a
              href={`tel:${donor.phone}`}
              className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors group"
            >
              <div className="flex items-center space-x-2">
                <div className="text-emerald-500">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm text-gray-600">Contact Number</span>
              </div>
              <span className="text-sm font-semibold text-emerald-700 group-hover:underline">
                {donor.phone}
              </span>
            </a>
          )}
        </div>

        <Button
          type="button"
          className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:opacity-90 shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-[1.01] transition-transform"
          onClick={handleRequestBlood}
          disabled={requesting || requested}
        >
          {requested ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Requested
            </>
          ) : requesting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending Request...
            </>
          ) : (
            <>
              <Droplet className="h-4 w-4 mr-2" />
              Request to Donate ({donor.blood_group})
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper Component
function DetailItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="text-gray-400">{icon}</div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}