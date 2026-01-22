'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/dashboard');
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full h-full bg-white overflow-hidden flex items-center justify-center">
      {/* Background */}

      {/* <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #ffddbb 1px, transparent 1px),
        linear-gradient(to bottom, #ffddbb 1px, transparent 1px)
      `,
          backgroundSize: '32px 32px',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)',
          maskImage:
            'radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)',
        }}
      /> */}
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

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 px-6">
        <h1 className="text-5xl font-bold text-gray-900">Task Manager</h1>

        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Organize your tasks efficiently and boost your productivity
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
// <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-100 to-primary-200">

// </div>
