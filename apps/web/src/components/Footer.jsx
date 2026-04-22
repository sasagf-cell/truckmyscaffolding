
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo.jsx';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a2332] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <Logo variant="dark" />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-md mt-4">
              Replace your Excel scaffold tracker with a live system for requests, status, and reporting. Built specifically for the complex demands of power plants, refineries, and industrial shutdowns.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/90 mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-primary transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-sm text-white/70 hover:text-primary transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-primary transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-primary transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/90 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-white/70 hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/70 hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            &copy; {currentYear} TrackMyScaffolding. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
