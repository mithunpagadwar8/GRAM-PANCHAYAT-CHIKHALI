
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  logoUrl?: string;
  flagUrl?: string;
  marqueeText?: string;
  panchayatName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ logoUrl, flagUrl, marqueeText, panchayatName }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'मुख्य पृष्ठ (Home)', path: '/' },
    { name: 'योजना (Schemes)', path: '/schemes' },
    { name: 'कर भरा (Tax)', path: '/tax' },
    { name: 'तक्रार निवारण (Complaint)', path: '/complaint' },
    { name: 'बातम्या (News)', path: '/blog' },
    { name: 'संपर्क (Contact)', path: '/contact' }, 
  ];

  return (
    <div className="flex flex-col w-full z-50 sticky top-0">
      {/* Top Bar with Indian Flag Colors */}
      <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]"></div> {/* Saffron */}
          <div className="h-full w-1/3 bg-white"></div>     {/* White */}
          <div className="h-full w-1/3 bg-[#138808]"></div> {/* Green */}
      </div>

      <nav className="bg-gov-primary text-white shadow-2xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex justify-between items-center h-24 md:h-28">
            
            {/* Brand Logo Section */}
            <Link to="/" className="flex items-center gap-3 md:gap-4 group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-orange-400 p-1 transition-transform group-hover:scale-105">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <i className="fas fa-landmark text-gov-primary text-3xl"></i>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="text-xl md:text-3xl font-bold leading-tight text-white drop-shadow-md font-serif">
                  {panchayatName || "ग्रामपंचायत चिखली"}
                </h1>
                <span className="text-xs md:text-sm text-yellow-300 font-bold tracking-wide uppercase">
                  पंचायत समिती कुरखेडा | जिल्हा परिषद गडचिरोली
                </span>
                <span className="text-[10px] md:text-xs text-gray-200 italic mt-0.5">
                  "गावाचा विकास, देशाचा विकास"
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md transition-all duration-300 text-sm font-semibold border border-transparent ${
                    location.pathname === link.path 
                    ? 'bg-white text-gov-primary border-orange-400 shadow' 
                    : 'hover:bg-white/10 hover:border-white/30 text-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Explicit Admin Login Button */}
              <Link 
                to="/admin" 
                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow-lg font-bold text-sm border border-orange-400 flex items-center gap-2 transform hover:-translate-y-0.5 transition"
              >
                <i className="fas fa-user-shield"></i> Admin Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-3">
               <Link to="/admin" className="text-white bg-orange-500 p-2 rounded text-sm">
                  <i className="fas fa-user-shield"></i>
               </Link>
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white text-2xl p-2 focus:outline-none">
                  <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
               </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-blue-900 border-t border-blue-700 shadow-inner">
             {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-3 border-b border-blue-800 text-white font-medium hover:bg-blue-800 flex items-center justify-between"
                >
                  {link.name}
                  <i className="fas fa-chevron-right text-xs opacity-50"></i>
                </Link>
              ))}
          </div>
        )}

        {/* Marquee Section */}
        <div className="bg-white text-gov-primary py-1 border-b-2 border-green-600 shadow-inner relative overflow-hidden">
          <div className="container mx-auto px-4 flex items-center">
            <div className="bg-red-600 text-white px-3 py-0.5 text-xs font-bold rounded shadow mr-3 z-10 flex-shrink-0 animate-pulse">
              <i className="fas fa-bullhorn mr-1"></i> सूचना
            </div>
            <div className="marquee-container flex-1 overflow-hidden">
              <div className="marquee-content font-bold text-sm text-blue-900">
                {marqueeText || "ग्रामपंचायत पोर्टलवर आपले स्वागत आहे."}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
