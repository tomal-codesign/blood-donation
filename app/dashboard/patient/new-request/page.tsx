// app/dashboard/patient/new-request/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Droplet,
  MapPin,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Activity,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function NewRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Droplet className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
      </div>
    }>
      <NewRequestContent />
    </Suspense>
  );
}

function NewRequestContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: searchParams?.get('blood_group') || '',
    units_needed: 1,
    priority: 'normal',
    hospital_name: '',
    division: '',
    district: '',
    patient_condition: '',
    contact_phone: '',
    location_lat: 23.8103,
    location_lng: 90.4125,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Load divisions once on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data.divisions || []))
      .catch(() => toast.error('Failed to load divisions'));
  }, []);

  // Load districts when the selected division changes
  useEffect(() => {
    if (!formData.division) {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
      return;
    }

    setLoadingDistricts(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions/${encodeURIComponent(formData.division)}/districts`)
      .then(res => res.json())
      .then(data => setDistricts(data.districts || []))
      .catch(() => toast.error('Failed to load districts'))
      .finally(() => setLoadingDistricts(false));
  }, [formData.division]);

  const priorityInfo: Record<string, { label: string; icon: any; chip: string }> = {
    normal: { label: 'Normal', icon: ShieldCheck, chip: 'bg-blue-50 text-blue-700 border-blue-200' },
    moderate: { label: 'Moderate', icon: Activity, chip: 'bg-orange-50 text-orange-700 border-orange-200' },
    critical: { label: 'Critical', icon: AlertTriangle, chip: 'bg-red-50 text-red-700 border-red-200' },
  };

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
    if (!formData.division) {
      toast.error('Please select a division');
      return;
    }
    if (!formData.district) {
      toast.error('Please select a district');
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

  const isCriticalCondition =
    formData.patient_condition?.toLowerCase().includes('surgery') ||
    formData.patient_condition?.toLowerCase().includes('accident') ||
    formData.patient_condition?.toLowerCase().includes('emergency');

  const inputClass = "mt-1.5 h-11 rounded-xl border-gray-200 bg-white focus:border-red-400 focus:ring-red-400/20";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-6 sm:p-8 shadow-xl shadow-red-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Request Blood
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">New Blood Request</h1>
            <p className="text-red-50 mt-1.5 text-sm sm:text-base max-w-md">
              Request blood for yourself or a patient. Donors in your area will be notified.
            </p>
          </div>

          <Link href="/dashboard/patient/requests">
            <Button variant="outline" className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Requests
            </Button>
          </Link>
        </div>
      </div>

      {/* Form Card */}
      <Card className="overflow-hidden border-0 shadow-lg shadow-gray-900/5">
        <CardHeader className="bg-gradient-to-r from-red-50/50 to-transparent border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Droplet className="h-4 w-4 text-white" />
            </div>
            Blood Request Details
          </CardTitle>
          <CardDescription>
            Fill in the details below. Donors matching your blood group and location will be notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_group" className="text-sm font-semibold">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger className={`${inputClass} ${formData.blood_group ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <Droplet className={`h-4 w-4 mr-2 ${formData.blood_group ? 'text-red-500' : 'text-gray-400'}`} />
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
                  max="5"
                  required
                  value={formData.units_needed}
                  onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })}
                  className={`${inputClass} pl-10`}
                />
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Max 5 units per request
                </p>
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority" className="text-sm font-semibold">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                required
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className={inputClass}>
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">🔵 Normal</SelectItem>
                  <SelectItem value="moderate">🟠 Moderate</SelectItem>
                  <SelectItem value="critical">🔴 Critical (Emergency)</SelectItem>
                </SelectContent>
              </Select>
              {isCriticalCondition && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>"Surgery/Accident/Emergency" detected — this will be marked <strong>CRITICAL</strong> automatically</span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="division" className="text-sm font-semibold">
                  Division <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.division}
                  onValueChange={(value) => setFormData({ ...formData, division: value, district: '' })}
                >
                  <SelectTrigger className={inputClass}>
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district" className="text-sm font-semibold">
                  District <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                  disabled={!formData.division || loadingDistricts}
                >
                  <SelectTrigger className={`${inputClass} ${!formData.division ? 'opacity-50' : ''}`}>
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <SelectValue placeholder={!formData.division ? 'Select division first' : loadingDistricts ? 'Loading...' : 'Select district'} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hospital & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hospital_name" className="text-sm font-semibold">
                  Hospital Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="hospital_name"
                    placeholder="Enter hospital name"
                    required
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact_phone" className="text-sm font-semibold">
                  Contact Phone <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contact_phone"
                    placeholder="Enter phone number"
                    required
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Patient Condition */}
            <div>
              <Label htmlFor="patient_condition" className="text-sm font-semibold">
                Patient Condition <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="patient_condition"
                  placeholder="Describe patient's condition (e.g., Surgery, Accident, Emergency)"
                  value={formData.patient_condition}
                  onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value })}
                  className="pl-10 min-h-[90px] rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Link href="/dashboard/patient/requests" className="sm:w-1/3">
                <Button type="button" variant="outline" className="w-full h-11 rounded-xl border-gray-200 hover:border-red-200 hover:text-red-600">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25 font-semibold"
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

      {/* Priority Legend */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-sky-50/50 to-transparent shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 text-sm">Priority Guide</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="border bg-blue-50 text-blue-700 border-blue-200">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Normal — routine request
                </Badge>
                <Badge className="border bg-orange-50 text-orange-700 border-orange-200">
                  <Activity className="h-3 w-3 mr-1" />
                  Moderate — needs attention soon
                </Badge>
                <Badge className="border bg-red-50 text-red-700 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Critical — emergency help needed
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Info (Hidden) */}
      <div className="hidden">
        <Input
          type="number"
          step="0.0001"
          value={formData.location_lat}
          onChange={(e) => setFormData({ ...formData, location_lat: parseFloat(e.target.value) })}
        />
        <Input
          type="number"
          step="0.0001"
          value={formData.location_lng}
          onChange={(e) => setFormData({ ...formData, location_lng: parseFloat(e.target.value) })}
        />
      </div>
    </div>
  );
}