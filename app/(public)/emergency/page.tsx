// app/(public)/emergency/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Droplet,
  Hospital,
  Phone,
  MapPin,
  Clock,
  Send,
  PhoneCall,
  Radio,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageHero from '@/components/shared/PageHero';
import { toast } from 'sonner';

// ── Edit page copy below ──────────────────────────────────────────────
const EMERGENCY_HOTLINE = '+880 1999 888777';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const units = ['1', '2', '3', '4', '5'];

// Approximate center coordinates per division — not stored in the DB,
// used only to fill location_lat/location_lng on submit.
const divisionCoords: Record<string, { lat: number; lng: number }> = {
  Dhaka: { lat: 23.8103, lng: 90.4125 },
  Chittagong: { lat: 22.3569, lng: 91.7832 },
  Khulna: { lat: 22.8456, lng: 89.5403 },
  Rajshahi: { lat: 24.3745, lng: 88.6042 },
  Sylhet: { lat: 24.8949, lng: 91.8687 },
  Barishal: { lat: 22.7010, lng: 90.3535 },
  Rangpur: { lat: 25.7439, lng: 89.2752 },
  Mymensingh: { lat: 24.7471, lng: 90.4203 },
};

const RESPONSE_STEPS = [
  {
    icon: Send,
    title: 'Alert broadcasted',
    description: 'Your request goes out instantly, tagged critical priority.',
    color: 'from-red-500 to-orange-500',
    bg: 'from-red-100 to-orange-100',
  },
  {
    icon: Radio,
    title: 'Donors notified',
    description: 'Matching, available donors nearby are notified within ~30 seconds.',
    color: 'from-amber-400 to-orange-500',
    bg: 'from-amber-100 to-orange-100',
  },
  {
    icon: UserCheck,
    title: 'Donor responds',
    description: 'A donor confirms and heads your way — usually within 15-30 minutes.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'from-emerald-100 to-teal-100',
  },
];
// ── End of editable copy ──────────────────────────────────────────────

export default function EmergencyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    hospital_name: '',
    division: '',
    district: '',
    contact_phone: '',
    patient_name: '',
    patient_condition: '',
    units_needed: '1',
  });
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load divisions once on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data.divisions || []))
      .catch(() => toast.error('Failed to load divisions'));
  }, []);

  // Load districts whenever the selected division changes
  useEffect(() => {
    if (!formData.division) {
      setDistricts([]);
      return;
    }

    setLoadingDistricts(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/divisions/${encodeURIComponent(formData.division)}/districts`)
      .then(res => res.json())
      .then(data => setDistricts(data.districts || []))
      .catch(() => toast.error('Failed to load districts'))
      .finally(() => setLoadingDistricts(false));
  }, [formData.division]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.blood_group || !formData.hospital_name || !formData.division || !formData.contact_phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const coords = divisionCoords[formData.division] ?? divisionCoords.Dhaka;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: formData.blood_group,
          hospital_name: formData.hospital_name,
          location_lat: coords.lat,
          location_lng: coords.lng,
          city: formData.division,
          district: formData.district,
          contact_phone: formData.contact_phone,
          // Backend stores this single field as the request's displayed reason —
          // combine name + condition so neither is silently dropped.
          patient_name: [formData.patient_name, formData.patient_condition].filter(Boolean).join(' — ') || 'Emergency',
          units_needed: parseInt(formData.units_needed),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🚨 Emergency alert sent! Donors have been notified.');
        setTimeout(() => {
          router.push('/find-donor');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to send emergency request');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-white">
      <PageHero
        variant="emergency"
        icon={AlertTriangle}
        title={
          <>
            Emergency blood{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-orange-500">
              request
            </span>
          </>
        }
        description="Immediate blood required? Fill out this form and we'll notify nearby donors instantly."
        size="compact"
      >
        <a href={`tel:${EMERGENCY_HOTLINE.replace(/\s/g, '')}`}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 hover:opacity-90 text-white shadow-xl shadow-red-500/30 cursor-pointer hover:scale-105 transition-transform text-base px-8"
          >
            <PhoneCall className="mr-2 h-5 w-5" />
            Or call the hotline: {EMERGENCY_HOTLINE}
          </Button>
        </a>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <Alert className="mb-8 border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            This is for EMERGENCY requests only. Please provide accurate information.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-100 shadow-xl shadow-red-500/5 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md shadow-red-500/30">
                    <Send className="h-4 w-4 text-white" />
                  </div>
                  Emergency Blood Request Form
                </CardTitle>
                <CardDescription>
                  Fill out all required fields. We'll immediately notify eligible donors in your area.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="blood_group">Blood Group Required *</Label>
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

                    <div>
                      <Label htmlFor="units_needed">Units Needed *</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, units_needed: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(u => (
                            <SelectItem key={u} value={u}>{u} unit{u !== '1' ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hospital_name">Hospital Name *</Label>
                    <div className="relative mt-1">
                      <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="hospital_name"
                        placeholder="e.g., Dhaka Medical College Hospital"
                        className="pl-10"
                        value={formData.hospital_name}
                        onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="division">Division *</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select
                          onValueChange={(value) => setFormData({ ...formData, division: value, district: '' })}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select division" />
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
                      <Label htmlFor="district">District</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) => setFormData({ ...formData, district: value })}
                        disabled={!formData.division || loadingDistricts}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={!formData.division ? 'Select division first' : loadingDistricts ? 'Loading...' : 'Select district'} />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map(district => (
                            <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact_phone">Contact Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="e.g., 017XXXXXXXX"
                        className="pl-10"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="patient_name">Patient Name</Label>
                    <Input
                      id="patient_name"
                      placeholder="Patient's full name"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="patient_condition">Patient Condition / Reason</Label>
                    <Textarea
                      id="patient_condition"
                      placeholder="e.g., Surgery, Accident, Thalassemia, etc."
                      value={formData.patient_condition}
                      onChange={(e) => setFormData({ ...formData, patient_condition: e.target.value })}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Expected Response Time</p>
                        <p className="text-sm text-red-600">
                          We will notify donors within 30 seconds. Expected donor arrival: 15-30 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 hover:opacity-90 shadow-lg shadow-red-500/30 text-lg py-6 cursor-pointer hover:scale-[1.01] transition-transform"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Emergency Alert...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Send Emergency Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-gray-500 text-sm">
              <p>By submitting this form, you confirm that this is a genuine emergency.</p>
              <p className="mt-1">All donor notifications are sent immediately.</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20 h-fit">
            {/* Response timeline */}
            <Card className="border border-gray-100 shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-5">What happens next</h3>
                <div className="space-y-5">
                  {RESPONSE_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md shrink-0`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {index < RESPONSE_STEPS.length - 1 && (
                            <div className="w-px flex-1 bg-gray-200 my-1" />
                          )}
                        </div>
                        <div className="pb-1">
                          <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Hotline card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-6 text-center shadow-xl shadow-red-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                  <PhoneCall className="h-6 w-6 text-white animate-pulse" />
                </div>
                <p className="text-white font-bold text-lg">{EMERGENCY_HOTLINE}</p>
                <p className="text-red-50 text-xs mt-1">24/7 Emergency Hotline — call for immediate help</p>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every request is broadcast only to verified, eligible donors nearby.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
