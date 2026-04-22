import React from 'react';
import { useInspections } from './hooks/useInspections';
import InspectionForm from './components/InspectionForm';
import InspectionHistory from './components/InspectionHistory';
import SafetyTag from './components/SafetyTag';

/**
 * Glavna stranica za upravljanje bezbednošću skela.
 * @param {Object} props
 * @param {string} props.scaffoldId - ID skele (dinamički prosleđen)
 */
const SafetyInspectionsPage = ({ scaffoldId = 'DEMO-SCAFFOLD-123' }) => {
  const { 
    inspections, 
    latest, 
    loading, 
    error, 
    addInspection 
  } = useInspections(scaffoldId);

  const handleNewInspection = async (data) => {
    try {
      await addInspection(data);
      // Ovdje možemo dodati toast notifikaciju ako je dostupna
    } catch (err) {
      console.error('Greška pri čuvanju:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Safety Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Upravljanje bezbednosnim sertifikatima i inspekcijama.</p>
        </div>
        
        {latest && (
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-gray-400 uppercase mb-1">Trenutni Status</span>
            <SafetyTag status={latest.status} />
          </div>
        )}
      </header>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Greška:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <section className="lg:col-span-4">
          <div className="sticky top-8">
            <InspectionForm 
              onSubmit={handleNewInspection} 
              isLoading={loading} 
            />
          </div>
        </section>

        {/* Right: History Table */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-800">Istorija Pregleda</h2>
            <span className="text-sm text-gray-500">{inspections.length} zapisa</span>
          </div>
          
          <InspectionHistory 
            list={inspections} 
            isLoading={loading} 
          />
        </section>
      </main>
    </div>
  );
};

export default SafetyInspectionsPage;
