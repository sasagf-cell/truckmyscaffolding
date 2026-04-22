import React from 'react';
import SafetyTag from './SafetyTag';

/**
 * Tabela koja prikazuje istoriju inspekcija.
 * @param {Object} props
 * @param {Array} props.list - Lista inspekcija
 * @param {boolean} props.isLoading - Status učitavanja
 */
const InspectionHistory = ({ list, isLoading }) => {
  if (isLoading && list.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 italic">Nema zabeleženih inspekcija za ovu skelu.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Napomena</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sledeći pregled</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {list.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {new Date(item.created).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <SafetyTag status={item.status} className="scale-90 origin-left" />
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {item.notes || '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.next_inspection_date ? new Date(item.next_inspection_date).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InspectionHistory;
