// app/dashboard/donor/find-donors/page.tsx
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
  CheckCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Blood groups data
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function FindDonorsPage() {
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

  const getEligibilityStatus = (lastDonationDate: string) => {
    if (!lastDonationDate) return 'Eligible';
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 90) return 'Eligible';
    return `Not eligible until ${new Date(lastDonation.setDate(lastDonation.getDate() + 90)).toLocaleDateString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Donors</h1>
        <p className="text-gray-500 mt-1">Search for blood donors using AI-powered matching in your area</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Find donors that match your blood group and location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Blood Group *</Label>
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
              <Label>Division *</Label>
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
              <Label>District</Label>
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
            <Label>Availability</Label>
            <div className="flex gap-2 mt-1">
              {(['all', 'available', 'unavailable'] as const).map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={availabilityFilter === filter ? 'default' : 'outline'}
                  className={availabilityFilter === filter
                    ? 'bg-red-600 hover:bg-red-700'
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
              className="flex-1 bg-red-600 hover:bg-red-700"
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
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for donors...</p>
              </CardContent>
            </Card>
          ) : filteredDonors.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
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
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/patient/new-request')}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Create Blood Request
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Donor Card Component
function DonorCard({ donor, isSelected, onSelect }: any) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card
      className={`group cursor-pointer transition-all border ${isSelected ? 'border-red-300 ring-2 ring-red-200 shadow-md shadow-gray-500/20' : 'border-gray-100 shadow-md shadow-gray-500/10 hover:border-transparent hover:shadow-xl hover:shadow-gray-900/10'
        }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-gray-500/20 group-hover:scale-110 transition-transform">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{donor.name}</h3>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none">
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
function DonorDetails({ donor, getEligibilityStatus }: any) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [requesting, setRequesting] = useState(false);

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
          hospital_name: user.city || 'Local Hospital',
          location_lat: user?.location_lat || 23.8103,
          location_lng: user?.location_lng || 90.4125,
          division: user?.division || '',
          district: user?.district || '',
          patient_condition: 'Requesting blood donation',
          contact_phone: user.phone || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
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

  return (
    <Card className="border border-gray-100 rounded-3xl shadow-xl shadow-gray-900/10">
      <CardHeader>
        <CardTitle>Donor Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-red-500/25">
            <User className="h-9 w-9 text-white" />
          </div>
          <h3 className="text-xl font-semibold mt-3">{donor.name}</h3>
          <Badge className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white border-none">
            <Droplet className="h-3 w-3 mr-1" />
            Blood Group {donor.blood_group}
          </Badge>
        </div>

        <div className="space-y-3">
          <DetailItem label="Total Donations" value={`${donor.total_donations} times`} icon={<Award className="h-4 w-4" />} />
          <DetailItem label="Last Donation" value={donor.last_donation_date || 'Never'} icon={<Calendar className="h-4 w-4" />} />
          <DetailItem label="Eligibility" value={getEligibilityStatus(donor.last_donation_date)} icon={<Clock className="h-4 w-4" />} />
          <DetailItem label="Location" value={`${donor.division}, ${donor.district}`} icon={<MapPin className="h-4 w-4" />} />
          <DetailItem label="Availability" value={donor.is_available ? 'Available' : 'Unavailable'} icon={<CheckCircle className="h-4 w-4" />} />
          {/* Contact info visible directly */}
          {donor.phone && (
            <a
              href={`tel:${donor.phone}`}
              className="flex items-center justify-between p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="flex items-center space-x-2">
                <div className="text-green-500">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm text-gray-600">Contact Number</span>
              </div>
              <span className="text-sm font-semibold text-green-700 group-hover:underline">
                {donor.phone}
              </span>
            </a>
          )}
        </div>

        <Button
          type="button"
          className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-red-500/30 cursor-pointer hover:scale-[1.01] transition-transform"
          onClick={handleRequestBlood}
          disabled={requesting}
        >
          {requesting ? (
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