// app/dashboard/donor/alerts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Droplet, Clock, MapPin, Phone, User, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: number;
  patient_name: string;
  blood_group: string;
  hospital: string;
  contact_person: string;
  contact_number: string;
  distance: string;
  time: string;
}

export default function EmergencyAlertsPage() {
  const { user, token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergency/alerts?city=${user?.city}`);
      if (response.ok) {
        const data = await response.json();
        if (data.alerts && data.alerts.length > 0) {
          setAlerts(data.alerts);
        } else {
          setAlerts(getMockAlerts());
        }
      } else {
        setAlerts(getMockAlerts());
      }
    } catch (error) {
      console.error('Error:', error);
      setAlerts(getMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const getMockAlerts = (): Alert[] => {
    return [
      {
        id: 1,
        patient_name: 'Rahman Ahmed',
        blood_group: 'O-',
        hospital: 'Dhaka Medical Hospital',
        contact_person: 'Fatema Begum (Daughter)',
        contact_number: '01712345678',
        distance: '2.5 km',
        time: '5 min ago'
      },
      {
        id: 2,
        patient_name: 'Karim Uddin',
        blood_group: 'A+',
        hospital: 'Square Hospital',
        contact_person: 'Jamal Hossain (Son)',
        contact_number: '01987654321',
        distance: '3.8 km',
        time: '15 min ago'
      },
      {
        id: 3,
        patient_name: 'Nasrin Akter',
        blood_group: 'B+',
        hospital: 'Labaid Hospital',
        contact_person: 'Shahin Alam (Husband)',
        contact_number: '01876543210',
        distance: '1.2 km',
        time: '25 min ago'
      }
    ];
  };

  const respondToAlert = async (alertId: number) => {
    setRespondingId(alertId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emergency/respond/${alertId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ donor_id: user?.id })
      });

      if (response.ok) {
        toast.success('Response sent! They will contact you shortly.');
        setAlerts(alerts.filter(a => a.id !== alertId));
      } else {
        toast.error('Failed to respond');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setRespondingId(null);
    }
  };

  const callContact = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== 'N/A') {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Alerts</h1>
          <p className="text-gray-500 mt-1">Urgent blood requests in your area</p>
        </div>
        {alerts.length > 0 && (
          <Badge variant="secondary" className="w-fit bg-red-50 text-red-600 border-red-200">
            {alerts.length} Active Alert{alerts.length !== 1 && 's'}
          </Badge>
        )}
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Alerts</h3>
            <p className="text-gray-500 text-sm">There are no emergency alerts in your area right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Emergency Ribbon */}
                <div className="bg-red-600 px-4 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-xs font-medium uppercase tracking-wide">Critical Emergency</span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Top Section: Blood Group & Action */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                        <Droplet className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-xl font-bold text-gray-900">{alert.blood_group}</span>
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-xs">
                            URGENT
                          </Badge>
                        </div>
                        <p className="text-gray-700 font-medium">{alert.patient_name}</p>
                        <p className="text-sm text-gray-500">{alert.hospital}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => respondToAlert(alert.id)}
                      disabled={respondingId === alert.id}
                      size="default"
                      className="bg-red-600 hover:bg-red-700 shadow-sm min-w-[120px]"
                    >
                      {respondingId === alert.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          I Can Help
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-gray-100 my-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-gray-500">Contact:</span>
                      <span className="text-gray-800 font-medium truncate">{alert.contact_person}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Phone className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-gray-500">Phone:</span>
                      <button
                        onClick={() => callContact(alert.contact_number)}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        {alert.contact_number}
                      </button>
                    </div>
                  </div>

                  {/* Footer Meta Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{alert.distance}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span>Awaiting response</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Info */}
      {alerts.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700 text-center">
            💡 When responding, please call the contact number first to confirm availability and location details.
          </p>
        </div>
      )}
    </div>
  );
}