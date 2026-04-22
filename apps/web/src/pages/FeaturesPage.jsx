
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FeaturesPage = () => {
  const features = [
    {
      title: 'Request forms',
      description: 'Standardized forms for scaffold requests with approval workflows'
    },
    {
      title: 'Live status by area/tag',
      description: 'Real-time status tracking organized by area or custom tags'
    },
    {
      title: 'Handover workflow',
      description: 'Structured handover process between teams and contractors'
    },
    {
      title: 'Shutdown reporting',
      description: 'Comprehensive reporting for scaffold shutdowns and compliance'
    },
    {
      title: 'Unlimited users',
      description: 'Add unlimited team members and contractors to your account'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Helmet>
        <title>Scaffold Management Features | TrackMyScaffolding</title>
        <meta name="description" content="Scaffold management features including request forms, live status tracking, handover workflows, and shutdown reporting." />
      </Helmet>

      <Header />

      <main className="flex-1 py-[40px] px-[40px]">
        <div className="max-w-6xl mx-auto">
          
          <h1 className="text-[#1E3A5F] font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-[40px] text-balance">
            Scaffold management features
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-[#ffffff] border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] p-[24px] flex flex-col"
              >
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-[#1E3A5F] font-semibold text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <p className="text-[#64748B] text-base leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
