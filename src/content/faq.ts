import { business } from "./business";

export type FaqItem = { q: string; a: string };

export type FaqGroup = { id: string; title: string; items: FaqItem[] };

/** FAQ locale : horaires, devis, tarifs, prestations, zones couvertes. */
export const faqGroups: FaqGroup[] = [
  {
    id: "horaires",
    title: "Horaires et disponibilité",
    items: [
      {
        q: "Quels sont vos horaires d'intervention ?",
        a: `${business.hours}. Nous adaptons nos passages aux contraintes des locaux : tôt le matin avant l'ouverture, en fin de journée après le départ des équipes, ou le samedi pour les commerces.`,
      },
      {
        q: "Intervenez-vous le dimanche ou les jours fériés ?",
        a: "Oui, sur demande et selon nos disponibilités, pour les remises en état urgentes, les fins de chantier et les commerces ouverts le week-end. Prévenez-nous si possible 48 h à l'avance.",
      },
      {
        q: "Pouvez-vous intervenir en urgence au Pré-Saint-Gervais ou à Pantin ?",
        a: `Nous sommes basés au ${business.city} (${business.postalCode}) : sur Le Pré-Saint-Gervais, Pantin, Les Lilas et le nord-est de Paris, nous pouvons souvent passer dans la journée. Appelez le ${business.phone} pour connaître le prochain créneau libre.`,
      },
    ],
  },
  {
    id: "devis",
    title: "Devis et prise de contact",
    items: [
      {
        q: "Le devis est-il gratuit ?",
        a: "Oui, le devis est gratuit et sans engagement. Remplissez le formulaire de demande de devis, écrivez-nous sur WhatsApp ou appelez-nous : vous recevez une réponse chiffrée sous 24 heures ouvrées.",
      },
      {
        q: "Comment se passe la visite avant le devis ?",
        a: "Pour les surfaces supérieures à 100 m² ou les prestations récurrentes, nous nous déplaçons gratuitement afin de mesurer les surfaces, repérer les accès et définir la fréquence utile. Pour une intervention ponctuelle, quelques photos suffisent souvent.",
      },
      {
        q: "Quelles informations faut-il nous transmettre ?",
        a: "Le type de local (bureaux, copropriété, commerce, logement), la surface approximative, la prestation souhaitée, la fréquence et vos contraintes d'horaires. Vous pouvez joindre des photos à votre demande de devis.",
      },
    ],
  },
  {
    id: "tarifs",
    title: "Tarifs et facturation",
    items: [
      {
        q: "Comment sont calculés vos tarifs de nettoyage ?",
        a: "Le prix dépend de la surface, de l'état des lieux, de la fréquence et du matériel nécessaire. Un entretien régulier revient moins cher au passage qu'une intervention unique. Tout est détaillé ligne par ligne dans le devis, sans frais cachés.",
      },
      {
        q: "Y a-t-il un montant minimum d'intervention ?",
        a: "Oui, nous appliquons un minimum correspondant à environ deux heures de présence sur place, déplacement et produits inclus. Les détails figurent sur notre page tarifs.",
      },
      {
        q: "Quels sont les moyens de paiement acceptés ?",
        a: "Virement bancaire et chèque, à réception de facture pour les entreprises et les syndics. Les prestations ponctuelles chez les particuliers sont réglées après l'intervention.",
      },
    ],
  },
  {
    id: "prestations",
    title: "Prestations et matériel",
    items: [
      {
        q: "Quelles prestations de nettoyage proposez-vous ?",
        a: "Nettoyage de bureaux, entretien de copropriétés et parties communes, locaux commerciaux, vitrerie, nettoyage de fin de chantier, remise en état, ménage d'état des lieux, nettoyage de canapés et tapis, et nettoyage intérieur de véhicules.",
      },
      {
        q: "Fournissez-vous les produits et le matériel ?",
        a: "Oui, nos équipes arrivent avec l'ensemble du matériel professionnel et des produits, dont des références éco-responsables. Vous n'avez rien à prévoir sur place.",
      },
      {
        q: "Vos équipes sont-elles assurées ?",
        a: "Oui. Nos intervenants sont formés à nos protocoles et l'entreprise est couverte par une responsabilité civile professionnelle. Le résultat est contrôlé après chaque passage.",
      },
      {
        q: "Peut-on souscrire un contrat régulier ?",
        a: "Oui : passage quotidien, plusieurs fois par semaine, hebdomadaire ou mensuel, avec un référent unique et un cahier de suivi. Le contrat reste résiliable selon les conditions indiquées sur le devis.",
      },
    ],
  },
  {
    id: "zones",
    title: "Zones couvertes",
    items: [
      {
        q: "Quelles villes couvrez-vous ?",
        a: "Le Pré-Saint-Gervais, Pantin, Les Lilas, Aubervilliers, Montreuil, Bagnolet, Saint-Denis, l'est de Paris (10e, 11e, 18e, 19e, 20e) et, sur devis, l'ensemble de l'Île-de-France.",
      },
      {
        q: "Facturez-vous des frais de déplacement ?",
        a: "Aucun frais de déplacement en Seine-Saint-Denis ni dans l'est parisien. Au-delà, un forfait déplacement peut s'appliquer ; il est toujours indiqué à l'avance dans le devis.",
      },
      {
        q: "Intervenez-vous ailleurs en Île-de-France ?",
        a: "Oui, pour les fins de chantier, les remises en état et les contrats multi-sites, nous nous déplaçons dans les Hauts-de-Seine, le Val-de-Marne et le Val-d'Oise. Contactez-nous pour vérifier nos disponibilités sur votre commune.",
      },
    ],
  },
];

export const faqFlat: FaqItem[] = faqGroups.flatMap((g) => g.items);
