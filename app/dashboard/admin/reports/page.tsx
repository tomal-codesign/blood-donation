// app/dashboard/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  Eye,
  Printer,
  Mail,
  BarChart3,
  TrendingUp,
  Users,
  Droplet,
  Hospital,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  title: string;
  type: 'donation' | 'request' | 'user' | 'inventory' | 'financial';
  date: string;
  size: string;
  status: 'ready' | 'generating' | 'failed';
  description: string;
  url?: string;
}

type StatsColorType = 'blue' | 'green' | 'yellow' | 'red';

const statsColors: Record<StatsColorType, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-700'
};

export default function AdminReportsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('donation');

  const reportTypes = [
    { value: 'donation', label: 'Donation Report', icon: Droplet },
    { value: 'request', label: 'Blood Request Report', icon: FileText },
    { value: 'user', label: 'User Report', icon: Users },
    { value: 'inventory', label: 'Inventory Report', icon: BarChart3 },
    { value: 'financial', label: 'Financial Report', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, filterType, filterStatus, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        toast.error('Failed to load reports');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    setFilteredReports(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return <Droplet className="h-4 w-4 text-red-500" />;
      case 'request': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'user': return <Users className="h-4 w-4 text-green-500" />;
      case 'inventory': return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'financial': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return <Badge className="bg-green-100 text-green-700">✅ Ready</Badge>;
      case 'generating': return <Badge className="bg-yellow-100 text-yellow-700">⏳ Generating</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700">❌ Failed</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // ✅ Download Report as Excel only
  const downloadReport = async (report: Report) => {
    if (report.status !== 'ready') {
      toast.error('Report is not ready for download');
      return;
    }

    try {
      toast.loading(`Downloading ${report.title}...`);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/download/${report.id}?format=excel`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.dismiss();
        toast.success(`✅ ${report.title} downloaded successfully`);
      } else {
        toast.dismiss();
        toast.error('Failed to download report');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  // ✅ Generate Report
  const generateReport = async () => {
    setGenerating(true);
    try {
      toast.loading(`Generating ${getTypeLabel(selectedType)} report...`);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ type: selectedType })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        toast.dismiss();
        toast.success(`✅ ${getTypeLabel(selectedType)} report generated successfully`);
        setShowGenerateModal(false);
        await fetchReports();
      } else {
        toast.dismiss();
        toast.error('Failed to generate report');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // ✅ Share Report
  const shareReport = (report: Report) => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: report.description,
        url: window.location.href
      }).catch(() => {
        toast.success('📧 Report link copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(`${report.title} - ${report.description}`)
        .then(() => toast.success('📧 Report details copied to clipboard'))
        .catch(() => toast.success('📧 Report shared via email'));
    }
    setShowDetails(false);
  };

  // ✅ Print Report
  const printReport = (report: Report) => {
    toast.info('🖨️ Preparing report for printing...');
    setTimeout(() => {
      window.print();
      setShowDetails(false);
    }, 500);
  };

  const stats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    generating: reports.filter(r => r.status === 'generating').length,
    failed: reports.filter(r => r.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            Reports
          </h1>
          <p className="text-gray-500 mt-1">Generate and download system reports</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchReports}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 gap-2"
            onClick={() => setShowGenerateModal(true)}
          >
            <Plus className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Reports" value={stats.total} color="blue" />
        <StatsCard label="Ready" value={stats.ready} color="green" />
        <StatsCard label="Generating" value={stats.generating} color="yellow" />
        <StatsCard label="Failed" value={stats.failed} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by title, description or type..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="donation">Donation</option>
            <option value="request">Request</option>
            <option value="user">User</option>
            <option value="inventory">Inventory</option>
            <option value="financial">Financial</option>
          </select>
        </div>
        <div className="w-48">
          <select 
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="generating">Generating</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => {
            setSearchTerm('');
            setFilterType('all');
            setFilterStatus('all');
          }}
        >
          <Filter className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reports found</p>
            <p className="text-sm text-gray-400 mt-1">Generate a new report to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {report.size}
                        </span>
                        <span className="capitalize">{getTypeLabel(report.type)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDetails(true);
                      }}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => downloadReport(report)}
                      disabled={report.status !== 'ready'}
                      className={report.status === 'ready' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Generate Report</h3>
                <p className="text-sm text-gray-500 mt-1">Select report type to generate</p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium text-center ${isSelected ? 'text-purple-600' : 'text-gray-700'}`}>
                        {type.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={generateReport}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedReport.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Report Details</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Report Type</p>
                  <p className="font-medium capitalize">{getTypeLabel(selectedReport.type)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{new Date(selectedReport.date).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="font-medium">{selectedReport.size}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Description</p>
                <p className="font-medium">{selectedReport.description}</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => downloadReport(selectedReport)}
                  disabled={selectedReport.status !== 'ready'}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// StatsCard Component
interface StatsCardProps {
  label: string;
  value: number;
  color: StatsColorType;
}

function StatsCard({ label, value, color }: StatsCardProps) {
  return (
    <Card className={statsColors[color]}>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs">{label}</p>
      </CardContent>
    </Card>
  );
}