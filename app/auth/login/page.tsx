'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Keycloakのログインページに直接誘導
    signIn('keycloak', { callbackUrl: '/user/dashboard' });
  }, [router]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <p>ログインページにリダイレクト中...</p>
      </div>
    </div>
  );
}
