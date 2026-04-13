'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/spinner';
import { LifeHubLogo } from '@/components/lifehub-logo';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <LifeHubLogo className="h-16 w-16 animate-pulse" />
      <div className="flex items-center gap-3">
        <Spinner className="h-5 w-5" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
