'use client';
import { useState } from 'react';

export default function DashboardLayout({ children, schoolCode }) {

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              School<span className="text-blue-600">Scheduler</span>
            </span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* School Code Badge */}
            {schoolCode && (
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Kod Szkoły
                </span>
                <div className="font-mono font-bold text-lg text-slate-800 bg-slate-100 px-3 py-0.5 rounded border border-slate-200 select-all">
                  {schoolCode}
                </div>
              </div>
            )}

            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Removed: Dark mode toggle */}

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border-2 border-white shadow-sm cursor-pointer hover:opacity-90"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
