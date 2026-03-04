import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}

const BASE_URL = "https://app.taalam.eu";
const DEFAULT_IMAGE = `${BASE_URL}/icon-512.png`;

export default function SEOHead({
  title = "Ta'alam - Apprendre le Coran facilement",
  description = "Apprenez le Coran facilement avec Ta'alam. Quiz, récitation vocale, mémorisation avec répétition espacée, et progression gamifiée.",
  path = "/",
  image = DEFAULT_IMAGE,
}: SEOHeadProps) {
  const fullUrl = `${BASE_URL}${path}`;
  const fullTitle = title.includes("Ta'alam") ? title : `${title} | Ta'alam`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Hreflang pour SEO multilingue */}
      <link rel="alternate" hrefLang="fr" href={`${BASE_URL}${path}`} />
      <link rel="alternate" hrefLang="en" href={`${BASE_URL}${path}?lang=en`} />
      <link rel="alternate" hrefLang="ar" href={`${BASE_URL}${path}?lang=ar`} />
      <link rel="alternate" hrefLang="nl" href={`${BASE_URL}${path}?lang=nl`} />
      <link rel="alternate" hrefLang="ur" href={`${BASE_URL}${path}?lang=ur`} />
      <link rel="alternate" hrefLang="tr" href={`${BASE_URL}${path}?lang=tr`} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${path}`} />
    </Helmet>
  );
}
