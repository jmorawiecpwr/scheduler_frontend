'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import {
  EnvelopeIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/solid';

// Reużywalny input (można wydzielić do osobnego pliku, ale tu inline dla prostoty)
function InputField({ id, type, value, onChange, disabled, placeholder, icon, endIcon }) {
  return (
    <div className="group relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        {/* Klonowanie ikony aby dodać klasy stylów */}
        {icon && React.cloneElement(icon, { className: "h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" })}
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        placeholder={placeholder}
        className={`
            w-full pl-12 ${endIcon ? 'pr-12' : 'pr-4'} py-3.5 
            bg-slate-900/50 text-slate-100 
            border border-slate-800 rounded-xl 
            placeholder-slate-500 
            focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-900/80
            transition-all duration-300
        `}
      />
      {endIcon}
    </div>
  );
}

// Potrzebny import React do klonowania ikon
import React from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createPagesBrowserClient();

  async function handleLogin(e) {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      setFormError('Nieprawidłowy email lub hasło.');
      setLoading(false);
      return;
    }

    const user = data.user;

    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || !profileData?.role) {
      setFormError('Błąd pobierania profilu. Skontaktuj się z administratorem.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    switch (profileData.role) {
      case 'dyrektor': router.push('/dyrektor'); break;
      case 'nauczyciel': router.push('/nauczyciel'); break;
      case 'uczen': router.push('/uczen'); break;
      default:
        setFormError('Nieznana rola użytkownika.');
        await supabase.auth.signOut();
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0C10] p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <header className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-2xl">S</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                Witaj <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Ponownie</span>
            </h1>
            <p className="text-slate-400 text-sm">
                Zaloguj się, aby zarządzać planem lekcji.
            </p>
        </header>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          
          {formError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm flex items-center">
                <span className="mr-2">⚠️</span> {formError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <InputField
              id="email-login"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Adres Email"
              icon={<EnvelopeIcon />}
            />

            <InputField
              id="password-login"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Hasło"
              icon={<KeyIcon />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Logowanie...
                </span>
              ) : (
                <span className="flex items-center">
                    Zaloguj się <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5 opacity-80" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
                Nie masz konta?{' '}
                <Link href="/register" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    Zarejestruj się
                </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}