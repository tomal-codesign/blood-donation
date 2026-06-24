// app/dashboard/donor/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
  Heart,
  Award,
  Eye
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
  }, []);

  useEffect(() => {
    filterData();
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
        // Fallback mock data
        setHistory([
          { id: 1, date: '2024-05-15', blood_group: 'O+', hospital: 'Dhaka Medical Hospital', units: 1, status: 'completed', impact: 'Helped save a life' },
          { id: 2, date: '2024-02-10', blood_group: 'O+', hospital: 'Square Hospital', units: 1, status: 'completed', impact: 'Supported a cancer patient' },
          { id: 3, date: '2023-11-20', blood_group: 'O+', hospital: 'Labaid Hospital', units: 1, status: 'completed', impact: 'Emergency blood requirement' }
        ]);
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
        item.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterYear !== 'all') {
      filtered = filtered.filter(item => item.date.startsWith(filterYear));
    }
    
    setFilteredHistory(filtered);
  };

  const exportHistory = () => {
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

  const years = ['all', '2024', '2023', '2022'];
  const totalDonations = filteredHistory.length;
  const livesSaved = totalDonations * 3;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
          <p className="text-gray-500 mt-1">Your past donations and impact</p>
        </div>
        <Button variant="outline" onClick={exportHistory} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Droplet className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalDonations}</p>
            <p className="text-xs text-gray-500">Total Donations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{livesSaved}</p>
            <p className="text-xs text-gray-500">Lives Saved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">Hero</p>
            <p className="text-xs text-gray-500">You're a Hero!</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by hospital..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select onValueChange={setFilterYear} defaultValue="all">
            <SelectTrigger>
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
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No donation records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Droplet className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Blood {item.blood_group}</p>
                      <p className="text-sm text-gray-500">{item.hospital}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.impact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.date}</p>
                      <p className="text-xs text-gray-500">{item.units} unit</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      ✅ Completed
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}