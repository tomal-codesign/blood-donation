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
  BarChart3,
  Activity,
  Droplet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Minus,
  Flame,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

// ============ API DATA STRUCTURES ============
interface PredictionData {
  blood_group: string;
  current_period: {
    request_count: number;
    total_units_needed: number;
    critical_requests: number;
    moderate_requests: number;
    normal_requests: number;
  };
  previous_period: {
    request_count: number;
    total_units_needed: number;
  };
  trend_change_pct: number;
  projected_request_count: number;
  projected_units_needed: number;
  demand_level: string;
  status: 'critical' | 'low' | 'stable';
  recommendation: string;
}

interface AISummary {
  total_blood_groups: number;
  total_current_requests: number;
  total_projected_requests: number;
  total_units_needed: number;
  total_critical_requests: number;
  critical_groups: number;
  low_groups: number;
  stable_groups: number;
  highest_demand_group: {
    blood_group: string;
    projected_requests: number;
  } | null;
}

interface ChartDataPoint {
  blood_group: string;
  currentRequests: number;
  projectedRequests: number;
  status: string;
  demand_level: string;
}

// ============ CONSTANTS ============
const STATUS_COLORS: Record<string, string> = {
  critical: '#ef4444',
  low: '#eab308',
  stable: '#22c55e',
};

const STATUS_STYLES = {
  critical: {
    badge: 'bg-red-600 text-white',
    border: 'border-red-200 ring-2 ring-red-100',
    accent: 'bg-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
  low: {
    badge: 'bg-yellow-500 text-white',
    border: 'border-yellow-200 ring-2 ring-yellow-100',
    accent: 'bg-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  stable: {
    badge: 'bg-green-500 text-white',
    border: 'border-gray-100 ring-0',
    accent: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
};

const DEMAND_LEVEL_STYLES: Record<string, string> = {
  'Very High': 'bg-red-100 text-red-700 border-red-200',
  'High': 'bg-orange-100 text-orange-700 border-orange-200',
  'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Low': 'bg-blue-100 text-blue-700 border-blue-200',
  'No Demand': 'bg-gray-100 text-gray-500 border-gray-200',
};

const TREND_STYLES = {
  up: { icon: TrendingUp, text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  down: { icon: TrendingDown, text: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  flat: { icon: Minus, text: 'text-gray-500', bg: 'bg-gray-50 border-gray-100' },
};

export default function AdminAIMonitorPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [summary, setSummary] = useState<AISummary>({
    total_blood_groups: 0,
    total_current_requests: 0,
    total_projected_requests: 0,
    total_units_needed: 0,
    total_critical_requests: 0,
    critical_groups: 0,
    low_groups: 0,
    stable_groups: 0,
    highest_demand_group: null,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

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
        setSummary(data.summary || {});
        setLastUpdated(data.generated_at || new Date().toISOString());
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

  // ============ DERIVED DATA ============
  const chartData: ChartDataPoint[] = predictions.map((p) => ({
    blood_group: p.blood_group,
    currentRequests: p.current_period.request_count,
    projectedRequests: p.projected_request_count,
    status: p.status,
    demand_level: p.demand_level,
  }));

  const totalCurrentRequests = chartData.reduce((s, d) => s + d.currentRequests, 0);
  const totalProjectedRequests = chartData.reduce((s, d) => s + d.projectedRequests, 0);

  const highestDemandGroup = chartData.length > 0
    ? chartData.reduce((max, d) => (d.projectedRequests > max.projectedRequests ? d : max), chartData[0])
    : null;

  const demandGrowthPct = totalCurrentRequests > 0
    ? Math.round(((totalProjectedRequests - totalCurrentRequests) / totalCurrentRequests) * 100)
    : 0;

  const totalModerateRequests = predictions.reduce((s, p) => s + p.current_period.moderate_requests, 0);
  const totalNormalRequests = predictions.reduce((s, p) => s + p.current_period.normal_requests, 0);
  const totalPreviousRequests = predictions.reduce((s, p) => s + p.previous_period.request_count, 0);
  const totalProjectedUnits = predictions.reduce((s, p) => s + p.projected_units_needed, 0);

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
              AI Monitoring
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              AI Shortage Monitor
            </h1>
            <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
              AI-powered blood request prediction and demand monitoring for all 8 blood groups.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Brain className="h-3 w-3 mr-1.5" />
                {summary.total_blood_groups} Groups
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <AlertCircle className="h-3 w-3 mr-1.5" />
                {summary.critical_groups} Critical
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <TrendingUp className="h-3 w-3 mr-1.5" />
                {summary.total_current_requests} Requests
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Droplet className="h-3 w-3 mr-1.5" />
                {summary.total_units_needed} Units Needed
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-purple-300/70 font-semibold">Last Updated</p>
                <p className="text-sm text-white font-medium">{new Date(lastUpdated).toLocaleTimeString()}</p>
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
              {summary.stable_groups} stable groups
            </div>
          </div>
        </div>
      </div>

      {/* ========== KEY METRICS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests (30d)"
          value={summary.total_current_requests}
          sub={`${totalPreviousRequests} previous period`}
          icon={<BarChart3 className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
          accent="bg-gradient-to-r from-blue-500 to-indigo-400"
          to="from-white to-blue-50/50"
        />
        <MetricCard
          title="Critical Requests"
          value={summary.total_critical_requests}
          sub={`${totalModerateRequests} moderate · ${totalNormalRequests} normal`}
          icon={<AlertCircle className="h-5 w-5 text-white" />}
          trend={summary.total_critical_requests > 0 ? 'down' : 'up'}
          iconBg="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
          accent="bg-gradient-to-r from-red-500 to-rose-400"
          to="from-white to-red-50/50"
        />
        <MetricCard
          title="Projected Requests"
          value={summary.total_projected_requests}
          sub={`${getMonthName(1)} forecast`}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          trend={demandGrowthPct >= 0 ? 'up' : 'down'}
          iconBg="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25"
          accent="bg-gradient-to-r from-purple-500 to-violet-400"
          to="from-white to-purple-50/50"
        />
        <MetricCard
          title="Units Needed"
          value={summary.total_units_needed}
          sub={`${totalProjectedUnits} projected units`}
          icon={<Droplet className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
          accent="bg-gradient-to-r from-emerald-500 to-teal-400"
          to="from-white to-emerald-50/50"
        />
      </div>

      {/* ========== DEMAND DISTRIBUTION ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DistributionCard
          title="Critical Groups"
          value={summary.critical_groups}
          total={summary.total_blood_groups}
          color="bg-red-500"
          text="text-red-600"
          bg="from-red-50/50"
          icon={<Flame className="h-4 w-4 text-red-500" />}
          description="Immediate action needed"
        />
        <DistributionCard
          title="Low Groups"
          value={summary.low_groups}
          total={summary.total_blood_groups}
          color="bg-yellow-500"
          text="text-yellow-600"
          bg="from-yellow-50/50"
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
          description="Monitor closely"
        />
        <DistributionCard
          title="Stable Groups"
          value={summary.stable_groups}
          total={summary.total_blood_groups}
          color="bg-emerald-500"
          text="text-emerald-600"
          bg="from-emerald-50/50"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          description="No concerns"
        />
      </div>

      {/* ========== BLOOD REQUEST PREDICTIONS CHART ========== */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/30">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <BarChart3 className="h-4.5 w-4.5 text-white" />
              </div>
              Blood Request Predictions by Group
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {getMonthName(0)}: {totalCurrentRequests} requests
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {getMonthName(1)}: {totalProjectedRequests} projected
              </Badge>
            </div>
          </div>
          <CardDescription>
            Monthly blood request demand per blood group — current vs AI-projected for next month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="blood_group"
                    tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    label={{
                      value: 'Requests',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#9ca3af', fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                    formatter={(value: any, name: any, entry: any) => {
                      const group = chartData.find((d) => d.blood_group === entry?.payload?.blood_group);
                      if (name === 'currentRequests') {
                        return [`${value} requests (${group?.demand_level || 'No Demand'})`, `${getMonthName(0)} (Current)`];
                      }
                      return [`${value} requests`, `${getMonthName(1)} (AI Projected)`];
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-medium text-gray-600">
                        {value === 'currentRequests' ? `${getMonthName(0)} (Current)` : `${getMonthName(1)} (AI Projected)`}
                      </span>
                    )}
                  />
                  <Bar dataKey="currentRequests" name="currentRequests" radius={[4, 4, 0, 0]} fill="#6366f1" barSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6366f1'} />
                    ))}
                  </Bar>
                  <Bar dataKey="projectedRequests" name="projectedRequests" radius={[4, 4, 0, 0]} fill="#8b5cf6" barSize={28} fillOpacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No blood request data available yet</p>
            </div>
          )}

          {/* Legend & Growth */}
          <div className="flex flex-wrap items-center gap-4 mt-4 p-3 bg-white/70 border border-gray-100 rounded-xl text-xs text-gray-500">
            <span className="font-semibold text-gray-600 mr-1">Status:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.critical }}></span>
              Critical
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.low }}></span>
              Low
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS.stable }}></span>
              Stable
            </div>
            <span className="ml-auto">
              {demandGrowthPct >= 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <TrendingUp className="h-3 w-3" /> +{demandGrowthPct}% projected growth
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                  <TrendingDown className="h-3 w-3" /> {demandGrowthPct}% projected decline
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ========== PER-GROUP PREDICTION CARDS ========== */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            Group-wise Demand Details
          </CardTitle>
          <CardDescription>
            Detailed prediction for each blood group — demand, trend, projection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <GroupPredictionCard key={index} prediction={prediction} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========== AI INSIGHT ========== */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            AI Insight
          </CardTitle>
          <CardDescription>AI-generated recommendations based on request patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-semibold text-gray-900">Recommendation</h4>
              <p className="text-sm text-gray-600">
                {summary.total_critical_requests > 0
                  ? `${summary.total_critical_requests} critical blood request(s) this month. Immediate donation campaigns needed. Next month demand projected at ${summary.total_projected_requests} requests (+${demandGrowthPct}%).`
                  : summary.critical_groups > 0
                  ? `${summary.critical_groups} blood group(s) at critical demand level. Consider organizing donation drives.`
                  : `Blood request demand is manageable. ${summary.total_current_requests} requests this month, projected ${summary.total_projected_requests} next month.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {highestDemandGroup && highestDemandGroup.projectedRequests > 0 && (
                  <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    <span>
                      <span className="font-semibold">{highestDemandGroup.blood_group}</span>{' '}
                      highest projected demand ({highestDemandGroup.projectedRequests} requests)
                    </span>
                  </div>
                )}
                {demandGrowthPct !== 0 && (
                  <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2 border ${
                    demandGrowthPct > 0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                      : 'text-blue-700 bg-blue-50 border-blue-100'
                  }`}>
                    {demandGrowthPct > 0
                      ? <TrendingUp className="h-4 w-4 shrink-0" />
                      : <TrendingDown className="h-4 w-4 shrink-0" />}
                    <span>
                      Overall demand projected to {demandGrowthPct > 0 ? 'increase' : 'decrease'} by{' '}
                      <span className="font-semibold">{Math.abs(demandGrowthPct)}%</span> next month
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ HELPER: METRIC CARD ============
interface MetricCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  iconBg: string;
  accent: string;
  to: string;
}

function MetricCard({ title, value, sub, icon, trend, iconBg, accent, to }: MetricCardProps) {
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${to} hover:-translate-y-0.5`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1.5">{value}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
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
              {trend === 'up' ? 'Positive trend' : 'Needs attention'}
            </span>
          </div>
        )}
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`}></div>
    </Card>
  );
}

// ============ HELPER: DISTRIBUTION CARD ============
interface DistributionCardProps {
  title: string;
  value: number;
  total: number;
  color: string;
  text: string;
  bg: string;
  icon: React.ReactNode;
  description: string;
}

function DistributionCard({ title, value, total, color, text, bg, icon, description }: DistributionCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${bg} to-white shadow-sm`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</span>
          </div>
          <span className={`text-2xl font-bold ${text}`}>{value}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">{description} · {pct}% of all groups</p>
      </CardContent>
    </Card>
  );
}

// ============ HELPER: GROUP PREDICTION CARD ============
interface GroupPredictionCardProps {
  prediction: PredictionData;
}

function GroupPredictionCard({ prediction }: GroupPredictionCardProps) {
  const style = STATUS_STYLES[prediction.status] || STATUS_STYLES.stable;
  const trend = prediction.trend_change_pct > 0
    ? 'up'
    : prediction.trend_change_pct < 0
    ? 'down'
    : 'flat';
  const TrendIcon = TREND_STYLES[trend].icon;

  const demandBarMax = Math.max(
    prediction.current_period.request_count,
    prediction.previous_period.request_count,
    prediction.projected_request_count,
    1
  );

  return (
    <div className={`relative overflow-hidden border rounded-2xl p-4 sm:p-5 bg-white hover:shadow-lg transition-all duration-300 ${style.border}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accent}`}></div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${style.bg} ${style.text} flex items-center justify-center border-2 shrink-0`}>
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{prediction.blood_group}</span>
              <Badge className={style.badge}>{prediction.status.toUpperCase()}</Badge>
              <Badge className={DEMAND_LEVEL_STYLES[prediction.demand_level] || 'bg-gray-100 text-gray-500 border-gray-200'}>
                {prediction.demand_level}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {prediction.current_period.request_count > 0
                ? `${prediction.current_period.request_count} requests (${prediction.current_period.total_units_needed} units) in the last 30 days`
                : 'No requests in the last 30 days'}
            </p>
          </div>
        </div>

        {/* Trend badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${TREND_STYLES[trend].bg} ${TREND_STYLES[trend].text}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {prediction.trend_change_pct > 0 ? '+' : ''}{prediction.trend_change_pct}% vs last month
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pl-2">
        {/* Requests comparison */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Requests Trend</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Previous Period</span>
                <span className="font-bold text-gray-800">{prediction.previous_period.request_count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-400"
                  style={{ width: `${Math.max((prediction.previous_period.request_count / demandBarMax) * 100, 2)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Current Period</span>
                <span className="font-bold text-gray-800">{prediction.current_period.request_count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.accent}`}
                  style={{ width: `${Math.max((prediction.current_period.request_count / demandBarMax) * 100, 2)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-purple-500" /> Projected
                </span>
                <span className="font-bold text-purple-600">{prediction.projected_request_count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${Math.max((prediction.projected_request_count / demandBarMax) * 100, 2)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Priority Breakdown</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-red-50 border border-red-100 rounded-lg">
              <Flame className="h-3.5 w-3.5 mx-auto text-red-500" />
              <p className="text-lg font-bold text-red-600 mt-0.5">{prediction.current_period.critical_requests}</p>
              <p className="text-[10px] text-gray-500">Critical</p>
            </div>
            <div className="p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
              <Clock className="h-3.5 w-3.5 mx-auto text-yellow-500" />
              <p className="text-lg font-bold text-yellow-600 mt-0.5">{prediction.current_period.moderate_requests}</p>
              <p className="text-[10px] text-gray-500">Moderate</p>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 mx-auto text-blue-500" />
              <p className="text-lg font-bold text-blue-600 mt-0.5">{prediction.current_period.normal_requests}</p>
              <p className="text-[10px] text-gray-500">Normal</p>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[11px] text-gray-500">
              Total units needed: <span className="font-semibold text-gray-800">{prediction.current_period.total_units_needed}</span>
            </p>
          </div>
        </div>

      </div>

      {/* Recommendation */}
      <div className="mt-4 pl-2 flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-50/70 to-transparent border border-purple-100/60">
        <Info className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-700">
          <span className="font-medium text-purple-700">AI Recommendation:</span>{' '}
          {prediction.recommendation}
        </p>
      </div>
    </div>
  );
}