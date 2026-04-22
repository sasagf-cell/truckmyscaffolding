
import React from 'react';

const Logo = ({ variant = 'light', className }) => {
  const myScaffoldingColor = variant === 'light' ? '#1E3A5F' : '#FFFFFF';
  
  return (
    <div className={`flex items-center text-[18px] md:text-[20px] ${className || ''}`}>
      <span 
        className="inline-block"
        style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: 300,
          color: '#0EA5A0',
          visibility: 'visible',
          opacity: 1,
          display: 'inline-block'
        }}
      >
        Track
      </span>
      <span 
        className="inline-block ml-1"
        style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontWeight: 700,
          color: myScaffoldingColor,
          visibility: 'visible',
          opacity: 1,
          display: 'inline-block'
        }}
      >
        MyScaffolding
      </span>
      <span 
        className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-[#f97316] text-white"
      >
        Beta
      </span>
    </div>
  );
};

export default Logo;
