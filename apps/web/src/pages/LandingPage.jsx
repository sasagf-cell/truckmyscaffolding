
import React from 'react';
import { ClipboardList, MapPin, Truck, BookOpen, ArrowRight, CheckCircle2, AlertTriangle, Clock, FileText, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-[#1a2332] text-white overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1686061593213-98dad7c599b9')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="container-default relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Replace your Excel scaffold tracker with a live system for requests, status, and reporting.
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10">
              TrackMyScaffolding helps scaffold coordinators manage requests, approvals, and material deliveries in one live system. Built for scaffold teams working across shutdowns, turnarounds, refineries, power plants, and petrochemical sites.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <a
                href="#cta"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-md shadow-lg text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                Book a demo
              </a>
              <a
                href="#how-it-works"
                className="text-white/90 hover:text-white text-link-secondary flex items-center gap-2"
              >
                See the workflow
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WHY TEAMS SWITCH FROM EXCEL SECTION */}
      <section id="why-switch" className="section-padding bg-[#f5f5f5] text-[#1E3A5F]">
        <div className="container-default">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why teams switch from Excel
            </h2>
          </div>

          <div className="grid-industrial">
            {/* Problem Block 1 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Lost or duplicated scaffold requests</h3>
              </div>
              <p className="text-[#1E3A5F]/80">
                Scaffold requests scattered across emails, WhatsApp, and spreadsheets. Duplicates go unnoticed. Approvals get lost in the noise.
              </p>
            </div>

            {/* Problem Block 2 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">No live status by area</h3>
              </div>
              <p className="text-[#1E3A5F]/80">
                Coordinators manually update status in Excel. By the time the update reaches the site, it's outdated. No clear view of what's pending, in progress, or ready for handover.
              </p>
            </div>

            {/* Problem Block 3 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Manual end-of-shift reporting</h3>
              </div>
              <p className="text-[#1E3A5F]/80">
                Hours spent compiling daily logs, manpower counts, and issue summaries from paper notes and messages. Shutdown reporting becomes a bottleneck.
              </p>
            </div>

            {/* Problem Block 4 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Weak audit trail for approvals and handovers</h3>
              </div>
              <p className="text-[#1E3A5F]/80">
                Who approved what, when, and why? Hard to answer when everything's in email or handwritten notes. Inspections and compliance reviews take longer.
              </p>
            </div>
          </div>

          <div className="mt-16 p-6 bg-white border border-border rounded-lg shadow-sm">
            <p className="text-lg font-medium text-[#1E3A5F]">
              TrackMyScaffolding gives every scaffold request, status change, and handover a visible history. Teams spend less time chasing updates and more time keeping work moving.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="section-padding bg-white text-[#1E3A5F]">
        <div className="container-default">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
          </div>

          <div className="grid-industrial">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-xl border border-border shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-6">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Scaffold Requests & Approvals</h3>
              <p className="text-[#1E3A5F]/80 flex-grow">
                Scaffold planners and site engineers submit requests with area, type, scope, and tag number. Every approval is timestamped and linked to the responsible person. No more lost requests or unclear sign-offs.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-xl border border-border shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Status by Area</h3>
              <p className="text-[#1E3A5F]/80 flex-grow">
                Track scaffold status by work area, elevation, or tag number. See at a glance what's pending, in progress, and ready for handover. Coordinators and supervisors always know the current state without asking.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-xl border border-border shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-6">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Material Delivery & Tagging</h3>
              <p className="text-[#1E3A5F]/80 flex-grow">
                Record scaffold material deliveries, tag numbers, and counts. Link deliveries to active work orders and areas. Reduce delays caused by missing or misplaced materials.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-xl border border-border shadow-sm flex flex-col h-full">
              <div className="w-12 h-12 bg-[#f5f5f5] rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Site Diary & Shutdown Reporting</h3>
              <p className="text-[#1E3A5F]/80 flex-grow">
                Log daily status, manpower, and issues in one place. Automatically generate shutdown reporting summaries. Reduce the time spent compiling end-of-day and end-of-shift reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGNED FOR REAL SITE CONDITIONS SECTION */}
      <section className="section-padding bg-[#f5f5f5] text-[#1E3A5F]">
        <div className="container-default">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Designed for real site conditions
            </h2>
          </div>

          <div className="grid-industrial">
            {/* Point 1 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h3 className="text-xl font-semibold mb-2">Multiple contractors, one live source of truth</h3>
              <p className="text-[#1E3A5F]/80">
                Scaffold teams, site supervisors, and contractors all see the same request and status data in real time. No conflicting versions.
              </p>
            </div>

            {/* Point 2 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h3 className="text-xl font-semibold mb-2">Full request and approval history</h3>
              <p className="text-[#1E3A5F]/80">
                Every scaffold request, approval, and status change is logged with timestamps and responsible persons. Built for inspection and compliance reviews.
              </p>
            </div>

            {/* Point 3 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h3 className="text-xl font-semibold mb-2">Clear scaffold status by area or tag</h3>
              <p className="text-[#1E3A5F]/80">
                Know exactly what's pending, in progress, or ready for handover. Reduce delay risk and keep shutdown schedules on track.
              </p>
            </div>

            {/* Point 4 */}
            <div className="border-l-4 border-primary pl-6 py-2">
              <h3 className="text-xl font-semibold mb-2">Better reporting during shutdown pressure</h3>
              <p className="text-[#1E3A5F]/80">
                Automatic daily and shift-end summaries. Less manual work, more time for site coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR INDUSTRIAL SITES SECTION */}
      <section id="industrial-sites" className="section-padding bg-[#1a2332] text-white">
        <div className="container-default">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for power plants, refineries, and shutdowns
              </h2>
              <p className="text-white/80 text-lg mb-10">
                Designed around the way scaffold teams really work on power plants, refineries, petrochemical sites, and major shutdowns. Long shifts, multiple contractors, high-risk work zones, strict reporting expectations, and tight turnaround schedules. Generic project management tools don't reflect how scaffold operations actually function in these environments. TrackMyScaffolding is built specifically for this complexity.
              </p>
            </div>
            
            <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-white/90 font-medium text-lg">"We reduced lost scaffold requests by centralizing everything."</p>
              </div>
              <div className="w-full h-px bg-white/10"></div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-white/90 font-medium text-lg">"We finally have a clear audit trail for approvals and handovers."</p>
              </div>
              <div className="w-full h-px bg-white/10"></div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-white/90 font-medium text-lg">"Our coordinators spend less time on admin, more time on site."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section id="cta" className="section-padding bg-[#1a2332] text-white border-t border-white/10">
        <div className="container-default text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stop chasing scaffold updates across spreadsheets, calls, and inboxes.
            </h2>
            <p className="text-lg text-white/80 mb-10">
              Book a demo to see how TrackMyScaffolding helps your team manage requests, status, and reporting in one live system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-md shadow-lg text-lg font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                Book a demo
              </a>
              <a
                href="#how-it-works"
                className="text-white/90 hover:text-white text-link-secondary flex items-center gap-2"
              >
                See how the workflow works
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
