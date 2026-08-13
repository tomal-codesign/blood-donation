// app/dashboard/admin/ai-monitor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Brain,
  AlertCircle,
  Clock,
  RefreshCw,
  Target,
  BarChart3,
  Activity,
  Droplet,
  Sparkles,
  Eye,
  Calendar,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PredictionData {
  blood_group: string;
  units_available: number;
  monthly_demand: number;
  days_until_shortage: number;
  status: 'critical' | 'low' | 'stable';
  recommendation: string;
}

interface AIStats {
  totalPredictions: number;
  criticalGroups: number;
  lowGroups: number;
  stableGroups: number;
  accuracy: number;
  lastUpdated: string;
  currentMonthDemand: number;
  nextMonthDemand: number;
}

export default function AdminAIMonitorPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [stats, setStats] = useState<AIStats>({
    totalPredictions: 0,
    criticalGroups: 0,
    lowGroups: 0,
    stableGroups: 0,
    accuracy: 0,
    lastUpdated: new Date().toISOString(),
    currentMonthDemand: 0,
    nextMonthDemand: 0
  });

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/predict`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);

        const critical = data.predictions?.filter((p: any) => p.status === 'critical').length || 0;
        const low = data.predictions?.filter((p: any) => p.status === 'low').length || 0;
        const stable = data.predictions?.filter((p: any) => p.status === 'stable').length || 0;

        const currentMonthDemand = data.predictions?.reduce((sum: number, p: any) => sum + (p.monthly_demand || 0), 0) || 0;
        const nextMonthDemand = Math.round(currentMonthDemand * 1.15);

        setStats({
          totalPredictions: data.predictions?.length || 0,
          criticalGroups: critical,
          lowGroups: low,
          stableGroups: stable,
          accuracy: data.accuracy || 0,
          lastUpdated: data.generated_at || new Date().toISOString(),
          currentMonthDemand,
          nextMonthDemand
        });
      } else {
        toast.error('Failed to load AI predictions from server');
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
      toast.error('Failed to load AI predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAIData();
    setRefreshing(false);
    toast.success('AI data refreshed');
  };

  const getMonthName = (offset: number = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleString('default', { month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Brain className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading AI predictions...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  const demandGrowth = stats.currentMonthDemand > 0
    ? Math.round(((stats.nextMonthDemand - stats.currentMonthDemand) / stats.currentMonthDemand) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-purple-900/20 border border-white/10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-8 right-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full"></div>
        <div className="absolute bottom-12 right-1/2 w-2 h-2 bg-indigo-300/30 rounded-full"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              AI Monitoring
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              AI Shortage Monitor
            </h1>
            <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
              AI-powered blood shortage predictions and monitoring for all blood groups.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Brain className="h-3 w-3 mr-1.5" />
                {stats.totalPredictions} Groups
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <AlertCircle className="h-3 w-3 mr-1.5" />
                {stats.criticalGroups} Critical
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Target className="h-3 w-3 mr-1.5" />
                {stats.accuracy}% Accuracy
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Droplet className="h-3 w-3 mr-1.5" />
                {stats.currentMonthDemand} Units Demand
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-purple-300/70 font-semibold">Last Updated</p>
                <p className="text-sm text-white font-medium">{new Date(stats.lastUpdated).toLocaleTimeString()}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {stats.stableGroups} stable groups
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Predictions"
          value={stats.totalPredictions}
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
          accent="bg-gradient-to-r from-blue-500 to-indigo-400"
          to="from-white to-blue-50/50"
        />
        <MetricCard
          title="Critical Groups"
          value={stats.criticalGroups}
          icon={<AlertCircle className="h-5 w-5 text-white" />}
          trend={stats.criticalGroups > 0 ? 'down' : 'up'}
          iconBg="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
          accent="bg-gradient-to-r from-red-500 to-rose-400"
          to="from-white to-red-50/50"
        />
        <MetricCard
          title="Low Groups"
          value={stats.lowGroups}
          icon={<Clock className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-yellow-500 to-amber-600 shadow-yellow-500/25"
          accent="bg-gradient-to-r from-yellow-500 to-amber-400"
          to="from-white to-yellow-50/50"
        />
        <MetricCard
          title="AI Accuracy"
          value={`${stats.accuracy}%`}
          icon={<Target className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
          accent="bg-gradient-to-r from-emerald-500 to-teal-400"
          to="from-white to-emerald-50/50"
        />
      </div>

      {/* Demand Overview & AI Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Calendar className="h-4.5 w-4.5 text-white" />
              </div>
              Monthly Demand Overview
            </CardTitle>
            <CardDescription>Projected blood demand for upcoming months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Current Month</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.currentMonthDemand} units</p>
                  <span className="text-xs text-gray-400">{getMonthName(0)}</span>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="text-center">
                  <p className="text-xs text-gray-500">Next Month</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.nextMonthDemand} units</p>
                  <span className="text-xs text-gray-400">{getMonthName(1)}</span>
                </div>
              </div>
              <div className="bg-green-100 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-green-700">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +{demandGrowth}% growth
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                <Activity className="h-4.5 w-4.5 text-white" />
              </div>
              AI Model Status
            </CardTitle>
            <CardDescription>Real-time model health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <StatRow label="Model Active" value="Running" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
              <StatRow label="Accuracy Rate" value={`${stats.accuracy}%`} icon={<Target className="h-4 w-4 text-purple-500" />} />
              <StatRow label="Last Updated" value={new Date(stats.lastUpdated).toLocaleString()} icon={<Clock className="h-4 w-4 text-blue-500" />} />
              <StatRow label="Stable Groups" value={stats.stableGroups} icon={<Shield className="h-4 w-4 text-emerald-500" />} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Shortage Predictions */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
              <Droplet className="h-4.5 w-4.5 text-white" />
            </div>
            Blood Shortage Predictions
          </CardTitle>
          <CardDescription>
            <Badge className="bg-purple-100 text-purple-700">
              {stats.totalPredictions} Blood Groups Monitored
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <PredictionCard key={index} prediction={prediction} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            AI Insight
          </CardTitle>
          <CardDescription>AI-generated recommendations and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Recommendation</h4>
              <p className="text-sm text-gray-600 mt-1">
                {stats.criticalGroups > 0
                  ? `⚠️ ${stats.criticalGroups} blood group(s) are at critical shortage. Immediate donation campaigns needed. Next month demand is projected to increase by ${demandGrowth}%.`
                  : stats.lowGroups > 0
                  ? `⚡ ${stats.lowGroups} blood group(s) are running low. Consider organizing donation drives. Demand is expected to rise by ${demandGrowth}% next month.`
                  : `✅ All blood groups are stable. Continue regular monitoring. Demand is expected to remain stable.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  iconBg: string;
  accent: string;
  to: string;
}

function MetricCard({ title, value, icon, trend, iconBg, accent, to }: MetricCardProps) {
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${to} hover:-translate-y-0.5`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend === 'up' ? 'Improving' : 'Needs attention'}
            </span>
          </div>
        )}
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`}></div>
    </Card>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatRow({ label, value, icon }: StatRowProps) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// Prediction Card Component
interface PredictionCardProps {
  prediction: PredictionData;
}

function PredictionCard({ prediction }: PredictionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 border-red-300';
      case 'low': return 'bg-yellow-100 border-yellow-300';
      case 'stable': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-600 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      case 'stable': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDaysColor = (days: number) => {
    if (days < 7) return 'text-red-600';
    if (days < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMonthIndicator = (days: number) => {
    const months = Math.floor(days / 30);
    if (months === 0) return 'This month';
    if (months === 1) return 'Next month';
    return `${months} months`;
  };

  return (
    <div className={`border rounded-xl p-4 ${getStatusColor(prediction.status)} hover:shadow-md transition-all duration-300`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900">{prediction.blood_group}</span>
              <Badge className={getStatusBadgeColor(prediction.status)}>
                {prediction.status.toUpperCase()}
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Calendar className="h-3 w-3 mr-1" />
                {getMonthIndicator(prediction.days_until_shortage)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-600">
                Available: <span className="font-semibold">{prediction.units_available}</span> units
              </span>
              <span className="text-gray-600">
                Monthly Demand: <span className="font-semibold">{prediction.monthly_demand}</span> units
              </span>
              <span className={`font-semibold ${getDaysColor(prediction.days_until_shortage)}`}>
                {prediction.days_until_shortage > 30
                  ? `${Math.round(prediction.days_until_shortage / 30)} months`
                  : `${prediction.days_until_shortage} days`} until shortage
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
            onClick={() => toast.info(`Opening ${prediction.blood_group} campaign`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 pt-3 border-t border-gray-200/50">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Recommendation:</span> {prediction.recommendation}
        </p>
      </div>

      {/* Stock Level with Month Indicator */}
      <div className="mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span>Stock Level</span>
          <span className="ml-auto">
            {prediction.days_until_shortage < 30 ? (
              <span className="text-red-500 font-medium">⚠️ Critical shortage expected {getMonthIndicator(prediction.days_until_shortage)}</span>
            ) : prediction.days_until_shortage < 60 ? (
              <span className="text-yellow-500 font-medium">⚠️ Monitor closely - shortage in {getMonthIndicator(prediction.days_until_shortage)}</span>
            ) : (
              <span className="text-green-500 font-medium">✅ Sufficient stock for {getMonthIndicator(prediction.days_until_shortage)}</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                prediction.status === 'critical' ? 'bg-red-500' :
                prediction.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((prediction.units_available / 50) * 100, 100)}%` }}
            />
          </div>
          <span>{Math.min((prediction.units_available / 50) * 100, 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}