export const business = {
  name: "PURE SPACE NETT",
  legalName: "PURE SPACE NETT",
  tagline: "Entreprise de nettoyage professionnel en Île-de-France",
  phone: "07 59 48 30 21",
  phoneHref: "tel:+33759483021",
  email: "contact@purespacenett.com",
  emailHref: "mailto:contact@purespacenett.com",
  city: "Le Pré-Saint-Gervais",
  postalCode: "93310",
  region: "Île-de-France",
  country: "FR",
  areaServed: [
    "Le Pré-Saint-Gervais",
    "Pantin",
    "Les Lilas",
    "Aubervilliers",
    "Montreuil",
    "Bagnolet",
    "Saint-Denis",
    "Paris",
    "Île-de-France",
  ],
  hours: "Lundi au samedi, 7h – 20h — interventions en soirée et week-end sur demande",
  usp: [
    "Devis gratuit sous 24 h",
    "Équipes formées et assurées",
    "Produits professionnels et éco-responsables",
    "Interventions ponctuelles ou contrats réguliers",
  ],
} as const;

export const quoteMailto = (subject: string) =>
  `mailto:${business.email}?subject=${encodeURIComponent(`Demande de devis — ${subject}`)}`;
