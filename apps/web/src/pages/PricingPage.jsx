
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PricingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Helmet>
        <title>TrackMyScaffolding Pricing | Scaffold Software Pricing</title>
        <meta name="description" content="Simple pricing for scaffold operations. Priced per active scaffold or per user, whichever is lower." />
      </Helmet>

      <Header />

      <main className="flex-1 py-[40px] px-[40px]">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-[40px]">
            <h1 className="text-[#1E3A5F] font-bold text-3xl md:text-4xl lg:text-5xl text-balance mb-4">
              Simple pricing for scaffold operations
            </h1>
            <p className="text-[#64748B] font-normal text-base md:text-lg max-w-2xl mx-auto text-balance">
              Priced per active scaffold or per user, whichever is lower.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-xl mx-auto">
            
            {/* Site Plan Card */}
            <Card className="bg-[#ffffff] border-4 border-[#f97316] shadow-[0_4px_12px_rgba(249,115,22,0.1)] rounded-[12px] flex flex-col p-[32px] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#f97316] text-white px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                Active Beta
              </div>
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-bold text-[#1E3A5F] mb-1">Professional Beta Access</CardTitle>
                <div className="flex flex-col">
                  <span className="text-4xl font-bold text-[#1E3A5F] mb-1">$0 <span className="text-lg font-medium text-[#64748B]">/mo</span></span>
                  <span className="text-[#f97316] font-semibold text-sm">FREE until January 1st, 2027</span>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex-1">
                <p className="text-sm text-[#64748B] mb-6">
                  Get full access to all professional features for free during our real-world testing phase. Your feedback helps us build the safest scaffolding software in the world.
                </p>
                <ul className="space-y-4">
                  {[
                    'Unlimited active scaffolds',
                    'Unlimited users & contractors',
                    'Industrial Request Forms',
                    '3D Scaffold Visualization',
                    'Digital QR Handovers',
                    'Shutdown Reporting',
                    'Smart Analytics & Exports'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#0EA5A0] flex-shrink-0 mt-0.5" />
                      <span className="text-[#1E3A5F] font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="p-0 mt-8 flex flex-col gap-3">
                <Button asChild className="w-full bg-[#f97316] hover:bg-[#f97316]/90 text-white font-bold py-6 text-lg rounded-md shadow-lg transition-all duration-200 active:scale-[0.98]">
                  <Link to="/signup">Register Free Now</Link>
                </Button>
                <p className="text-[11px] text-center text-[#64748B]">
                  No credit card required. Free for all industrial sites.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
