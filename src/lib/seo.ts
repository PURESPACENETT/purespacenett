import { business } from "@/content/business";
import logoAsset from "@/assets/pure-space-nett-logo.jpg.asset.json";

/** Origine publique du site : les URL canoniques doivent être absolues pour Google. */
export const SITE_URL = "https://purespacenett.com";

/** Transforme un chemin interne en URL absolue auto-référencée. */
export const canonicalUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`;

/** Image Open Graph absolue, utilisée par les aperçus sociaux. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}${logoAsset.url}`;


/** JSON-LD de l'entreprise, réutilisé sur les pages principales. */
export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  name: business.name,
  description: business.tagline,
  telephone: "+33759483021",
  email: business.email,
  url: SITE_URL,
  hasMap: business.googleBusinessUrl,
  sameAs: [
    business.googleBusinessUrl,
    business.linkedinUrl,
    business.facebookUrl,
    business.instagramUrl,
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address,
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
  url: canonicalUrl(path),
  provider: {
    "@type": "CleaningService",
    name: business.name,
    telephone: "+33759483021",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
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
  services = [],
}: {
  city: string;
  postalCode: string;
  department: string;
  sectors: string[];
  neighbours: string[];
  path: string;
  description: string;
  services?: { name: string; path: string }[];
}) => ({
  ...localBusinessJsonLd,
  "@id": canonicalUrl(path),
  name: `${business.name} — Nettoyage à ${city}`,
  description,
  url: canonicalUrl(path),
  slogan: `Nettoyage ${city}${postalCode ? ` ${postalCode}` : ""} — devis gratuit sous 24 h`,
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
  serviceArea: {
    "@type": "City",
    name: city,
    ...(postalCode ? { postalCode } : {}),
  },
  ...(services.length
    ? {
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `Prestations de nettoyage à ${city}`,
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: `${s.name} à ${city}`,
              serviceType: s.name,
              url: canonicalUrl(s.path),
              areaServed: {
                "@type": "City",
                name: city,
                ...(postalCode ? { postalCode } : {}),
              },
            },
          })),
        },
      }
    : {}),
});

/** Balises Open Graph orientées établissement local (résultats locaux Google & partages). */
export const localOgMeta = ({
  city,
  postalCode,
  department,
}: {
  city: string;
  postalCode: string;
  department: string;
}) => [
  { property: "business:contact_data:locality", content: city },
  ...(postalCode ? [{ property: "business:contact_data:postal_code", content: postalCode }] : []),
  { property: "business:contact_data:region", content: department },
  { property: "business:contact_data:country_name", content: "France" },
  { property: "business:contact_data:phone_number", content: "+33759483021" },
  { property: "business:contact_data:email", content: business.email },
  { property: "business:contact_data:website", content: "https://purespacenett.com" },
  { property: "place:location:region", content: business.region },
];

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
    item: canonicalUrl(it.item),
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
  { property: "og:url", content: canonicalUrl(path) },
  { property: "og:site_name", content: business.name },
  { property: "og:image", content: DEFAULT_OG_IMAGE },
  { property: "og:image:alt", content: `${business.name} — entreprise de nettoyage professionnel` },
  { property: "og:locale", content: "fr_FR" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:image", content: DEFAULT_OG_IMAGE },
  { name: "twitter:image:alt", content: `${business.name} — entreprise de nettoyage professionnel` },
];
