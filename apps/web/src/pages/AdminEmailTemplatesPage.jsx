
import React from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EmailTemplatePreview from '@/components/EmailTemplatePreview.jsx';

const AdminEmailTemplatesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Email Template Manager</h1>
            <p className="text-muted-foreground mt-1">
              Preview, test, and manage transactional email templates.
            </p>
          </div>
          
          <EmailTemplatePreview />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminEmailTemplatesPage;
