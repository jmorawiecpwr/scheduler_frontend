'use client';

import { useState } from 'react';
import { useSchoolData } from '@/app/hooks/useSchoolData';
import DashboardLayout from '@/app/layouts/DashboardLayout';

import TeachersManager from '@/app/components/dashboard/TeachersManager';
import RoomsManager from '@/app/components/dashboard/RoomsManager';
import SurveysManager from '@/app/components/dashboard/SurveysManager';
import ClassesManager from '@/app/components/dashboard/ClassesManager';
import CurriculumProfiles from '@/app/components/dashboard/CurriculumProfiles';
import ClusteringModal from '@/app/components/scheduler/ClusteringModal';
import ClusterViewer from '@/app/components/scheduler/ClusterViewer';
import InteractiveTimetable from '@/app/components/timetable/InteractiveTimetable';
import GenerationProgressBar from '@/app/components/timetable/GenerationProgressBar';
import TimetableEditorModal from '@/app/components/timetable/TimetableEditorModal';

import { 
  Card, CardHeader, Button, Badge, Alert, Tabs, Modal, Spinner 
} from '../../ui';

export default function DyrektorPage() {
  const {
    schoolCode,
    loading,
    error,
    teachers,
    rooms,
    surveys,
    finalClasses,
    manualClasses,
    profiles,
    refetch,
    createTeacher, updateTeacher, deleteTeacher,
    createRoom, updateRoom, deleteRoom,
    createSurvey, closeSurvey, deleteSurvey,
    createProfile, updateProfile, deleteProfile,
    createManualClass, deleteManualClass,
    runClustering, confirmClusters,
    generateTimetables,
    fetchClassTimetable,
    saveFinalTimetables,
    validateMove, deleteAiClass, addStudentToClass, removeStudentFromClass
  } = useSchoolData();

  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showClusteringModal, setShowClusteringModal] = useState(false);
  const [clusteringResult, setClusteringResult] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ 
    stage: '', current: 0, total: 0 
  });
  
  const [showEditor, setShowEditor] = useState(false);
  const [draftTimetables, setDraftTimetables] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInitiateClustering = (survey) => {
    setSelectedSurvey(survey);
    setShowClusteringModal(true);
  };

  const handleRunClustering = async (params) => {
    try {
      const result = await runClustering(
        params.surveyCode,
        params.clusterCount,
        params.maxPerCluster
      );
      setClusteringResult(result);
      setShowClusteringModal(false);
      showNotification('success', 'Klasteryzacja zakończona pomyślnie');
    } catch (err) {
      showNotification('error', `Błąd klasteryzacji: ${err.message}`);
    }
  };

  const handleConfirmClusters = async (clustersData) => {
    if (!selectedSurvey) return;
    try {
      await confirmClusters(clustersData, selectedSurvey.survey_code);
      setClusteringResult(null);
      setSelectedSurvey(null);
      showNotification('success', 'Klasy zostały zapisane');
    } catch (err) {
      showNotification('error', `Błąd zapisu: ${err.message}`);
    }
  };

  const simulateProgress = (total) => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setGenerationProgress(prev => ({
        ...prev,
        current: Math.min(current, total),
        stage: `Przetwarzanie klasy ${current}/${total}...`
      }));
      if (current >= total) clearInterval(interval);
    }, 500); 
    return interval;
  };

  const handleGenerateFlow = async () => {
    const totalClassesEstimate = (finalClasses.length + manualClasses.length) || 10;
    
    setIsGenerating(true);
    setGenerationProgress({ stage: 'Inicjalizacja solvera...', current: 0, total: totalClassesEstimate });

    const progressInterval = simulateProgress(totalClassesEstimate);

    try {
      const generatedData = await generateTimetables(); 

      clearInterval(progressInterval);
      setGenerationProgress({ stage: 'Finalizacja...', current: totalClassesEstimate, total: totalClassesEstimate });
      
      setTimeout(() => {
        setIsGenerating(false);
        setDraftTimetables(generatedData);
        setShowEditor(true);
        showNotification('info', 'Plany wygenerowane. Zweryfikuj je przed zapisem.');
      }, 800);

    } catch (err) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      showNotification('error', `Błąd generowania: ${err.message}`);
    }
  };

  const handleEditorSave = async (approvedTimetables) => {
    try {
      await saveFinalTimetables(approvedTimetables);
      
      setShowEditor(false);
      setDraftTimetables(null);
      await refetch();
      showNotification('success', 'Plany lekcji zostały zatwierdzone i opublikowane.');
    } catch (err) {
      showNotification('error', `Błąd zapisu: ${err.message}`);
    }
  };

  const handleEditorValidate = async (lessonId, day, hour, roomId, surveyCode) => {
    return await validateMove(lessonId, day, hour, roomId, surveyCode);
  };
  const handleShowTimetable = async (classInfo) => {    
    const codeToFetch = classInfo.isManual ? 'MANUAL' : classInfo.primarySurveyCode;
    if (!classInfo.isManual && !classInfo.primarySurveyCode) {
      showNotification('error', 'Brak kodu ankiety dla tej klasy');
      return;
    }

    setSelectedClass(classInfo);
    setTimetableLoading(true);
    
    try {
      const data = await fetchClassTimetable(
        codeToFetch,
        classInfo.originalClusterLabel
      );

      if (data && Object.keys(data).length > 0) {
        setTimetableData(data);
      } else {
        setTimetableData(null);
      }
      
    } catch (err) {
      showNotification('error', `Nie udało się pobrać planu: ${err.message}`);
      setTimetableData(null);
    } finally {
      setTimetableLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Przegląd' },
    { id: 'teachers', label: 'Nauczyciele', count: teachers.length },
    { id: 'rooms', label: 'Sale', count: rooms.length },
    { id: 'surveys', label: 'Ankiety', count: surveys.length },
    { id: 'classes', label: 'Klasy', count: finalClasses.length + manualClasses.length },
    { id: 'profiles', label: 'Szablony Siatki', count: profiles.length },
  ];

  if (loading && !schoolCode) {
    return (
      <DashboardLayout schoolCode="">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout schoolCode={schoolCode}>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Panel Dyrektora</h1>
        <p className="mt-1 text-sm text-slate-500">
          Zarządzaj szkołą, profilami nauczania i planami lekcji.
        </p>
      </div>

      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-slide-in">
          <Alert type={notification.type} message={notification.message} onDismiss={() => setNotification(null)} />
        </div>
      )}

      {error && (
        <Alert type="error" title="Błąd ładowania danych" message={error} className="mb-6" />
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label="Nauczyciele" count={teachers.length} icon="user" color="blue" />
            <StatsCard label="Sale" count={rooms.length} icon="home" color="emerald" />
            <StatsCard label="Ankiety" count={surveys.length} icon="clipboard" color="amber" />
            <StatsCard label="Wszystkie Klasy" count={finalClasses.length + manualClasses.length} icon="collection" color="purple" />
            <div className="lg:col-span-4">
              <Card>
                <CardHeader title="Szybkie akcje" description="Najczęściej używane funkcje" />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveTab('teachers')}>Dodaj nauczyciela</Button>
                  <Button variant="secondary" onClick={() => setActiveTab('classes')}>Zarządzaj klasami</Button>
                  <Button variant="secondary" onClick={() => setActiveTab('profiles')}>Edytuj szablony</Button>
                  
                  <Button 
                    variant="success" 
                    onClick={handleGenerateFlow} 
                    disabled={finalClasses.length === 0 && manualClasses.length === 0}
                  >
                    Generuj plany lekcji
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <TeachersManager 
            teachers={teachers} 
            onCreateTeacher={async (data) => { await createTeacher(data); showNotification('success', 'Nauczyciel dodany'); }} 
            onUpdateTeacher={async (id, data) => { await updateTeacher(id, data); showNotification('success', 'Nauczyciel zaktualizowany'); }}
            onDeleteTeacher={async (id) => { await deleteTeacher(id); showNotification('success', 'Nauczyciel usunięty'); }}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsManager 
            rooms={rooms}
            onCreateRoom={async (data) => { await createRoom(data); showNotification('success', 'Sala dodana'); }}
            onUpdateRoom={async (id, data) => { await updateRoom(id, data); showNotification('success', 'Sala zaktualizowana'); }}
            onDeleteRoom={async (id) => { await deleteRoom(id); showNotification('success', 'Sala usunięta'); }}
          />
        )}

      {activeTab === 'surveys' && (
        <SurveysManager 
          surveys={surveys}
          profiles={profiles}
          
          onCreateSurvey={async (data) => { 
            const code = await createSurvey(data); 
            showNotification('success', `Ankieta utworzona: ${code}`); 
            return code; 
          }}
          onCloseSurvey={async (id) => { await closeSurvey(id); showNotification('success', 'Ankieta zamknięta'); }}
          onDeleteSurvey={async (id, code) => { await deleteSurvey(id, code); showNotification('success', 'Ankieta usunięta'); }}
          onRunClustering={handleInitiateClustering}
        />
      )}

        {activeTab === 'profiles' && (
          <CurriculumProfiles 
            profiles={profiles}
            onCreateProfile={async (data) => { await createProfile(data); showNotification('success', 'Profil utworzony'); }}
            onUpdateProfile={async (id, data) => { await updateProfile(id, data); showNotification('success', 'Profil zaktualizowany'); }}
            onDeleteProfile={async (id) => { await deleteProfile(id); showNotification('success', 'Profil usunięty'); }}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesManager 
            classes={finalClasses}
            manualClasses={manualClasses}
            profiles={profiles}
            onCreateManualClass={async (data) => { await createManualClass(data); showNotification('success', 'Klasa dodana'); }}
            onDeleteManualClass={async (id) => { await deleteManualClass(id); showNotification('success', 'Klasa usunięta'); }}

            onDeleteAiClass={async (label, code) => { await deleteAiClass(label, code); showNotification('success', 'Klasa usunięta'); }}
            onAddStudent={addStudentToClass}
            onRemoveStudent={removeStudentFromClass}
            
            onShowTimetable={handleShowTimetable}
            onGenerateTimetables={handleGenerateFlow} 
          />
        )}

      </div>
      <ClusteringModal 
        isOpen={showClusteringModal} 
        survey={selectedSurvey} 
        onClose={() => { setShowClusteringModal(false); setSelectedSurvey(null); }}
        onSubmit={handleRunClustering}
      />

      {clusteringResult && (
        <Modal 
          isOpen={!!clusteringResult} 
          onClose={() => setClusteringResult(null)} 
          title="Wyniki klasteryzacji" 
          size="xl"
        >
          <ClusterViewer 
            clusteredData={clusteringResult} 
            onRecluster={() => { setClusteringResult(null); setShowClusteringModal(true); }}
            onConfirmClusters={handleConfirmClusters}
          />
        </Modal>
      )}

      <GenerationProgressBar 
        isVisible={isGenerating}
        currentStage={generationProgress.stage}
        currentClass={generationProgress.current}
        totalClasses={generationProgress.total}
      />

      <TimetableEditorModal 
        isOpen={showEditor}
        planyKlas={draftTimetables}
        sale={rooms}
        nauczyciele={teachers}
        onClose={() => setShowEditor(false)}
        onZapiszPlany={handleEditorSave}
        onWalidujRuch={handleEditorValidate}
      />

      {selectedClass && (
        <Modal 
          isOpen={!!selectedClass} 
          onClose={() => { setSelectedClass(null); setTimetableData(null); }} 
          title={`Plan lekcji: ${selectedClass.className}`}
          size="xl"
        >
          <InteractiveTimetable 
            timetableData={timetableData} 
            loading={timetableLoading}
            rooms={rooms}
            teachers={teachers}
            editable={false} 
          />
        </Modal>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}

function StatsCard({ label, count, color, icon }) {
  return (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <div className={`w-6 h-6 text-${color}-600 bg-${color}-200 rounded-full`} /> 
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{count}</p>
        </div>
      </div>
    </Card>
  );
}