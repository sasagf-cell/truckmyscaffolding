
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FileEdit, ThumbsUp, Activity, CheckCircle2, BarChart, Archive } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const HowItWorksPage = () => {
  const steps = [
    {
      icon: FileEdit,
      title: 'Request Submission',
      description: 'Subcontractors or site engineers submit a digital scaffold request specifying location, dimensions, load requirements, and required dates. The system automatically assigns a unique tracking number.'
    },
    {
      icon: ThumbsUp,
      title: 'Approval Process',
      description: 'Scaffold coordinators review incoming requests. They can approve, reject with comments, or request modifications. Approved requests are instantly queued for the scaffold builder.'
    },
    {
      icon: Activity,
      title: 'Live Status Tracking',
      description: 'As builders erect the scaffold, the status updates from "Approved" to "In Progress". Everyone on site can see exactly what is being built and where, eliminating duplicate requests.'
    },
    {
      icon: CheckCircle2,
      title: 'Handover Preparation',
      description: 'Once erected and inspected, the scaffold is marked as "Handed Over" and safe for use. Digital signatures and inspection tags are recorded in the system.'
    },
    {
      icon: BarChart,
      title: 'Shutdown Reporting',
      description: 'During active use, coordinators generate reports on total active scaffolds, volume, and contractor utilization to keep the shutdown schedule on track.'
    },
    {
      icon: Archive,
      title: 'Archive & Dismantle',
      description: 'When work is complete, a dismantle request is triggered. Once removed, the scaffold is archived, maintaining a complete historical record for auditing and billing.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Helmet>
        <title>How TrackMyScaffolding Works | Scaffold Workflow Software</title>
        <meta name="description" content="Learn how TrackMyScaffolding streamlines the scaffold workflow from request to approval, status tracking, and handover for shutdown and refinery operations." />
      </Helmet>

      <Header />

      <main className="flex-1 py-[60px] px-[40px]">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-[60px]">
            <h1 className="text-[#1E3A5F] font-bold text-3xl md:text-4xl lg:text-5xl mb-4 text-balance">
              From scaffold request to handover, in one workflow
            </h1>
            <p className="text-[#64748B] font-normal text-base md:text-lg max-w-3xl mx-auto text-balance">
              TrackMyScaffolding guides your team through each step: from initial request through approval, live tracking, and final handover. No manual updates needed.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-8 mb-[60px]">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="bg-white border border-[#e5e7eb] rounded-[8px] p-[32px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <step.icon className="w-8 h-8 text-[#0EA5A0]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-[#0EA5A0] tracking-wider uppercase">Step {index + 1}</span>
                    <h3 className="text-xl font-bold text-[#1E3A5F]">{step.title}</h3>
                  </div>
                  <p className="text-[#64748B] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white border border-[#e5e7eb] rounded-[8px] p-[40px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-6">
              See the workflow in action
            </h2>
            <div className="mb-6">
              <Link
                to="/contact"
                className="inline-flex justify-center items-center px-8 py-3 rounded-md font-medium text-white bg-[#0EA5A0] hover:bg-[#0EA5A0]/90 transition-colors active:scale-[0.98]"
              >
                Book a demo
              </Link>
            </div>
            <p className="text-[12px] text-[#9ca3af] font-normal">
              Built for scaffold coordinators managing shutdown pressure, site visibility, and reporting.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
