// app/dashboard/hospital/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import {
  Droplet,
  Plus,
  Minus,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Activity,
  HeartPulse,
  Flame,
  TrendingUp,
  PackagePlus,
  Pencil,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Boxes,
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  blood_group: string;
  units_available: number;
}

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Blood group theme colors
const BLOOD_THEMES: Record<string, { gradient: string; soft: string; text: string; bar: string; glow: string }> = {
  'A+': { gradient: 'from-red-500 to-rose-600', soft: 'bg-red-50 border-red-100', text: 'text-red-600', bar: 'bg-red-500', glow: 'shadow-red-500/20' },
  'A-': { gradient: 'from-rose-400 to-pink-500', soft: 'bg-rose-50 border-rose-100', text: 'text-rose-500', bar: 'bg-rose-400', glow: 'shadow-rose-500/20' },
  'B+': { gradient: 'from-blue-500 to-indigo-600', soft: 'bg-blue-50 border-blue-100', text: 'text-blue-600', bar: 'bg-blue-500', glow: 'shadow-blue-500/20' },
  'B-': { gradient: 'from-sky-400 to-blue-500', soft: 'bg-sky-50 border-sky-100', text: 'text-sky-500', bar: 'bg-sky-400', glow: 'shadow-sky-500/20' },
  'AB+': { gradient: 'from-purple-500 to-violet-600', soft: 'bg-purple-50 border-purple-100', text: 'text-purple-600', bar: 'bg-purple-500', glow: 'shadow-purple-500/20' },
  'AB-': { gradient: 'from-fuchsia-400 to-purple-500', soft: 'bg-fuchsia-50 border-fuchsia-100', text: 'text-fuchsia-500', bar: 'bg-fuchsia-400', glow: 'shadow-fuchsia-500/20' },
  'O+': { gradient: 'from-emerald-500 to-teal-600', soft: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  'O-': { gradient: 'from-teal-400 to-emerald-500', soft: 'bg-teal-50 border-teal-100', text: 'text-teal-500', bar: 'bg-teal-400', glow: 'shadow-teal-500/20' },
};

// Max units for the progress bar (30 = full)
const MAX_UNITS = 30;

export default function InventoryPage() {
  const { user, token } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBloodGroup, setNewBloodGroup] = useState('');
  const [newUnits, setNewUnits] = useState('');

  // Edit dialog state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editUnits, setEditUnits] = useState<number>(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Quick adjust loading states
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustDirection, setAdjustDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${user?.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      } else {
        // Fallback mock data
        setInventory([
          { id: '1', blood_group: 'A+', units_available: 25 },
          { id: '2', blood_group: 'A-', units_available: 10 },
          { id: '3', blood_group: 'B+', units_available: 20 },
          { id: '4', blood_group: 'B-', units_available: 8 },
          { id: '5', blood_group: 'AB+', units_available: 12 },
          { id: '6', blood_group: 'AB-', units_available: 5 },
          { id: '7', blood_group: 'O+', units_available: 30 },
          { id: '8', blood_group: 'O-', units_available: 15 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
    toast.success('Inventory refreshed');
  };

  const updateInventory = async (bloodGroup: string, units: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            hospital_id: user?.id,
            blood_group: bloodGroup,
            units_available: units
          })
        }
      );

      if (response.ok) {
        return true;
      } else {
        toast.error('Failed to update inventory');
        return false;
      }
    } catch (error) {
      toast.error('Network error');
      return false;
    }
  };

  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    if (adjustingId) return;
    const newValue = Math.max(0, item.units_available + delta);
    if (newValue === item.units_available) {
      toast.error('Cannot go below 0 units');
      return;
    }

    setAdjustingId(item.id);
    setAdjustDirection(delta > 0 ? 'up' : 'down');

    const success = await updateInventory(item.blood_group, newValue);
    if (success) {
      toast.success(`${item.blood_group}: ${item.units_available} → ${newValue} units`);
      await fetchInventory();
    }

    setAdjustingId(null);
    setAdjustDirection(null);
  };

  const handleAdd = async () => {
    if (!newBloodGroup || !newUnits) {
      toast.error('Please select blood group and enter units');
      return;
    }

    const units = parseInt(newUnits);
    if (isNaN(units) || units < 0) {
      toast.error('Please enter a valid number');
      return;
    }

    // Check if blood group already exists
    const exists = inventory.find(i => i.blood_group === newBloodGroup);
    if (exists) {
      // Update existing instead
      const success = await updateInventory(newBloodGroup, units);
      if (success) {
        toast.success(`${newBloodGroup} stock updated to ${units} units`);
        await fetchInventory();
        setIsAddDialogOpen(false);
        setNewBloodGroup('');
        setNewUnits('');
      }
      return;
    }

    const success = await updateInventory(newBloodGroup, units);
    if (success) {
      toast.success(`${newBloodGroup} added with ${units} units`);
      await fetchInventory();
      setIsAddDialogOpen(false);
      setNewBloodGroup('');
      setNewUnits('');
    }
  };

  const handleEdit = async () => {
    if (!editingItem) return;
    if (isNaN(editUnits) || editUnits < 0) {
      toast.error('Please enter a valid number');
      return;
    }

    const success = await updateInventory(editingItem.blood_group, editUnits);
    if (success) {
      toast.success(`${editingItem.blood_group} updated to ${editUnits} units`);
      await fetchInventory();
      setIsEditDialogOpen(false);
      setEditingItem(null);
    }
  };

  const getStatus = (units: number) => {
    if (units >= 20) return { label: 'Good', text: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500', pct: (units / MAX_UNITS) * 100, icon: CheckCircle2 };
    if (units >= 10) return { label: 'Low', text: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500', pct: (units / MAX_UNITS) * 100, icon: AlertTriangle };
    return { label: 'Critical', text: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500', pct: (units / MAX_UNITS) * 100, icon: Flame };
  };

  const totalUnits = inventory.reduce((sum, i) => sum + i.units_available, 0);
  const criticalCount = inventory.filter(i => i.units_available < 10).length;
  const lowCount = inventory.filter(i => i.units_available >= 10 && i.units_available < 20).length;
  const healthyCount = inventory.filter(i => i.units_available >= 20).length;
  const missingGroups = ALL_BLOOD_GROUPS.filter(bg => !inventory.some(i => i.blood_group === bg));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-red-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Droplet className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading blood inventory...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 sm:p-8 shadow-xl shadow-blue-500/20">
        {/* Decorative */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>
        <div className="absolute bottom-6 right-40 w-8 h-8 bg-white/10 rounded-lg rotate-45"></div>
        <div className="absolute top-6 right-32 w-8 h-8 bg-white/5 rounded-lg rotate-12"></div>
        <div className="absolute bottom-8 right-48 w-5 h-5 bg-white/5 rounded-full"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold mb-3">
              <Activity className="h-3.5 w-3.5" />
              Blood Bank Overview
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              Blood Inventory
            </h1>
            <p className="text-blue-100 mt-2 text-sm sm:text-base max-w-md">
              Monitor your blood bank stock levels in real-time. Keep every blood group healthy and ready to save lives.
            </p>

            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <Droplet className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">{totalUnits}</p>
                                  <p className="text-blue-100 text-[10px]">Total Units</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Boxes className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">{inventory.length}/8</p>
                                  <p className="text-blue-100 text-[10px]">Groups</p>
                </div>
              </div>
              {criticalCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center animate-pulse">
                    <Flame className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">{criticalCount}</p>
                                    <p className="text-blue-100 text-[10px]">Critical</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/15 text-white hover:bg-white/10 hover:text-white bg-white/5"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25 font-semibold"
            >
              <PackagePlus className="h-4 w-4 mr-2" />
              Add Blood Group
            </Button>
          </div>
        </div>
      </div>

      {/* ===== HEALTH SUMMARY ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50/30 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{healthyCount}</p>
              <p className="text-xs text-gray-500 mt-1">Healthy Groups (≥20)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50/30 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{lowCount}</p>
              <p className="text-xs text-gray-500 mt-1">Low Stock (10-19)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-rose-50/30 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{criticalCount}</p>
              <p className="text-xs text-gray-500 mt-1">Critical {'(<10)'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== ALERT BANNER ===== */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50/50">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-red-400/30 rounded-full blur-lg animate-pulse"></div>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-800">
              {criticalCount} blood group{criticalCount > 1 ? 's' : ''} critically low!
            </p>
            <p className="text-sm text-red-700">
              {missingGroups.length > 0
                ? `${missingGroups.join(', ')} not in stock. `
                : ''}
              Urgent restocking is recommended.
            </p>
          </div>
          {missingGroups.length > 0 && (
            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Missing
            </Button>
          )}
        </div>
      )}

      {/* ===== INVENTORY GRID ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Stock Levels</h2>
            <p className="text-sm text-gray-500">Click +/- to quickly adjust stock</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Good
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span> Low
            <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span> Critical
          </div>
        </div>

        {inventory.length === 0 && missingGroups.length === 8 ? (
          <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
            <CardContent className="py-16 text-center">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-60"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center border border-red-100">
                  <Droplet className="h-10 w-10 text-red-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No blood groups added yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Start building your blood bank inventory by adding blood groups and their available units.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first blood group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Existing inventory cards */}
            {inventory.map((item) => {
              const theme = BLOOD_THEMES[item.blood_group] || BLOOD_THEMES['O+'];
              const status = getStatus(item.units_available);
              const StatusIcon = status.icon;
              const isAdjusting = adjustingId === item.id;
              const pct = Math.min((item.units_available / MAX_UNITS) * 100, 100);

              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden border bg-white hover:shadow-lg hover:shadow-gray-900/5 transition-all duration-300 rounded-2xl"
                >
                  {/* Top gradient accent */}
                  <div className={`h-1.5 bg-gradient-to-r ${theme.gradient}`}></div>

                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* Blood group icon */}
                        <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg ${theme.glow}`}>
                          <Droplet className="h-5 w-5 text-white" />
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${status.dot} ring-2 ring-white"></span>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900 leading-none">{item.blood_group}</p>
                          <p className={`text-[10px] font-medium uppercase tracking-wide mt-0.5 ${status.text}`}>
                            {status.label} Stock
                          </p>
                        </div>
                      </div>

                      {/* Edit button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingItem(item);
                          setEditUnits(item.units_available);
                          setIsEditDialogOpen(true);
                        }}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Units display */}
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-3xl font-bold text-gray-900 leading-none">{item.units_available}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">units available</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${status.bg}`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${status.text}`} />
                        <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] text-gray-400">
                        {item.units_available >= 20
                          ? '✓ Healthy'
                          : item.units_available >= 10
                            ? '⚠ Need restock'
                            : '🔥 Urgent'}
                      </span>
                      <span className="text-[10px] text-gray-400">{Math.round(pct)}% capacity</span>
                    </div>

                    {/* Quick adjust buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdjust(item, 1)}
                        disabled={isAdjusting}
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                      >
                        {isAdjusting && adjustDirection === 'up' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1">Receive</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdjust(item, -1)}
                        disabled={isAdjusting || item.units_available === 0}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        {isAdjusting && adjustDirection === 'down' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                        <span className="ml-1">Issue</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Missing blood group placeholders */}
            {missingGroups.slice(0, 8 - inventory.length).map((bg) => {
              const theme = BLOOD_THEMES[bg] || BLOOD_THEMES['O+'];
              return (
                <button
                  key={bg}
                  onClick={() => {
                    setNewBloodGroup(bg);
                    setIsAddDialogOpen(true);
                  }}
                  className="group relative overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-2xl p-4 text-left bg-white/50"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${theme.gradient} opacity-30 group-hover:opacity-50 transition-opacity flex items-center justify-center`}>
                      <Droplet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-500 leading-none">{bg}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Not Added Yet</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Click to add stock</span>
                    <span className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Plus className="h-3.5 w-3.5 text-gray-500" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== IMPACT CARD ===== */}
      <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl overflow-hidden">
        <CardContent className="p-5 relative">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-red-500/20 to-rose-500/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25 animate-pulse">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Your Blood Bank Impact</p>
              <p className="text-sm text-gray-400 mt-1">
                Holding <span className="font-bold text-white">{totalUnits}</span> units across{' '}
                <span className="font-bold text-white">{inventory.length}</span> blood groups —
                enough to help save up to <span className="font-bold text-white">{totalUnits * 3}</span> lives. 🏥
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== ADD DIALOG ===== */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Add Blood Group
            </DialogTitle>
            <DialogDescription>
              Add a new blood group or update stock levels for your inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Blood Group</Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {ALL_BLOOD_GROUPS.map(bg => {
                  const theme = BLOOD_THEMES[bg] || BLOOD_THEMES['O+'];
                  const exists = inventory.some(i => i.blood_group === bg);
                  const isSelected = newBloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setNewBloodGroup(bg)}
                      disabled={exists}
                      className={`
                        relative py-2 rounded-xl border text-sm font-bold transition-all
                        flex items-center justify-center gap-1
                        ${isSelected
                          ? `bg-gradient-to-r ${theme.gradient} text-white border-transparent shadow-lg ${theme.glow}`
                          : exists
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : `border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50`
                        }
                      `}
                    >
                      <Droplet className="h-3 w-3" />
                      {bg}
                      {exists && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                      )}
                    </button>
                  );
                })}
              </div>
              {newBloodGroup && (
                <p className="text-xs text-gray-400 mt-1.5">
                  {inventory.some(i => i.blood_group === newBloodGroup)
                    ? `"${newBloodGroup}" already has stock — this will update it.`
                    : `Adding new group: ${newBloodGroup}`}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold">Units Available</Label>
              <Input
                type="number"
                min="0"
                placeholder="Enter number of units"
                value={newUnits}
                onChange={(e) => setNewUnits(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-white" />
              </div>
              Update {editingItem?.blood_group} Stock
            </DialogTitle>
            <DialogDescription>
              Set the exact number of available units for this blood group.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label className="text-sm font-semibold">Units Available</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditUnits(Math.max(0, editUnits - 1))}
                className="h-11 w-11 flex-shrink-0 border-gray-200"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="0"
                value={editUnits}
                onChange={(e) => setEditUnits(parseInt(e.target.value) || 0)}
                className="h-11 text-center font-bold text-lg"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditUnits(editUnits + 1)}
                className="h-11 w-11 flex-shrink-0 border-gray-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 shadow-lg shadow-blue-500/25"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}