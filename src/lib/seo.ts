import { business } from "@/content/business";

/** JSON-LD de l'entreprise, réutilisé sur les pages principales. */
export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  name: business.name,
  description: business.tagline,
  telephone: "+33759483021",
  email: business.email,
  url: "/",
  hasMap: business.googleBusinessUrl,
  sameAs: [business.googleBusinessUrl],
  address: {
    "@type": "PostalAddress",
    addressLocality: business.city,
    postalCode: business.postalCode,
    addressRegion: business.region,
    addressCountry: business.country,
  },
  areaServed: business.areaServed.map((a) => ({ "@type": "Place", name: a })),
  openingHours: business.openingHours,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:00",
      closes: "22:00",
    },
  ],
  priceRange: "€€",
};

export const serviceJsonLd = (name: string, description: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  serviceType: name,
  url: path,
  provider: {
    "@type": "CleaningService",
    name: business.name,
    telephone: "+33759483021",
    address: {
      "@type": "PostalAddress",
      addressLocality: business.city,
      postalCode: business.postalCode,
      addressCountry: business.country,
    },
  },
  areaServed: business.areaServed.map((a) => ({ "@type": "Place", name: a })),
});

/** JSON-LD d'une page de ville : entreprise + zone servie précise. */
export const cityBusinessJsonLd = ({
  city,
  postalCode,
  department,
  sectors,
  neighbours,
  path,
  description,
}: {
  city: string;
  postalCode: string;
  department: string;
  sectors: string[];
  neighbours: string[];
  path: string;
  description: string;
}) => ({
  ...localBusinessJsonLd,
  name: `${business.name} — Nettoyage à ${city}`,
  description,
  url: path,
  areaServed: [
    {
      "@type": "City",
      name: city,
      ...(postalCode ? { postalCode } : {}),
      containedInPlace: { "@type": "AdministrativeArea", name: department },
    },
    ...sectors.map((s) => ({ "@type": "Place", name: `${s}, ${city}` })),
    ...neighbours.map((n) => ({ "@type": "City", name: n })),
  ],
});

/** Balises géographiques locales pour une ville. */
export const geoMeta = ({
  city,
  postalCode,
  department,
}: {
  city: string;
  postalCode: string;
  department: string;
}) => [
  {
    name: "geo.region",
    content: postalCode.startsWith("75") ? "FR-75" : postalCode ? "FR-93" : "FR-IDF",
  },
  { name: "geo.placename", content: city },
  ...(postalCode ? [{ name: "geo.postal-code", content: postalCode }] : []),
  { name: "coverage", content: `${city}${postalCode ? ` ${postalCode}` : ""} — ${department}` },
];

export const breadcrumbJsonLd = (items: { name: string; item: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.item,
  })),
});

export const faqJsonLd = (faq: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

/** Construit les balises meta d'une page (title, description, og, twitter). */
export const pageMeta = ({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
}) => [
  { title },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:type", content: type },
  { property: "og:url", content: path },
  { property: "og:site_name", content: business.name },
  { property: "og:locale", content: "fr_FR" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
];
