'use client';

import Link from 'next/link';
import { EnvelopeOpenIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-4 text-slate-100 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-lg animate-fade-in-up text-center">
        <div className="bg-slate-800 bg-opacity-60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-700">
          
          <div className="mb-8">
            <EnvelopeOpenIcon className="h-20 w-20 text-teal-400 mx-auto animate-pulse-slow" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-sky-400 to-cyan-400">
              Jeszcze Jeden Krok!
            </span>
          </h1>

          <p className="text-slate-300 text-lg mb-4 leading-relaxed">
            Dziękujemy za rejestrację! Aby aktywować swoje konto, musisz potwierdzić swój adres email.
          </p>
          <p className="text-slate-400 text-md mb-8 leading-relaxed">
            Wysłaliśmy do Ciebie wiadomość email z linkiem aktywacyjnym. Sprawdź swoją skrzynkę odbiorczą (oraz folder spam/oferty).
          </p>
          
          <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
            <h2 className="text-xl font-semibold text-purple-300 mb-3">Co dalej?</h2>
            <ul className="list-none space-y-2 text-left text-slate-300 text-sm">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 mt-1">&#10004;</span>
                Otwórz swoją skrzynkę email powiązaną z kontem.
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 mt-1">&#10004;</span>
                Znajdź wiadomość od <strong className="text-purple-300 mx-1">Supabase Auth</strong>.
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 mt-1">&#10004;</span>
                Kliknij w link potwierdzający w tej wiadomości.
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 mt-1">&#10004;</span>
                Po potwierdzeniu, będziesz mógł się zalogować!
              </li>
            </ul>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Nie otrzymałeś maila? Spróbuj <Link href="/auth/resend-confirmation" className="text-teal-400 hover:text-teal-300 underline">wysłać ponownie link aktywacyjny</Link> lub skontaktuj się z pomocą.
          </p>
          
          <div className="mt-10">
            <Link href="/"
              className="inline-flex items-center px-8 py-3 text-md font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <ArrowLeftIcon className="h-5 w-5 mr-2.5" />
                Wróć do Logowania
            </Link>
          </div>

        </div>
      </div>
      <footer className="absolute bottom-6 text-center w-full">
          <p className="text-xs text-slate-500">
              Genetic Scheduler &copy; {new Date().getFullYear()}
          </p>
      </footer>
      <style jsx global>{`
          @keyframes fade-in-up {
              0% { opacity: 0; transform: translateY(25px) scale(0.98); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }

          @keyframes pulse-slow {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
          }
          .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
}