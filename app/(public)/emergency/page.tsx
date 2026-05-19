// app/(public)/emergency/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Droplet, Hospital, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function EmergencyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: '',
    hospital_name: '',
    location: '',
    contact_phone: '',
    patient_name: '',
    patient_condition: '',
    units_needed: '1',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const units = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.blood_group || !formData.hospital_name || !formData.contact_phone) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: formData.blood_group,
          hospital_name: formData.hospital_name,
          location_lat: 23.8103,
          location_lng: 90.4125,
          city: 'Dhaka',
          contact_phone: formData.contact_phone,
          patient_condition: formData.patient_condition || 'Emergency',
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Emergency Blood Request</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            Immediate blood required? Fill out this form and we'll notify nearby donors instantly.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <Alert className="mb-8 border-red-500 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            ⚠️ This is for EMERGENCY requests only. Please provide accurate information.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-red-600" />
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
                <Label htmlFor="hospital_name">Hospital / Location Name *</Label>
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

              <div>
                <Label htmlFor="location">Location Address *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="location"
                    placeholder="Full address with area, city"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
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

              <div className="bg-red-50 p-4 rounded-lg">
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
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
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

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>By submitting this form, you confirm that this is a genuine emergency.</p>
          <p className="mt-1">All donor notifications are sent immediately.</p>
        </div>
      </div>
    </div>
  );
}