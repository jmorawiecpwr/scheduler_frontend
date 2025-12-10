import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export function useSchoolData() {
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const session = useSession();

  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [surveys, setSurveys] = useState([]);
  
  const [finalClasses, setFinalClasses] = useState([]);
  const [manualClasses, setManualClasses] = useState([]);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchSchoolCode = async () => {
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('school_code')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setSchoolCode(data?.school_code || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolCode();
  }, [session, supabase]);

  const fetchAllData = useCallback(async () => {
    if (!schoolCode) return;

    setLoading(true);
    setError(null);

    try {
      const [
        teachersRes, 
        roomsRes, 
        surveysRes, 
        clustersRes,
        profilesRes,
        manualClassesRes
      ] = await Promise.all([
        supabase.from('teachers').select('*').eq('school_code', schoolCode),
        supabase.from('rooms').select('*').eq('school_code', schoolCode),
        supabase.from('surveys').select('*').eq('school_code', schoolCode),
        supabase.from('final_clusters').select('*').eq('school_code', schoolCode),
        supabase.from('curriculum_profiles').select('*').eq('school_code', schoolCode),
        supabase
          .from('manual_classes')
          .select('*, students:manual_students(*)') 
          .eq('school_code', schoolCode)
      ]);

      if (teachersRes.error) throw teachersRes.error;
      setTeachers(teachersRes.data || []);

      if (roomsRes.error) throw roomsRes.error;
      setRooms(roomsRes.data || []);

      if (surveysRes.error) throw surveysRes.error;
      setSurveys(surveysRes.data || []);

      if (profilesRes.error) throw profilesRes.error;
      setProfiles(profilesRes.data || []);

      if (manualClassesRes.error) throw manualClassesRes.error;
      setManualClasses(manualClassesRes.data || []);

      const clustersData = clustersRes.data;
      if (clustersData?.length) {
         const studentIds = [...new Set(clustersData.map(c => c.student_id).filter(Boolean))];
         let idToName = new Map();
         if (studentIds.length) {
            const { data: names } = await supabase
              .from('survey_responses')
              .select('id, student_name')
              .in('id', studentIds);
            (names || []).forEach(r => idToName.set(String(r.id), r.student_name || 'Student'));
         }

         const grouped = clustersData.reduce((acc, row) => {
            const label = String(row.cluster_label ?? '');
            const sid = row.student_id ? String(row.student_id) : '';
            if (!label || !sid) return acc;

            if (!acc[label]) {
              acc[label] = {
                label: row.cluster_label,
                school_code: row.school_code,
                surveyCodesSet: new Set(),
                students: [],
              };
            }
            acc[label].surveyCodesSet.add(row.survey_code);
            acc[label].students.push({
              id: sid,
              name: idToName.get(sid) || `Student (${sid.slice(-6)})`,
            });
            return acc;
         }, {});

         const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
         const formatted = Object.values(grouped).map((grp, idx) => ({
            key: String(grp.label),
            className: `Klasa ${alphabet[idx] || idx + 1}`,
            originalClusterLabel: grp.label,
            students: grp.students,
            survey_codes: Array.from(grp.surveyCodesSet),
            primarySurveyCode: Array.from(grp.surveyCodesSet)[0] || null,
            school_code: grp.school_code,
         }));

         setFinalClasses(formatted);
      } else {
         setFinalClasses([]);
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [schoolCode, supabase]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const deleteAiClass = async (clusterLabel, surveyCode) => {
    const labelInt = parseInt(clusterLabel, 10);

    if (isNaN(labelInt)) throw new Error("Błędny numer klastra");

    const { error } = await supabase
      .from('final_clusters')
      .delete()
      .match({ 
        school_code: schoolCode, 
        survey_code: surveyCode, 
        cluster_label: labelInt 
      });
      
    await supabase
      .from('timetable_plans')
      .delete()
      .match({
        school_code: schoolCode,
        survey_code: surveyCode,
        cluster_label: labelInt
      });

    if (error) throw error;
    await fetchAllData();
  };

  const addStudentToClass = async (classId, studentName, isManual, surveyCode) => {
    if (isManual) {
      const res = await fetch(`${BACKEND_URL}/manual_classes/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manual_class_id: classId,
          student_name: studentName,
          school_code: schoolCode
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Błąd backendu");
      }
    } else {
      const fakeId = crypto.randomUUID(); 
      const labelInt = parseInt(classId, 10);

      if (isNaN(labelInt)) throw new Error(`Nieprawidłowe ID: ${classId}`);

      const { error: respError } = await supabase.from('survey_responses').insert({
        id: fakeId,
        school_code: schoolCode,
        survey_code: surveyCode,
        student_name: studentName,
        class_level: 'Manual Add',
        time_preference: 'rano',
        preference_priority: 'balanced'
      });
      if (respError) throw respError;

      const { error: clustError } = await supabase.from('final_clusters').insert({
        school_code: schoolCode,
        survey_code: surveyCode,
        cluster_label: labelInt,
        student_id: fakeId
      });
      if (clustError) throw clustError;
    }
    await fetchAllData();
  };

  const removeStudentFromClass = async (studentId, classId, isManual, surveyCode) => {
    if (isManual) {
      const res = await fetch(`${BACKEND_URL}/manual_classes/student/${studentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Błąd API przy usuwaniu ucznia");
    } else {
      const labelInt = parseInt(classId, 10);
      
      const { error } = await supabase
        .from('final_clusters')
        .delete()
        .match({ 
          school_code: schoolCode, 
          survey_code: surveyCode, 
          cluster_label: labelInt,
          student_id: studentId 
        });
        
      if (error) throw error;
    }
    await fetchAllData();
  };

  const createTeacher = async (data) => {
    const { error } = await supabase.from('teachers').insert({ ...data, school_code: schoolCode });
    if (error) throw error;
    await fetchAllData();
  };
  const updateTeacher = async (id, data) => {
    const { error } = await supabase.from('teachers').update(data).eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };
  const deleteTeacher = async (id) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const createRoom = async (data) => {
    const { error } = await supabase.from('rooms').insert({ ...data, school_code: schoolCode });
    if (error) throw error;
    await fetchAllData();
  };
  const updateRoom = async (id, data) => {
    const { error } = await supabase.from('rooms').update(data).eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };
  const deleteRoom = async (id) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const createSurvey = async ({ name, profile_id }) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase.from('surveys').insert({
      survey_code: code,
      class_level: name,
      profile_id: profile_id,
      school_code: schoolCode,
      status: 'open',
    });
    
    if (error) throw error;
    await fetchAllData();
    return code;
  };
  const closeSurvey = async (id) => {
    const { error } = await supabase.from('surveys').update({ status: 'closed' }).eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };
  const deleteSurvey = async (id, surveyCode) => {
    await supabase.from('final_clusters').delete().eq('survey_code', surveyCode).eq('school_code', schoolCode);
    const { error } = await supabase.from('surveys').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const createProfile = async (data) => {
    const { error } = await supabase.from('curriculum_profiles').insert({ ...data, school_code: schoolCode });
    if (error) throw error;
    await fetchAllData();
  };
  const updateProfile = async (id, data) => {
    const { error } = await supabase.from('curriculum_profiles').update(data).eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };
  const deleteProfile = async (id) => {
    const { error } = await supabase.from('curriculum_profiles').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const createManualClass = async ({ name, profile_id }) => {
    const surveyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase.from('manual_classes').insert({
      school_code: schoolCode,
      class_name: name,
      profile_id: profile_id,
      students_count: 25,
      survey_code: surveyCode
    });
    
    if (error) throw error;
    await fetchAllData();
  };
  const deleteManualClass = async (id) => {
    const { error } = await supabase.from('manual_classes').delete().eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const runClustering = async (surveyCode, clusterCount, maxPerCluster) => {
    const res = await fetch(`${BACKEND_URL}/cluster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        survey_code: surveyCode,
        school_code: schoolCode,
        cluster_count: clusterCount,
        max_per_cluster: maxPerCluster,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || `Clustering Error: ${res.status}`);
    return json;
  };

  const confirmClusters = async (clustersData, surveyCode) => {
    const res = await fetch(`${BACKEND_URL}/confirm_clusters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clusters_data: clustersData,
        survey_code: surveyCode,
        school_code: schoolCode,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || `Confirm Error: ${res.status}`);
    await fetchAllData();
    return json;
  };

  const generateTimetables = async () => {
    if (!schoolCode) throw new Error("Brak kodu szkoły");

    await fetch(`${BACKEND_URL}/cache_data?school_code=${encodeURIComponent(schoolCode)}`, { method: 'POST' });
    
    const res = await fetch(
      `${BACKEND_URL}/generate_timetable?school_code_param=${encodeURIComponent(schoolCode)}`,
      { method: 'POST' }
    );
    
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.detail || `Generation Error: ${res.status}`);
    }

    const allDrafts = {};
    
    const clusterPromises = finalClasses.map(async (cls) => {
      if (!cls.primarySurveyCode) return null;
      try {
        const timetableRes = await fetch(
          `${BACKEND_URL}/api/timetable/class/${schoolCode}/${cls.primarySurveyCode}/${cls.originalClusterLabel}`
        );
        if (timetableRes.ok) {
            const data = await timetableRes.json();
            return {
                id: cls.key,
                data: {
                    className: cls.className,
                    survey_code: cls.primarySurveyCode,
                    originalClusterLabel: cls.originalClusterLabel,
                    timetable: data || {}
                }
            };
        }
      } catch (e) { console.warn("Fetch error cluster:", cls.className); }
      return null;
    });

    const manualPromises = manualClasses.map(async (cls) => {
        try {
            const timetableRes = await fetch(
                `${BACKEND_URL}/api/timetable/class/${schoolCode}/MANUAL/${cls.id}`
            );
            
            if (timetableRes.ok) {
                const data = await timetableRes.json();
                const timetableData = (data && Object.keys(data).length > 0) ? data : {};

                return {
                    id: cls.id,
                    data: {
                        className: cls.class_name,
                        survey_code: 'MANUAL',
                        originalClusterLabel: cls.id,
                        timetable: timetableData 
                    }
                };
            }
        } catch (e) { 
            console.warn("Fetch error manual:", cls.class_name, e); 
        }
        return null;
    });

    const results = await Promise.all([...clusterPromises, ...manualPromises]);
    results.forEach(item => {
        if (item) allDrafts[item.id] = item.data;
    });

    if (Object.keys(allDrafts).length === 0) {
        throw new Error("Algorytm zakończył pracę, ale nie udało się pobrać żadnych planów lekcji. Sprawdź konfigurację.");
    }

    return allDrafts; 
  };

  const saveFinalTimetables = async (finalDataObj) => {
    const updates = Object.values(finalDataObj).map(async (clsData) => {
        const { originalClusterLabel, survey_code, timetable } = clsData;
        
        if (survey_code === 'MANUAL') {
            const { error } = await supabase
                .from('timetable_plans')
                .update({ timetable: timetable })
                .match({ 
                    school_code: schoolCode, 
                    survey_code: 'MANUAL', 
                    student_id: originalClusterLabel
                });
            if (error) throw error;

        } else {
            const { error } = await supabase
                .from('timetable_plans')
                .update({ timetable: timetable })
                .match({ 
                    school_code: schoolCode, 
                    survey_code: survey_code, 
                    cluster_label: parseInt(originalClusterLabel, 10)
                });
            if (error) throw error;
        }
    });

    await Promise.all(updates);
    return { message: "Zapisano pomyślnie" };
  };

  const validateMove = async (lessonId, newDay, newHour, newRoomId, surveyCode) => {
    try {
      const res = await fetch(`${BACKEND_URL}/validate_move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          new_day: newDay,
          new_hour: newHour,
          new_room_id: newRoomId,
          school_code: schoolCode,
          survey_code: surveyCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { valid: false, errors: [data.detail || 'Server error'] };
      return data;
    } catch (e) {
      return { valid: false, errors: ['Błąd walidacji API'] };
    }
  };

  const fetchClassTimetable = async (surveyCode, clusterLabel) => {
    const res = await fetch(
      `${BACKEND_URL}/api/timetable/class/${schoolCode}/${surveyCode}/${clusterLabel}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  return {
    schoolCode,
    loading,
    error,
    
    teachers,
    rooms,
    surveys,
    finalClasses,
    manualClasses,
    profiles,

    refetch: fetchAllData,

    createTeacher, updateTeacher, deleteTeacher,
    createRoom, updateRoom, deleteRoom,
    createSurvey, closeSurvey, deleteSurvey,
    
    createProfile, updateProfile, deleteProfile,
    createManualClass, deleteManualClass,

    runClustering, confirmClusters,
    generateTimetables,
    saveFinalTimetables,
    validateMove,
    fetchClassTimetable,
    deleteAiClass,
    addStudentToClass,
    removeStudentFromClass
  };
}