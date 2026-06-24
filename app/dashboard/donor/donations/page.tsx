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
  Hospital
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Donation {
  id: number;
  blood_group: string;
  hospital: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'scheduled' | 'completed';
  contact_person?: string;
  contact_number?: string;
}

export default function MyDonationsPage() {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
        setDonations(data.donations || []);
      } else {
        // Fallback mock data
        setDonations([
          {
            id: 1,
            blood_group: 'O+',
            hospital: 'Dhaka Medical Hospital',
            date: '2024-07-15',
            time: '10:00 AM',
            location: 'Blood Bank, 2nd Floor',
            status: 'upcoming',
            contact_person: 'Dr. Rahman',
            contact_number: '01712345678'
          },
          {
            id: 2,
            blood_group: 'O+',
            hospital: 'Square Hospital',
            date: '2024-07-25',
            time: '02:30 PM',
            location: 'Donation Center, Ground Floor',
            status: 'scheduled',
            contact_person: 'Nurse Fatema',
            contact_number: '01987654321'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const cancelDonation = async (id: number) => {
    setActionLoading(id);
    try {
      // API call to cancel donation
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donors/cancel/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Donation cancelled successfully');
        setDonations(donations.filter(d => d.id !== id));
      } else {
        toast.error('Failed to cancel donation');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDonation = async (id: number) => {
    toast.success('Thank you for confirming! See you at the hospital.');
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
          <p className="text-gray-500 mt-1">Manage your upcoming and scheduled donations</p>
        </div>
        <Badge className="bg-red-100 text-red-700 px-3 py-1">
          {donations.length} Upcoming
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-75" />
            <p className="text-2xl font-bold">{donations.length}</p>
            <p className="text-sm opacity-75">Total Donations</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 opacity-75" />
            <p className="text-2xl font-bold">
              {donations.filter(d => d.status === 'upcoming').length}
            </p>
            <p className="text-sm opacity-75">Upcoming</p>
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

      {/* Donation List */}
      {donations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Upcoming Donations</h3>
            <p className="text-gray-500 text-sm mb-4">You haven't scheduled any donations yet</p>
            <Button className="bg-red-600 hover:bg-red-700">
              Schedule a Donation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <Card key={donation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Status Bar */}
              <div className={`h-1 ${donation.status === 'upcoming' ? 'bg-red-500' : 'bg-green-500'}`}></div>
              
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
                          Blood {donation.blood_group}
                        </span>
                        <Badge className={donation.status === 'upcoming' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {donation.status === 'upcoming' ? 'Upcoming' : 'Scheduled'}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-800">{donation.hospital}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {donation.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {donation.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {donation.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => confirmDonation(donation.id)}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => cancelDonation(donation.id)}
                      disabled={actionLoading === donation.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {actionLoading === donation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                {donation.contact_person && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      <span className="font-medium">Contact:</span> {donation.contact_person}
                    </span>
                    {donation.contact_number && (
                      <span className="text-gray-500">
                        <span className="font-medium">Phone:</span> {donation.contact_number}
                      </span>
                    )}
                  </div>
                )}
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