// app/dashboard/hospital/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Droplet, 
  Plus, 
  Edit, 
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  blood_group: string;
  units_available: number;
}

// Define color types
type SummaryColorType = 'blue' | 'green' | 'red' | 'purple';

const summaryColors: Record<SummaryColorType, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700'
};

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
    if (units >= 20) return { label: 'Good', color: 'bg-green-100 text-green-700' };
    if (units >= 10) return { label: 'Low', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Critical', color: 'bg-red-100 text-red-700' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your hospital blood stock</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Add New Blood Group */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Add New Blood Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm font-semibold">Blood Group</Label>
              <select 
                className="w-full px-3 py-2 border rounded-lg mt-1"
                value={newBloodGroup}
                onChange={(e) => setNewBloodGroup(e.target.value)}
              >
                <option value="">Select blood group</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
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
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Blood Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.map((item) => {
              const status = getStockStatus(item.units_available);
              const isEditing = editingId === item.id;

              return (
                <Card key={item.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Droplet className="h-5 w-5 text-red-500" />
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
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-blue-600">
                              {item.units_available}
                            </p>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
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
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {inventory.length === 0 && (
            <div className="text-center py-12">
              <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No inventory items found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first blood group above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          label="Total Units" 
          value={inventory.reduce((sum, i) => sum + i.units_available, 0)}
          color="blue"
        />
        <SummaryCard 
          label="Blood Groups" 
          value={inventory.length}
          color="green"
        />
        <SummaryCard 
          label="Critical Stock" 
          value={inventory.filter(i => i.units_available < 10).length}
          color="red"
        />
        <SummaryCard 
          label="Good Stock" 
          value={inventory.filter(i => i.units_available >= 20).length}
          color="purple"
        />
      </div>
    </div>
  );
}

// SummaryCard Component with proper typing
interface SummaryCardProps {
  label: string;
  value: number;
  color: SummaryColorType;
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  return (
    <Card className={summaryColors[color]}>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs">{label}</p>
      </CardContent>
    </Card>
  );
}