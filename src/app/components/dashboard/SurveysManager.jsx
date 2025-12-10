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
  Badge,
  Alert,
  EmptyState,
} from '../../ui';

export default function SurveysManager({
  surveys = [],
  profiles = [],
  onCreateSurvey,
  onCloseSurvey,
  onDeleteSurvey,
  onRunClustering,
}) {
  const [surveyName, setSurveyName] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSurvey = async () => {
    if (!surveyName.trim()) {
      setError('Podaj nazwę ankiety (np. Rocznik 2010).');
      return;
    }
    if (!selectedProfileId) {
      setError('Wybierz profil nauczania (siatkę godzin).');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const code = await onCreateSurvey({ 
        name: surveyName.trim(), 
        profile_id: selectedProfileId 
      });
      
      setGeneratedCode(code);
      setSurveyName('');
      setSelectedProfileId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const getProfileName = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile ? profile.name : '—';
  };
  const handleDelete = async (survey) => { /* ... */ try { await onDeleteSurvey(survey.id, survey.survey_code); } catch (e) { setError(e.message); } };
  const handleClose = async (survey) => { /* ... */ try { await onCloseSurvey(survey.id); } catch (e) { setError(e.message); } };
  const copyToClipboard = async (text) => { try { await navigator.clipboard.writeText(text); } catch {} };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Nowa ankieta"
          description="Utwórz ankietę i przypisz do niej profil nauczania (siatkę godzin)"
        />

        {error && <Alert type="error" message={error} className="mb-4" onDismiss={() => setError('')} />}

        <div className="grid grid-cols-1 md:grid-cols-[2fr,2fr,1fr] gap-4 items-end">
          <Input
            label="Nazwa / Rocznik"
            placeholder="np. Klasy Ósme 2024/25"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
          />

          <Select
            label="Profil Nauczania"
            options={[
              { value: '', label: 'Wybierz profil...' },
              ...profiles.map(p => ({ value: p.id, label: p.name }))
            ]}
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
          />

          <Button onClick={handleCreateSurvey} loading={isCreating} className="w-full">
            Generuj kod
          </Button>
        </div>

        {generatedCode && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800">Kod ankiety:</p>
                <p className="text-2xl font-mono font-bold text-emerald-900 mt-1">{generatedCode}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => copyToClipboard(generatedCode)}>Kopiuj</Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Aktywne Ankiety" description="Lista utworzonych ankiet i ich status" />

        {surveys.length === 0 ? (
          <EmptyState title="Brak ankiet" description="Utwórz pierwszą ankietę powyżej." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead>Profil (Siatka)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell><span className="font-mono font-bold text-blue-600">{survey.survey_code}</span></TableCell>
                  <TableCell className="font-medium">{survey.class_level}</TableCell>
                  
                  {/* Wyświetlamy nazwę profilu zamiast hardcodowanego etapu */}
                  <TableCell>
                    <Badge variant="outline">{getProfileName(survey.profile_id)}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={survey.status === 'open' ? 'success' : 'warning'}>
                      {survey.status === 'open' ? 'Otwarta' : 'Zamknięta'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {survey.status === 'open' && <Button size="xs" variant="secondary" onClick={() => handleClose(survey)}>Zamknij</Button>}
                      {survey.status === 'closed' && <Button size="xs" variant="info" onClick={() => onRunClustering(survey)}>Klasteryzuj</Button>}
                      <Button size="xs" variant="ghost" className="text-red-600" onClick={() => handleDelete(survey)}>Usuń</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}