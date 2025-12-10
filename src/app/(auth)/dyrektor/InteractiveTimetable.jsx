'use client';

import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Alert, Spinner } from '../../ui';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_LABELS = {
  monday: 'Poniedziałek',
  tuesday: 'Wtorek',
  wednesday: 'Środa',
  thursday: 'Czwartek',
  friday: 'Piątek',
};

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const HOUR_TIMES = {
  1: '8:00 - 8:45',
  2: '8:50 - 9:35',
  3: '9:40 - 10:25',
  4: '10:30 - 11:15',
  5: '11:20 - 12:05',
  6: '12:10 - 12:55',
  7: '13:00 - 13:45',
  8: '13:50 - 14:35',
  9: '14:40 - 15:25',
};

const SUBJECT_COLORS = {
  matematyka: 'bg-blue-100 border-blue-300 text-blue-800',
  polski: 'bg-rose-100 border-rose-300 text-rose-800',
  fizyka: 'bg-purple-100 border-purple-300 text-purple-800',
  chemia: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  biologia: 'bg-green-100 border-green-300 text-green-800',
  historia: 'bg-amber-100 border-amber-300 text-amber-800',
  wos: 'bg-orange-100 border-orange-300 text-orange-800',
  wf: 'bg-lime-100 border-lime-300 text-lime-800',
  informatyka: 'bg-cyan-100 border-cyan-300 text-cyan-800',
  angielski: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  niemiecki: 'bg-violet-100 border-violet-300 text-violet-800',
  religia: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  plastyka: 'bg-pink-100 border-pink-300 text-pink-800',
  muzyka: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
  technika: 'bg-stone-100 border-stone-300 text-stone-800',
  przyroda: 'bg-teal-100 border-teal-300 text-teal-800',
  godzina_wych: 'bg-slate-100 border-slate-300 text-slate-800',
};

const getSubjectColor = (subject) => {
  const key = subject?.toLowerCase().replace(/\s+/g, '_');
  if (key?.includes('angielski')) return SUBJECT_COLORS.angielski;
  if (key?.includes('niemiecki')) return SUBJECT_COLORS.niemiecki;
  
  return SUBJECT_COLORS[key] || 'bg-gray-50 border-gray-200 text-gray-800';
};

function LessonCell({ lesson, onSelect, isSelected, isDragTarget, validationResult, teachers, rooms }) {
  if (!lesson) {
    return (
      <div
        className={`
          h-full min-h-[80px] rounded-lg border-2 border-dashed
          transition-colors duration-150
          ${isDragTarget ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-slate-50/30'}
        `}
      />
    );
  }

  const getTeacherName = (id) => {
    if (!id || id === 'default') return 'Wakat';
    const t = teachers.find(t => t.id === id);
    return t ? t.name.split(' ')[0] + ' ' + (t.name.split(' ')[1]?.[0] || '') + '.' : 'Nieznany';
  };

  const getRoomName = (id) => {
    const r = rooms.find(rm => rm.id === id);
    return r ? r.name : id;
  };

  const colorClass = getSubjectColor(lesson.subject);
  const hasWarning = validationResult?.warnings?.length > 0;
  const hasError = validationResult?.errors?.length > 0;

  return (
    <div
      onClick={() => onSelect?.(lesson)}
      className={`
        h-full min-h-[80px] p-2 rounded-lg border cursor-pointer
        transition-all duration-150 group flex flex-col justify-between
        ${colorClass}
        ${isSelected ? 'ring-2 ring-slate-900 ring-offset-2 shadow-lg scale-[1.02]' : ''}
        ${hasError ? 'ring-2 ring-red-500' : ''}
        ${hasWarning ? 'ring-2 ring-amber-500' : ''}
        hover:shadow-md
      `}
    >
      <div>
        <div className="font-bold text-sm capitalize leading-tight">
          {lesson.subject?.replace(/_/g, ' ')}
        </div>
      </div>
      
      <div className="mt-2 space-y-0.5">
        {lesson.room_id && (
          <div className="flex items-center text-xs opacity-75">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{getRoomName(lesson.room_id)}</span>
          </div>
        )}

        {lesson.teacher_id && (
          <div className="flex items-center text-xs font-semibold opacity-90">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">{getTeacherName(lesson.teacher_id)}</span>
          </div>
        )}
      </div>
      
      {(hasError || hasWarning) && (
        <div className="absolute top-1 right-1 flex gap-1">
          {hasError && <span className="w-2 h-2 rounded-full bg-red-500" title="Błąd" />}
          {hasWarning && !hasError && <span className="w-2 h-2 rounded-full bg-amber-500" title="Ostrzeżenie" />}
        </div>
      )}
    </div>
  );
}

export default function InteractiveTimetable({
  timetableData,
  loading = false,
  error = null,
  rooms = [],
  teachers = [],
  onValidateMove,
  onLessonMove,
  editable = false,
}) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const [validationResults, setValidationResults] = useState({});

  const lessonGrid = useMemo(() => {
    const grid = {};
    DAYS.forEach((day) => {
      grid[day] = {};
      HOURS.forEach((hour) => {
        grid[day][hour] = null;
      });
    });

    if (timetableData) {
      Object.entries(timetableData).forEach(([day, lessons]) => {
        const normDay = day.toLowerCase().trim();
        if (grid[normDay]) {
          lessons?.forEach((lesson) => {
            const h = parseInt(lesson.hour, 10);
            if (h && grid[normDay]) {
              grid[normDay][h] = lesson;
            }
          });
        }
      });
    }

    return grid;
  }, [timetableData]);

  const stats = useMemo(() => {
    let totalLessons = 0;
    let dayLoads = {};

    DAYS.forEach((day) => {
      let count = 0;
      HOURS.forEach((hour) => {
        if (lessonGrid[day]?.[hour]) count++;
      });
      dayLoads[day] = count;
      totalLessons += count;
    });

    return { totalLessons, dayLoads };
  }, [lessonGrid]);

  const handleLessonSelect = async (lesson) => {
    if (!editable) return;
    
    if (selectedLesson?.lesson_id === lesson.lesson_id) {
      setSelectedLesson(null);
      return;
    }
    
    setSelectedLesson(lesson);

    if (onValidateMove && lesson.lesson_id) {
      // dopisze sie potem
    }
  };

  const handleCellClick = async (day, hour) => {
    if (!editable || !selectedLesson) return;
    
    if (onLessonMove) {
      await onLessonMove(selectedLesson, { day, hour });
    }
    
    setSelectedLesson(null);
    setValidationResults({});
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-slate-500">Ładowanie planu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Błąd ładowania" message={error} />
    );
  }

  if (!timetableData || Object.keys(timetableData).length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900">Brak planu lekcji</h3>
        <p className="mt-1 text-sm text-slate-500">
          Dla tej klasy nie wygenerowano jeszcze planu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-4">
          <Badge variant="info">{stats.totalLessons} lekcji / tydz.</Badge>
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-500">
            {DAYS.map((day) => (
              <span key={day} className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-1.5 ${stats.dayLoads[day] > 0 ? 'bg-blue-400' : 'bg-slate-300'}`} />
                {DAY_LABELS[day].slice(0, 3)}: <b>{stats.dayLoads[day]}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-24 px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                  Godzina
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="px-2 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200 last:border-0"
                  >
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HOURS.map((hour) => (
                <tr key={hour} className="bg-white hover:bg-slate-50/50 transition-colors">
                  {/* Kolumna Godziny */}
                  <td className="px-2 py-2 whitespace-nowrap border-r border-slate-100 text-center">
                    <div className="text-sm font-bold text-slate-900">{hour}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {HOUR_TIMES[hour]}
                    </div>
                  </td>

                  {DAYS.map((day) => (
                    <td
                      key={`${day}-${hour}`}
                      className="px-1 py-1 relative border-r border-slate-100 last:border-0 h-[100px]"
                      onClick={() => handleCellClick(day, hour)}
                    >
                      <LessonCell
                        lesson={lessonGrid[day][hour]}
                        teachers={teachers}
                        rooms={rooms}
                        onSelect={handleLessonSelect}
                        isSelected={selectedLesson?.lesson_id === lessonGrid[day][hour]?.lesson_id}
                        isDragTarget={selectedLesson && !lessonGrid[day][hour] && dragTarget?.day === day && dragTarget?.hour === hour}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editable && selectedLesson && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <Card className="shadow-xl border-slate-300 px-4 py-3 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm font-bold text-slate-900">
                  Przenoszenie: <span className="text-blue-600 capitalize">{selectedLesson.subject}</span>
                </span>
                <p className="text-xs text-slate-500">Kliknij inne pole, aby przenieść lub zamienić.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedLesson(null)}>
                Anuluj
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}