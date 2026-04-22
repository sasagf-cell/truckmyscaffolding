
import React from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
