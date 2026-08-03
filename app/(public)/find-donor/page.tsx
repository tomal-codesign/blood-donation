// app/(public)/find-donor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Droplet,
  MapPin,
  Search,
  Filter,
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
import PageHero from '@/components/shared/PageHero';
import { useRouter } from 'next/navigation';

// Blood groups data
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function FindDonorPage() {
  const [searchParams, setSearchParams] = useState({
    blood_group: '',
    division: '',
    district: ''
  });
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [filteredDonors, setFilteredDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
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
           location_lat: 23.8103, // Get from user's location or city center
           location_lng: 90.4125,
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-white">
      <PageHero
        eyebrow="AI-Powered Search"
        eyebrowIcon={Search}
        title={
          <>
            Find blood{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-orange-500">
              donors
            </span>
          </>
        }
        description="Search for blood donors in your area. Our AI helps find the most suitable and nearest donors."
        size="compact"
      />

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-10 relative z-10">
        {/* Search Form */}
        <Card className="mb-8 border border-gray-100 shadow-2xl shadow-gray-900/10 rounded-3xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Blood Group *</Label>
                <Select onValueChange={(value) => setSearchParams({ ...searchParams, blood_group: value })}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium mb-2 block">Division *</Label>
                <Select
                  onValueChange={(value) => setSearchParams({ ...searchParams, division: value, district: '' })}
                >
                  <SelectTrigger>
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
                <Label className="text-sm font-medium mb-2 block">District</Label>
                <Select
                  value={searchParams.district}
                  onValueChange={(value) => setSearchParams({ ...searchParams, district: value })}
                  disabled={!searchParams.division || loadingDistricts}
                >
                  <SelectTrigger>
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

            <div className="flex gap-3 mt-6">
              <Button type="button" onClick={handleSearch} className="flex-1 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-red-500/30 cursor-pointer hover:scale-[1.01] transition-transform" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredDonors.length} Donor{filteredDonors.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {searchParams.blood_group} blood group in {searchParams.district ? `${searchParams.district}, ` : ''}{searchParams.division}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for donors...</p>
              </div>
            ) : filteredDonors.length === 0 ? (
              <Card className="border border-gray-100 shadow-lg rounded-3xl">
                <CardContent className="text-center py-12">
                  <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Donors Found</h3>
                  <p className="text-gray-600 mb-4">
                    No {searchParams.blood_group} donors found in {searchParams.district ? `${searchParams.district}, ` : ''}{searchParams.division}.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Suggestions:</p>
                    <ul className="text-sm text-gray-500 list-disc list-inside">
                      <li>Try a nearby district</li>
                      <li>Check other divisions</li>
                      <li>Create a blood request instead</li>
                    </ul>
                  </div>
                  <Button type="button" variant="outline" className="mt-6 cursor-pointer" onClick={() => window.location.href = '/emergency'}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Create Emergency Request
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

        {/* Info Section */}
        {!searchPerformed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <InfoCard
              icon={<Heart className="h-6 w-6 text-white" />}
              color="from-red-500 to-rose-600"
              bg="from-red-50 to-rose-100"
              shadow="shadow-gray-500/20"
              title="Why Choose AI Matching?"
              description="Our AI finds the most suitable donors based on blood group, location, donation history, and availability."
            />
            <InfoCard
              icon={<MapPin className="h-6 w-6 text-white" />}
              color="from-red-500 to-rose-600"
              bg="from-red-50 to-rose-100"
              shadow="shadow-gray-500/20"
              title="Nearest Donors First"
              description="Donors are sorted by distance to ensure quick response times for emergencies."
            />
            <InfoCard
              icon={<Award className="h-6 w-6 text-white" />}
              color="from-red-500 to-rose-600"
              bg="from-red-50 to-rose-100"
              shadow="shadow-gray-500/20"
              title="Verified Donors"
              description="All donors are verified and their donation history is tracked for reliability."
            />
          </div>
        )}
      </div>
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
      className={`group cursor-pointer transition-all border bg-gradient-to-br from-red-50/70 to-rose-100/70 ${isSelected ? 'border-red-300 ring-2 ring-red-200 shadow-md shadow-gray-500/20' : 'border-white shadow-md shadow-gray-500/20 hover:border-transparent hover:shadow-xl hover:shadow-gray-900/10'
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

  return (
    <Card className="border border-white bg-gradient-to-br from-red-50/70 to-rose-100/70 shadow-xl shadow-gray-900/10 rounded-3xl">
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
        </div>
          <Button
            type="button"
            className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-lg shadow-red-500/30 cursor-pointer hover:scale-[1.01] transition-transform"
            onClick={(e) =>  router.push(`/login`)}
          >
            <Phone className="h-4 w-4 mr-2" />
            View Contact
          </Button>
      </CardContent>
    </Card>
  );
}

// Helper Components
function InfoCard({ icon, title, description, color, bg, shadow }: any) {
  return (
    <Card className={`group border border-white bg-gradient-to-br ${bg} shadow-md hover:border-transparent hover:shadow-xl ${shadow} transition-all`}>
      <CardContent className="text-center p-6">
        <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${color} mb-4 shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

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