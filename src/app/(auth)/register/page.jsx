'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { 
    UserPlusIcon,
    EnvelopeIcon, 
    KeyIcon, 
    UserIcon, 
    BuildingOffice2Icon, 
    ShieldCheckIcon, 
    EyeIcon, 
    EyeSlashIcon,
    ArrowRightIcon
} from '@heroicons/react/24/solid';

// Komponent Input w stylu High-End SaaS
function FormInput({ icon, placeholder, value, onChange, disabled, required, type = 'text', name, id, endIcon }) {
    return (
        <div className="group relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                {icon && React.cloneElement(icon, { className: "h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" })}
            </div>
            <input
                id={id || name}
                name={name || id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                autoComplete={type === "password" ? "new-password" : name}
                className={`
                    w-full pl-12 ${endIcon ? 'pr-12' : 'pr-4'} py-3.5 
                    bg-slate-900/50 text-slate-100 
                    border border-slate-800 rounded-xl 
                    placeholder-slate-500 
                    focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-900/80
                    transition-all duration-300
                `}
            />
            {endIcon && (
                 <div className="absolute inset-y-0 right-0 pr-4 flex items-center z-10">
                    {endIcon}
                </div>
            )}
        </div>
    );
}

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('uczen');
    const [fullName, setFullName] = useState('');
    const [schoolCode, setSchoolCode] = useState('');
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createPagesBrowserClient();

    const generateSchoolCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    async function handleRegister(e) {
        e.preventDefault();
        setFormError('');
        setLoading(true);

        if (!email || !password || !fullName) {
            setFormError('Wypełnij wszystkie wymagane pola.');
            setLoading(false); return;
        }
        if (password.length < 6) {
            setFormError('Hasło musi mieć co najmniej 6 znaków.');
            setLoading(false); return;
        }
        if (role !== 'dyrektor' && !schoolCode.trim()) {
            setFormError('Kod szkoły jest wymagany.');
            setLoading(false); return;
        }

        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: { full_name: fullName }
            }
        });

        if (error || !data?.user) {
            setFormError(error?.message || 'Błąd rejestracji.');
            setLoading(false); return;
        }

        const user = data.user;
        const finalSchoolCode = role === 'dyrektor' ? generateSchoolCode() : schoolCode.trim().toUpperCase();
        
        const { error: profileError } = await supabase.rpc('save_profile', {
            p_user_id: user.id,
            p_full_name: fullName,
            p_role: role,
            p_school_code: finalSchoolCode
        });

        if (profileError) {
            setFormError(`Błąd profilu: ${profileError.message}`);
            setLoading(false); return;
        }
        
        router.push('/login?registered=true');
        setLoading(false);
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0C10] p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                <header className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 mb-6 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
                        <span className="text-white font-bold text-2xl">S</span>
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
                        Dołącz do <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Nas</span>
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Twórz lepsze plany lekcji w kilka minut.
                    </p>
                </header>

                <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
                    
                    {formError && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm flex items-center">
                            <span className="mr-2">⚠️</span> {formError}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <FormInput
                            icon={<UserIcon />}
                            name="fullName"
                            placeholder="Imię i Nazwisko"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <FormInput
                            icon={<EnvelopeIcon />}
                            name="email"
                            type="email"
                            placeholder="Adres Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <FormInput
                            icon={<KeyIcon />}
                            name="password"
                            placeholder="Hasło (min. 6 znaków)"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            endIcon={(
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="text-slate-500 hover:text-slate-300 transition-colors">
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            )}
                        />

                        {/* Role Selector */}
                        <div className="group relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <ShieldCheckIcon className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <select
                                id="role"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                disabled={loading}
                                className="w-full pl-12 pr-10 py-3.5 bg-slate-900/50 text-slate-100 border border-slate-800 rounded-xl placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer hover:bg-slate-800/50"
                            >
                                <option value="uczen">Uczeń</option>
                                <option value="nauczyciel">Nauczyciel</option>
                                <option value="dyrektor">Dyrektor (Nowa Szkoła)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>

                        {/* School Code Logic */}
                        <div className="transition-all duration-300 ease-in-out">
                            {role !== 'dyrektor' ? (
                                <FormInput
                                    icon={<BuildingOffice2Icon />}
                                    name="schoolCode"
                                    placeholder="Kod Szkoły"
                                    value={schoolCode}
                                    onChange={e => setSchoolCode(e.target.value.toUpperCase())}
                                    disabled={loading}
                                    required
                                />
                            ) : (
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                                    <p className="text-xs text-purple-300 font-medium">
                                        ✨ Kod szkoły zostanie wygenerowany automatycznie
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Tworzenie konta...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Stwórz Konto <UserPlusIcon className="ml-2 h-5 w-5 opacity-80" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-slate-400">
                            Masz już konto?{' '}
                            <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                                Zaloguj się
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