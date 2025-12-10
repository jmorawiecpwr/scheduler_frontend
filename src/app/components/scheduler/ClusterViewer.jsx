'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge, Card } from '../../ui';

export default function ClusterViewer({
  clusteredData,
  onRecluster,
  onConfirmClusters,
}) {
  const [clusters, setClusters] = useState({});
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (clusteredData && typeof clusteredData === 'object') {
      if (typeof clusteredData === 'number') {
        return;
      }
      setClusters(clusteredData);
    }
  }, [clusteredData]);

  const handleDragStart = (e, student, fromCluster) => {
    setDraggedStudent({ student, fromCluster });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toCluster) => {
    e.preventDefault();
    if (!draggedStudent) return;

    const { student, fromCluster } = draggedStudent;
    if (fromCluster === toCluster) return;

    setClusters((prev) => {
      const updated = { ...prev };
      
      updated[fromCluster] = updated[fromCluster].filter(
        (s) => s.id !== student.id
      );

      updated[toCluster] = [...(updated[toCluster] || []), student];
      
      return updated;
    });

    setDraggedStudent(null);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirmClusters(clusters);
    } finally {
      setIsConfirming(false);
    }
  };

  const totalStudents = Object.values(clusters).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0
  );

  const clusterEntries = Object.entries(clusters).sort(
    ([a], [b]) => parseInt(a) - parseInt(b)
  );

  if (clusterEntries.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Brak danych klasteryzacji
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{totalStudents}</span> uczniów w{' '}
            <span className="font-medium text-slate-900">{clusterEntries.length}</span> klasach
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Przeciągnij uczniów między klasami, aby dostosować podział
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onRecluster}>
            Ponów klasteryzację
          </Button>
        </div>
      </div>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusterEntries.map(([clusterLabel, students]) => (
          <Card
            key={clusterLabel}
            padding="none"
            className="overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, clusterLabel)}
          >
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">
                  Klasa {String.fromCharCode(65 + parseInt(clusterLabel))}
                </h4>
                <Badge variant="default">{students?.length || 0} uczniów</Badge>
              </div>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto min-h-[100px]">
              {students?.length > 0 ? (
                <ul className="space-y-1">
                  {students.map((student) => (
                    <li
                      key={student.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, student, clusterLabel)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg cursor-move hover:border-slate-300 hover:shadow-sm transition-all select-none"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {student.name || `Uczeń ${student.id.slice(-6)}`}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            ID: ...{student.id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-20 text-sm text-slate-400">
                  Przeciągnij uczniów tutaj
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button variant="secondary" onClick={onRecluster}>
          Anuluj
        </Button>
        <Button onClick={handleConfirm} loading={isConfirming}>
          Zatwierdź i zapisz klasy
        </Button>
      </div>
    </div>
  );
}