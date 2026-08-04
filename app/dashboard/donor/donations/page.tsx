// app/dashboard/donor/donations/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Droplet,
  CalendarClock,
  HeartPulse,
  MapPin,
  BellRing,
  Loader2,
  CheckCircle2,
  XCircle,
  Gift,
  Hospital,
  Phone,
  UserRound,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Clock3,
  Activity,
  ShieldCheck
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

// Priority styling config
const priorityConfig: Record<string, { label: string; badge: string; border: string; icon: any }> = {
  critical: {
    label: 'CRITICAL',
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-l-red-500',
    icon: AlertTriangle,
  },
  moderate: {
    label: 'MODERATE',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    border: 'border-l-orange-400',
    icon: Activity,
  },
  normal: {
    label: 'NORMAL',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-l-blue-400',
    icon: Clock3,
  },
};

export default function MyDonationsPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<UpcomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            status: action === 'accept' ? 'matched' : 'cancelled',
            donor_id: user?.id
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (action === 'accept') {
          toast.success(data.message || 'You accepted the donation request! The requester will contact you.');
        } else {
          toast.success(data.message || 'Donation request declined');
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

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority?.toLowerCase()] || priorityConfig.normal;
  };

  const getPriorityBadge = (priority: string) => {
    const config = getPriorityConfig(priority);
    const Icon = config.icon;
    return (
      <Badge className={`border ${config.badge} font-semibold gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Derived stats
  const stats = useMemo(() => {
    const critical = requests.filter(r => r.priority?.toLowerCase() === 'critical').length;
    const moderate = requests.filter(r => r.priority?.toLowerCase() === 'moderate').length;
    const totalUnits = requests.reduce((sum, r) => sum + (r.units_needed || 1), 0);
    return { total: requests.length, critical, moderate, totalUnits };
  }, [requests]);

  // Sort critical first for visibility
  const sortedRequests = useMemo(() => {
    const priorityOrder: Record<string, number> = { critical: 0, moderate: 1, normal: 2 };
    return [...requests].sort((a, b) =>
      (priorityOrder[a.priority?.toLowerCase()] ?? 2) - (priorityOrder[b.priority?.toLowerCase()] ?? 2)
    );
  }, [requests]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Droplet className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading your donation requests...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 p-6 sm:p-8 shadow-xl shadow-red-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Life Saver Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Donations</h1>
            <p className="text-red-50 mt-1.5 text-sm sm:text-base max-w-md">
              Manage incoming donation requests and be ready to save a life
            </p>
          </div>

          {/* Pending Count */}
          <div className="flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <p className="text-3xl font-bold text-white leading-none">{stats.total}</p>
              <p className="text-[11px] text-red-50 mt-1 font-medium uppercase tracking-wide">
                Pending Request{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pending */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">requests awaiting your response</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                <BellRing className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-400"></div>
        </Card>

        {/* Critical */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-orange-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-orange-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Critical Priority</p>
                <p className={`text-3xl font-bold mt-1 ${stats.critical > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.critical}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.critical > 0
                    ? 'urgent help needed!'
                    : 'no urgent cases right now'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                stats.critical > 0
                  ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/25 animate-pulse'
                  : 'bg-gradient-to-br from-orange-100 to-amber-200 shadow-orange-500/10'
              }`}>
                <AlertTriangle className={`h-6 w-6 ${stats.critical > 0 ? 'text-white' : 'text-orange-500'}`} />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"></div>
        </Card>

        {/* Units Needed */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Blood Units Needed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUnits}</p>
                <p className="text-xs text-gray-400 mt-1">across all pending requests</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Droplet className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>
      </div>

      {/* Requests Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {stats.total > 0 ? 'Incoming Requests' : 'No Requests Yet'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.total > 0
              ? 'Priority order — critical requests appear first'
              : 'When someone needs your help, it will show up here'}
          </p>
        </div>
        {stats.total > 0 && (
          <Badge className="bg-red-50 text-red-600 border-red-100 px-3 py-1.5 gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {stats.total} Active
          </Badge>
        )}
      </div>

      {/* Donation Request List */}
      {sortedRequests.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
          <CardContent className="py-16 text-center">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-60"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center border border-red-100">
                <HeartPulse className="h-10 w-10 text-red-300" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">You're all caught up!</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              No pending donation requests right now. Keep your availability on so patient can reach you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25">
                <HeartPulse className="h-4 w-4 mr-2" />
                Keep Helping
              </Button>
              <Link href="/dashboard/donor/find-donors">
                <Button variant="outline" className="border-gray-200 hover:border-red-200 hover:text-red-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Opportunities
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedRequests.map((request) => {
            const priority = getPriorityConfig(request.priority);
            const isActionLoading = actionLoading === request.id;
            const unitsNeeded = request.units_needed || 1;

            return (
              <Card
                key={request.id}
                className={`group overflow-hidden border-l-4 ${priority.border} hover:shadow-xl hover:shadow-gray-900/5 hover:border-gray-100 hover:border-l-4 hover:border-l-red-400 transition-all duration-300 relative`}
              >
                <CardContent className="p-0">
                  {/* Top accent glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-red-50/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>

                  <div className="relative p-5 sm:p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      {/* Left - Blood info */}
                      <div className="flex items-start gap-4">
                        {/* Blood Icon */}
                        <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${request.priority?.toLowerCase() === 'critical' ? 'from-red-500 to-rose-600 shadow-red-500/30' : request.priority?.toLowerCase() === 'moderate' ? 'from-orange-400 to-amber-500 shadow-orange-500/30' : 'from-rose-400 to-pink-600 shadow-pink-500/30'} flex items-center justify-center shadow-lg`}>
                          <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                          <Droplet className="h-7 w-7 text-white relative" />
                          {/* Animated pulse for critical */}
                          {request.priority?.toLowerCase() === 'critical' && (
                            <span className="absolute -inset-1 rounded-2xl bg-red-500/20 animate-ping"></span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-gray-900">
                              {request.blood_group}
                            </span>
                            {getPriorityBadge(request.priority)}
                          </div>
                          <p className="font-medium text-gray-700 flex items-center gap-1.5">
                            <Hospital className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{request.hospital_name}</span>
                          </p>

                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                              {formatTime(request.created_at)}
                            </span>
                            {(request.district || request.division) && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                {request.district || request.division}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Droplet className="h-3.5 w-3.5 text-gray-400" />
                              {unitsNeeded} unit{unitsNeeded > 1 ? 's' : ''} needed
                            </span>
                            {request.patient_condition && (
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                                <span className="italic truncate max-w-[180px]">{request.patient_condition}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleRespond(request.id, 'accept')}
                          disabled={isActionLoading}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md shadow-emerald-500/25 font-semibold"
                        >
                          {isActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRespond(request.id, 'decline')}
                          disabled={isActionLoading}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium"
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Decline
                        </Button>
                      </div>
                    </div>

                    {/* Requester & Contact */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                            <UserRound className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-500">Requester:</span>
                          <span className="font-semibold text-gray-800">
                            {request.profiles?.full_name || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callContact(request.contact_phone || request.profiles?.phone || '')}
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 font-semibold group/phone"
                      >
                        <Phone className="h-4 w-4 mr-1.5 text-green-500 group-hover/phone:scale-110 transition-transform" />
                        {request.contact_phone || request.profiles?.phone || 'N/A'}
                        <ChevronRight className="h-3.5 w-3.5 ml-1 opacity-50 group-hover/phone:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Health Tips */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-transparent">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-amber-800">Ready for your next donation?</h4>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pre-Donation Checklist</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3 text-sm text-amber-800/80">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  Get 7-8 hours of sleep
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  Eat a healthy, iron-rich meal
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  Drink plenty of water
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  Bring your ID card
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}