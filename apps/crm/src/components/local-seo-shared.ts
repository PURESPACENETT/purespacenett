// Data and structured-data helpers for the local SEO pages.
// Kept free of React/UI imports: route `head()` functions import this module,
// so it ends up in the initial client chunk. The page component lives in
// `local-seo-page.tsx` and stays in the lazily loaded route chunks.

export const BUSINESS = {
  name: "PURE SPACE NETT",
  phone: "07 59 48 30 21",
  phoneE164: "+33759483021",

  email: "contact@purespacenett.com",
  website: "https://www.purespacenett.com",
  googleMapsUrl: "https://maps.app.goo.gl/tQfk5XU5CuWB8G1s5",
  street: "2 rue Chevreul",
  city: "Le Pré-Saint-Gervais",
  postalCode: "93310",
  latitude: 48.8869,
  longitude: 2.4064,
} as const;

export type LocalPageProps = {
  /** Heading of the page, e.g. "Entreprise de nettoyage à Pantin". */
  title: string;
  /** Short lead paragraph under the heading. */
  intro: string;
  /** Neighbourhoods or cities covered, listed for local relevance. */
  districts: readonly string[];
  /** Services highlighted on this page. */
  services: readonly string[];
  /** Questions clients actually ask about this area. */
  faq: readonly { question: string; answer: string }[];
  /** Areas served, used in the structured data. */
  areaServed: readonly string[];
};

/** Structured data so Google can link the page to the business and its area. */
export function localBusinessJsonLd(props: LocalPageProps, path: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CleaningService",
    name: BUSINESS.name,
    description: props.intro,
    url: `https://www.purespacenett.com${path}`,
    telephone: BUSINESS.phoneE164,
    email: BUSINESS.email,
    sameAs: [BUSINESS.website, BUSINESS.googleMapsUrl],
    hasMap: BUSINESS.googleMapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      postalCode: BUSINESS.postalCode,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    areaServed: props.areaServed.map((name) => ({ "@type": "Place", name })),
    priceRange: "€€",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "07:00",
        closes: "22:00",
      },
    ],
    mainEntityOfPage: {
      "@type": "FAQPage",
      mainEntity: props.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  });
}
