
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useHeadTags } from '@/hooks/useHeadTags.jsx';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const FeaturePageTemplate = ({ title, metaDesc, heroTitle, content, ctaText, lang = 'en', canonicalUrl }) => {
  const headTags = useHeadTags({
    title,
    description: metaDesc,
    canonicalUrl,
    lang
  });

  return (
    <>
      {headTags}
      <Header />
      <main>
        <div className="container py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={lang === 'de' ? '/de/' : '/'}>{lang === 'de' ? 'Startseite' : 'Home'}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{heroTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{heroTitle}</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <p className="text-xl text-muted-foreground leading-relaxed">{content}</p>
            </div>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              {ctaText} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default FeaturePageTemplate;
