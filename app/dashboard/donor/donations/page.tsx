// app/dashboard/donor/donations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Droplet, 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Bell, 
  Activity,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Gift,
  Shield,
  X,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Donation {
  id: number;
  blood_group: string;
  hospital: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'scheduled' | 'completed' | 'cancelled';
  contact_person?: string;
  contact_number?: string;
}

export default function MyDonationsPage() {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors/${user?.id}/upcoming-donations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
      } else {
        setDonations(getMockDonations());
      }
    } catch (error) {
      console.error('Error:', error);
      setDonations(getMockDonations());
    } finally {
      setLoading(false);
    }
  };

  const getMockDonations = (): Donation[] => {
    return [
      { 
        id: 1, 
        blood_group: 'O+', 
        hospital: 'Dhaka Medical Hospital', 
        date: '2024-06-20', 
        time: '10:00 AM',
        location: 'Blood Bank, 2nd Floor, Room 201',
        status: 'upcoming',
        contact_person: 'Dr. Rahman',
        contact_number: '01712345678'
      },
      { 
        id: 2, 
        blood_group: 'O+', 
        hospital: 'Square Hospital', 
        date: '2024-06-25', 
        time: '02:30 PM',
        location: 'Donation Center, Ground Floor',
        status: 'scheduled',
        contact_person: 'Nurse Fatema',
        contact_number: '01987654321'
      }
    ];
  };

  const markAsDonated = async (id: number) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors/${id}/mark-donated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Thank you for your donation! You saved a life today! 🎉');
        setDonations(donations.filter(d => d.id !== id));
      } else {
        toast.error('Failed to mark as donated');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDonation = async (id: number) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors/${id}/cancel-donation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { 
          icon: <Clock className="h-3.5 w-3.5" />, 
          label: 'Upcoming', 
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        };
      case 'scheduled':
        return { 
          icon: <Calendar className="h-3.5 w-3.5" />, 
          label: 'Scheduled', 
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case 'completed':
        return { 
          icon: <Award className="h-3.5 w-3.5" />, 
          label: 'Completed', 
          color: 'bg-purple-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700'
        };
      default:
        return { 
          icon: <AlertCircle className="h-3.5 w-3.5" />, 
          label: 'Pending', 
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
    }
  };

  const nextDonation = donations[0];
  const daysUntilNext = nextDonation ? Math.ceil((new Date(nextDonation.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        <p className="text-gray-500 mt-1">Manage your upcoming and scheduled donations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Next Donation</p>
                <p className="text-2xl font-bold">{daysUntilNext > 0 ? `In ${daysUntilNext} days` : 'Today'}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Scheduled</p>
                <p className="text-2xl font-bold">{donations.length}</p>
              </div>
              <Activity className="h-8 w-8 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Eligibility</p>
                <p className="text-2xl font-bold">Ready</p>
              </div>
              <Shield className="h-8 w-8 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation List */}
      {donations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Upcoming Donations</h3>
            <p className="text-gray-500 text-sm mb-4">You haven't scheduled any donations yet</p>
            <Button className="bg-red-600 hover:bg-red-700">
              Schedule a Donation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => {
            const statusConfig = getStatusConfig(donation.status);
            const isExpanded = selectedDonation === donation.id;
            const isLoading = actionLoading === donation.id;
            
            return (
              <Card key={donation.id} className="overflow-hidden">
                {/* Progress Bar for upcoming */}
                {donation.status === 'upcoming' && (
                  <div className="h-1 bg-gray-100">
                    <div className="h-full w-2/3 bg-red-500"></div>
                  </div>
                )}
                
                <CardContent className="p-0">
                  <div className="p-5">
                    {/* Header Section */}
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                          <Droplet className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-gray-900">{donation.blood_group}</span>
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border-none`}>
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-800">{donation.hospital}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => markAsDonated(donation.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Successfully Donated
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cancelDonation(donation.id)}
                          disabled={isLoading}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>

                    {/* Date & Time Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-gray-100 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium text-gray-800">{donation.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="font-medium text-gray-800">{donation.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium text-gray-800 truncate">{donation.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="font-medium text-green-600 capitalize">{donation.status}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Section */}
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setSelectedDonation(isExpanded ? null : donation.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        {isExpanded ? 'Show less' : 'Show more details'}
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Bell className="h-3 w-3" />
                        <span>Reminder will be sent 1 day before</span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        <h4 className="font-semibold text-gray-800 mb-2">Donation Instructions</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Get at least 7-8 hours of sleep before donation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Eat a healthy meal 2-3 hours before donation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Drink plenty of water before donation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Bring your ID card and donor card</span>
                          </li>
                        </ul>
                        
                        {donation.contact_person && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Contact Person:</span> {donation.contact_person}
                              {donation.contact_number && ` (${donation.contact_number})`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reminder Banner */}
                  {donation.status === 'upcoming' && (
                    <div className="bg-blue-50 px-5 py-2 flex items-center gap-2 text-sm text-blue-700">
                      <Bell className="h-4 w-4" />
                      <span>Donation is scheduled in {daysUntilNext} days. Please prepare accordingly.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Donation Tips */}
      <Card className="bg-amber-50 border-amber-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-800 text-sm">Health Tips</h4>
              <p className="text-xs text-amber-700 mt-1">
                Maintain a healthy iron-rich diet. Avoid alcohol 24 hours before donation. 
                Inform the medical staff if you have any medical conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}