// app/dashboard/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  Calendar,
  Filter,
  Search,
  Loader2,
  RefreshCw,
  Eye,
  Droplet,
  TrendingUp,
  Users,
  X,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Database,
  FileBarChart,
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

const STATS_ICONS = {
  blue: <FileBarChart className="h-4 w-4 text-white" />,
  green: <CheckCircle2 className="h-4 w-4 text-white" />,
  yellow: <Clock className="h-4 w-4 text-white" />,
  red: <AlertCircle className="h-4 w-4 text-white" />,
};

const TYPE_STYLES: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  donation: {
    icon: <Droplet className="h-5 w-5 text-red-500" />,
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-100'
  },
  request: {
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100'
  },
  user: {
    icon: <Users className="h-5 w-5 text-emerald-500" />,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100'
  },
  inventory: {
    icon: <Database className="h-5 w-5 text-purple-500" />,
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100'
  },
  financial: {
    icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-100'
  },
};

const STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode }> = {
  ready: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />
  },
  generating: {
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />
  },
  failed: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertCircle className="h-3 w-3 mr-1" />
  },
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
    { value: 'inventory', label: 'Inventory Report', icon: Database },
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

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getStatusBadge = (status: string) => {
    const style = STATUS_STYLES[status] || { badge: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
    return (
      <Badge className={`border ${style.badge}`}>
        {style.icon}
        {status.toLowerCase()}
      </Badge>
    );
  };

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
        toast.success(`${report.title} downloaded successfully`);
      } else {
        toast.dismiss();
        toast.error('Failed to download report');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

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
        toast.success(`${getTypeLabel(selectedType)} report generated successfully`);
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

  const stats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    generating: reports.filter(r => r.status === 'generating').length,
    failed: reports.filter(r => r.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FileText className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading reports...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* ========== HERO HEADER ========== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-purple-900/20 border border-white/10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              Report Center
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Reports
            </h1>
            <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
              Generate, manage and download system reports with ease.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <FileText className="h-3 w-3 mr-1.5" />
                {stats.total} Total
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                {stats.ready} Ready
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1.5" />
                {stats.generating} Generating
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchReports}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30 transition-all"
                onClick={() => setShowGenerateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== STATS ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Reports" value={stats.total} color="blue" />
        <StatsCard label="Ready" value={stats.ready} color="green" />
        <StatsCard label="Generating" value={stats.generating} color="yellow" />
        <StatsCard label="Failed" value={stats.failed} color="red" />
      </div>

      {/* ========== FILTERS ========== */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by title, description or type..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-700"
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
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-700"
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
              className="gap-2 border-gray-200 text-gray-600 hover:bg-gray-50"
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
        </CardContent>
      </Card>

      {/* ========== REPORTS LIST ========== */}
      {filteredReports.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-8 w-8 text-purple-300" />
            </div>
            <p className="text-gray-500 font-medium">No reports found</p>
            <p className="text-sm text-gray-400 mt-1">Generate a new report to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const typeStyle = TYPE_STYLES[report.type] || TYPE_STYLES.donation;
            return (
              <Card key={report.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-white hover:from-purple-50/50 hover:to-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl ${typeStyle.bg} ${typeStyle.text} flex items-center justify-center border ${typeStyle.border} shrink-0`}>
                        {typeStyle.icon}
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
                          <span className={`font-medium ${typeStyle.text}`}>
                            {getTypeLabel(report.type)}
                          </span>
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
                        className={report.status === 'ready'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-gray-300 cursor-not-allowed text-gray-600'}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========== GENERATE REPORT MODAL ========== */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-6">
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
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 shadow-md shadow-purple-500/10'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
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
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
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

      {/* ========== REPORT DETAILS MODAL ========== */}
      {showDetails && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-6">
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
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500">Report Type</p>
                  <p className="font-medium capitalize text-gray-900">{getTypeLabel(selectedReport.type)}</p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{new Date(selectedReport.date).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="font-medium text-gray-900">{selectedReport.size}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="font-medium text-gray-900">{selectedReport.description}</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                  onClick={() => downloadReport(selectedReport)}
                  disabled={selectedReport.status !== 'ready'}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download Excel
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    navigator.clipboard.writeText(`${selectedReport.title} - ${selectedReport.description}`)
                      .then(() => toast.success('Report details copied to clipboard'));
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STATS CARD (Dashboard Style) ==========
interface StatsCardProps {
  label: string;
  value: number;
  color: StatsColorType;
}

const COLOR_STYLES: Record<StatsColorType, { iconBg: string; accent: string; to: string; valueText: string }> = {
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25',
    accent: 'bg-gradient-to-r from-blue-500 to-indigo-400',
    to: 'from-white to-blue-50/50',
    valueText: 'text-gray-900'
  },
  green: {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    to: 'from-white to-emerald-50/50',
    valueText: 'text-gray-900'
  },
  yellow: {
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600 shadow-yellow-500/25',
    accent: 'bg-gradient-to-r from-yellow-500 to-amber-400',
    to: 'from-white to-yellow-50/50',
    valueText: 'text-gray-900'
  },
  red: {
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25',
    accent: 'bg-gradient-to-r from-red-500 to-rose-400',
    to: 'from-white to-red-50/50',
    valueText: 'text-gray-900'
  },
};

function StatsCard({ label, value, color }: StatsCardProps) {
  const style = COLOR_STYLES[color];
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${style.to} hover:-translate-y-0.5`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold ${style.valueText} mt-1.5`}>{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {STATS_ICONS[color]}
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.accent}`}></div>
    </Card>
  );
}
