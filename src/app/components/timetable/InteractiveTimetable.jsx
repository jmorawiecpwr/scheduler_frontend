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
  jezyk_angielski: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  jezyk_niemiecki: 'bg-violet-100 border-violet-300 text-violet-800',
  religia: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  plastyka: 'bg-pink-100 border-pink-300 text-pink-800',
  muzyka: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
  technika: 'bg-stone-100 border-stone-300 text-stone-800',
  przyroda: 'bg-teal-100 border-teal-300 text-teal-800',
  godzina_wych: 'bg-slate-100 border-slate-300 text-slate-800',
};

const getSubjectColor = (subject) => {
  const key = subject?.toLowerCase().replace(/\s+/g, '_');
  if (key?.includes('angielski')) return SUBJECT_COLORS.jezyk_angielski;
  if (key?.includes('niemiecki')) return SUBJECT_COLORS.jezyk_niemiecki;
  return SUBJECT_COLORS[key] || 'bg-gray-100 border-gray-300 text-gray-800';
};

function LessonCell({ lesson, onSelect, isSelected, isDragTarget, validationResult, teachers, rooms }) {
  if (!lesson) {
    return (
      <div
        className={`
          h-full min-h-[60px] rounded-lg border-2 border-dashed
          transition-colors duration-150
          ${isDragTarget
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-200 hover:border-slate-300'
          }
        `}
      />
    );
  }

  const getTeacherName = (id) => {
    if (!id || id === 'default') return '';
    const t = teachers.find(teacher => teacher.id === id);
    if (t) {
        const parts = t.name.split(' ');
        return parts.length > 1 ? `${parts[0][0]}. ${parts[1]}` : t.name;
    }
    return 'Nieznany';
  };

  const getRoomName = (id) => {
    const r = rooms.find(room => room.id === id);
    return r ? r.name : id;
  };

  const colorClass = getSubjectColor(lesson.subject);
  const hasWarning = validationResult?.warnings?.length > 0;
  const hasError = validationResult?.errors?.length > 0;

  return (
    <div
      onClick={() => onSelect?.(lesson)}
      className={`
        h-full min-h-[60px] p-2 rounded-lg border cursor-pointer
        transition-all duration-150 group flex flex-col justify-between
        ${colorClass}
        ${isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : ''}
        ${hasError ? 'ring-2 ring-red-500' : ''}
        ${hasWarning ? 'ring-2 ring-amber-500' : ''}
        hover:shadow-md
      `}
    >
      <div className="flex flex-col h-full">
        <span className="font-bold text-xs uppercase tracking-wide truncate leading-tight">
          {lesson.subject?.replace(/_/g, ' ')}
        </span>
        
        <div className="mt-auto space-y-0.5">
            {lesson.room_id && (
            <span className="text-[10px] opacity-80 block truncate font-mono">
                📍 {getRoomName(lesson.room_id)}
            </span>
            )}
            {lesson.teacher_id && lesson.teacher_id !== 'default' && (
            <span className="text-[10px] font-semibold opacity-90 block truncate">
                👤 {getTeacherName(lesson.teacher_id)}
            </span>
            )}
        </div>
      </div>
      
      {(hasError || hasWarning) && (
        <div className="absolute top-1 right-1 flex gap-1">
          {hasError && (
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" title="Błąd walidacji" />
          )}
          {hasWarning && !hasError && (
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Ostrzeżenie" />
          )}
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
        lessons?.forEach((lesson) => {
          if (lesson.hour && grid[normDay]) {
            grid[normDay][lesson.hour] = lesson;
          }
        });
      });
    }

    return grid;
  }, [timetableData]);

  // Statystyki
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
      const results = {};
      for (const day of DAYS) {
        for (const hour of HOURS) {
          if (!lessonGrid[day][hour] || lessonGrid[day][hour].lesson_id === lesson.lesson_id) {
            for (const room of rooms) {
            }
          }
        }
      }
      setValidationResults(results);
    }
  };

  const handleCellClick = async (day, hour) => {
    if (!editable || !selectedLesson) return;
    
    const existingLesson = lessonGrid[day][hour];
    if (onLessonMove) {
        await onLessonMove(selectedLesson, { day, hour });
    }
    
    setSelectedLesson(null);
    setValidationResults({});
  };

  if (loading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-slate-500">Ładowanie planu lekcji...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          type="error"
          title="Błąd ładowania"
          message={error}
        />
      </Card>
    );
  }

  if (!timetableData || Object.keys(timetableData).length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📅</span>
        </div>
        <h3 className="mt-2 text-lg font-medium text-slate-900">
          Brak wygenerowanego planu
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Dla tej klasy nie utworzono jeszcze planu lekcji.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-4">
          <Badge variant="info">{stats.totalLessons} lekcji / tydz.</Badge>
          <div className="flex items-center space-x-3 text-sm text-slate-500">
            {DAYS.map((day) => (
              <span key={day} className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-1.5 ${stats.dayLoads[day] > 0 ? 'bg-slate-600' : 'bg-slate-200'}`} />
                <span className="text-xs">
                  {DAY_LABELS[day].slice(0, 3)}: <b>{stats.dayLoads[day]}</b>
                </span>
              </span>
            ))}
          </div>
        </div>
        {editable && (
          <Button variant="secondary" size="sm">
            Odśwież widok
          </Button>
        )}
      </div>

      <Card padding="none" className="overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-24 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">
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
                  <td className="px-4 py-2 whitespace-nowrap border-r border-slate-100">
                    <div className="text-sm font-bold text-slate-900">
                      {hour}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {HOUR_TIMES[hour]}
                    </div>
                  </td>
                  {DAYS.map((day) => (
                    <td
                      key={`${day}-${hour}`}
                      className="px-1 py-1 relative border-r border-slate-100 last:border-0 h-[85px]"
                      onClick={() => handleCellClick(day, hour)}
                    >
                      <LessonCell
                        lesson={lessonGrid[day][hour]}
                        teachers={teachers}
                        rooms={rooms}
                        onSelect={handleLessonSelect}
                        isSelected={
                          selectedLesson?.lesson_id ===
                          lessonGrid[day][hour]?.lesson_id
                        }
                        isDragTarget={
                          selectedLesson &&
                          !lessonGrid[day][hour] &&
                          dragTarget?.day === day &&
                          dragTarget?.hour === hour
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 px-1 pt-2">
        <span className="text-xs text-slate-400 self-center mr-2">Legenda:</span>
        {Object.entries(SUBJECT_COLORS).slice(0, 6).map(([subject, colorClass]) => (
          <div
            key={subject}
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${colorClass.replace('text-', 'border-').split(' ')[0]} opacity-80`}
          >
            {subject}
          </div>
        ))}
        <span className="text-xs text-slate-400 self-center ml-1">+ inne</span>
      </div>

      {selectedLesson && editable && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <Card className="shadow-xl border-slate-300 px-4 py-3 bg-white/95 backdrop-blur">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  Przenoszenie: {selectedLesson.subject?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500 ml-2 block">
                  Kliknij puste pole, aby przenieść.
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedLesson(null);
                  setValidationResults({});
                }}
              >
                Anuluj
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}