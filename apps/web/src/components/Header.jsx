
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo.jsx';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll to hash on route change or load
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const navLinks = [
    { name: 'Hero', href: '#hero' },
    { name: 'Why switch', href: '#why-switch' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'See software', href: '#see-software' },
    { name: 'Pricing', href: '#pricing' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL hash without jumping
      window.history.pushState(null, '', href);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      {/* Beta Banner Removed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo variant="light" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Button with Trust Line */}
          <div className="hidden md:flex items-center">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#book-demo"
                onClick={(e) => handleNavClick(e, '#book-demo')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                Book a demo
              </a>
              <p className="text-[12px] text-[#64748B] font-normal leading-[1.5] m-0">
                Built for shutdowns & refineries.
              </p>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground/80 hover:bg-muted/10 hover:border-primary/50 hover:text-primary"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 pb-2">
              <a
                href="#book-demo"
                onClick={(e) => handleNavClick(e, '#book-demo')}
                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90"
              >
                Book a demo
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
