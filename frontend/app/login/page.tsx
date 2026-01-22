'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import api from '@/lib/api';
import { LoginData } from '@/types';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { accessToken, refreshToken, user } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Logged in successfully');

      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: `
      radial-gradient(circle, rgba(0, 0, 0, 0.25) 1px, transparent 1.5px)
    `,
          backgroundSize: '25px 25px',
          backgroundPosition: '0 0',
        }}
      />
      <Card className="relative w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
