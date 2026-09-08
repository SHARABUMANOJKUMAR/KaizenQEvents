import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: string;
  image?: string;
  structuredData?: object | object[];
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  type = 'website',
  image = 'https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png',
  structuredData,
  noindex = false,
}) => {
  const siteUrl = 'https://kaizenqevents.tech'; // Updated to new domain
  const currentUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  const renderStructuredData = () => {
    if (!structuredData || noindex) return null;
    
    const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];
    
    return schemas.map((schema, index) => (
      <script type="application/ld+json" key={index}>
        {JSON.stringify(schema)}
      </script>
    ));
  };

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={currentUrl} />}

      {/* Robots Tag */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Kaizen Q Events" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (Schema.org) */}
      {renderStructuredData()}
    </Helmet>
  );
};
