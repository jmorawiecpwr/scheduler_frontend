'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Badge, Spinner, Alert } from '../../ui';

const DNI = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DNI_LABELS = { monday: 'Poniedziałek', tuesday: 'Wtorek', wednesday: 'Środa', thursday: 'Czwartek', friday: 'Piątek' };
const GODZINY = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const HOUR_TIMES = {
  1: '8:00', 2: '8:50', 3: '9:40', 4: '10:30', 
  5: '11:20', 6: '12:10', 7: '13:00', 8: '13:50', 9: '14:40'
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
  godzina_wych: 'bg-slate-100 border-slate-300 text-slate-800',
  default: 'bg-white border-slate-200 text-slate-700'
};

const getSubjectColor = (subject) => {
  if (!subject) return SUBJECT_COLORS.default;
  const key = subject.toLowerCase().replace(/\s+/g, '_');
  if (key.includes('angielski')) return SUBJECT_COLORS.jezyk_angielski;
  if (key.includes('niemiecki')) return SUBJECT_COLORS.jezyk_niemiecki;
  return SUBJECT_COLORS[key] || SUBJECT_COLORS.default;
};


const DraggableLesson = ({ lesson, day, hour, teachers, rooms, onDragStart }) => {
  const colorClass = getSubjectColor(lesson.subject);
  
  const teacherName = useMemo(() => {
    if (!lesson.teacher_id || lesson.teacher_id === 'default') return 'Wakat';
    const t = teachers.find(tr => tr.id === lesson.teacher_id);
    if (!t) return 'Nieznany';
    const parts = t.name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}. ${parts[1]}` : t.name;
  }, [lesson.teacher_id, teachers]);

  const roomName = useMemo(() => {
    return rooms.find(r => r.id === lesson.room_id)?.name || lesson.room_id || '?';
  }, [lesson.room_id, rooms]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lesson, day, hour)}
      className={`
        h-full w-full p-2 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing
        flex flex-col justify-between group transition-all duration-200
        hover:shadow-md hover:scale-[1.02] relative z-10
        ${colorClass}
      `}
    >
      <div className="font-bold text-xs uppercase tracking-tight truncate leading-tight">
        {lesson.subject}
      </div>
      
      <div className="mt-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-semibold opacity-80 truncate">
                👤 {teacherName}
            </span>
        </div>
        <Badge variant="outline" size="xs" className="bg-white/50 border-black/10 text-[9px] px-1 h-4">
            {roomName}
        </Badge>
      </div>
    </div>
  );
};

const DropCell = ({ 
  day, 
  hour, 
  children, 
  onDrop, 
  isDragOver, 
  setIsDragOver, 
  canDrop 
}) => {
  return (
    <div 
      onDragOver={(e) => {
        e.preventDefault();
        if(canDrop) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(e);
      }}
      className={`
        relative p-1 border-r border-slate-100 last:border-0 h-[80px] transition-colors duration-200
        ${isDragOver ? 'bg-blue-50' : 'hover:bg-slate-50/30'}
      `}
    >
      {isDragOver && (
        <div className="absolute inset-1 border-2 border-dashed border-blue-400 rounded-lg bg-blue-100/20 z-0 pointer-events-none flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold uppercase">Upuść tutaj</span>
        </div>
      )}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default function TimetableEditorModal({ 
  isOpen, 
  onClose, 
  planyKlas, 
  onZapiszPlany, 
  onWalidujRuch, 
  sale = [], 
  nauczyciele = [] 
}) {
  const [lokalnePlany, setLokalnePlany] = useState(planyKlas || {});
  const [aktywnaKlasaId, setAktywnaKlasaId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [draggedItem, setDraggedItem] = useState(null);
  const [processingDrop, setProcessingDrop] = useState(false);
  const [activeDropTarget, setActiveDropTarget] = useState(null);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    if (isOpen && planyKlas) {
      setLokalnePlany(JSON.parse(JSON.stringify(planyKlas)));
      if (!aktywnaKlasaId && Object.keys(planyKlas).length > 0) {
        setAktywnaKlasaId(Object.keys(planyKlas)[0]);
      }
    }
  }, [isOpen, planyKlas]);

  const activeGrid = useMemo(() => {
    const g = {};
    DNI.forEach(d => g[d] = {});
    const currentPlan = lokalnePlany[aktywnaKlasaId]?.timetable || {};

    Object.entries(currentPlan).forEach(([day, lessons]) => {
      const normDay = day.toLowerCase().trim();
      if (DNI.includes(normDay) && Array.isArray(lessons)) {
        lessons.forEach(l => {
          if(l.hour) g[normDay][l.hour] = l;
        });
      }
    });
    return g;
  }, [lokalnePlany, aktywnaKlasaId]);

  const handleDragStart = (e, lesson, day, hour) => {
    setDraggedItem({ lesson, day, hour });
    e.dataTransfer.setData("application/json", JSON.stringify({ lesson, day, hour }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, targetDay, targetHour) => {
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;

    const { lesson, day: srcDay, hour: srcHour } = JSON.parse(dataStr);

    if (srcDay === targetDay && srcHour === targetHour) return;

    const targetOccupied = activeGrid[targetDay]?.[targetHour];
    if (targetOccupied) {
        if (!confirm(`Slot zajęty przez: ${targetOccupied.subject}. Czy chcesz nadpisać?`)) return;
    }

    setProcessingDrop(true);
    setLastError(null);

    try {
      if (onWalidujRuch) {
        const validation = await onWalidujRuch(
            lesson.lesson_id, 
            targetDay, 
            targetHour, 
            lesson.room_id,
            lokalnePlany[aktywnaKlasaId]?.survey_code
        );
        
        if (!validation.valid) {
            setLastError(validation.errors.join(', '));
            setProcessingDrop(false);
            return;
        }
      }

      setLokalnePlany(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const timetable = next[aktywnaKlasaId].timetable;

        if(timetable[srcDay]) {
            timetable[srcDay] = timetable[srcDay].filter(l => l.lesson_id !== lesson.lesson_id);
        }

        if(!timetable[targetDay]) timetable[targetDay] = [];
        timetable[targetDay] = timetable[targetDay].filter(l => l.hour !== targetHour);
        
        timetable[targetDay].push({ ...lesson, day: targetDay, hour: targetHour });
        
        return next;
      });

    } catch (err) {
        setLastError("Błąd walidacji lub połączenia.");
        console.error(err);
    } finally {
        setProcessingDrop(false);
        setDraggedItem(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await onZapiszPlany(lokalnePlany);
        onClose();
    } catch(e) {
        setLastError("Nie udało się zapisać zmian.");
    } finally {
        setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" title="Edytor Planu Lekcji">
      <div className="flex flex-col h-[90vh] bg-slate-50">
        
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800">
                        {lokalnePlany[aktywnaKlasaId]?.className || "Edycja Planu"}
                    </h2>
                    <span className="text-xs text-slate-500">Tryb manualny • Przeciągnij i upuść</span>
                </div>
                
                {processingDrop && (
                    <Badge variant="warning" className="animate-pulse">
                        <Spinner size="xs" className="mr-2"/> Walidacja ruchu...
                    </Badge>
                )}
                {lastError && (
                    <Alert type="error" className="py-1 px-3 text-xs">
                        {lastError}
                    </Alert>
                )}
            </div>

            <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose} disabled={isSaving}>Anuluj</Button>
                <Button variant="primary" onClick={handleSave} loading={isSaving} icon="check">
                    Zapisz zmiany
                </Button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

            <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dostępne Klasy</h3>
                </div>
                <div className="p-2 space-y-1">
                    {Object.entries(lokalnePlany).map(([id, dane]) => (
                        <button
                            key={id}
                            onClick={() => setAktywnaKlasaId(id)}
                            className={`
                                w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all
                                flex items-center justify-between group
                                ${aktywnaKlasaId === id 
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                                    : 'text-slate-600 hover:bg-slate-50'}
                            `}
                        >
                            <span>{dane.className || `Klasa ${id}`}</span>
                            {aktywnaKlasaId === id && <span className="w-2 h-2 rounded-full bg-blue-500"/>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 relative">
                 {processingDrop && <div className="absolute inset-0 bg-white/60 z-50 cursor-wait backdrop-blur-[1px]" />}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-w-[900px]">
                    <div className="grid grid-cols-[60px_repeat(5,_1fr)] border-b border-slate-200 bg-slate-50/80">
                        <div className="p-3 text-center border-r border-slate-200">
                            <span className="text-xs font-bold text-slate-400">GODZ</span>
                        </div>
                        {DNI.map(d => (
                            <div key={d} className="p-3 text-center border-r border-slate-200 last:border-0">
                                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    {DNI_LABELS[d]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {GODZINY.map(godz => (
                        <div key={godz} className="grid grid-cols-[60px_repeat(5,_1fr)] border-b border-slate-100 last:border-0">
                            <div className="flex flex-col items-center justify-center border-r border-slate-100 bg-slate-50/30 p-2">
                                <span className="text-sm font-bold text-slate-900">{godz}</span>
                                <span className="text-[10px] text-slate-400 font-mono mt-1">
                                    {HOUR_TIMES[godz]}
                                </span>
                            </div>

                            {DNI.map(dzien => {
                                const lesson = activeGrid[dzien]?.[godz];
                                const targetId = `${dzien}-${godz}`;
                                
                                return (
                                    <DropCell
                                        key={targetId}
                                        day={dzien}
                                        hour={godz}
                                        onDrop={(e) => handleDrop(e, dzien, godz)}
                                        isDragOver={activeDropTarget === targetId}
                                        setIsDragOver={(state) => setActiveDropTarget(state ? targetId : null)}
                                        canDrop={!!draggedItem}
                                    >
                                        {lesson ? (
                                            <DraggableLesson 
                                                lesson={lesson}
                                                day={dzien}
                                                hour={godz}
                                                teachers={nauczyciele}
                                                rooms={sale}
                                                onDragStart={handleDragStart}
                                            />
                                        ) : null}
                                    </DropCell>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </Modal>
  );
}