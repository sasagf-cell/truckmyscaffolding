
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Detect language from URL
    const isDe = location.pathname.startsWith('/de');
    setLang(isDe ? 'de' : 'en');

    // Auto-redirect based on locale if on root and no preference set
    if (location.pathname === '/' && !localStorage.getItem('langPref')) {
      const userLang = navigator.language || navigator.userLanguage;
      if (userLang.startsWith('de')) {
        localStorage.setItem('langPref', 'de');
        navigate('/de/');
      }
    }
  }, [location.pathname, navigate]);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'de' : 'en';
    localStorage.setItem('langPref', newLang);
    
    let newPath = location.pathname;
    if (newLang === 'de') {
      newPath = newPath === '/' ? '/de/' : `/de${newPath}`;
    } else {
      newPath = newPath.replace(/^\/de/, '') || '/';
    }
    
    navigate(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      {lang === 'en' ? 'DE' : 'EN'}
    </button>
  );
};

export default LanguageSwitcher;
