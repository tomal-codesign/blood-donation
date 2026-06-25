// app/dashboard/patient/emergency/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Droplet,
  Hospital,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin
} from 'lucide-react';

export default function EmergencyRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    hospital_name: '',
    city: '',
    contact_phone: '',
    patient_condition: '',
    location_lat: 23.8103,
    location_lng: 90.4125,
    patient_name: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.blood_group) {
      toast.error('Please select a blood group');
      return;
    }
    if (!formData.hospital_name) {
      toast.error('Please enter hospital name');
      return;
    }
    if (!formData.city) {
      toast.error('Please select a city');
      return;
    }
    if (!formData.contact_phone) {
      toast.error('Please enter contact phone');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        requester_id: user?.id,
        priority: 'critical',
      };

      const response = await api.post('/api/emergency', payload);
      
      if (response.data.success) {
        toast.success('🚨 Emergency request sent successfully! Donors have been notified.');
        router.push('/dashboard/patient/requests');
      } else {
        toast.error(response.data.message || 'Failed to create emergency request');
      }
    } catch (error: any) {
      console.error('Emergency request error:', error);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        router.push('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to create emergency request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Emergency Blood Request
          </h1>
          <p className="text-gray-500 text-sm">⚠️ Urgent - This request will be prioritized as CRITICAL</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-red-500 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-800">🚨 EMERGENCY REQUEST</h4>
              <p className="text-sm text-red-700">
                This is an emergency blood request. It will be marked as <span className="font-bold">CRITICAL</span> priority
                and nearby donors will be notified immediately. Please provide accurate information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-red-600" />
            Emergency Request Details
          </CardTitle>
          <CardDescription>
            Fill in the details below. All fields marked with * are required.
            <span className="block text-red-600 font-semibold mt-1">Priority: CRITICAL</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger className="mt-1 border-red-300 focus:ring-red-500">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="mt-1 border-red-300 focus:ring-red-500">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hospital Name */}
            <div>
              <Label className="text-sm font-semibold">
                Hospital Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-400" />
                <Input
                  placeholder="Enter hospital name"
                  required
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  className="pl-10 border-red-300 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <Label className="text-sm font-semibold">
                Contact Phone <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-400" />
                <Input
                  placeholder="Enter phone number (for donor contact)"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="pl-10 border-red-300 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Patient Name */}
            <div>
              <Label className="text-sm font-semibold">
                Patient Name <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter patient name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Patient Condition */}
            <div>
              <Label className="text-sm font-semibold">
                Patient Condition <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-red-400" />
                <Textarea
                  placeholder="Describe the emergency condition (e.g., Accident, Surgery, Severe bleeding)"
                  required
                  value={formData.patient_condition}
                  onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value })}
                  className="pl-10 min-h-[100px] border-red-300 focus:ring-red-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Request Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-red-700">Blood Group:</span>
                  <span className="font-bold ml-1 text-red-800">{formData.blood_group || 'Not selected'}</span>
                </div>
                <div>
                  <span className="text-red-700">Priority:</span>
                  <span className="font-bold ml-1 text-red-600">🚨 CRITICAL</span>
                </div>
                <div>
                  <span className="text-red-700">City:</span>
                  <span className="font-bold ml-1 text-red-800">{formData.city || 'Not selected'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-red-700">Hospital:</span>
                  <span className="font-bold ml-1 text-red-800">{formData.hospital_name || 'Not entered'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Link href="/dashboard/patient" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 animate-pulse"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Emergency Request...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Emergency Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Emergency Tips */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-800 text-sm">📋 Emergency Response Tips</h4>
              <ul className="text-xs text-red-700 mt-1 space-y-1">
                <li>• Keep your phone ready for donor calls</li>
                <li>• Have patient ID and medical records ready</li>
                <li>• Inform hospital staff about the emergency request</li>
                <li>• Stay near the hospital for quick response</li>
                <li>• Share location details with the hospital</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 text-sm">📍 Location Information</h4>
              <p className="text-xs text-blue-700 mt-1">
                Your location will be shared with nearby donors for faster response.
                Please ensure your location settings are accurate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}