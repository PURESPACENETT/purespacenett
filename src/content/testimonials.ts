export type Testimonial = {
  /** Nom affiché tel que publié par le client. */
  author: string;
  /** Ville, type de client ou source de l'avis. */
  context: string;
  /** Note sur 5 telle que laissée sur Google. */
  rating: number;
  /** Texte de l'avis, repris mot pour mot (absent si l'avis est une note seule). */
  text?: string;
  /** Date de publication au format AAAA-MM (optionnel). */
  date?: string;
};

/**
 * Avis réels de clients PURE SPACE NETT.
 * N'ajouter ici que des avis authentiquement reçus (Google, e-mail, SMS),
 * recopiés sans modification. Aucun avis inventé.
 */
export const testimonials: Testimonial[] = [
  {
    author: "Boualem Ait Chait",
    context: "Avis Google · Nettoyage fin de chantier",
    rating: 5,
    text: "Service impeccable, franchement après avoir été déçu par 3 autres entreprises, PURE SPACE NETT sont intervenus avec full équipements et ont fait mon nettoyage de fin de chantier avec minutie. Je recommande vivement. Encore merci 🙏🙏",
  },
  {
    author: "Karim Zitti",
    context: "Avis Google · il y a 2 mois",
    rating: 5,
  },
];
