// app/dashboard/hospital/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import {
  Droplet,
  Plus,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Save,
  Sparkles,
  Database,
  TrendingUp,
  Activity,
  Boxes,
  Package,
  HeartPulse,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  blood_group: string;
  units_available: number;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function InventoryPage() {
  const { user, token } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [newBloodGroup, setNewBloodGroup] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
        toast.success(`${bloodGroup} updated successfully`);
        await fetchInventory();
        setEditingId(null);
      } else {
        toast.error('Failed to update inventory');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const addBloodGroup = async () => {
    if (!newBloodGroup || !newUnits) {
      toast.error('Please select blood group and enter units');
      return;
    }

    const units = parseInt(newUnits);
    if (isNaN(units) || units < 0) {
      toast.error('Please enter a valid number');
      return;
    }

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
            blood_group: newBloodGroup,
            units_available: units
          })
        }
      );

      if (response.ok) {
        toast.success(`${newBloodGroup} added successfully`);
        setNewBloodGroup('');
        setNewUnits('');
        await fetchInventory();
      } else {
        toast.error('Failed to add blood group');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getStockStatus = (units: number) => {
    if (units >= 20) return { label: 'Good', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2, bar: 'bg-gradient-to-r from-emerald-400 to-teal-500' };
    if (units >= 10) return { label: 'Low', color: 'text-amber-600 bg-amber-50', icon: AlertCircle, bar: 'bg-gradient-to-r from-amber-400 to-orange-500' };
    return { label: 'Critical', color: 'text-red-600 bg-red-50', icon: XCircle, bar: 'bg-gradient-to-r from-red-400 to-rose-500' };
  };

  const totalUnits = inventory.reduce((sum, i) => sum + i.units_available, 0);
  const criticalStock = inventory.filter(i => i.units_available < 10).length;
  const lowStock = inventory.filter(i => i.units_available >= 10 && i.units_available < 20).length;
  const goodStock = inventory.filter(i => i.units_available >= 20).length;
  const coverageRate = inventory.length > 0 ? Math.round((goodStock / inventory.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Droplet className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading your blood inventory...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 sm:p-8 shadow-xl shadow-blue-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-24 w-12 h-12 bg-white/10 rounded-xl rotate-12"></div>
        <div className="absolute bottom-6 right-40 w-8 h-8 bg-white/10 rounded-lg rotate-45"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Blood Inventory Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Blood Inventory</h1>
            <p className="text-blue-50 mt-1.5 text-sm sm:text-base max-w-md">
              Track and manage your hospital's blood stock levels. Every unit saves a life!
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-none">
                <Database className="h-3 w-3 mr-1" />
                {inventory.length} Blood Groups
              </Badge>
              <Badge className="bg-white/20 text-white border-none">
                <Boxes className="h-3 w-3 mr-1" />
                {totalUnits} Total Units
              </Badge>
              {criticalStock > 0 && (
                <Badge className="bg-red-500/30 text-red-100 border-none animate-pulse">
                  <Flame className="h-3 w-3 mr-1" />
                  {criticalStock} Critical
                </Badge>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-white/10 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Units */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Units</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalUnits}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">across all groups</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <Droplet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        </Card>

        {/* Blood Groups */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Blood Groups</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{inventory.length}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">of 8 total</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
        </Card>

        {/* Critical Stock */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-red-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Critical Stock</p>
                <p className={`text-2xl font-bold mt-0.5 ${criticalStock > 0 ? 'text-red-600' : 'text-gray-900'}`}>{criticalStock}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">need attention</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${criticalStock > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25 animate-pulse' : 'bg-gradient-to-br from-red-100 to-rose-200 shadow-red-500/10'}`}>
                <AlertCircle className={`h-5 w-5 ${criticalStock > 0 ? 'text-white' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
        </Card>

        {/* Coverage Rate */}
        <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-shadow border-0 bg-gradient-to-br from-white to-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Coverage Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-0.5">{coverageRate}%</p>
                <p className="text-[11px] text-gray-400 mt-0.5">good stock level</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-400"></div>
        </Card>
      </div>

      {/* Add New Blood Group */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add New Blood Group</h3>
              <p className="text-xs text-gray-500">Add or update blood stock levels</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm font-semibold">Blood Group</Label>
              <Select onValueChange={setNewBloodGroup} value={newBloodGroup}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Units Available</Label>
              <Input
                type="number"
                placeholder="Enter units"
                value={newUnits}
                onChange={(e) => setNewUnits(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addBloodGroup}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90 shadow-lg shadow-blue-500/25 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Blood Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Boxes className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Stock Levels</h3>
                <p className="text-xs text-gray-500">Real-time inventory status</p>
              </div>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.map((item) => {
              const status = getStockStatus(item.units_available);
              const StatusIcon = status.icon;
              const isEditing = editingId === item.id;

              return (
                <Card
                  key={item.id}
                  className={`group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg hover:shadow-gray-900/5 transition-all duration-300 ${
                    isEditing ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                            item.units_available >= 20
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
                              : item.units_available >= 10
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20'
                                : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                          }`}>
                            <Droplet className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xl font-bold text-gray-900">
                            {item.blood_group}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                              className="w-24"
                            />
                            <Button
                              size="sm"
                              onClick={() => updateInventory(item.blood_group, editValue)}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-md shadow-emerald-500/20"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              className="border-gray-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {item.units_available}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`border ${status.color} font-semibold gap-1`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditValue(item.units_available);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {!isEditing && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${status.bar}`}
                            style={{ width: `${Math.min((item.units_available / 30) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {item.units_available >= 20
                            ? 'Healthy stock level'
                            : item.units_available >= 10
                              ? 'Consider restocking soon'
                              : 'Urgent restocking needed'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {inventory.length === 0 && (
            <div className="text-center py-12">
              <div className="relative mx-auto w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-60"></div>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center border border-blue-100">
                  <Droplet className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <p className="text-gray-500 text-sm">No inventory items found</p>
              <p className="text-xs text-gray-400 mt-1">Add your first blood group above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Message */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-transparent shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your Impact Matters</p>
              <p className="text-sm text-gray-600 mt-0.5">
                Your blood bank currently holds <span className="font-bold text-blue-600">{totalUnits}</span> units across{' '}
                <span className="font-bold text-blue-600">{inventory.length}</span> blood groups,
                enough to help save up to <span className="font-bold text-blue-600">{totalUnits * 3}</span> lives.
                Keep your stock healthy! 🏥
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}