/**
 * Rooms Manager Component (Fixed & Translated)
 * Handles CRUD operations for rooms with type and capacity management
 */
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
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

const ROOM_TYPES = [
  { value: 'zwykla', label: 'Klasa zwykła' },
  { value: 'komputerowa', label: 'Pracownia komputerowa' },
  { value: 'wf', label: 'Sala gimnastyczna' },
];

export default function RoomsManager({
  rooms = [],
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  loading = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    type: 'zwykla',
    multi_class: false,
    restrictions: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 30,
      type: 'zwykla',
      multi_class: false,
      restrictions: '',
    });
    setEditingRoom(null);
    setFormError('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setFormData({
      name: room.name || '',
      capacity: room.capacity || 30,
      type: room.type || 'zwykla',
      multi_class: room.multi_class || false,
      restrictions: Array.isArray(room.restrictions)
        ? room.restrictions.join(', ')
        : '',
    });
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nazwa sali jest wymagana');
      return;
    }

    if (!formData.capacity || formData.capacity < 1) {
      setFormError('Pojemność musi wynosić co najmniej 1');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      capacity: parseInt(formData.capacity, 10),
      type: formData.type,
      multi_class: formData.multi_class,
      restrictions: formData.restrictions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setIsSubmitting(true);
    try {
      if (editingRoom) {
        await onUpdateRoom(editingRoom.id, payload);
      } else {
        await onCreateRoom(payload);
      }
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    if (!confirm(`Czy na pewno chcesz usunąć salę "${room.name}"?`)) return;
    try {
      await onDeleteRoom(room.id);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const getRoomTypeLabel = (type) => {
    const found = ROOM_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getRoomTypeVariant = (type) => {
    switch (type) {
      case 'komputerowa':
        return 'info';
      case 'wf':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Sale Lekcyjne"
          description="Zarządzaj salami i ich specyfikacją"
          action={
            <Button onClick={openCreateModal}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Dodaj salę
            </Button>
          }
        />

        {rooms.length === 0 ? (
          <EmptyState
            title="Brak skonfigurowanych sal"
            description="Dodaj sale lekcyjne i pracownie, aby rozpocząć planowanie."
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            action={
              <Button onClick={openCreateModal} size="sm">
                Dodaj salę
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa/Numer</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead className="text-center">Pojemność</TableHead>
                <TableHead className="text-center">Współdzielona</TableHead>
                <TableHead>Wyposażenie / Ograniczenia</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>
                    <Badge variant={getRoomTypeVariant(room.type)}>
                      {getRoomTypeLabel(room.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{room.capacity}</TableCell>
                  <TableCell className="text-center">
                    {room.multi_class ? (
                      <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 max-w-[200px] truncate">
                    {room.restrictions?.length
                      ? room.restrictions.join(', ')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => openEditModal(room)}
                      >
                        Edytuj
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDelete(room)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Usuń
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRoom ? 'Edytuj salę' : 'Dodaj salę'}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <Alert type="error" message={formError} className="mb-4" />
          )}

          <div className="space-y-4">
            <Input
              label="Nazwa/Numer sali"
              placeholder="np. Sala 101, Pracownia Chemiczna"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Typ sali"
                options={ROOM_TYPES}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />

              <Input
                label="Pojemność"
                type="number"
                min="1"
                max="500"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
              />
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.multi_class}
                onChange={(e) =>
                  setFormData({ ...formData, multi_class: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              <span className="text-sm text-slate-700">
                Zezwól na wiele klas jednocześnie (np. duża sala gimnastyczna)
              </span>
            </label>

            <Input
              label="Wyposażenie / Ograniczenia"
              placeholder="np. rzutnik, tablica interaktywna"
              value={formData.restrictions}
              onChange={(e) =>
                setFormData({ ...formData, restrictions: e.target.value })
              }
              hint="Lista oddzielona przecinkami (wpływa na przydział sal)"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Anuluj
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingRoom ? 'Zapisz zmiany' : 'Dodaj salę'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}