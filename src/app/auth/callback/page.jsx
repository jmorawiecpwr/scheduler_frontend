'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      const supabase = createPagesBrowserClient();

      // Supabase v2: wyciąga kod z URL i store'uje sesję
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (error) {
        console.error('🔥 Błąd podczas potwierdzania emaila:', error);
        setErrorMsg(error.message);
      } else {
        console.log('✅ Sesja po callback:', data.session);
      }

      setLoading(false);
      // po wszystkim przekieruj na /
      router.replace('/');
    }

    handleCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Potwierdzanie konta…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 p-4">
        <p>Nie udało się potwierdzić rejestracji:</p>
        <pre className="mt-2 bg-slate-800 p-4 rounded">{errorMsg}</pre>
        <button
          onClick={() => router.replace('/login')}
          className="mt-4 px-4 py-2 bg-teal-500 rounded text-white"
        >
          Wróć do logowania
        </button>
      </div>
    );
  }

  return null; // od razu przekierowanie
}