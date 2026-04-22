import React, { useState } from 'react';

/**
 * Forma za kreiranje novog zapisa o inspekciji.
 * @param {Object} props
 * @param {Function} props.onSubmit - Funkcija koja šalje podatke servisu
 * @param {boolean} props.isLoading - Status učitavanja
 */
const InspectionForm = ({ onSubmit, isLoading }) => {
  const [status, setStatus] = useState('pass');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    base_plates: true,
    uprights: true,
    guard_rails: true,
    toe_boards: true,
    platform_boards: true
  });

  const handleChecklistChange = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      status,
      notes,
      checklist,
      next_inspection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 7 dana
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Nova Inspekcija Skele</h3>

      {/* Status Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Finalni Status</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setStatus('pass')}
            className={`flex-1 py-3 rounded-lg font-bold border-2 transition-all ${
              status === 'pass' 
                ? 'bg-green-500 border-green-600 text-white' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-green-200'
            }`}
          >
            Sređeno (PASS)
          </button>
          <button
            type="button"
            onClick={() => setStatus('fail')}
            className={`flex-1 py-3 rounded-lg font-bold border-2 transition-all ${
              status === 'fail' 
                ? 'bg-red-500 border-red-600 text-white' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-red-200'
            }`}
          >
            Nije Bezbedno (FAIL)
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Checklista provere</label>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {Object.keys(checklist).map((key) => (
            <label key={key} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={() => handleChecklistChange(key)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700 capitalize group-hover:text-gray-900">
                {key.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Napomene</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          placeholder="Unesite zapažanja sa terena..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95'
        }`}
      >
        {isLoading ? 'Snimanje...' : 'Sačuvaj Inspekciju'}
      </button>
    </form>
  );
};

export default InspectionForm;
