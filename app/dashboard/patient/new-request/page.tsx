// app/dashboard/patient/new-request/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  MapPin,
  Phone,
  User,
  AlertCircle,
  Calendar,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function NewRequestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    units_needed: 1,
    priority: 'normal',
    hospital_name: '',
    city: '',
    patient_condition: '',
    contact_phone: '',
    location_lat: 23.8103,
    location_lng: 90.4125,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];
  const priorities = ['normal', 'moderate', 'critical'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
        units_needed: parseInt(formData.units_needed.toString()),
        requester_id: user?.id,
      };

      const response = await api.post('/api/requests', payload);
      
      if (response.data.success) {
        toast.success('Blood request created successfully! 🎉');
        // ✅ Redirect to My Requests page after successful creation
        router.push('/dashboard/patient/requests');
      } else {
        toast.error(response.data.message || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('Create request error:', error);
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        router.push('/login');
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patient/requests">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to My Requests
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Blood Request</h1>
          <p className="text-gray-500 text-sm">Request blood for yourself or a patient</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-red-600" />
            Request Details
          </CardTitle>
          <CardDescription>
            Fill in the details below to request blood. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group & Units */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_group" className="text-sm font-semibold">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="units_needed" className="text-sm font-semibold">
                  Units Needed <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="units_needed"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.units_needed}
                  onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum 10 units per request</p>
              </div>
            </div>

            {/* Priority & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority" className="text-sm font-semibold">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p === 'critical' && '🔴 '}
                        {p === 'moderate' && '🟠 '}
                        {p === 'normal' && '🔵 '}
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-semibold">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="mt-1">
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
              <Label htmlFor="hospital_name" className="text-sm font-semibold">
                Hospital Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="hospital_name"
                  placeholder="Enter hospital name"
                  required
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <Label htmlFor="contact_phone" className="text-sm font-semibold">
                Contact Phone <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="contact_phone"
                  placeholder="Enter phone number"
                  required
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Patient Condition */}
            <div>
              <Label htmlFor="patient_condition" className="text-sm font-semibold">
                Patient Condition <span className="text-gray-400 text-xs">(Optional)</span>
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="patient_condition"
                  placeholder="Describe patient's condition (e.g., Surgery, Accident, Emergency)"
                  value={formData.patient_condition}
                  onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value })}
                  className="pl-10 min-h-[100px]"
                  rows={3}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formData.patient_condition?.toLowerCase().includes('surgery') || 
                 formData.patient_condition?.toLowerCase().includes('accident') ||
                 formData.patient_condition?.toLowerCase().includes('emergency')
                  ? '⚠️ This will be automatically set to CRITICAL priority'
                  : 'Provide details for better assistance'}
              </p>
            </div>

            {/* Location Info (Hidden) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.location_lat}
                  onChange={(e) => setFormData({ ...formData, location_lat: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.location_lng}
                  onChange={(e) => setFormData({ ...formData, location_lng: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                Request Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Blood Group:</span>
                  <span className="font-medium ml-1">{formData.blood_group || 'Not selected'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Units:</span>
                  <span className="font-medium ml-1">{formData.units_needed}</span>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className="font-medium ml-1 capitalize">{formData.priority || 'Not selected'}</span>
                </div>
                <div>
                  <span className="text-gray-500">City:</span>
                  <span className="font-medium ml-1">{formData.city || 'Not selected'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Hospital:</span>
                  <span className="font-medium ml-1">{formData.hospital_name || 'Not entered'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Link href="/dashboard/patient/requests" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Request...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Droplet className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 text-sm">💡 Tips for Requesting Blood</h4>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Provide accurate blood group and units needed</li>
                <li>• Choose correct priority based on urgency</li>
                <li>• Include patient condition for better matching</li>
                <li>• Keep contact phone active for donor communication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}