// app/dashboard/donor/donations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Droplet, 
  Calendar, 
  Clock, 
  MapPin, 
  Bell,
  Loader2,
  CheckCircle,
  X,
  Gift,
  Hospital,
  Phone,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface UpcomingRequest {
  id: string;
  blood_group: string;
  hospital_name: string;
  units_needed: number;
  priority: string;
  patient_condition: string;
  contact_phone: string;
  division: string;
  district: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone: string;
    division: string;
    district: string;
  };
}

export default function MyDonationsPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<UpcomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donors/upcoming?user_id=${user?.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.upcoming || []);
      } else {
        toast.error('Failed to load donation requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
    setActionLoading(requestId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: action === 'accept' ? 'matched' : 'cancelled'
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (action === 'accept') {
          toast.success('You accepted the donation request! The requester will contact you.');
        } else {
          toast.success('Donation request declined');
        }
        // Remove from list
        setRequests(requests.filter(r => r.id !== requestId));
      } else {
        toast.error(data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const callContact = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error('Contact number not available');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-600 text-white animate-pulse">🔴 CRITICAL</Badge>;
      case 'moderate':
        return <Badge className="bg-orange-100 text-orange-700">🟠 MODERATE</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700">🔵 NORMAL</Badge>;
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
          <p className="text-gray-500 mt-1">Manage incoming donation requests and upcoming donations</p>
        </div>
        <Badge className="bg-red-100 text-red-700 px-3 py-1">
          {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 opacity-75" />
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-sm opacity-75">Pending Requests</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 opacity-75" />
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-sm opacity-75">Awaiting Response</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-75" />
            <p className="text-2xl font-bold">Ready</p>
            <p className="text-sm opacity-75">You Can Donate</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation Request List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Donation Requests</h3>
            <p className="text-gray-500 text-sm mb-4">You don't have any pending donation requests right now</p>
            <Link href="/dashboard/donor/find-donors">
              <Button className="bg-red-600 hover:bg-red-700">
                Find Blood Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Status Bar */}
              <div className="h-1 bg-red-500"></div>
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  {/* Left Section */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Droplet className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-gray-900">
                          Blood {request.blood_group}
                        </span>
                        {getPriorityBadge(request.priority)}
                      </div>
                      <p className="font-medium text-gray-800 flex items-center gap-1">
                        <Hospital className="h-4 w-4 text-gray-400" />
                        {request.hospital_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(request.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {request.district || request.division || ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplet className="h-3.5 w-3.5" />
                          {request.units_needed} unit(s) needed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleRespond(request.id, 'accept')}
                      disabled={actionLoading === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRespond(request.id, 'decline')}
                      disabled={actionLoading === request.id}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>

                {/* Requester & Contact Info */}
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Requested by:</span>
                    <span className="font-medium text-gray-800">
                      {request.profiles?.full_name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">Phone:</span>
                    <button 
                      onClick={() => callContact(request.contact_phone || request.profiles?.phone || '')}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {request.contact_phone || request.profiles?.phone || 'N/A'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Health Tips */}
      <Card className="bg-amber-50 border-amber-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Hospital className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-800 text-sm">Before Donation Tips</h4>
              <p className="text-xs text-amber-700 mt-1">
                • Get 7-8 hours of sleep • Eat a healthy meal • Drink plenty of water • Bring your ID card
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}