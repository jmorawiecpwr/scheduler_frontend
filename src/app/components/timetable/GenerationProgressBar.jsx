/**
 * Pasek postępu dla procesu generowania planów.
 * Wyświetla aktualny stan algorytmu genetycznego.
 */
'use client';

import React from 'react';
import { Card } from '../../ui'// Zakładam, że Card to prosty div z shadow/border

export default function GenerationProgressBar({
  isVisible,
  currentStage, // np. "Pobieranie danych", "Klasa 1A (Gen 20/400)", "Finalizacja"
  totalClasses = 0,
  currentClass = 0,
  onComplete
}) {
  if (!isVisible) return null;

  // Obliczenie procentu postępu (uproszczone, w prawdziwym GA trudne do estymacji idealnej)
  // Zakładamy, że każda klasa to równy kawałek tortu.
  const percentage = totalClasses > 0 
    ? Math.round((currentClass / totalClasses) * 100) 
    : 5; // Startowe 5% żeby coś było widać

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white p-6 shadow-2xl border-0 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Generowanie Planów</h3>
          <span className="text-sm font-mono font-medium text-blue-600">{percentage}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3 relative">
          {/* Animated Stripe Bar */}
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%]" />
          </div>
        </div>

        {/* Status Text */}
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Status:</span>
          <span className="truncate max-w-[200px] text-right text-slate-700 animate-pulse">
            {currentStage || 'Inicjalizacja...'}
          </span>
        </div>

        {/* Info o klasach */}
        {totalClasses > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Przetwarzanie klasy <span className="font-bold text-slate-900">{currentClass}</span> z {totalClasses}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              To może potrwać od kilku sekund do minuty.
            </p>
          </div>
        )}
      </Card>
      
      {/* Inline styles for custom shimmer animation if not in Tailwind config */}
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
}