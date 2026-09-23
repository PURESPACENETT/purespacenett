export const business = {
  name: "PURE SPACE NETT",
  legalName: "BENSEGHIR AMAZIGH",
  tagline: "Entreprise de nettoyage professionnel en Île-de-France",
  phone: "07 59 48 30 21",
  phoneHref: "tel:+33759483021",
  email: "contact@purespacenett.com",
  emailHref: "mailto:contact@purespacenett.com",
  whatsapp: "+33 7 59 48 30 21",
  whatsappNumber: "33759483021",
  googleBusinessUrl: "https://share.google/2u1kIaVRrVNB4drT0",
  googleReviewUrl: "https://share.google/2u1kIaVRrVNB4drT0",
  linkedinUrl: "https://www.linkedin.com/in/amazigh-benseghir-449828420",
  facebookUrl: "https://www.facebook.com/share/1BuEaVDznf/",
  instagramUrl: "https://www.instagram.com/purespacenett",
  address: "2 rue Chevreul, BP 67",
  city: "Le Pré-Saint-Gervais",
  postalCode: "93310",
  region: "Île-de-France",
  country: "FR",
  siren: "885 370 767",
  siret: "885 370 767 00034",
  vatNumber: "FR16 885370767",
  apeCode: "81.21Z",
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

export const whatsappHref = (subject: string) =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    `Bonjour ${business.name}, je souhaite un devis pour : ${subject}.`,
  )}`;

export const quoteMailto = (subject: string) =>
  `mailto:${business.email}?subject=${encodeURIComponent(`Demande de devis — ${subject}`)}`;
