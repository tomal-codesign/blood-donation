// app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Droplet, Loader2, Info, Users, Building2 } from 'lucide-react';
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
    blood_group: '',
    address: '',
    registration_number: '',
    blood_bank_license: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const currentRole = user.currentRole || user.roles?.[0] || 'donor';
      router.push(`/dashboard/${currentRole}`);
    }
  }, [user, router]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-8">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-full shadow-lg">
              <Droplet className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-500">
            Choose your account type
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
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'donor_patient'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
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
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'hospital'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
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
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
                {getIcon()}
                <p className="text-xs text-blue-700">{getDescription()}</p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label className="text-sm font-semibold">Full Name *</Label>
              <Input
                required
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm font-semibold">Email *</Label>
              <Input
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <Label className="text-sm font-semibold">Phone Number *</Label>
              <Input
                required
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* City */}
            <div>
              <Label className="text-sm font-semibold">City *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
            </div>

            {/* Benefits */}
            <div className={`p-3 rounded-lg border ${
              userType === 'donor_patient' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-xs font-medium">
                {userType === 'donor_patient' 
                  ? '✅ As a donor, you can donate blood and also request blood as a patient. Both roles will be available.' 
                  : '✅ As a hospital, you can manage blood inventory, view requests, and access donor lists.'}
              </p>
            </div>

            <Button 
              type="submit" 
              className={`w-full text-white font-semibold py-6 ${
                userType === 'donor_patient'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Register as ${userType === 'donor_patient' ? 'Donor / Patient' : 'Hospital'}`
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
  );
}