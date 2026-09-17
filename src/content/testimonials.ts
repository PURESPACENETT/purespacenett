export type Testimonial = {
  /** Nom affiché tel que publié par le client (prénom + initiale suffit). */
  author: string;
  /** Ville ou type de client, ex. « Syndic, Pantin ». */
  context: string;
  /** Note sur 5 telle que laissée sur Google. */
  rating: number;
  /** Texte de l'avis, repris mot pour mot. */
  text: string;
  /** Date de publication au format AAAA-MM (optionnel). */
  date?: string;
  /** Prestation concernée, pour le maillage interne (slug de service). */
  serviceSlug?: string;
};

/**
 * Avis réels de clients PURE SPACE NETT.
 * N'ajouter ici que des avis authentiquement reçus (Google, e-mail, SMS),
 * recopiés sans modification. Aucun avis inventé.
 */
export const testimonials: Testimonial[] = [];
