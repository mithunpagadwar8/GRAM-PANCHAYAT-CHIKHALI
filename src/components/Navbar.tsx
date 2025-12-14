import React from 'react';

interface NavbarProps {
  logoUrl: string;
  panchayatName: string;
  flagUrl: string;
  marqueeText: string;
}

export const Navbar: React.FC<NavbarProps> = ({ logoUrl, panchayatName, flagUrl, marqueeText }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 w-12 object-contain" />}
          <h1 className="text-xl font-bold text-gray-800">{panchayatName}</h1>
        </div>
        {flagUrl && <img src={flagUrl} alt="Flag" className="h-8 object-contain" />}
      </div>
      {marqueeText && (
        <div className="bg-blue-600 text-white text-sm py-1 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block">{marqueeText}</div>
        </div>
      )}
    </nav>
  );
};
