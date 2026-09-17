export const business = {
  name: "PURE SPACE NETT",
  legalName: "PURE SPACE NETT",
  tagline: "Entreprise de nettoyage professionnel en Île-de-France",
  phone: "07 59 48 30 21",
  phoneHref: "tel:+33759483021",
  email: "contact@purespacenett.com",
  emailHref: "mailto:contact@purespacenett.com",
  /** Fiche Google (recherche Maps sur le nom + la ville, remplaçable par le lien court g.page). */
  googleBusinessUrl:
    "https://www.google.com/maps/search/?api=1&query=PURE+SPACE+NETT+Le+Pr%C3%A9-Saint-Gervais",
  googleReviewUrl:
    "https://www.google.com/maps/search/?api=1&query=PURE+SPACE+NETT+Le+Pr%C3%A9-Saint-Gervais",
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
  hours: "Du lundi au samedi, 7h – 22h — dimanche et jours fériés sur demande",
  openingHours: "Mo-Sa 07:00-22:00",
  usp: [
    "Devis gratuit sous 24 h",
    "Équipes formées et assurées",
    "Produits professionnels et éco-responsables",
    "Interventions ponctuelles ou contrats réguliers",
  ],
} as const;

export const quoteMailto = (subject: string) =>
  `mailto:${business.email}?subject=${encodeURIComponent(`Demande de devis — ${subject}`)}`;
