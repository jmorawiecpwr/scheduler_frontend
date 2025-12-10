'use client';

import React, { useState } from 'react';
import { Modal, Button, Input } from '../../ui';

export default function ClusteringModal({
  isOpen,
  survey,
  onClose,
  onSubmit,
}) {
  const [clusterCount, setClusterCount] = useState(2);
  const [maxPerCluster, setMaxPerCluster] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!survey) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        surveyCode: survey.survey_code,
        clusterCount,
        maxPerCluster,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!survey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ustawienia klasteryzacji">
      <div className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            Ankieta: <span className="font-mono font-medium text-slate-900">{survey.survey_code}</span>
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Poziom klasy: <span className="font-medium text-slate-900">{survey.class_level}</span>
          </p>
        </div>

        <Input
          label="Docelowa liczba klas"
          type="number"
          min={1}
          max={20}
          value={clusterCount}
          onChange={(e) => setClusterCount(Math.max(1, parseInt(e.target.value) || 1))}
          hint="Algorytm podzieli uczniów na tyle grup"
        />

        <Input
          label="Maksymalna liczba uczniów w klasie"
          type="number"
          min={1}
          max={50}
          value={maxPerCluster}
          onChange={(e) => setMaxPerCluster(Math.max(1, parseInt(e.target.value) || 1))}
          hint="Opcjonalne ograniczenie wielkości klasy"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Uruchom klasteryzację
          </Button>
        </div>
      </div>
    </Modal>
  );
}