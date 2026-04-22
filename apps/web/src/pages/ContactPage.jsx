
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Demo request sent successfully. We will be in touch shortly.');
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Helmet>
        <title>Book Demo | TrackMyScaffolding Scaffold Software</title>
        <meta name="description" content="Schedule a demo of TrackMyScaffolding and see how scaffold coordinators manage requests, status, and handovers in one system." />
      </Helmet>

      <Header />

      <main className="flex-1 py-[60px] px-[40px]">
        <div className="max-w-3xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-[40px] lg:mb-[60px]">
            <h1 className="text-[#1E3A5F] font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4 text-balance">
              Book a demo for your scaffold operations
            </h1>
            <p className="text-[#64748B] font-normal text-base md:text-lg text-center max-w-2xl mx-auto text-balance">
              See how TrackMyScaffolding helps your team manage scaffold requests, live status, handovers, and shutdown reporting in one system.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] p-[32px] md:p-[40px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-[40px]">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#f0fdfa] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#0EA5A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Request Received</h2>
                <p className="text-[#64748B]">
                  Thank you for your interest. Our team will contact you shortly to schedule your demo.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-[#0EA5A0] hover:underline font-medium"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-[20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-[#e5e7eb] rounded-md px-4 py-2.5 text-[#1E3A5F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0] focus:border-transparent transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
                      Work email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-[#e5e7eb] rounded-md px-4 py-2.5 text-[#1E3A5F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0] focus:border-transparent transition-colors"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-[#e5e7eb] rounded-md px-4 py-2.5 text-[#1E3A5F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0] focus:border-transparent transition-colors"
                      placeholder="Acme Industrial"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
                      Phone number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#e5e7eb] rounded-md px-4 py-2.5 text-[#1E3A5F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0] focus:border-transparent transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
                    Message <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white border border-[#e5e7eb] rounded-md px-4 py-2.5 text-[#1E3A5F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A0] focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us about your current scaffold tracking process..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0EA5A0] hover:bg-[#0EA5A0]/90 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center"
                  >
                    {loading ? 'Submitting...' : 'Schedule demo'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Trust Copy */}
          <p className="text-[12px] text-[#9ca3af] font-normal text-center">
            Built for scaffold coordinators, planners, and project teams working across shutdowns, refineries, and power plant sites.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
