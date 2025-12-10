"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mapowanie godzin na konkretne czasy
const hourToTime = {
    1: { start: '8:00', end: '8:45' },
    2: { start: '8:50', end: '9:35' },
    3: { start: '9:40', end: '10:25' },
    4: { start: '10:30', end: '11:15' },
    5: { start: '11:20', end: '12:05' },
    6: { start: '12:10', end: '12:55' },
    7: { start: '13:00', end: '13:45' },
    // Dodaj więcej, jeśli masz więcej godzin
};

const UczenTimetablePage = () => {
    const [studentId, setStudentId] = useState('');
    const [timetableData, setTimetableData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTimetableInput, setShowTimetableInput] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('timetable_plans')
                    .select('timetable')
                    .eq('student_id', studentId)
                    .limit(1); // Pobierz tylko pierwszy pasujący rekord

                if (error) {
                    console.error('Błąd pobierania planu lekcji z Supabase:', error);
                    setError('Nie udało się pobrać planu lekcji.');
                }

                if (data && data.length > 0) {
                    setTimetableData(data[0].timetable); // Weź pierwszy element z tablicy data
                    setShowTimetableInput(false);
                } else {
                    setError('Nie znaleziono planu lekcji dla tego studenta.');
                }
            } catch (error) {
                console.error('Wystąpił błąd:', error);
                setError('Wystąpił nieoczekiwany błąd.');
            } finally {
                setLoading(false);
            }
        };
        if (studentId) {
            fetchTimetable();
        }
    }, [studentId]);

    const handleInputChange = (event) => {
        setStudentId(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Fetch timetable will be triggered by the useEffect on studentId change
    };

    const daysOfWeekOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const dayTranslations = {
        monday: 'Poniedziałek',
        tuesday: 'Wtorek',
        wednesday: 'Środa',
        thursday: 'Czwartek',
        friday: 'Piątek',
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Mój Plan Lekcji</h1>

            {showTimetableInput && (
                <form onSubmit={handleSubmit} className="mb-4 flex items-center space-x-2">
                    <input
                        type="text"
                        id="studentId"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Wpisz swój ID studenta"
                        value={studentId}
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Pokaż Plan
                    </button>
                </form>
            )}

            {loading && <div className="bg-gray-100 rounded-lg shadow-md p-6 text-center"><p className="text-gray-600">Ładowanie planu lekcji...</p></div>}
            {error && <div className="bg-red-100 border border-red-400 rounded-lg shadow-md p-4 text-red-700"><p>{error}</p></div>}

            {timetableData && (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200 text-center">
                        Plan Lekcji
                    </h2>
                    <div className="p-4">
                        {daysOfWeekOrder.map((dayKey) => (
                            <div key={dayKey} className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 capitalize">{dayTranslations[dayKey]}</h3>
                                {timetableData[dayKey] && timetableData[dayKey].length > 0 ? (
                                    <ul className="space-y-2">
                                        {timetableData[dayKey].map((lesson, index) => {
                                            const timeSlot = hourToTime[lesson.hour] || { start: 'N/A', end: 'N/A' };
                                            return (
                                                <li key={index} className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-md p-3 flex items-center justify-between shadow-sm">
                                                    <span className="font-medium text-blue-700">{timeSlot.start} - {timeSlot.end}</span>
                                                    <div className="flex items-center">
                                                        <span className="text-indigo-700 font-semibold mr-2">{lesson.subject}</span>
                                                        {lesson.room && <span className="text-gray-500 text-sm">({lesson.room})</span>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">Brak zajęć w {dayTranslations[dayKey]}.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UczenTimetablePage;