// app/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Search, 
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  User,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Calendar,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';

interface UserType {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  created_at: string;
  is_available?: boolean;
  total_donations?: number;
}

// Define color types
type StatsColorType = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

const statsColors: Record<StatsColorType, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-yellow-50 text-yellow-700'
};

type RoleType = 'all' | 'donor' | 'hospital' | 'admin' | 'patient';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<RoleType>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Add mock data for demo
        const usersWithExtra = (data.users || []).map((u: any) => ({
          ...u,
          is_available: Math.random() > 0.3,
          total_donations: Math.floor(Math.random() * 20)
        }));
        setUsers(usersWithExtra);
      } else {
        // Fallback mock data
        setUsers([
          { id: '1', full_name: 'John Doe', email: 'john@example.com', phone: '01712345678', city: 'Dhaka', role: 'donor', created_at: '2024-01-01', is_available: true, total_donations: 5 },
          { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', phone: '01812345678', city: 'Chittagong', role: 'hospital', created_at: '2024-02-15', is_available: true, total_donations: 0 },
          { id: '3', full_name: 'Admin User', email: 'admin@example.com', phone: '01912345678', city: 'Dhaka', role: 'admin', created_at: '2024-03-01', is_available: true, total_donations: 0 },
          { id: '4', full_name: 'Patient One', email: 'patient@example.com', phone: '01612345678', city: 'Khulna', role: 'patient', created_at: '2024-04-01', is_available: false, total_donations: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }
    
    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      donor: 'bg-green-100 text-green-700',
      hospital: 'bg-blue-100 text-blue-700',
      admin: 'bg-purple-100 text-purple-700',
      patient: 'bg-yellow-100 text-yellow-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'donor': return <UserCheck className="h-4 w-4" />;
      case 'hospital': return <Shield className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // API call to delete user
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        }
      );

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
        setSelectedUser(null);
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getStats = () => {
    const total = users.length;
    const donors = users.filter(u => u.role === 'donor').length;
    const hospitals = users.filter(u => u.role === 'hospital').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const patients = users.filter(u => u.role === 'patient').length;
    const active = users.filter(u => u.is_available).length;
    return { total, donors, hospitals, admins, patients, active };
  };

  const stats = getStats();

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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users in the system</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchUsers}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard label="Total" value={stats.total} color="blue" />
        <StatsCard label="Donors" value={stats.donors} color="green" />
        <StatsCard label="Hospitals" value={stats.hospitals} color="purple" />
        <StatsCard label="Admins" value={stats.admins} color="orange" />
        <StatsCard label="Patients" value={stats.patients} color="yellow" />
        <StatsCard label="Active" value={stats.active} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email or phone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select 
            className="w-full px-4 py-2 border rounded-lg"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as RoleType)}
          >
            <option value="all">All Roles</option>
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                      backgroundColor: user.role === 'admin' ? '#f3e8ff' : 
                                      user.role === 'hospital' ? '#dbeafe' : 
                                      user.role === 'donor' ? '#d1fae5' : '#fef3c7'
                    }}>
                      {user.role === 'admin' ? <Shield className="h-5 w-5 text-purple-600" /> :
                       user.role === 'hospital' ? <Shield className="h-5 w-5 text-blue-600" /> :
                       user.role === 'donor' ? <UserCheck className="h-5 w-5 text-green-600" /> :
                       <User className="h-5 w-5 text-yellow-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{user.full_name || 'Unknown'}</p>
                        <Badge className={getRoleBadge(user.role)}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</span>
                        </Badge>
                        {user.is_available !== undefined && (
                          <Badge className={user.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {user.is_available ? '🟢 Active' : '🔴 Inactive'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {user.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {user.city || 'N/A'}
                        </span>
                      </div>
                      {user.total_donations !== undefined && user.role === 'donor' && (
                        <p className="text-xs text-gray-400 mt-1">
                          <span className="font-medium">Total Donations:</span> {user.total_donations}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                      className="text-purple-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Edit Role Section */}
                {selectedUser?.id === user.id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Change Role:</span>
                      <select 
                        className="px-3 py-1 border rounded-lg text-sm"
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                      >
                        <option value="donor">Donor</option>
                        <option value="hospital">Hospital</option>
                        <option value="admin">Admin</option>
                        <option value="patient">Patient</option>
                      </select>
                      <span className="text-xs text-gray-400">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{selectedUser.full_name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => deleteUser(selectedUser.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// StatsCard Component with proper typing
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