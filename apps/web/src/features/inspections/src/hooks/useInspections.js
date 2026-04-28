import { useState, useEffect, useCallback } from 'react';
import { inspectionService } from '../services/inspectionService';

/**
 * Hook for managing scaffold inspections.
 * Sprint 3C: Updated to support project-level + scaffold-log-level filtering.
 * @param {string} projectId - Always required (project scope)
 * @param {string|null} scaffoldLogId - Optional: filter to specific scaffold log
 * @param {number} intervalDays - Project inspection interval (default 28)
 */
export const useInspections = (projectId, scaffoldLogId = null, intervalDays = 28) => {
  const [inspections, setInspections] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      let data;
      if (scaffoldLogId) {
        // Show only inspections for the selected scaffold log
        data = await inspectionService.getByScaffoldLogId(scaffoldLogId);
      } else {
        // Show all project inspections
        data = await inspectionService.getByProjectId(projectId);
      }
      setInspections(data);
      setLatest(data[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, scaffoldLogId]);

  const addInspection = async (inspectionData) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await inspectionService.create(
        {
          ...inspectionData,
          project_id: projectId,
          scaffold_log_id: scaffoldLogId,
        },
        intervalDays
      );

      // Optimistic update
      setInspections(prev => [newRecord, ...prev]);
      setLatest(newRecord);
      return newRecord;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    inspections,
    latest,
    loading,
    error,
    refresh,
    addInspection,
  };
};
