// app/(public)/find-donor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Droplet, 
  MapPin, 
  Search, 
  Filter, 
  X, 
  Heart,
  Phone,
  Mail,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// Blood groups data
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

// Mock donors data (will be replaced with API call)
const mockDonors = [
  {
    id: '1',
    name: 'Rahman Ahmed',
    blood_group: 'O-',
    phone: '+880 1712 345678',
    email: 'rahman@example.com',
    city: 'Dhaka',
    location_lat: 23.8103,
    location_lng: 90.4125,
    distance_km: 2.5,
    is_available: true,
    total_donations: 12,
    last_donation_date: '2024-02-15',
    rating: 4.8,
    verified: true
  },
  {
    id: '2',
    name: 'Fatema Begum',
    blood_group: 'A+',
    phone: '+880 1812 345678',
    email: 'fatema@example.com',
    city: 'Dhaka',
    location_lat: 23.7900,
    location_lng: 90.4000,
    distance_km: 3.2,
    is_available: true,
    total_donations: 8,
    last_donation_date: '2024-03-01',
    rating: 4.5,
    verified: true
  },
  {
    id: '3',
    name: 'Karim Uddin',
    blood_group: 'B+',
    phone: '+880 1912 345678',
    email: 'karim@example.com',
    city: 'Dhaka',
    location_lat: 23.8200,
    location_lng: 90.4300,
    distance_km: 4.8,
    is_available: false,
    total_donations: 5,
    last_donation_date: '2024-01-10',
    rating: 4.2,
    verified: true
  },
  {
    id: '4',
    name: 'Nusrat Jahan',
    blood_group: 'AB-',
    phone: '+880 1612 345678',
    email: 'nusrat@example.com',
    city: 'Chittagong',
    location_lat: 22.3569,
    location_lng: 91.7832,
    distance_km: null,
    is_available: true,
    total_donations: 3,
    last_donation_date: '2024-02-28',
    rating: 4.0,
    verified: false
  },
  {
    id: '5',
    name: 'Hasan Mahmud',
    blood_group: 'O+',
    phone: '+880 1712 987654',
    email: 'hasan@example.com',
    city: 'Dhaka',
    location_lat: 23.8000,
    location_lng: 90.3900,
    distance_km: 1.8,
    is_available: true,
    total_donations: 15,
    last_donation_date: '2024-03-10',
    rating: 4.9,
    verified: true
  },
  {
    id: '6',
    name: 'Shamim Ahmed',
    blood_group: 'A-',
    phone: '+880 1812 987654',
    email: 'shamim@example.com',
    city: 'Dhaka',
    location_lat: 23.8150,
    location_lng: 90.4200,
    distance_km: 3.5,
    is_available: true,
    total_donations: 7,
    last_donation_date: '2024-02-20',
    rating: 4.3,
    verified: true
  }
];

export default function FindDonorPage() {
  const [searchParams, setSearchParams] = useState({
    blood_group: '',
    city: '',
    radius: 10
  });
  const [donors, setDonors] = useState<any[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Load donors on component mount
  useEffect(() => {
    // In production, fetch from API
    setDonors(mockDonors);
  }, []);

  const handleSearch = async () => {
    if (!searchParams.blood_group) {
      toast.error('Please select a blood group');
      return;
    }
    if (!searchParams.city) {
      toast.error('Please select a city');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      // Call your backend API for AI donor matching
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blood_group: searchParams.blood_group,
          city: searchParams.city,
          location_lat: 23.8103, // Get from user's location or city center
          location_lng: 90.4125,
          units_needed: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFilteredDonors(data.matches || []);
      } else {
        // Use mock filtering as fallback
        const filtered = donors.filter(donor => 
          donor.blood_group === searchParams.blood_group &&
          donor.city === searchParams.city &&
          (availabilityFilter === 'all' || donor.is_available === (availabilityFilter === 'available'))
        );
        
        // Sort by distance if available
        const sorted = filtered.sort((a, b) => {
          if (a.distance_km && b.distance_km) {
            return a.distance_km - b.distance_km;
          }
          return 0;
        });
        
        setFilteredDonors(sorted);
      }
    } catch (error) {
      // Fallback to mock data
      const filtered = donors.filter(donor => 
        donor.blood_group === searchParams.blood_group &&
        donor.city === searchParams.city &&
        (availabilityFilter === 'all' || donor.is_available === (availabilityFilter === 'available'))
      );
      setFilteredDonors(filtered);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      blood_group: '',
      city: '',
      radius: 10
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
            <Search className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Blood Donors</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for blood donors in your area. Our AI helps find the most suitable and nearest donors.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Blood Group *</Label>
                <Select onValueChange={(value) => setSearchParams({...searchParams, blood_group: value})}>
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
                <Label className="text-sm font-medium mb-2 block">City *</Label>
                <Select onValueChange={(value) => setSearchParams({...searchParams, city: value})}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium mb-2 block">Search Radius (km)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[searchParams.radius]}
                    onValueChange={(value) => setSearchParams({...searchParams, radius: value[0]})}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 km</span>
                    <span>{searchParams.radius} km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Filters Toggle */}
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Availability</Label>
                    <Select onValueChange={(value: any) => setAvailabilityFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All donors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Donors</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSearch} className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading}>
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
              {(searchPerformed || searchParams.blood_group || searchParams.city) && (
                <Button variant="outline" onClick={clearFilters}>
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredDonors.length} Donor{filteredDonors.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {searchParams.blood_group} blood group in {searchParams.city}
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                AI Matched
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for donors...</p>
              </div>
            ) : filteredDonors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Donors Found</h3>
                  <p className="text-gray-600 mb-4">
                    No {searchParams.blood_group} donors found in {searchParams.city}.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Suggestions:</p>
                    <ul className="text-sm text-gray-500 list-disc list-inside">
                      <li>Try expanding your search radius</li>
                      <li>Check nearby cities</li>
                      <li>Create a blood request instead</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="mt-6" onClick={() => window.location.href = '/emergency'}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Create Emergency Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donor Cards */}
                <div className="space-y-4">
                  {filteredDonors.map((donor, index) => (
                    <DonorCard
                      key={donor.id}
                      donor={donor}
                      isSelected={selectedDonor?.id === donor.id}
                      onSelect={() => setSelectedDonor(donor)}
                      rank={index + 1}
                    />
                  ))}
                </div>

                {/* Selected Donor Details */}
                {selectedDonor && (
                  <div className="lg:sticky lg:top-4 h-fit">
                    <DonorDetails
                      donor={selectedDonor}
                      onClose={() => setSelectedDonor(null)}
                      getEligibilityStatus={getEligibilityStatus}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!searchPerformed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <InfoCard
              icon={<Heart className="h-8 w-8 text-red-600" />}
              title="Why Choose AI Matching?"
              description="Our AI finds the most suitable donors based on blood group, location, donation history, and availability."
            />
            <InfoCard
              icon={<MapPin className="h-8 w-8 text-green-600" />}
              title="Nearest Donors First"
              description="Donors are sorted by distance to ensure quick response times for emergencies."
            />
            <InfoCard
              icon={<Award className="h-8 w-8 text-purple-600" />}
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
function DonorCard({ donor, isSelected, onSelect, rank }: any) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-red-500' : ''}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <User className="h-6 w-6 text-red-600" />
              </div>
              {rank === 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {rank}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                {donor.verified && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className="bg-red-100 text-red-800">
                  <Droplet className="h-3 w-3 mr-1" />
                  {donor.blood_group}
                </Badge>
                {donor.is_available ? (
                  <Badge className="bg-green-100 text-green-800">
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
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
            {donor.city}
          </div>
          {donor.distance_km && (
            <div className="flex items-center text-gray-600">
              <Navigation className="h-3 w-3 mr-1" />
              {donor.distance_km} km away
            </div>
          )}
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
function DonorDetails({ donor, onClose, getEligibilityStatus }: any) {
  const [showContact, setShowContact] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Donor Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <User className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mt-3">{donor.name}</h3>
          <Badge className="mt-1 bg-red-100 text-red-800">
            <Droplet className="h-3 w-3 mr-1" />
            Blood Group {donor.blood_group}
          </Badge>
        </div>

        <div className="space-y-3">
          <DetailItem label="Total Donations" value={`${donor.total_donations} times`} icon={<Award className="h-4 w-4" />} />
          <DetailItem label="Last Donation" value={donor.last_donation_date || 'Never'} icon={<Calendar className="h-4 w-4" />} />
          <DetailItem label="Eligibility" value={getEligibilityStatus(donor.last_donation_date)} icon={<Clock className="h-4 w-4" />} />
          <DetailItem label="Location" value={donor.city} icon={<MapPin className="h-4 w-4" />} />
          {donor.distance_km && (
            <DetailItem label="Distance" value={`${donor.distance_km} km from you`} icon={<Navigation className="h-4 w-4" />} />
          )}
        </div>

        {!showContact ? (
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => setShowContact(true)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Reveal Contact Info
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Phone Number</p>
              <p className="font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2 text-green-600" />
                {donor.phone}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                {donor.email}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast.success(`Request sent to ${donor.name}`);
                setShowContact(false);
              }}
            >
              <Heart className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper Components
function InfoCard({ icon, title, description }: any) {
  return (
    <Card>
      <CardContent className="text-center p-6">
        <div className="flex justify-center mb-4">{icon}</div>
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