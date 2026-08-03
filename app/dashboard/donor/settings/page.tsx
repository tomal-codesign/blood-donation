// app/dashboard/donor/settings/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { 
  Lock, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  CheckCircle,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Key,
  UserX,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DonorSettingsPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success('Account deleted successfully');
        logout();
        router.push('/');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account security and preferences</p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shadow-red-200">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Current Password */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter new password (min 6 characters)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordData.newPassword && (
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-1.5 flex-1 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-red-300'}`} />
                <span className={`text-xs ${passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordData.newPassword.length >= 6 ? 'Strong enough' : 'Too short'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:border-red-400 focus:ring-red-400/20"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <X className="h-3 w-3" />
                Passwords do not match
              </p>
            )}
            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={loading}
            className="h-11 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete Account Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100 bg-gradient-to-r from-red-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shadow-red-200">
              <UserX className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600">Permanently remove your account and data</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {!showDeleteConfirm ? (
            <div>
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100 mb-5">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Warning: This action cannot be undone</p>
                  <p className="text-sm text-red-600 mt-1">
                    Deleting your account will permanently remove all your data including donation history, requests, and personal information.
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="h-11 rounded-xl border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-6"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-5 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-bold text-red-900">Are you absolutely sure?</p>
                </div>
                <p className="text-sm text-red-700">
                  This will permanently delete your account and all associated data. This action cannot be reversed.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteAccount} 
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-200"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Info Card */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Security Tips</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                Use a strong password with at least 6 characters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                Never share your password with anyone
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                Change your password regularly for better security
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}