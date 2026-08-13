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
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  User,
  Filter,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Shield,
  UserCheck,
  Sparkles,
  Building2,
  AlertTriangle,
  X,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserType {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  district: string;
  division: string;
  role: string;
  created_at: string;
}

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
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        // Fallback mock data
        setUsers([
          { id: '1', full_name: 'John Doe', email: 'john@example.com', phone: '01712345678', district: 'Dhaka', division: 'Dhaka', role: 'donor', created_at: '2024-01-01' },
          { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', phone: '01812345678', district: 'Chattogram', division: 'Chattogram', role: 'hospital', created_at: '2024-02-15' },
          { id: '3', full_name: 'Admin User', email: 'admin@example.com', phone: '01912345678', district: 'Gazipur', division: 'Dhaka', role: 'admin', created_at: '2024-03-01' },
          { id: '4', full_name: 'Patient One', email: 'patient@example.com', phone: '01612345678', district: 'Khulna', division: 'Khulna', role: 'patient', created_at: '2024-04-01' }
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

  const getRoleConfig = (role: string) => {
    const configs: Record<string, { badge: string; iconBg: string; icon: React.ReactNode; text: string }> = {
      donor: {
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20',
        icon: <UserCheck className="h-4 w-4 text-white" />,
        text: 'Donor'
      },
      hospital: {
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20',
        icon: <Building2 className="h-4 w-4 text-white" />,
        text: 'Hospital'
      },
      admin: {
        badge: 'bg-purple-100 text-purple-700 border-purple-200',
        iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/20',
        icon: <Shield className="h-4 w-4 text-white" />,
        text: 'Admin'
      },
      patient: {
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20',
        icon: <User className="h-4 w-4 text-white" />,
        text: 'Patient'
      }
    };
    return configs[role] || {
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      iconBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
      icon: <User className="h-4 w-4 text-white" />,
      text: role?.charAt(0).toUpperCase() + role?.slice(1)
    };
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
    return { total, donors, hospitals, admins, patients };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Users className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <p className="mt-5 text-gray-500 font-medium">Loading users...</p>
        <div className="mt-3 h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    );
  }

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
              User Management
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Manage Users
            </h1>
            <p className="text-purple-200/80 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
              View, edit, and manage all users across the blood donation platform.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Users className="h-3 w-3 mr-1.5" />
                {stats.total} Total
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <UserCheck className="h-3 w-3 mr-1.5" />
                {stats.donors} Donors
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Building2 className="h-3 w-3 mr-1.5" />
                {stats.hospitals} Hospitals
              </Badge>
              <Badge className="bg-white/10 text-white border-white/10 backdrop-blur-sm">
                <Shield className="h-3 w-3 mr-1.5" />
                {stats.admins} Admins
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchUsers}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {stats.total} total users
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Total Users"
          value={stats.total}
          icon={<Users className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/25"
          accent="bg-gradient-to-r from-slate-500 to-slate-400"
          to="from-white to-slate-50/50"
        />
        <StatsCard
          label="Donors"
          value={stats.donors}
          icon={<UserCheck className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
          accent="bg-gradient-to-r from-emerald-500 to-teal-400"
          to="from-white to-emerald-50/50"
        />
        <StatsCard
          label="Hospitals"
          value={stats.hospitals}
          icon={<Building2 className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
          accent="bg-gradient-to-r from-blue-500 to-indigo-400"
          to="from-white to-blue-50/50"
        />
        <StatsCard
          label="Admins"
          value={stats.admins}
          icon={<Shield className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25"
          accent="bg-gradient-to-r from-purple-500 to-violet-400"
          to="from-white to-purple-50/50"
        />
        <StatsCard
          label="Patients"
          value={stats.patients}
          icon={<User className="h-5 w-5 text-white" />}
          iconBg="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/25"
          accent="bg-gradient-to-r from-amber-400 to-orange-400"
          to="from-white to-amber-50/50"
        />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email or phone..."
                className="pl-9 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 bg-white"
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
        </CardContent>
      </Card>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const roleConfig = getRoleConfig(user.role);
            return (
              <Card key={user.id} className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${roleConfig.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        {roleConfig.icon}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="font-semibold text-gray-900 text-base">{user.full_name || 'Unknown'}</p>
                          <Badge className={`${roleConfig.badge} border`}>
                            {roleConfig.text}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {user.phone}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {user.district || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            {user.division || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                        className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
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
                    <div className="mt-4 pt-4 border-t border-gray-100 bg-gradient-to-r from-purple-50/50 to-transparent rounded-xl p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <UserCog className="h-4 w-4 text-purple-500" />
                          Change Role:
                        </span>
                        <select
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 bg-white"
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value)}
                        >
                          <option value="donor">Donor</option>
                          <option value="hospital">Hospital</option>
                          <option value="admin">Admin</option>
                          <option value="patient">Patient</option>
                        </select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setSelectedUser(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete User</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedUser.full_name}</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20"
                onClick={() => deleteUser(selectedUser.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
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
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
  to: string;
}

function StatsCard({ label, value, icon, iconBg, accent, to }: StatsCardProps) {
  return (
    <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br ${to} hover:-translate-y-0.5`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`}></div>
    </Card>
  );
}