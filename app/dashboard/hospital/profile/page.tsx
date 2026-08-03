// app/dashboard/hospital/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import {
  Mail,
  Phone,
  MapPin,
  Loader2,
  Save,
  Edit,
  X,
  Building2,
  Shield,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Division {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

export default function HospitalProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    division: '',
    district: '',
  });
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch divisions on mount
  useEffect(() => {
    fetchDivisions();
  }, []);

  // Fetch districts when division changes
  useEffect(() => {
    if (formData.division) {
      fetchDistricts(formData.division);
    } else {
      setDistricts([]);
    }
  }, [formData.division]);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        division: user.division || '',
        district: user.district || '',
      });
    }
  }, [user]);

  // Retry function for API calls
  const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, delay = 1000): Promise<Response> => {
    try {
      const response = await fetch(url, options);

      // If server is waking up (slow response), retry
      if (response.status === 408 || response.status === 503 || !response.ok) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
      }

      return response;
    } catch (error) {
      // Network errors, retry
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  const fetchDivisions = async (retryCount = 0) => {
    setLoadingDivisions(true);
    try {
      const response = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_API_URL}/api/divisions`
        // No Authorization header needed for divisions API
      );
      const data = await response.json();
      if (data.success) {
        setDivisions(data.divisions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch divisions');
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      if (retryCount < 2) {
        // Retry after 2 seconds
        setTimeout(() => fetchDivisions(retryCount + 1), 2000);
      } else {
        toast.error('Failed to load divisions. Please refresh the page.');
      }
    } finally {
      setLoadingDivisions(false);
    }
  };

  const fetchDistricts = async (divisionName: string, retryCount = 0) => {
    setLoadingDistricts(true);
    setDistricts([]);
    try {
      const response = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_API_URL}/api/divisions/${encodeURIComponent(divisionName)}/districts`
        // No Authorization header needed for districts API
      );
      const data = await response.json();
      if (data.success) {
        setDistricts(data.districts || []);
      } else {
        throw new Error(data.error || 'Failed to fetch districts');
      }
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      if (retryCount < 2) {
        // Retry after 2 seconds
        setTimeout(() => fetchDistricts(divisionName, retryCount + 1), 2000);
      } else {
        toast.error('Failed to load districts. Please try again.');
      }
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/hospitals/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: user?.id,
            ...formData
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      division: user?.division || '',
      district: user?.district || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-gray-900 font-medium">Profile</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Hospital Profile</h1>
            <p className="text-gray-500">
              Manage your hospital information
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold py-3 px-6 shadow-lg shadow-red-500/30 hover:scale-[1.01] transition-transform"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Overview Card */}
        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-red-200 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-4 ring-white/30">
              <span className="text-3xl font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">{user?.full_name || 'User'}</h2>
              <p className="text-red-100 mt-1">{user?.email || ''}</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                {user?.division && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    <Building2 className="h-3.5 w-3.5" />
                    {user.division}
                  </span>
                )}
                {user?.district && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.district}
                  </span>
                )}
                {user?.phone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    <Phone className="h-3.5 w-3.5" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <p className="text-sm text-gray-500 mt-0.5">Update your personal details</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Hospital Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Hospital Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20 ${!isEditing ? 'bg-gray-50' : ''}`}
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your hospital name"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-500"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className={`pl-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20 ${!isEditing ? 'bg-gray-50' : ''}`}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>

            {/* Division */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Division</Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {isEditing ? (
                  <Select
                    value={formData.division}
                    onValueChange={(value) => setFormData({ ...formData, division: value, district: '' })}
                    disabled={loadingDivisions}
                  >
                    <SelectTrigger className="pl-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20">
                      <SelectValue placeholder={loadingDivisions ? "Loading divisions..." : "Select your division"} />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((div) => (
                        <SelectItem key={div.id} value={div.name}>{div.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200"
                    value={formData.division || 'Not set'}
                    disabled
                  />
                )}
              </div>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">District</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {isEditing ? (
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                    disabled={!formData.division || loadingDistricts}
                  >
                    <SelectTrigger className="pl-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20">
                      <SelectValue placeholder={
                        !formData.division
                          ? "Select a division first"
                          : loadingDistricts
                            ? "Loading districts..."
                            : "Select your district"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((dist) => (
                        <SelectItem key={dist.id} value={dist.name}>{dist.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200"
                    value={formData.district || 'Not set'}
                    disabled
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}