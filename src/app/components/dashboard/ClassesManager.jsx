'use client';
import React, { useState, useMemo } from 'react';
import { 
  Card, CardHeader, Button, Table, TableHeader, TableHead, TableBody, TableRow, TableCell, 
  Badge, Modal, Input, Select, Alert 
} from '../../ui';

export default function ClassesManager({ 
  classes = [], 
  manualClasses = [],
  profiles = [],
  onGenerateTimetables,
  onShowTimetable,
  onCreateManualClass,
  onDeleteManualClass,
  onDeleteAiClass,
  onAddStudent,
  onRemoveStudent
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', profile_id: '' });

  const [editingClassUniqueId, setEditingClassUniqueId] = useState(null);
  const [sharingClass, setSharingClass] = useState(null);

  const [newStudentName, setNewStudentName] = useState('');
  const [studentProcessing, setStudentProcessing] = useState(false);

  const allClasses = useMemo(() => {
    const safeClasses = Array.isArray(classes) ? classes : [];
    const safeManual = Array.isArray(manualClasses) ? manualClasses : [];

    const mappedAi = safeClasses.map(c => ({ 
      ...c, 
      type: 'AI Cluster', 
      profileName: 'Dedykowany (Ankieta)', 
      isManual: false,
      students: Array.isArray(c.students) ? c.students : [],
      uniqueId: `ai-${c.originalClusterLabel}`
    }));

    const mappedManual = safeManual.map(c => {
      const profile = profiles.find(p => p.id === c.profile_id);
      const studentsList = Array.isArray(c.students) ? c.students : [];
      
      return {
        key: c.id,
        className: c.class_name,
        students: studentsList,
        studentsCount: studentsList.length || c.students_count || 0,
        type: 'Manualna',
        profileName: profile ? profile.name : 'Nieznany',
        isManual: true,
        uniqueId: `man-${c.id}`,
        primarySurveyCode: c.survey_code,
        originalClusterLabel: c.id
      };
    });

    return [...mappedAi, ...mappedManual];
  }, [classes, manualClasses, profiles]);

  const activeEditingClass = useMemo(() => {
    if (!editingClassUniqueId) return null;
    return allClasses.find(c => c.uniqueId === editingClassUniqueId) || null;
  }, [allClasses, editingClassUniqueId]);

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.profile_id) return alert("Wypełnij wszystkie pola");
    await onCreateManualClass(newClass);
    setIsCreateModalOpen(false);
    setNewClass({ name: '', profile_id: '' });
  };

  const handleDeleteClassWrapper = async (cls) => {
    if (!confirm(`Czy na pewno chcesz usunąć klasę ${cls.className}?`)) return;
    if (cls.isManual) {
      await onDeleteManualClass(cls.key);
    } else {
      await onDeleteAiClass(cls.originalClusterLabel, cls.primarySurveyCode);
    }
  };

  const openStudentModal = (cls) => {
    setEditingClassUniqueId(cls.uniqueId);
    setNewStudentName('');
  };

  const openShareModal = (cls) => {
    setSharingClass(cls);
  };

  const handleCopyLink = () => {
    const sc = sharingClass.school_code || "2ABQYE"; 
    const linkId = sharingClass.isManual 
      ? sharingClass.key 
      : `${sharingClass.primarySurveyCode}-${sharingClass.originalClusterLabel}`;
    const url = `${window.location.origin}/p/${sc}/${linkId}`;
    navigator.clipboard.writeText(url);
    alert(`Skopiowano link: ${url}`);
  };

  const handleAddStudentWrapper = async () => {
    if (!newStudentName.trim() || !activeEditingClass) return;
    setStudentProcessing(true);
    try {
      const classId = activeEditingClass.isManual 
        ? activeEditingClass.key 
        : activeEditingClass.originalClusterLabel;

      await onAddStudent(
        classId, 
        newStudentName, 
        activeEditingClass.isManual, 
        activeEditingClass.primarySurveyCode
      );
      setNewStudentName('');
    } catch (err) {
      alert("Błąd: " + err.message);
    } finally {
      setStudentProcessing(false);
    }
  };

  const handleRemoveStudentWrapper = async (studentId) => {
    if (!confirm("Usunąć ucznia?") || !activeEditingClass) return;
    setStudentProcessing(true);
    try {
      const classId = activeEditingClass.isManual 
        ? activeEditingClass.key 
        : activeEditingClass.originalClusterLabel;

      await onRemoveStudent(
        studentId, 
        classId, 
        activeEditingClass.isManual, 
        activeEditingClass.primarySurveyCode
      );
    } catch (err) {
      alert("Błąd: " + err.message);
    } finally {
      setStudentProcessing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader 
          title="Klasy i Oddziały" 
          description="Zarządzaj strukturą klas, profilami oraz składem osobowym."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>+ Dodaj Klasę</Button>
              <Button variant="success" onClick={onGenerateTimetables}>Generuj Plan dla Wszystkich</Button>
            </div>
          } 
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa Klasy</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Kod Ankiety</TableHead>
                <TableHead className="text-center">Uczniowie</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    Brak klas. Dodaj pierwszą klasę ręcznie lub przeprowadź klasteryzację.
                  </TableCell>
                </TableRow>
              ) : (
                allClasses.map(cls => (
                  <TableRow key={cls.uniqueId}>
                    <TableCell className="font-bold text-slate-900">{cls.className}</TableCell>
                    <TableCell><Badge variant={cls.isManual ? 'default' : 'info'}>{cls.type}</Badge></TableCell>
                    <TableCell className="text-slate-600">{cls.profileName}</TableCell>
                    <TableCell>
                      {cls.primarySurveyCode ? (
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700">
                          {cls.primarySurveyCode}
                        </span>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {Array.isArray(cls.students) ? cls.students.length : cls.studentsCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="xs" variant="secondary" onClick={() => openShareModal(cls)} title="Udostępnij">🔗</Button>
                        <Button size="xs" variant="secondary" onClick={() => openStudentModal(cls)}>Edytuj skład</Button>
                        <Button size="xs" variant="ghost" onClick={() => onShowTimetable(cls)}>Plan</Button>
                        <Button size="xs" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteClassWrapper(cls)}>Usuń</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Dodaj Klasę Ręcznie">
        <div className="space-y-4">
          <Input label="Nazwa Klasy" placeholder="np. 8A" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1">Wybierz Profil (Szablon)</label>
            <Select 
              value={newClass.profile_id} 
              onChange={e => setNewClass({...newClass, profile_id: e.target.value})}
              options={[{label: 'Wybierz...', value: ''}, ...profiles.map(p => ({label: p.name, value: p.id}))]} 
            />
          </div>
          <Button onClick={handleCreateClass} className="w-full mt-4">Utwórz Klasę</Button>
        </div>
      </Modal>

      {sharingClass && (
        <Modal isOpen={!!sharingClass} onClose={() => setSharingClass(null)} title={`Udostępnij plan: ${sharingClass.className}`}>
          <div className="space-y-6">
            <Alert type="info" message="Ten link jest publiczny. Każdy kto go posiada, będzie mógł zobaczyć plan tej klasy." />
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Link bezpośredni</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded font-mono text-sm text-slate-600 truncate select-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/p/{sharingClass.school_code || '2ABQYE'}/{sharingClass.isManual ? sharingClass.key : `${sharingClass.primarySurveyCode}-${sharingClass.originalClusterLabel}`}
                </div>
                <Button onClick={handleCopyLink}>Kopiuj</Button>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm text-slate-500">Wersja do druku (PDF)</span>
              <Button variant="secondary" onClick={() => window.open(`/p/${sharingClass.school_code || '2ABQYE'}/${sharingClass.isManual ? sharingClass.key : `${sharingClass.primarySurveyCode}-${sharingClass.originalClusterLabel}`}?print=true`, '_blank')}>
                🖨️ Drukuj
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {activeEditingClass && (
        <Modal 
          isOpen={!!activeEditingClass} 
          onClose={() => setEditingClassUniqueId(null)} 
          title={`Uczniowie: ${activeEditingClass.className}`} 
          size="lg"
        >
          <div className="flex flex-col h-[60vh]">
            <div className="flex-1 overflow-y-auto border rounded-lg bg-slate-50 p-2 mb-4">
              {/* --- TUTAJ BYŁO ŹRÓDŁO BŁĘDU: DODANO BEZPIECZNE SPRAWDZANIE TABLICY --- */}
              {(!Array.isArray(activeEditingClass.students) || activeEditingClass.students.length === 0) ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Brak uczniów w tej klasie.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <tbody>
                    {activeEditingClass.students.map((student, idx) => (
                      <tr key={student.id || student.student_id || idx} className="border-b border-slate-200 last:border-0 group">
                        <td className="py-2 px-3 text-slate-700 font-medium">
                          {student.name || student.student_name || "Uczeń"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button 
                            onClick={() => handleRemoveStudentWrapper(student.id || student.student_id)}
                            className="text-red-400 hover:text-red-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={studentProcessing}
                          >
                            USUŃ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Dodaj Ucznia</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Imię i Nazwisko" 
                  value={newStudentName} 
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStudentWrapper()}
                />
                <Button onClick={handleAddStudentWrapper} loading={studentProcessing}>
                  Dodaj
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}