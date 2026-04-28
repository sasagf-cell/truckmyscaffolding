import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Check, ArrowRight, Sparkles, ShieldCheck, Clock, FileText, Truck, ClipboardList, BarChart3, Users, Wrench, BookOpen, Bot, Zap, Globe, QrCode, Mic, Camera, Calculator, Settings2, Euro, Package, Languages } from 'lucide-react';
import { useHeadTags } from '@/hooks/useHeadTags.jsx';
import { Badge } from '@/components/ui/badge';

const LIVE_FEATURES = [
  { icon: ClipboardList, label: 'Scaffold Requests', desc: 'Digital request forms with approval workflow' },
  { icon: BookOpen,      label: 'Scaffold Logs',     desc: 'Full Gerüstbuch — erection, inspection, dismantling' },
  { icon: FileText,      label: 'Site Diary',         desc: 'AI-assisted daily site reports' },
  { icon: Truck,         label: 'Truck Deliveries',   desc: 'Auto weight & volume calculation per delivery' },
  { icon: ShieldCheck,   label: 'Safety Inspections', desc: 'Digital inspection checklists with findings log' },
  { icon: Wrench,        label: 'Material Master Data',desc: 'Catalogue of scaffold components & stock' },
  { icon: BarChart3,     label: 'Reports',            desc: 'Daily & monthly PDF reports per project' },
  { icon: Bot,           label: 'AI Assistant',       desc: 'GPT-powered project Q&A and smart alerts' },
  { icon: Users,         label: 'Team Management',    desc: 'Coordinators and subcontractors in one workspace' },
];

const COMING_SOON = [
  { icon: Users,      label: 'Worker Hours Tracking',    desc: 'GDPR-compliant anonymous worker IDs (W-001 system)', tag: 'V2' },
  { icon: QrCode,     label: 'QR Site Team Onboarding',  desc: 'Scan QR → register → submit reports from the field', tag: 'V2' },
  { icon: BarChart3,  label: 'Multi-Project Dashboard',  desc: 'Overview of all active sites in one view', tag: 'V2' },
  { icon: Settings2,  label: 'Project Settings',         desc: 'Coordinator controls which modules site team can access per project', tag: 'V2' },
  { icon: Euro,       label: 'Rental & Billing Models',  desc: 'Per day, per m², fixed price or time & materials — per project', tag: 'V2' },
  { icon: Sparkles,   label: 'AI Risk Score',            desc: 'Predictive 0-100 safety score per project, updated daily', tag: 'V2 AI' },
  { icon: Camera,     label: 'AI Safety Photo Analysis', desc: 'Upload scaffold photo → AI flags EN 12811 violations instantly', tag: 'V2 AI' },
  { icon: Mic,        label: 'Voice-to-Diary',           desc: 'Speak your site update → AI writes the full diary entry', tag: 'V2 AI' },
  { icon: Package,    label: 'Material Inventory (Lager)',desc: 'Full warehouse tracking — stock levels, reorder alerts, history', tag: 'V2' },
  { icon: Languages,  label: 'German Language (Deutsch)',desc: 'Full UI in German — built for DACH scaffold coordinators', tag: 'V2' },
  { icon: FileText,   label: 'AI Document Import',       desc: 'Upload PDF/Excel Gerüstanforderung → auto-create record', tag: 'V3 AI' },
  { icon: Calculator, label: 'AI Cost Estimator',        desc: 'Describe the job → AI generates material list + price', tag: 'V3 AI' },
];

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    highlight: false,
    desc: 'For coordinators starting out',
    features: [
      '1 project',
      'Up to 3 team members',
      'Scaffold Requests & Logs',
      'Site Diary',
      'No AI features',
    ],
    cta: 'Start Free',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '€39',
    period: '/ month',
    highlight: true,
    desc: 'For active scaffold coordinators',
    features: [
      'Up to 3 projects',
      'Unlimited team members',
      'All core modules',
      'Worker Hours + QR Site Team',
      'AI Assistant + PDF Reports',
      '14-day free trial',
    ],
    cta: 'Start Pro Trial',
    href: '/signup',
  },
  {
    name: 'Enterprise',
    price: '€149',
    period: '/ month',
    highlight: false,
    desc: 'For multi-site operations',
    features: [
      'Unlimited projects',
      'All Pro features',
      'AI Safety Photo Analysis',
      'AI Document Import',
      'AI Cost Estimator',
      'Priority support + API access',
    ],
    cta: 'Contact Us',
    href: '#book-demo',
  },
];

const HomePage = () => {
  const headTags = useHeadTags({
    title: 'TrackMyScaffolding | AI Scaffold Management Software',
    description: 'AI-powered scaffold management for construction coordinators. Replace Excel with live tracking, smart alerts, and automated reports. Built for shutdowns, refineries and power plants.',
    canonicalUrl: 'https://trackmyscaffolding.com/',
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      {headTags}

      {/* HERO — bg-[#f0fdf4] = deploy verify marker Sprint3 25.04 */}
      <section id="hero" className="section-padding bg-[#f0fdf4] border-b border-[#e5e7eb]">
        <div className="container-default">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">
                Open Beta — Free until Jan 2027
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E3A5F] leading-tight mb-6">
                Replace Excel with an AI scaffold operations platform.
              </h1>
              <p className="text-lg text-[#64748B] mb-4">
                TrackMyScaffolding gives scaffold coordinators a live system for requests, inspections, site diaries, and deliveries — with AI that flags risks before they become incidents.
              </p>
              <p className="text-xs text-[#9ca3af] mb-8">
                Built for shutdowns, refineries, petrochemical sites, and power plant scaffold operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/signup" className="inline-flex items-center justify-center px-8 py-4 rounded-md text-base font-bold text-black bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                  Start Free Beta
                </a>
                <a href="#features" className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all gap-2">
                  See all features <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="relative mx-auto w-full max-w-lg lg:pl-8">
              <div className="bg-[#1a2332] rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="bg-gray-900/80 border-b border-gray-800 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gray-700" />
                    <div className="w-3 h-3 rounded-full bg-gray-700" />
                    <div className="w-3 h-3 rounded-full bg-gray-700" />
                  </div>
                  <span className="ml-4 text-xs text-gray-400 font-medium flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Live Dashboard
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[['Active Requests','24','text-[#f0f1f3]'],['In Progress','12','text-[#0EA5A0]'],['Risk Score','72','text-orange-400']].map(([label, val, color]) => (
                      <div key={label} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                        <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 font-medium">{label}</div>
                        <div className={`font-semibold text-xl ${color}`}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-3 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-300 font-medium mb-1">AI Alert</div>
                      <div className="text-[11px] text-gray-400">Scaffold SCF-082 at Pump House East has had no inspection in 9 days. Risk score elevated to 72.</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-800/50 text-gray-400 border-b border-gray-700/50">
                        <tr>
                          <th className="px-3 py-2 font-medium">Tag</th>
                          <th className="px-3 py-2 font-medium">Location</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50 text-gray-300">
                        <tr>
                          <td className="px-3 py-2 font-medium text-[#f0f1f3]">SCF-081</td>
                          <td className="px-3 py-2">Reactor A - L2</td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0EA5A0]/10 text-[#0EA5A0] border border-[#0EA5A0]/20">In Progress</span></td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-[#f0f1f3]">SCF-082</td>
                          <td className="px-3 py-2">Pump House East</td>
                          <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Needs Inspection</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SWITCH */}
      <section id="why-switch" className="section-padding">
        <div className="container-default">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">Why switch from Excel?</h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">Spreadsheets weren't built for live site coordination.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ['Manual tracking wastes time', 'Coordinators spend hours updating spreadsheets instead of managing the site.'],
              ['No real-time visibility', 'Contractors work from outdated lists. Issues surface too late.'],
              ['Approval bottlenecks', 'Requests get lost in email threads, delaying critical shutdown work.'],
              ['Compliance gaps', 'Missing inspection records and incomplete audit trails create safety and legal risks.'],
            ].map(([title, desc]) => (
              <div key={title} className="card-industrial">
                <h3 className="text-xl font-semibold text-[#1E3A5F] mb-3">{title}</h3>
                <p className="text-[#64748B] m-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE FEATURES */}
      <section id="features" className="section-padding bg-white border-y border-[#e5e7eb]">
        <div className="container-default">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-3 py-1 text-xs font-semibold">Live Now</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">Everything you need to run a scaffold site</h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">All modules are live and included in the free Beta.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIVE_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card-industrial flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E3A5F] mb-1">{label}</h3>
                  <p className="text-sm text-[#64748B] m-0">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section id="ai" className="section-padding bg-[#1a2332]">
        <div className="container-default">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 px-3 py-1 text-xs font-semibold">
                AI Scaffolding Copilot
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                AI that understands your site — not just your data.
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                TrackMyScaffolding uses AI to flag risks, draft site diaries, and answer questions about your project in plain language. No dashboards to learn — just ask.
              </p>
              <div className="space-y-4">
                {[
                  ['Live AI Chat', 'Ask anything about your project. "Which scaffolds haven\'t been inspected this week?" — answered instantly.'],
                  ['Smart Alerts', 'Proactive notifications for overdue inspections, missing diary entries, and pending requests.'],
                  ['AI Site Diary', 'AI drafts your daily report from today\'s scaffold activity. Review and submit in seconds.'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{title}</div>
                      <div className="text-gray-400 text-sm">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* AI Chat mock */}
            <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-white text-sm font-medium">AI Assistant</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-green-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Online
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                  <div className="bg-gray-800 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-gray-200 max-w-[80%]">
                    Which scaffolds need inspection today?
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl rounded-tr-sm px-4 py-3 text-sm text-gray-200 max-w-[80%]">
                    3 scaffolds are overdue for inspection: SCF-082 (9 days), SCF-091 (7 days), and SCF-103 (7 days). SCF-082 at Pump House East has the highest risk score — I'd start there.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Show overdue requests', 'Draft today\'s diary', 'Active alerts'].map(s => (
                    <span key={s} className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full border border-gray-700">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP — COMING SOON */}
      <section id="roadmap" className="section-padding bg-[#f9fafb]">
        <div className="container-default">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 text-xs font-semibold">Product Roadmap</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">What's coming next</h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              We're building towards a full AI-native scaffold operations platform. Beta users shape the priority.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMING_SOON.map(({ icon: Icon, label, desc, tag }) => (
              <div key={label} className="bg-white border border-[#e5e7eb] rounded-xl p-5 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  tag.includes('AI') ? 'bg-primary/10' : 'bg-blue-50'
                }`}>
                  <Icon className={`w-4 h-4 ${tag.includes('AI') ? 'text-primary' : 'text-blue-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1E3A5F] text-sm leading-snug">{label}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      tag.includes('AI') ? 'bg-primary/10 text-primary' : tag === 'V3 AI' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] m-0">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section-padding bg-white border-y border-[#e5e7eb]">
        <div className="container-default">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">Open Beta — All plans free until Jan 2027</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">Simple, honest pricing</h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              During Beta, every plan is free. Pricing activates January 2027 — and Beta users lock in a 40% discount.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.name} className={`rounded-xl border p-8 flex flex-col ${
                tier.highlight
                  ? 'bg-[#1a2332] border-primary/40 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative'
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 ${tier.highlight ? 'text-white' : 'text-[#1E3A5F]'}`}>{tier.name}</h3>
                  <p className={`text-sm mb-4 ${tier.highlight ? 'text-gray-400' : 'text-[#64748B]'}`}>{tier.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${tier.highlight ? 'text-white' : 'text-[#1E3A5F]'}`}>{tier.price}</span>
                    <span className={`text-sm ${tier.highlight ? 'text-gray-400' : 'text-[#64748B]'}`}>{tier.period}</span>
                  </div>
                  {tier.highlight && <p className="text-primary text-xs font-medium mt-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Free during Beta</p>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlight ? 'text-primary' : 'text-green-500'}`} />
                      <span className={`text-sm ${tier.highlight ? 'text-gray-300' : 'text-[#64748B]'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={tier.href} className={`w-full text-center py-3 rounded-md font-semibold text-sm transition-all ${
                  tier.highlight
                    ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                    : 'border border-[#e5e7eb] text-[#1E3A5F] hover:bg-[#f9fafb]'
                }`}>
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT BY A COORDINATOR */}
      <section className="section-padding bg-[#1a2332]">
        <div className="container-default max-w-3xl text-center">
          <Globe className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built by a scaffold coordinator. For scaffold coordinators.</h2>
          <p className="text-gray-400 text-lg mb-2">
            TrackMyScaffolding was built out of frustration with Excel on live industrial projects. The founder manages scaffold operations on active power plant shutdowns in Germany — and uses this software daily.
          </p>
          <p className="text-gray-500 text-sm">
            Developed by DreamSoftAI — Ratingen, Germany 🇩🇪 &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; EU-hosted infrastructure
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="book-demo" className="section-padding bg-white border-t border-[#e5e7eb]">
        <div className="container-default max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">Ready to replace your Excel scaffold tracker?</h2>
          <p className="text-lg text-[#64748B] mb-8">
            Join the Beta today. Free access to all modules, no credit card required, full support.
          </p>
          <a href="/signup" className="inline-flex items-center justify-center px-10 py-5 rounded-md text-xl font-bold text-black bg-primary hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] gap-2">
            Start Free — No Card Needed <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
