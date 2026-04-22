
import React from 'react';
import { Helmet } from 'react-helmet-async';

export function useHeadTags({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = '/og-image.png', 
  ogTitle, 
  ogDescription, 
  schemaMarkup, 
  lang = 'en',
  noindex = false
}) {
  return (
    <Helmet>
      <html lang={lang} />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
}
