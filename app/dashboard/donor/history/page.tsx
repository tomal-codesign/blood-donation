// app/dashboard/donor/history/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import {
  Droplet,
  Calendar,
  Download,
  Search,
  Heart,
  Award,
  ShieldCheck,
  Clock3,
  Sparkles,
  Building2,
  Filter,
  TrendingUp,
  Medal,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface HistoryItem {
  id: number;
  date: string;
  blood_group: string;
  hospital: string;
  units: number;
  status: string;
  impact: string;
}

export default function DonationHistoryPage() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterYear, history]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donors/history?user_id=${user?.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      } else {
        toast.error('Failed to load donation history');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...history];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.blood_group.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterYear !== 'all') {
      filtered = filtered.filter(item => item.date.startsWith(filterYear));
    }

    setFilteredHistory(filtered);
  };

  const exportHistory = () => {
    if (filteredHistory.length === 0) {
      toast.error('No records to export');
      return;
    }
    const csv = filteredHistory.map(item =>
      `${item.date},${item.blood_group},${item.hospital},${item.units},${item.status}`
    ).join('\n');
    const blob = new Blob([`Date,Blood Group,Hospital,Units,Status\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported successfully');
  };

  // Derived years from actual data
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    history.forEach(item => {
      const year = item.date?.slice(0, 4);
      if (year) yearSet.add(year);
    });
    return ['all', ...Array.from(yearSet).sort().reverse()];
  }, [history]);

  const totalDonations = filteredHistory.length;
  const livesSaved = totalDonations * 3;
  const totalUnits = filteredHistory.reduce((sum, item) => sum + (item.units || 1), 0);

  // Donor tier based on total donations
  const getTier = (count: number) => {
    if (count >= 20) return { name: 'Platinum Hero', icon: Medal, color: 'from-violet-500 to-purple-600 shadow-purple-500/25' };
    if (count >= 10) return { name: 'Gold Hero', icon: Award, color: 'from-amber-400 to-yellow-500 shadow-amber-500/25' };
    if (count >= 5) return { name: 'Silver Hero', icon: ShieldCheck, color: 'from-slate-400 to-gray-500 shadow-slate-500/25' };
    return { name: 'Rising Hero', icon: Sparkles, color: 'from-red-500 to-rose-600 shadow-red-500/25' };
  };

  const tier = getTier(totalDonations);
  const TierIcon = tier.icon;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDateFull = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading your donation history...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-500 p-6 sm:p-8 shadow-xl shadow-emerald-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Your Impact Journey
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Donation History</h1>
            <p className="text-emerald-50 mt-1.5 text-sm sm:text-base max-w-md">
              Every drop you've given has made a difference. Here's your story of giving.
            </p>
          </div>

          {/* Hero Tier Badge */}
          <div className="flex items-center gap-3">
            <div className="text-center px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <div className={`w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg mb-1.5`}>
                <TierIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-emerald-50 font-medium uppercase tracking-wide">{tier.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Donations */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Donations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalDonations}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalUnits} unit{totalUnits !== 1 ? 's' : ''} of blood given
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Droplet className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>

        {/* Lives Saved */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Lives Saved</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{livesSaved}</p>
                <p className="text-xs text-gray-400 mt-1">estimated from your donations</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-400"></div>
        </Card>

        {/* Hero Level */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-amber-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Your Title</p>
                <p className="text-lg font-bold text-gray-900 mt-1 leading-tight">{tier.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalDonations >= 20
                    ? 'Exceptional dedication!'
                    : totalDonations >= 10
                      ? 'Incredible commitment!'
                      : totalDonations >= 5
                        ? 'Great progress!'
                        : 'Every drop counts!'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <TierIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-400"></div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by hospital or blood group..."
            className="pl-9 h-11 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select onValueChange={setFilterYear} value={filterYear}>
            <SelectTrigger className="h-11 rounded-xl border-gray-200">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={exportHistory}
          className="h-11 rounded-xl border-gray-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary row */}
      {filteredHistory.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredHistory.length}</span> donation{filteredHistory.length !== 1 ? 's' : ''}
            {searchTerm || filterYear !== 'all' ? ' (filtered)' : ''}
          </p>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            All Completed
          </Badge>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
          <CardContent className="py-16 text-center">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-60"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center border border-emerald-100">
                <Droplet className="h-10 w-10 text-emerald-300" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {searchTerm || filterYear !== 'all' ? 'No matching records' : 'No donations yet'}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              {searchTerm || filterYear !== 'all'
                ? `No donation records match your search${searchTerm ? ` for "${searchTerm}"` : ''}. Try adjusting your filters.`
                : 'When you make your first donation it will appear here, marking the start of your hero journey.'}
            </p>
            {!searchTerm && filterYear === 'all' && (
              <p className="text-xs text-gray-400">Your first donation could save up to 3 lives 💚</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-200 to-emerald-100 rounded-full"></div>

          <div className="space-y-4">
            {filteredHistory.map((item, index) => (
              <div key={item.id} className="relative flex gap-4 group">
                {/* Timeline dot */}
                <div className="relative flex-shrink-0 w-14 flex justify-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-white group-hover:scale-110 transition-transform z-10">
                    <Droplet className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Content card */}
                <Card className="flex-1 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="text-left">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900">Blood {item.blood_group}</span>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 mt-1.5">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-gray-400" />
                              {item.hospital}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {formatDateFull(item.date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Droplet className="h-3.5 w-3.5 text-gray-400" />
                              {item.units} unit{item.units > 1 ? 's' : ''}
                            </span>
                          </div>
                          {item.impact && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-700 mt-2">
                              <Heart className="h-3 w-3" />
                              {item.impact}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Month badge */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                          <Clock3 className="h-3 w-3 mr-1" />
                          {formatDate(item.date)}
                        </Badge>
                        {/* Index number */}
                        <span className="text-xs text-gray-400 font-medium">
                          #{totalDonations - index}
                        </span>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact footer */}
      {filteredHistory.length > 0 && (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-transparent">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800">Your lifetime impact</h4>
                <p className="text-sm text-emerald-700/80 mt-1">
                  <span className="font-bold">{totalUnits}</span> unit{totalUnits !== 1 ? 's' : ''} of blood donated across{' '}
                  <span className="font-bold">{totalDonations}</span> donation{totalDonations !== 1 ? 's' : ''}, potentially saving up to{' '}
                  <span className="font-bold">{livesSaved}</span> lives. Keep up the amazing work! 💚
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}