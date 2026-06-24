// app/dashboard/donor/alerts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  AlertTriangle, 
  Droplet, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Loader2,
  CheckCircle,
  Bell,
  RefreshCw,
  XCircle,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  patient_name: string;
  blood_group: string;
  hospital: string;
  contact_person: string;
  contact_number: string;
  distance: string;
  time: string;
  status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export default function EmergencyAlertsPage() {
  const { user, token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/alerts?city=${user?.city || 'Dhaka'}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Alerts fetched:', data);
        setAlerts(data.alerts || []);
      } else {
        console.error('Failed to fetch alerts:', response.status);
        toast.error('Failed to load alerts');
        // Fallback mock data
        setAlerts([
          {
            id: '1',
            patient_name: 'Rahman Ahmed',
            blood_group: 'O-',
            hospital: 'Dhaka Medical Hospital',
            contact_person: 'Fatema Begum (Daughter)',
            contact_number: '01712345678',
            distance: '2.5 km',
            time: '5 min ago',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            patient_name: 'Karim Uddin',
            blood_group: 'A+',
            hospital: 'Square Hospital',
            contact_person: 'Jamal Hossain (Son)',
            contact_number: '01987654321',
            distance: '3.8 km',
            time: '15 min ago',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const respondToAlert = async (alertId: string) => {
    setRespondingId(alertId);
    try {
      console.log('Responding to alert:', alertId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emergency/respond/${alertId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ donor_id: user?.id })
        }
      );

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success('Response sent! They will contact you shortly.');
        // Update the alert status locally
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: 'matched', contact_person: '✅ Matched - Donor Found' }
              : alert
          )
        );
      } else {
        toast.error(data.error || 'Failed to respond');
      }
    } catch (error) {
      console.error('Respond error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  const callContact = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== 'N/A') {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error('Contact number not available');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
    toast.info('Alerts refreshed');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-red-600 text-white animate-pulse">🚨 EMERGENCY</Badge>;
      case 'matched':
        return <Badge className="bg-green-600 text-white">✅ Matched</Badge>;
      case 'fulfilled':
        return <Badge className="bg-blue-600 text-white">✓ Fulfilled</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-600 text-white">✗ Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>;
    }
  };

  // Sort: Pending first, then by time
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const matchedCount = alerts.filter(a => a.status === 'matched').length;
  const fulfilledCount = alerts.filter(a => a.status === 'fulfilled').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Alerts</h1>
          <p className="text-gray-500 mt-1">Urgent blood requests in your area</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
            <p className="text-xs text-gray-500">Matched</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{fulfilledCount}</p>
            <p className="text-xs text-gray-500">Fulfilled</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 text-gray-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-600">{alerts.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Alerts</h3>
            <p className="text-gray-500 text-sm">There are no emergency alerts in your area</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mt-4"
            >
              Check Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => {
            const isPending = alert.status === 'pending';
            const isMatched = alert.status === 'matched';
            const isFulfilled = alert.status === 'fulfilled';
            const isCancelled = alert.status === 'cancelled';
            
            return (
              <Card 
                key={alert.id} 
                className={`border-2 ${
                  isPending ? 'border-red-200' : 
                  isMatched ? 'border-green-200' : 
                  'border-gray-200'
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPending ? 'bg-red-100' : 
                        isMatched ? 'bg-green-100' : 
                        'bg-gray-100'
                      } ${isPending ? 'animate-pulse' : ''}`}>
                        <Droplet className={`h-6 w-6 ${
                          isPending ? 'text-red-600' : 
                          isMatched ? 'text-green-600' : 
                          'text-gray-500'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-gray-900">
                            Blood {alert.blood_group}
                          </span>
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="font-semibold text-gray-800">{alert.patient_name}</p>
                        <p className="text-sm text-gray-500">{alert.hospital}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {alert.distance} away
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {alert.time}
                          </span>
                          {isMatched && (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Donor Found
                            </span>
                          )}
                          {isFulfilled && (
                            <span className="text-blue-600 font-medium flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              Donation Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Action */}
                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                      {isPending && (
                        <Button 
                          onClick={() => respondToAlert(alert.id)}
                          disabled={respondingId === alert.id}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          {respondingId === alert.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              I Can Help
                            </>
                          )}
                        </Button>
                      )}

                      {isMatched && (
                        <Badge className="bg-green-100 text-green-700 px-3 py-1.5 text-sm w-full text-center">
                          <CheckCircle className="h-4 w-4 mr-1 inline" />
                          Already Responded
                        </Badge>
                      )}

                      {isFulfilled && (
                        <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5 text-sm w-full text-center">
                          <Heart className="h-4 w-4 mr-1 inline" />
                          Donation Complete
                        </Badge>
                      )}

                      {isCancelled && (
                        <Badge className="bg-gray-100 text-gray-700 px-3 py-1.5 text-sm w-full text-center">
                          <XCircle className="h-4 w-4 mr-1 inline" />
                          Cancelled
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  {!isCancelled && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500">Contact:</span>
                          <span className="font-medium text-gray-800 truncate">{alert.contact_person}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500">Phone:</span>
                          <button 
                            onClick={() => callContact(alert.contact_number)}
                            className="font-medium text-blue-600 hover:underline truncate"
                          >
                            {alert.contact_number}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Emergency Tips */}
      {alerts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 text-sm">Emergency Response Tips</h4>
                <p className="text-xs text-blue-700 mt-1">
                  • Call the contact number first to confirm requirements<br />
                  • Share your location with the hospital<br />
                  • Carry your ID and donor card when going to donate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}