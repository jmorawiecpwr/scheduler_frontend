/**
 * Teachers Manager Component (Full Version)
 * Zarządzanie nauczycielami: Przedmioty + Dostępność Czasowa
 */
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  Badge,
  Alert,
  EmptyState,
} from '../../ui';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_LABELS = {
  monday: 'Pn',
  tuesday: 'Wt',
  wednesday: 'Śr',
  thursday: 'Cz',
  friday: 'Pt',
};

// Lista przedmiotów zgodna z systemem
const SUBJECTS_LIST = [
  'polski', 'matematyka', 'angielski', 'niemiecki', 'historia', 'wos', 
  'biologia', 'chemia', 'fizyka', 'geografia', 'informatyka', 
  'technika', 'plastyka', 'muzyka', 'wf', 'religia', 'godzina_wych', 'edb'
];

const emptyAvailability = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = { preferred: '', unavailable: '' };
    return acc;
  }, {});

export default function TeachersManager({
  teachers = [],
  onCreateTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  // Stan formularza
  const [formData, setFormData] = useState({
    name: '',
    subjects: [],
    availability: emptyAvailability(),
    max_hours_per_day: 6,
  });
  
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Helpers ---

  const resetForm = () => {
    setFormData({
      name: '',
      subjects: [],
      availability: emptyAvailability(),
      max_hours_per_day: 6,
    });
    setEditingTeacher(null);
    setFormError('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    // Mapowanie dostępności z backendu na format formularza
    const availability = emptyAvailability();
    if (teacher.availability) {
      DAYS.forEach((day) => {
        const dayData = teacher.availability[day];
        if (dayData) {
          availability[day] = {
            preferred: Array.isArray(dayData.preferred) ? dayData.preferred.join(', ') : '',
            unavailable: Array.isArray(dayData.unavailable) ? dayData.unavailable.join(', ') : '',
          };
        }
      });
    }

    setFormData({
      name: teacher.name || '',
      subjects: teacher.subjects || [], // Ładujemy przedmioty
      availability,
      max_hours_per_day: teacher.max_hours_per_day || 6,
    });
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const toggleSubject = (subj) => {
    setFormData(prev => {
      const exists = prev.subjects.includes(subj);
      return {
        ...prev,
        subjects: exists 
          ? prev.subjects.filter(s => s !== subj) 
          : [...prev.subjects, subj]
      };
    });
  };

  const handleAvailabilityChange = (day, type, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [type]: value,
        },
      },
    }));
  };

  // --- Submit ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Imię i nazwisko jest wymagane');
      return;
    }

    if (formData.subjects.length === 0) {
      setFormError('Wybierz przynajmniej jeden przedmiot');
      return;
    }

    // Transformacja dostępności do formatu backendu (tablice stringów)
    const availabilityPayload = {};
    DAYS.forEach((day) => {
      const { preferred, unavailable } = formData.availability[day];
      availabilityPayload[day] = {
        preferred: preferred.split(',').map(s => s.trim()).filter(Boolean),
        unavailable: unavailable.split(',').map(s => s.trim()).filter(Boolean),
      };
    });

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        subjects: formData.subjects,
        max_hours_per_day: parseInt(formData.max_hours_per_day, 10),
        availability: availabilityPayload
      };

      if (editingTeacher) {
        await onUpdateTeacher(editingTeacher.id, payload);
      } else {
        await onCreateTeacher(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Czy na pewno usunąć tego nauczyciela?')) {
      await onDeleteTeacher(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader 
          title="Nauczyciele" 
          description="Zarządzaj kadrą, przedmiotami i dostępnością czasową."
          action={
            <Button onClick={openCreateModal}>
              <span className="mr-2">+</span> Dodaj nauczyciela
            </Button>
          } 
        />

        {teachers.length === 0 ? (
          <EmptyState title="Brak nauczycieli" description="Dodaj kadrę pedagogiczną, aby rozpocząć." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nauczyciel</TableHead>
                <TableHead>Nauczane Przedmioty</TableHead>
                <TableHead>Max h/dzień</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-bold text-slate-900">{t.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(t.subjects || []).map(s => (
                        <Badge key={s} variant="info" size="xs" className="capitalize">
                          {s.replace('_', ' ')}
                        </Badge>
                      ))}
                      {(!t.subjects || t.subjects.length === 0) && <span className="text-slate-400 text-xs">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>{t.max_hours_per_day}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="xs" variant="secondary" onClick={() => openEditModal(t)}>Edytuj</Button>
                      <Button size="xs" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(t.id)}>Usuń</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal Edycji / Tworzenia */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTeacher ? "Edytuj Nauczyciela" : "Nowy Nauczyciel"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && <Alert type="error" message={formError} />}

          {/* Dane Podstawowe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Imię i Nazwisko" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
            <Input 
              label="Max godzin dziennie" 
              type="number" 
              min="1" max="10"
              value={formData.max_hours_per_day} 
              onChange={e => setFormData({...formData, max_hours_per_day: e.target.value})} 
            />
          </div>

          {/* Wybór Przedmiotów */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nauczane przedmioty <span className="text-red-500">*</span>
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {SUBJECTS_LIST.map(s => {
                  const isSelected = formData.subjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-all border capitalize
                        ${isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'}
                      `}
                    >
                      {s.replace('_', ' ')} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Kliknij, aby wybrać lub odznaczyć.</p>
          </div>

          {/* Dostępność (Opcjonalna, ale ważna) */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Dostępność Tygodniowa (Opcjonalne)</h4>
            <p className="text-xs text-slate-500 mb-3">
              Format: <code>08:00-10:00</code>. Oddzielaj przecinkami. Zostaw puste, jeśli dostępny cały dzień.
            </p>
            
            <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-200">
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-[40px,1fr,1fr] gap-3 items-center">
                  <span className="font-bold text-sm text-slate-600 uppercase">{DAY_LABELS[day]}</span>
                  <Input
                    placeholder="Preferowane (np. 08:00-12:00)"
                    value={formData.availability[day].preferred}
                    onChange={(e) => handleAvailabilityChange(day, 'preferred', e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    placeholder="Niedostępne (np. 14:00-16:00)"
                    value={formData.availability[day].unavailable}
                    onChange={(e) => handleAvailabilityChange(day, 'unavailable', e.target.value)}
                    className="text-xs bg-red-50/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Anuluj</Button>
            <Button type="submit" loading={isSubmitting}>Zapisz</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}