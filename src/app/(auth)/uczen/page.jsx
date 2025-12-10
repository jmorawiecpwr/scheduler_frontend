'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
    UserIcon, 
    IdentificationIcon, 
    ClockIcon, 
    AcademicCapIcon, 
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/solid';

// --- KONFIGURACJA SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- KOMPONENTY WIZUALNE (REACT BITS STYLE) ---

// 1. Spotlight Card - Efekt podświetlenia za myszką
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(139, 92, 246, 0.15)" }) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl transition-all duration-300 ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
};

// 2. Animated Background - Subtelna zorza w tle
const AuroraBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B0C10]">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora opacity-30 bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#581c87_50%),conic-gradient(from_270deg_at_50%_50%,#2e1065_50%,#00000000_50%)] mix-blend-screen blur-[100px]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora-reverse opacity-30 bg-[conic-gradient(from_0deg_at_50%_50%,#00000000_50%,#0f766e_50%),conic-gradient(from_180deg_at_50%_50%,#134e4a_50%,#00000000_50%)] mix-blend-screen blur-[100px]" />
    </div>
);

// --- GŁÓWNA STRONA ---

export default function StudentDashboardPage() {
    // --- Stany (Logika bez zmian) ---
    const [surveyCode, setSurveyCode] = useState('');
    const [surveyLoaded, setSurveyLoaded] = useState(false);
    const [classLevel, setClassLevel] = useState('');
    const [schoolCode, setSchoolCode] = useState('');
    
    const [studentName, setStudentName] = useState('');
    const [studentRealId, setStudentRealId] = useState(''); 
    const [timePreference, setTimePreference] = useState('');
    const [softSubjectsLate, setSoftSubjectsLate] = useState({});
    const [hardSubjectsHour, setHardSubjectsHour] = useState({});
    const [preferencePriority, setPreferencePriority] = useState('balanced');
    
    const [surveyError, setSurveyError] = useState('');
    const [surveySuccess, setSurveySuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const softSubjects = ["religia", "wf", "plastyka", "muzyka", "technika"];
    const hardSubjects = ["matematyka", "polski", "jezyk_obcy", "biologia", "fizyka", "informatyka", "chemia", "historia"];

    // --- Funkcje Logiki ---

    const fetchSurveyDetails = async () => {
        if (!surveyCode.trim()) { setSurveyError('Podaj kod.'); return; }
        setSurveyError(''); 
        
        const { data, error } = await supabase
            .from('surveys')
            .select('*')
            .eq('survey_code', surveyCode.trim().toUpperCase())
            .single();

        if (error || !data) { setSurveyError('Kod nieprawidłowy.'); return; }
        if (data.status !== 'open') { setSurveyError('Ankieta zamknięta.'); return; }

        setClassLevel(data.class_level);
        setSchoolCode(data.school_code);
        setSurveyLoaded(true);
    };

    const handleSurveySubmit = async () => {
        if (!studentName.trim()) { setSurveyError('Podaj imię.'); return; }
        if (!timePreference) { setSurveyError('Wybierz porę dnia.'); return; }

        setIsSubmitting(true);
        setSurveyError('');

        const finalId = studentRealId.trim() || crypto.randomUUID();

        const { error } = await supabase.from('survey_responses').insert({
            id: finalId,
            student_id: finalId,
            survey_code: surveyCode.trim().toUpperCase(),
            school_code: schoolCode,
            class_level: classLevel,
            student_name: studentName.trim(),
            time_preference: timePreference,
            soft_subjects_late: softSubjectsLate,
            hard_subjects_hour: hardSubjectsHour,
            preference_priority: preferencePriority
        });

        if (error) {
            console.error(error);
            setSurveyError(error.code === '23505' ? 'Już wypełniłeś tę ankietę.' : 'Błąd zapisu.');
            setIsSubmitting(false);
        } else {
            setSurveySuccess('Gotowe! Twoje preferencje zostały zapisane.');
            // Reset po 3s
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen text-slate-200 font-sans selection:bg-purple-500/30 selection:text-purple-200">
            <AuroraBackground />

            <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center relative z-10">
                
                {/* Logo / Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-md shadow-2xl">
                        <SparklesIcon className="w-6 h-6 text-purple-400 mr-2" />
                        <span className="text-sm font-bold tracking-widest uppercase text-purple-200">Strefa Ucznia</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-slate-400 mb-4">
                        Pomóż nam ułożyć plan <br className="md:hidden" /> skrojony pod Ciebie
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Algorytm potrzebuje Twoich danych, aby stworzyć idealny plan lekcji. To zajmie tylko chwilę.
                    </p>
                </div>

                {/* KROK 1: Wprowadzanie Kodu */}
                {!surveyLoaded && (
                    <SpotlightCard className="w-full max-w-md p-8 animate-fade-in-up delay-100">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white mb-6">Wprowadź Kod Ankiety</h2>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative flex">
                                    <input
                                        type="text"
                                        value={surveyCode}
                                        onChange={e => setSurveyCode(e.target.value.toUpperCase())}
                                        placeholder="X1Y2Z3"
                                        className="w-full bg-slate-900 text-white text-center font-mono text-2xl tracking-[0.2em] py-4 rounded-l-xl border-none focus:ring-0 focus:outline-none placeholder-slate-600 uppercase"
                                        onKeyDown={(e) => e.key === 'Enter' && fetchSurveyDetails()}
                                    />
                                    <button 
                                        onClick={fetchSurveyDetails}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-r-xl border-l border-slate-700 transition-colors"
                                    >
                                        <ArrowRightIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            {surveyError && <p className="mt-4 text-red-400 text-sm font-medium animate-shake">{surveyError}</p>}
                        </div>
                    </SpotlightCard>
                )}

                {/* KROK 2: Formularz */}
                {surveyLoaded && !surveySuccess && (
                    <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">
                        {/* Header Ankiety */}
                        <div className="flex justify-between items-end px-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Preferencje</h2>
                                <p className="text-purple-400 font-mono mt-1">Klasa {classLevel}</p>
                            </div>
                            <button onClick={() => setSurveyLoaded(false)} className="text-sm text-slate-500 hover:text-white transition-colors">
                                Zmień kod
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dane Osobowe */}
                            <SpotlightCard className="p-6 flex flex-col justify-center h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><UserIcon className="w-5 h-5" /></div>
                                    <h3 className="text-lg font-bold text-white">O Tobie</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">Imię i Nazwisko</label>
                                        <input 
                                            type="text" 
                                            value={studentName} 
                                            onChange={e => setStudentName(e.target.value)}
                                            className="w-full mt-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                            placeholder="Jan Kowalski"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs text-slate-500 uppercase font-bold ml-1">ID (Opcjonalne)</label>
                                        <input 
                                            type="text" 
                                            value={studentRealId} 
                                            onChange={e => setStudentRealId(e.target.value)}
                                            className="w-full mt-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                            placeholder="UUID / Nr legitymacji"
                                        />
                                    </div>
                                </div>
                            </SpotlightCard>

                            {/* Pora Dnia */}
                            <SpotlightCard className="p-6 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><ClockIcon className="w-5 h-5" /></div>
                                    <h3 className="text-lg font-bold text-white">Rytm Dnia</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { id: 'rano', label: 'Ranne Ptaszek', desc: '8:00 - 14:00' },
                                        { id: 'popoludnie', label: 'Nocny Marek', desc: '11:00 - 16:00' },
                                        { id: 'bez_preferencji', label: 'Elastyczny', desc: 'Dostosuję się' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setTimePreference(opt.id)}
                                            className={`w-full p-3 rounded-xl border text-left transition-all duration-200 flex justify-between items-center ${
                                                timePreference === opt.id 
                                                ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                                                : 'bg-slate-950/30 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                                            }`}
                                        >
                                            <div>
                                                <div className={`font-bold ${timePreference === opt.id ? 'text-white' : 'text-slate-300'}`}>{opt.label}</div>
                                                <div className="text-xs text-slate-500">{opt.desc}</div>
                                            </div>
                                            {timePreference === opt.id && <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
                                        </button>
                                    ))}
                                </div>
                            </SpotlightCard>
                        </div>

                        {/* Przedmioty Soft */}
                        <SpotlightCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><SparklesIcon className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Luźniejsze Przedmioty</h3>
                                    <p className="text-xs text-slate-400">Czy chcesz je na koniec dnia? (1=Tak, 5=Nie)</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {softSubjects.map(sub => (
                                    <div key={sub} className="bg-slate-950/30 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                                        <span className="text-sm font-medium capitalize text-slate-300">{sub}</span>
                                        <div className="flex gap-1">
                                            {[1, 3, 5].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => setSoftSubjectsLate(p => ({...p, [sub]: val}))}
                                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                                        softSubjectsLate[sub] === val 
                                                        ? 'bg-pink-500 text-white shadow-lg' 
                                                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SpotlightCard>

                        {/* Przedmioty Hard */}
                        <SpotlightCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><AcademicCapIcon className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Trudne Przedmioty</h3>
                                    <p className="text-xs text-slate-400">Preferowana godzina lekcyjna (1-9)</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {hardSubjects.map(sub => (
                                    <div key={sub} className="relative">
                                        <span className="absolute -top-2 left-2 px-1 bg-[#0F1115] text-[10px] text-slate-500 uppercase font-bold z-10">
                                            {sub.slice(0, 10)}
                                        </span>
                                        <input
                                            type="number"
                                            min="1" max="9"
                                            placeholder="-"
                                            value={hardSubjectsHour[sub] || ''}
                                            onChange={e => setHardSubjectsHour(p => ({...p, [sub]: parseInt(e.target.value)}))}
                                            className="w-full bg-slate-950/30 border border-slate-800 rounded-xl py-3 text-center text-white font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </SpotlightCard>

                        {/* Priorytet */}
                        <SpotlightCard className="p-6">
                            <label className="block text-sm font-bold text-slate-300 mb-3">Co jest dla Ciebie najważniejsze?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { val: 'balanced', label: 'Równomierne rozłożenie zajęć w tygodniu' },
                                    { val: 'shortFridays', label: 'Jak najkrótsze piątki' },
        
                                ].map(opt => (
                                    <button
                                        key={opt.val}
                                        onClick={() => setPreferencePriority(opt.val)}
                                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                                            preferencePriority === opt.val
                                            ? 'bg-slate-100 text-black border-white'
                                            : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </SpotlightCard>

                        {/* Submit Button */}
                        <div className="pt-4 pb-12">
                            {surveyError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-center text-sm">
                                    {surveyError}
                                </div>
                            )}
                            
                            <button
                                onClick={handleSurveySubmit}
                                disabled={isSubmitting}
                                className="group relative w-full py-4 bg-white text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-30 -translate-x-full group-hover:animate-shimmer" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {isSubmitting ? 'Wysyłanie...' : <>Wyślij Zgłoszenie <ArrowRightIcon className="w-5 h-5" /></>}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* KROK 3: Sukces */}
                {surveySuccess && (
                    <div className="w-full max-w-md text-center animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                            <SparklesIcon className="w-12 h-12 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Dziękujemy!</h2>
                        <p className="text-slate-400 mb-8">{surveySuccess}</p>
                        <button onClick={() => window.location.reload()} className="text-sm text-purple-400 hover:text-purple-300 underline">
                            Wróć do początku
                        </button>
                    </div>
                )}

            </div>

            <style jsx global>{`
                @keyframes aurora {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes aurora-reverse {
                    0% { transform: rotate(360deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-aurora { animation: aurora 60s linear infinite; }
                .animate-aurora-reverse { animation: aurora-reverse 60s linear infinite; }
                
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 1.5s infinite; }

                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                .delay-100 { animation-delay: 0.1s; }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
} 