import React from 'react';

/**
 * Komponenta koja vizuelno prikazuje status bezbednosti skele.
 * @param {Object} props
 * @param {'pass' | 'fail' | string} props.status - Status inspekcije
 * @param {string} [props.className] - Dodatni stilovi
 */
const SafetyTag = ({ status, className = "" }) => {
  const isPass = status === 'pass';

  return (
    <div 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider border-2 ${
        isPass 
          ? 'bg-green-100 text-green-800 border-green-500' 
          : 'bg-red-100 text-red-800 border-red-500'
      } ${className}`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${isPass ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {isPass ? 'Safe / Zeleni Tag' : 'Unsafe / Crveni Tag'}
    </div>
  );
};

export default SafetyTag;
