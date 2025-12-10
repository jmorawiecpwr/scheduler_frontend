'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mapowanie godzin na konkretne czasy
const hourToTime = {
    1: { start: '8:00', end: '8:45' },
    2: { start: '8:50', end: '9:35' },
    3: { start: '9:40', end: '10:25' },
    4: { start: '10:30', end: '11:15' },
    5: { start: '11:20', end: '12:05' },
    6: { start: '12:10', end: '12:55' },
    7: { start: '13:00', end: '13:45' },
};

const TimetableDisplay = ({ schoolCode, surveyCode, clusterLabel }) => {
    const [timetableData, setTimetableData] = useState(null);
    const [roomsMap, setRoomsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const supabase = createClientComponentClient();

    // ============================
    // Pobieranie sal (id → name)
    // ============================
    const fetchRooms = async (schoolCode) => {
        const { data, error } = await supabase
            .from("rooms")
            .select("id, name")
            .eq("school_code", schoolCode);

        if (error) {
            console.error("Błąd pobierania sal:", error);
            return;
        }

        const map = {};
        data.forEach(r => {
            map[r.id] = r.name;
        });

        setRoomsMap(map);
    };

    // ============================
    // Pobranie planu lekcji
    // ============================
    const fetchTimetable = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/get_class_timetable?school=${schoolCode}&survey=${surveyCode}&cluster=${clusterLabel}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setTimetableData(data);

            // pobierz sale, jeśli są w planie
            if (schoolCode) {
                await fetchRooms(schoolCode);
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (schoolCode && surveyCode && clusterLabel !== undefined) {
            fetchTimetable();
        }
    }, [schoolCode, surveyCode, clusterLabel]);

    // ============================
    // Renderowanie
    // ============================

    if (loading) {
        return (
            <div className="bg-gray-100 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">Ładowanie planu lekcji...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 rounded-lg shadow-md p-4 text-red-700">
                <p>Błąd pobierania planu lekcji: {error}</p>
            </div>
        );
    }

    if (!timetableData || Object.keys(timetableData).length === 0) {
        return (
            <div className="bg-gray-100 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 italic">Brak planu lekcji.</p>
            </div>
        );
    }

    const daysOfWeekOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const dayTranslations = {
        monday: "Poniedziałek",
        tuesday: "Wtorek",
        wednesday: "Środa",
        thursday: "Czwartek",
        friday: "Piątek",
    };

    return (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200 text-center">
                Plan lekcji
            </h2>

            <div className="p-4">
                {daysOfWeekOrder.map((dayKey) => (
                    <div key={dayKey} className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            {dayTranslations[dayKey]}
                        </h3>

                        {timetableData[dayKey] && timetableData[dayKey].length > 0 ? (
                            <ul className="space-y-2">
                                {timetableData[dayKey].map((lesson, index) => {
                                    const timeSlot = hourToTime[lesson.hour] || {
                                        start: "N/A",
                                        end: "N/A",
                                    };

                                    const roomName = roomsMap[lesson.room] || lesson.room || "Sala ??";

                                    return (
                                        <li
                                            key={index}
                                            className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-md p-3 flex items-center justify-between shadow-sm"
                                        >
                                            <span className="font-medium text-blue-700">
                                                {timeSlot.start} – {timeSlot.end}
                                            </span>

                                            <div className="flex items-center">
                                                <span className="text-indigo-700 font-semibold mr-2">
                                                    {lesson.subject}
                                                </span>

                                                {lesson.room && (
                                                    <span className="text-gray-600 text-sm">
                                                        ({roomName})
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">
                                Brak zajęć w {dayTranslations[dayKey]}.
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimetableDisplay;
