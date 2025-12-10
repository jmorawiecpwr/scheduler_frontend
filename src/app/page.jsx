'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CpuChipIcon, 
  BoltIcon, 
  CalendarDaysIcon, 
  UserGroupIcon, 
  AdjustmentsHorizontalIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/solid';

// --- Komponenty UI w stylu React Bits ---

const SpotlightCard = ({ children, className = "" }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-md transition-all hover:border-slate-700 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(124, 58, 237, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-xl">
    {children}
  </span>
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-slate-200 selection:bg-purple-500/30 overflow-x-hidden font-sans">
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px] animate-pulse-slow delay-700" />
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-white">S</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              School<span className="text-purple-500">Scheduler</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Logowanie
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/5"
            >
              Zacznij teraz
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 pt-32 pb-20 container mx-auto px-6 text-center">
        <div className="inline-block mb-6 animate-fade-in-up">
          <Badge>v2.4.0 Stabilna Wersja</Badge>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
          Planowanie lekcji <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
            napędzane ewolucją.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
          Zapomnij o Excelu i konfliktach w grafiku. Wykorzystaj potęgę <strong>algorytmów genetycznych</strong> i <strong>klasteryzacji AI</strong>, aby stworzyć idealny plan zajęć w kilka minut.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <Link 
            href="/register"
            className="group relative px-8 py-3.5 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/25 overflow-hidden transition-all hover:scale-105 hover:shadow-purple-500/40"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <span className="flex items-center gap-2">
              Generuj Plan <ArrowRightIcon className="w-4 h-4" />
            </span>
          </Link>
          <Link 
            href="#how-it-works"
            className="px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 hover:text-white transition-all"
          >
            Jak to działa?
          </Link>
        </div>

       
      </main>

      {/* --- Features Grid (Bento Style) --- */}
      <section id="features" className="relative z-10 py-20 container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Technologia, która ma sens.</h2>
          <p className="text-slate-400 max-w-xl">Nie robimy rzeczy "na sztukę". Każda funkcja SchoolScheduler rozwiązuje konkretny problem dyrektora szkoły.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <SpotlightCard className="md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                <CpuChipIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Algorytm Genetyczny</h3>
                <p className="text-slate-400 leading-relaxed">
                  Nasz silnik symuluje ewolucję tysięcy wariantów planu lekcji. Wybiera ten, który najlepiej spełnia kryteria: brak okienek dla uczniów, dostępność nauczycieli i optymalne wykorzystanie sal. To czysta matematyka, nie magia.
                </p>
              </div>
            </div>
          </SpotlightCard>

          {/* Feature 2 */}
          <SpotlightCard>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 w-fit mb-4">
              <UserGroupIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Klasteryzacja AI</h3>
            <p className="text-slate-400 text-sm">
              System wykorzystuje K-Means do analizy preferencji uczniów i automatycznie dzieli ich na grupy (klasy), które mają podobne oczekiwania co do godzin zajęć.
            </p>
          </SpotlightCard>

          {/* Feature 3 */}
          <SpotlightCard>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-4">
              <CalendarDaysIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wsparcie Hybrydowe</h3>
            <p className="text-slate-400 text-sm">
              Masz klasy z rekrutacji i klasy "stare"? Żaden problem. Algorytm obsłuży jednocześnie klastry AI oraz klasy dodane ręcznie.
            </p>
          </SpotlightCard>

          {/* Feature 4 */}
          <SpotlightCard className="md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
                <AdjustmentsHorizontalIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Edytor Drag & Drop</h3>
                <p className="text-slate-400 leading-relaxed">
                  Automat zrobił 99% roboty, ale chcesz coś poprawić? Nasz edytor pozwala na ręczne przesuwanie lekcji z walidacją kolizji w czasie rzeczywistym. Pełna kontrola, zero błędów.
                </p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* --- How it works --- */}
      <section id="how-it-works" className="py-20 container mx-auto px-6 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Proces, który działa.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 z-0" />

          {[
            { 
              step: '01', 
              title: 'Zdefiniuj Zasoby', 
              desc: 'Wprowadź nauczycieli, sale i stwórz profile nauczania (lub użyj gotowych presetów MEN).' 
            },
            { 
              step: '02', 
              title: 'Zbierz Dane', 
              desc: 'Wyślij kody ankiet uczniom lub stwórz klasy ręcznie. AI zajmie się resztą.' 
            },
            { 
              step: '03', 
              title: 'Generuj i Publikuj', 
              desc: 'Jednym kliknięciem uruchom algorytm. Zatwierdź wynik i udostępnij link uczniom.' 
            }
          ].map((item, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[#0B0C10] border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-purple-500/50 transition-colors duration-500">
                <span className="text-3xl font-black text-slate-700 group-hover:text-purple-500 transition-colors">{item.step}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20 container mx-auto px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-900/50 to-blue-900/20 border border-white/10 p-12 text-center overflow-hidden">
          <div className="relative z-10">
            <BoltIcon className="w-12 h-12 text-yellow-400 mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Gotowy na modernizację szkoły?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Dołącz do dyrektorów, którzy cenią swój czas i jakość planowania.
              Bez zbędnych formalności, prosto i skutecznie.
            </p>
            <Link 
              href="/register" 
              className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-transform hover:scale-105"
            >
              Załóż darmowe konto
            </Link>
          </div>
          
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-8 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} SchoolScheduler. Projekt inżynierski.</p>
        <p className="mt-2 opacity-50">Minimalizm. Jakość. Bezpieczeństwo.</p>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
}