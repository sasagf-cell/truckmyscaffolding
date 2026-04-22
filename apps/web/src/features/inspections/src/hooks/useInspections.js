import { useState, useEffect, useCallback } from 'react';
import { inspectionService } from '../services/inspectionService';

/**
 * Custom hook za rad sa inspekcijama specifične skele.
 * @param {string} scaffoldId 
 */
export const useInspections = (scaffoldId) => {
  const [inspections, setInspections] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Osvežava podatke o inspekcijama.
   */
  const refresh = useCallback(async () => {
    if (!scaffoldId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getByScaffoldId(scaffoldId);
      setInspections(data);
      setLatest(data[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [scaffoldId]);

  /**
   * Dodaje novu inspekciju i osvežava listu.
   * @param {Object} inspectionData 
   */
  const addInspection = async (inspectionData) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await inspectionService.create({
        ...inspectionData,
        scaffold_id: scaffoldId
      });
      
      // Lokalno ažuriramo state za instant feedback
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

  // Automatsko učitavanje pri inicijalizaciji
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    inspections,
    latest,
    loading,
    error,
    refresh,
    addInspection
  };
};
