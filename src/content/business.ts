export const business = {
  name: "PURE SPACE NETT",
  legalName: "PURE SPACE NETT",
  tagline: "Entreprise de nettoyage professionnel en Île-de-France",
  phone: "07 59 48 30 21",
  phoneHref: "tel:+33759483021",
  email: "contact@purespacenett.com",
  emailHref: "mailto:contact@purespacenett.com",
  /** WhatsApp Business (même numéro que la ligne téléphonique). */
  whatsapp: "+33 7 59 48 30 21",
  whatsappNumber: "33759483021",
  /** Fiche Google officielle (lien de partage fourni par le client). */
  googleBusinessUrl: "https://share.google/2u1kIaVRrVNB4drT0",
  googleReviewUrl: "https://share.google/2u1kIaVRrVNB4drT0",
  /** Profil LinkedIn du dirigeant (lien nettoyé, sans paramètres de partage). */
  linkedinUrl: "https://www.linkedin.com/in/amazigh-benseghir-449828420",
  /** Page Facebook officielle (lien de partage fourni par le client). */
  facebookUrl: "https://www.facebook.com/share/1BuEaVDznf/",
  /** Compte Instagram officiel (lien nettoyé, sans paramètres de suivi). */
  instagramUrl: "https://www.instagram.com/purespacenett",
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

/** Lien WhatsApp Business pré-rempli. */
export const whatsappHref = (subject: string) =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    `Bonjour ${business.name}, je souhaite un devis pour : ${subject}.`,
  )}`;

export const quoteMailto = (subject: string) =>
  `mailto:${business.email}?subject=${encodeURIComponent(`Demande de devis — ${subject}`)}`;
