// app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading, setLoading: setAuthLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      const role = user.currentRole || user.roles?.[0] || 'donor';
      console.log('🔄 Already logged in, redirecting to:', `/dashboard/${role}`);
      router.replace(`/dashboard/${role}`);
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || data.message || 'Login failed');
        setLoading(false);
        return;
      }

      console.log('✅ Login response:', data);

      // Validate user data
      if (!data.user || !data.token) {
        toast.error('Invalid response from server');
        setLoading(false);
        return;
      }

      // Ensure user has roles
      if (!data.user.roles || data.user.roles.length === 0) {
        data.user.roles = ['donor'];
        data.user.currentRole = 'donor';
      }
      if (!data.user.currentRole) {
        data.user.currentRole = data.user.roles[0];
      }

      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update auth state using the login function
      login(data.token, data.user);

      // Determine redirect role
      const role = data.user.currentRole || data.user.roles[0] || 'donor';
      console.log('🎯 Redirecting to role:', role);
      console.log('🎯 Full URL:', `/dashboard/${role}`);

      toast.success(`Welcome ${data.user.full_name || 'User'}!`);

      // Use router.replace with a slight delay
      setTimeout(() => {
        router.replace(`/dashboard/${role}`);
      }, 500);

    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <Image src="/logo-new.png" alt="PulseCoder" width={200} height={43} className="h-10 w-auto object-contain" priority />
        </Link>

        <Card className="border border-gray-100 shadow-2xl shadow-gray-900/10 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-gray-500">
              Login to your Blood Donation account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="donor@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold py-6 shadow-lg shadow-red-500/30 cursor-pointer hover:scale-[1.01] transition-transform"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Don't have an account?</span>{' '}
              <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}