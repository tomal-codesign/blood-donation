// app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Users, Building2, User, Mail, Phone, MapPin, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('donor_patient'); // 'donor_patient' or 'hospital'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
    district: '',
    blood_group: '',
    address: '',
    registration_number: '',
    blood_bank_license: ''
  });

  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const currentRole = user.currentRole || user.roles?.[0] || 'donor';
      router.push(`/dashboard/${currentRole}`);
    }
  }, [user, router]);

  // Load divisions once on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data.divisions || []))
      .catch(() => toast.error('Failed to load divisions'));
  }, []);

  // Load districts whenever the selected division changes
  useEffect(() => {
    if (!formData.city) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions/${encodeURIComponent(formData.city)}/districts`)
      .then(res => res.json())
      .then(data => setDistricts(data.districts || []))
      .catch(() => toast.error('Failed to load districts'))
      .finally(() => setLoadingDistricts(false));
  }, [formData.city]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Get role based on user type
  const getRole = () => {
    return userType === 'donor_patient' ? 'donor' : 'hospital';
  };

  // Get description
  const getDescription = () => {
    if (userType === 'donor_patient') {
      return 'Register as a donor and automatically get patient access. You can donate blood and also request blood when needed.';
    }
    return 'Register as a hospital to manage blood inventory, requests, and donor list.';
  };

  // Get icon
  const getIcon = () => {
    if (userType === 'donor_patient') {
      return <Users className="h-5 w-5 text-red-500" />;
    }
    return <Building2 className="h-5 w-5 text-blue-500" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const role = getRole();
      const payload = {
        ...formData,
        role,
        ...(role === 'donor' && { blood_group: formData.blood_group })
      };

      // Remove empty fields
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === '') {
          delete payload[key as keyof typeof payload];
        }
      });

      console.log('Registration payload:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please login.');
        if (role === 'donor') {
          toast.info('💡 You also got Patient access automatically!');
        }
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(data.error || data.message || data.details || 'Registration failed');
        console.error('Registration error:', data);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex justify-center mb-8">
          <Image src="/logo-new.png" alt="PulseCoder" width={200} height={43} className="h-10 w-auto object-contain" priority />
        </Link>

        <Card className="border border-gray-100 shadow-2xl shadow-gray-900/10 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your account</CardTitle>
            <CardDescription className="text-gray-500">
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <Label className="text-sm font-semibold">Account Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setUserType('donor_patient')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      userType === 'donor_patient'
                        ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-100 shadow-md shadow-red-500/10'
                        : 'border-gray-200 hover:border-red-200'
                    }`}
                  >
                    <Users className={`h-6 w-6 mx-auto mb-2 ${userType === 'donor_patient' ? 'text-red-500' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${userType === 'donor_patient' ? 'text-red-600' : 'text-gray-700'}`}>
                      Donor / Patient
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Donate & Request Blood</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('hospital')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      userType === 'hospital'
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-100 shadow-md shadow-blue-500/10'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <Building2 className={`h-6 w-6 mx-auto mb-2 ${userType === 'hospital' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${userType === 'hospital' ? 'text-blue-600' : 'text-gray-700'}`}>
                      Hospital
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Manage Blood Bank</p>
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2">
                  {getIcon()}
                  <p className="text-xs text-gray-600">{getDescription()}</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label className="text-sm font-semibold">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    required
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-semibold">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label className="text-sm font-semibold">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Division & District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Division *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={(value) => setFormData({ ...formData, city: value, district: '' })}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map(division => (
                          <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">District</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                    disabled={!formData.city || loadingDistricts}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={!formData.city ? 'Pick division first' : loadingDistricts ? 'Loading...' : 'District'} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(district => (
                        <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Blood Group (for donor/patient) */}
              {userType === 'donor_patient' && (
                <div>
                  <Label className="text-sm font-semibold">Blood Group *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
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
              )}

              {/* Hospital Fields */}
              {userType === 'hospital' && (
                <>
                  <div>
                    <Label className="text-sm font-semibold">Address</Label>
                    <Input
                      placeholder="123, Hospital Road, Area"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Registration Number</Label>
                    <Input
                      placeholder="HOSP-2024-001"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Blood Bank License</Label>
                    <Input
                      placeholder="BB-2024-001"
                      value={formData.blood_bank_license}
                      onChange={(e) => setFormData({ ...formData, blood_bank_license: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <Label className="text-sm font-semibold">Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
              </div>

              {/* Benefits */}
              <div className={`p-3 rounded-xl border ${
                userType === 'donor_patient'
                  ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-100'
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100'
              }`}>
                <p className="text-xs font-medium text-gray-700">
                  {userType === 'donor_patient'
                    ? 'As a donor, you can donate blood and also request blood as a patient. Both roles will be available.'
                    : 'As a hospital, you can manage blood inventory, view requests, and access donor lists.'}
                </p>
              </div>

              <Button
                type="submit"
                className={`w-full text-white font-semibold py-6 cursor-pointer shadow-lg hover:scale-[1.01] transition-transform ${
                  userType === 'donor_patient'
                    ? 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 shadow-red-500/30'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 shadow-blue-500/30'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register as {userType === 'donor_patient' ? 'Donor / Patient' : 'Hospital'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Already have an account?</span>{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}