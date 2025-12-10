'use client';

import React, { useState, useMemo } from 'react';
import {
  Card, CardHeader, Button, Input, Table, TableHeader, TableHead, TableBody, TableRow, TableCell, Modal, Select, Badge, Alert
} from '../../ui';

const SUBJECTS = [
  'polski', 'matematyka', 'angielski', 'niemiecki', 'historia', 
  'wos', 'biologia', 'chemia', 'fizyka', 'geografia', 
  'informatyka', 'technika', 'plastyka', 'muzyka', 'wf', 'religia', 'godzina_wych'
];

export default function CurriculumProfiles({ 
  profiles = [], 
  onCreateProfile, 
  onUpdateProfile, 
  onDeleteProfile 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', entries: [] });
  const [newItem, setNewItem] = useState({ subject: 'matematyka', hours: 4 });

  const totalHours = useMemo(() => 
    formData.entries.reduce((sum, item) => sum + parseInt(item.hours), 0), 
  [formData.entries]);

  const openModal = (profile = null) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({ name: profile.name, entries: profile.entries || [] });
    } else {
      setEditingProfile(null);
      setFormData({ name: '', entries: [] });
    }
    setNewItem({ subject: 'matematyka', hours: 4 });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    const existingIndex = formData.entries.findIndex(e => e.subject === newItem.subject);
    if (existingIndex >= 0) {
      alert("Ten przedmiot jest już na liście.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, { ...newItem, hours: parseInt(newItem.hours) }]
    }));
  };

  const handleRemoveItem = (index) => {
    const newEntries = [...formData.entries];
    newEntries.splice(index, 1);
    setFormData({ ...formData, entries: newEntries });
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert("Nazwa profilu jest wymagana");
    if (formData.entries.length === 0) return alert("Dodaj przynajmniej jeden przedmiot");

    try {
      if (editingProfile) {
        await onUpdateProfile(editingProfile.id, formData);
      } else {
        await onCreateProfile(formData);
      }
      setIsModalOpen(false);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Profile Nauczania (Szablony)" 
        description="Zdefiniuj siatkę godzin dla roczników (np. Klasa 4, Klasa 8). Zmiana tutaj wpłynie na wszystkie przypisane klasy."
        action={<Button onClick={() => openModal()}>Nowy Profil</Button>}
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa Profilu</TableHead>
            <TableHead>Liczba Przedmiotów</TableHead>
            <TableHead>Tygodniowy Wymiar Godzin</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map(profile => {
            const hours = profile.entries.reduce((acc, i) => acc + i.hours, 0);
            return (
              <TableRow key={profile.id}>
                <TableCell className="font-bold">{profile.name}</TableCell>
                <TableCell>{profile.entries.length}</TableCell>
                <TableCell>
                  <Badge variant={hours > 30 ? 'warning' : 'info'}>{hours}h</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="ghost" onClick={() => openModal(profile)}>Edytuj</Button>
                  <Button size="xs" variant="ghost" className="text-red-600" onClick={() => onDeleteProfile(profile.id)}>Usuń</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProfile ? "Edytuj Profil" : "Nowy Profil"} size="lg">
        <div className="space-y-4">
          <Input 
            label="Nazwa Profilu" 
            placeholder="np. Klasa 7 (Ogólna) lub Profil Mat-Fiz"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          
          <div className="bg-slate-50 p-4 rounded border grid grid-cols-[2fr,1fr,auto] gap-2 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500">Przedmiot</label>
              <Select 
                options={SUBJECTS.map(s => ({label: s.charAt(0).toUpperCase() + s.slice(1), value: s}))}
                value={newItem.subject}
                onChange={e => setNewItem({...newItem, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Godziny</label>
              <Input type="number" min="1" max="10" value={newItem.hours} onChange={e => setNewItem({...newItem, hours: e.target.value})} />
            </div>
            <Button onClick={handleAddItem}>Dodaj</Button>
          </div>

          <div className="border rounded max-h-64 overflow-y-auto">
             <Table>
               <TableHeader><TableRow><TableHead>Przedmiot</TableHead><TableHead>Godziny</TableHead><TableHead></TableHead></TableRow></TableHeader>
               <TableBody>
                 {formData.entries.map((item, idx) => (
                   <TableRow key={idx}>
                     <TableCell className="capitalize">{item.subject}</TableCell>
                     <TableCell>{item.hours}</TableCell>
                     <TableCell className="text-right">
                       <button onClick={() => handleRemoveItem(idx)} className="text-red-500 font-bold text-xs">USUŃ</button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-bold text-slate-700">Suma godzin: {totalHours}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Anuluj</Button>
              <Button onClick={handleSubmit}>Zapisz Profil</Button>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
}