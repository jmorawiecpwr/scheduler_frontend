'use client';

import React, { useEffect, useState } from 'react';
import InteractiveTimetable from '@/app/(auth)/dyrektor/InteractiveTimetable';
import { Spinner, Alert, Card } from '../../../ui';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export default function PublicTimetablePage({ params }) {
  const { schoolCode, targetId } = params;

  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const [metaData, setMetaData] = useState({ rooms: [], teachers: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let url = '';
  
        const parts = targetId.split('-');
        const isManual = parts[0].length > 6;

        if (isManual) {
          url = `${BACKEND_URL}/api/timetable/class/${schoolCode}/MANUAL/${targetId}`;
        } else {

          const lastDashIndex = targetId.lastIndexOf('-');
          if (lastDashIndex === -1) throw new Error("Nieprawidłowy format linku.");
          
          const surveyCode = targetId.substring(0, lastDashIndex);
          const label = targetId.substring(lastDashIndex + 1);
          
          url = `${BACKEND_URL}/api/timetable/class/${schoolCode}/${surveyCode}/${label}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Nie znaleziono planu lekcji.");
        const data = await res.json();
        
        if (Object.keys(data).length === 0) throw new Error("Plan lekcji jest jeszcze pusty.");
        setPlanData(data);

        Promise.all([
            fetch(`${BACKEND_URL}/rest/v1/teachers?select=id,name&school_code=eq.${schoolCode}`, { 
                headers: { 
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` 
                } 
            }),
            fetch(`${BACKEND_URL}/rest/v1/rooms?select=id,name&school_code=eq.${schoolCode}`, {
                headers: { 
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` 
                }
            })
        ]).then(async ([tRes, rRes]) => {
            if (tRes.ok && rRes.ok) {
                const tData = await tRes.json();
                const rData = await rRes.json();
                setMetaData({ teachers: tData, rooms: rData });
            }
        }).catch(e => console.warn("Nie udało się pobrać nazw nauczycieli/sal", e));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (schoolCode && targetId) {
      fetchData();
    }
  }, [schoolCode, targetId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4 text-blue-600" />
          <p className="text-slate-500">Ładowanie planu lekcji...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nie udało się wczytać planu</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <a href="/" className="text-blue-600 hover:underline text-sm">Wróć do strony głównej</a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Plan Lekcji</h1>
              <p className="text-xs text-slate-500 font-mono">Szkoła: {schoolCode}</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Drukuj
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl p-4 md:p-8 print:p-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-0">
          <InteractiveTimetable 
            timetableData={planData}
            loading={false}
            rooms={metaData.rooms}
            teachers={metaData.teachers}
            editable={false}
          />
        </div>
        
        <footer className="mt-8 text-center text-xs text-slate-400 print:hidden">
          Wygenerowano przez System Planowania Lekcji • {new Date().getFullYear()}
        </footer>
      </main>

      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}