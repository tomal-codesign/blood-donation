// app/dashboard/donor/settings/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function DonorSettingsPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async () => {
        // Validation
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account settings</p>
            </div>

            {/* Change Password Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-red-600" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password regularly for security
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            placeholder="Enter your current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                    </div>
                    <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <Button
                        onClick={handlePasswordChange}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 cursor-pointer"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone - Delete Account */}
            <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Delete Account
                    </CardTitle>
                    <CardDescription className="text-red-500">
                        Permanently delete your account and all data
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {!showDeleteConfirm ? (
                        <div>
                            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg mb-4">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-800">Warning: This action cannot be undone</p>
                                    <p className="text-sm text-red-600 mt-1">
                                        Deleting your account will permanently remove all your donation history,
                                        personal information, and you will lose access to all features.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50 cursor-pointer"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete Account
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-red-100 rounded-lg">
                                <p className="font-semibold text-red-800 mb-2">
                                    Are you absolutely sure?
                                </p>
                                <p className="text-sm text-red-700">
                                    This will permanently delete your account and all associated data.
                                    You cannot undo this action.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}