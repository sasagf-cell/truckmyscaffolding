
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Calendar, Package, MessageSquare, Users, BarChart3 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useHeadTags } from '@/hooks/useHeadTags.jsx';

const GermanLandingPage = () => {
  const headTags = useHeadTags({
    title: 'Gerüstmanagement Software mit KI | TrackMyScaffolding',
    description: 'Ersetzen Sie Excel durch eine digitale Plattform für Gerüstverwaltung. Verwalten Sie Arbeitsaufträge, Bautagebücher und Materiallieferungen.',
    canonicalUrl: 'https://trackmyscaffolding.com/de/',
    lang: 'de',
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "TrackMyScaffolding",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "19.00",
        "priceCurrency": "EUR"
      }
    }
  });

  const features = [
    { icon: CheckCircle, title: 'Arbeitsaufträge', link: '/de/features/work-orders', desc: 'Digitale Formulare mit Freigabe-Workflows.' },
    { icon: Calendar, title: 'Bautagebuch', link: '/de/features/site-diary', desc: 'Tägliche Einträge mit KI-Unterstützung.' },
    { icon: Package, title: 'Materialverfolgung', link: '/de/features/material-tracking', desc: 'Lieferungen erfassen und Bestand prüfen.' },
    { icon: MessageSquare, title: 'KI-Assistent', link: '/de/features/ai-assistant', desc: 'Smarte Warnungen für inaktive Gerüste.' },
    { icon: Users, title: 'Subunternehmer-Portal', link: '/de/features/subcontractor-portal', desc: 'Nahtlose Zusammenarbeit im Team.' },
    { icon: BarChart3, title: 'Echtzeit-Berichte', link: '/de/features/work-orders', desc: 'PDF-Berichte auf Knopfdruck generieren.' }
  ];

  return (
    <>
      {headTags}
      <Header />
      <main>
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Ihre Baustelle. Endlich unter Kontrolle.</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Digitalisieren Sie Ihre Gerüstverwaltung mit KI-gestützter Automatisierung.</p>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              Kostenlos starten – Keine Kreditkarte erforderlich <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Von einem Gerüstkoordinator entwickelt – für Gerüstkoordinatoren.</p>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Alles, was Sie für Ihre Baustelle brauchen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <Link to={f.link} key={i} className="card hover:shadow-lg transition-shadow block">
                  <f.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default GermanLandingPage;
