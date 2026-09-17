export type Service = {
  slug: string;
  name: string;
  navName: string;
  title: string;
  description: string;
  intro: string;
  h1: string;
  audience: string;
  bullets: string[];
  details: string[];
  faq: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "nettoyage-bureaux",
    name: "Nettoyage de bureaux et locaux professionnels",
    navName: "Bureaux & locaux pro",
    h1: "Nettoyage de bureaux en Île-de-France",
    title: "Nettoyage de bureaux Île-de-France | PURE SPACE NETT",
    description:
      "Entreprise de nettoyage de bureaux au Pré-Saint-Gervais : entretien quotidien ou hebdomadaire de vos locaux dans le 93 et l'est parisien. Devis gratuit sous 24 h.",
    intro:
      "Des bureaux impeccables chaque matin, sans que vous ayez à y penser. Nous intervenons avant l'ouverture, pendant la journée ou en soirée, selon votre activité.",
    audience: "TPE, PME, cabinets, coworkings, agences",
    bullets: [
      "Entretien des postes de travail, salles de réunion et sanitaires",
      "Aspiration et lavage des sols, vitrerie intérieure",
      "Gestion des déchets et réapprovisionnement des consommables",
      "Prestation cadrée par un cahier des charges et un référent unique",
    ],
    details: [
      "Nous établissons avec vous un plan de nettoyage précis : fréquence, horaires, zones prioritaires, points de contrôle. Vous gardez le même agent d'un mois sur l'autre, ce qui change tout sur la qualité.",
      "Nos équipes utilisent des produits professionnels et des microfibres codées par couleur pour éviter toute contamination croisée entre sanitaires, cuisine et espaces de travail.",
    ],
    faq: [
      {
        q: "Pouvez-vous intervenir en dehors des heures de bureau ?",
        a: "Oui, tôt le matin, en soirée ou le week-end selon vos contraintes d'exploitation.",
      },
      {
        q: "Faut-il un engagement de longue durée ?",
        a: "Non. Nous proposons des contrats mensuels sans engagement long, ainsi que des interventions ponctuelles.",
      },
    ],
  },
  {
    slug: "nettoyage-copropriete",
    name: "Nettoyage de copropriétés et résidences",
    navName: "Copropriétés & résidences",
    h1: "Nettoyage de copropriétés et résidences",
    title: "Nettoyage de copropriété 93 et Paris Est | PURE SPACE NETT",
    description:
      "Entretien des parties communes pour syndics et bailleurs : halls, escaliers, locaux poubelles, sorties de containers. Seine-Saint-Denis et est parisien.",
    intro:
      "Halls, cages d'escalier, ascenseurs, locaux vélos et poubelles : nous prenons en charge l'entretien complet de vos parties communes, avec un passage régulier et traçable.",
    audience: "Syndics, bailleurs sociaux, conseils syndicaux",
    bullets: [
      "Balayage, lavage des halls, escaliers et paliers",
      "Entretien des locaux poubelles et lavage des containers",
      "Sortie et rentrée des bacs aux jours de collecte",
      "Feuille de présence et compte rendu pour le syndic",
    ],
    details: [
      "Chaque immeuble reçoit un planning affiché en hall : les résidents savent quand nous passons, le conseil syndical peut contrôler. C'est le meilleur moyen de faire baisser les réclamations.",
      "Nous gérons aussi les prestations saisonnières : nettoyage haute pression des sous-sols, désinsectisation ponctuelle en partenariat, remise en état après travaux.",
    ],
    faq: [
      {
        q: "Gérez-vous la sortie des containers ?",
        a: "Oui, sortie et rentrée des bacs aux jours de collecte, avec lavage périodique du local.",
      },
      {
        q: "Intervenez-vous sur plusieurs immeubles d'un même portefeuille ?",
        a: "Oui, nous travaillons avec des syndics sur des lots de plusieurs adresses en Seine-Saint-Denis et à Paris.",
      },
    ],
  },
  {
    slug: "entretien-locaux-commerciaux",
    name: "Entretien régulier de locaux commerciaux",
    navName: "Locaux commerciaux",
    h1: "Entretien régulier de locaux commerciaux",
    title: "Nettoyage de locaux commerciaux Paris Est | PURE SPACE NETT",
    description:
      "Nettoyage régulier de commerces, restaurants, salons et cabinets en Île-de-France. Passages quotidiens ou hebdomadaires, avant ou après ouverture.",
    intro:
      "Un commerce propre rassure vos clients dès la porte d'entrée. Nous intervenons avant l'ouverture ou après la fermeture, à la fréquence qui correspond à votre flux.",
    audience: "Commerces, restaurants, salons, cabinets médicaux",
    bullets: [
      "Sols, vitrines, sanitaires et espaces d'accueil",
      "Protocoles renforcés pour les zones alimentaires et médicales",
      "Passages quotidiens, hebdomadaires ou à la demande",
      "Interventions avant ouverture ou après fermeture",
    ],
    details: [
      "Pour la restauration, nous appliquons des protocoles compatibles avec vos obligations d'hygiène : dégraissage des surfaces, plinthes, siphons, sols antidérapants.",
      "Pour les cabinets et espaces recevant du public, nous renforçons la désinfection des points de contact : poignées, comptoirs, interrupteurs, terminaux de paiement.",
    ],
    faq: [
      {
        q: "Pouvez-vous passer tous les jours ?",
        a: "Oui, y compris six jours sur sept selon vos horaires d'ouverture.",
      },
      {
        q: "Fournissez-vous les consommables ?",
        a: "Oui, papier, savon et sacs peuvent être inclus dans le contrat.",
      },
    ],
  },
  {
    slug: "nettoyage-vitres",
    name: "Nettoyage de vitres",
    navName: "Vitres",
    h1: "Nettoyage de vitres et vitrines",
    title: "Nettoyage de vitres Paris et 93 | PURE SPACE NETT",
    description:
      "Laveur de vitres professionnel pour vitrines, bureaux, immeubles et particuliers en Île-de-France. Résultat sans traces, matériel à eau pure.",
    intro:
      "Vitrines de commerce, baies vitrées de bureaux, verrières, fenêtres de particuliers : nous obtenons un rendu sans trace, y compris sur les surfaces difficiles d'accès.",
    audience: "Commerces, bureaux, copropriétés, particuliers",
    bullets: [
      "Vitrines et devantures de commerce",
      "Baies vitrées, verrières et cloisons intérieures",
      "Encadrements, rails et appuis de fenêtre",
      "Matériel à eau pure et perches télescopiques",
    ],
    details: [
      "Pour les vitrines de commerce, un passage hebdomadaire ou bimensuel suffit généralement à garder une devanture nette malgré la pollution urbaine.",
      "Nous travaillons en hauteur accessible depuis le sol grâce aux perches à eau pure, sans installation lourde ni nacelle dans la majorité des cas.",
    ],
    faq: [
      {
        q: "À quelle fréquence faire laver une vitrine ?",
        a: "Une fois par semaine en rue passante, une à deux fois par mois pour une rue calme.",
      },
      {
        q: "Travaillez-vous en hauteur ?",
        a: "Oui jusqu'aux étages accessibles à la perche ; au-delà, nous étudions la solution avec vous.",
      },
    ],
  },
  {
    slug: "nettoyage-fin-de-chantier",
    name: "Nettoyage fin de chantier",
    navName: "Fin de chantier",
    h1: "Nettoyage fin de chantier en Île-de-France",
    title: "Nettoyage fin de chantier Paris et 93 | PURE SPACE NETT",
    description:
      "Entreprise de nettoyage fin de chantier en Île-de-France : dépoussiérage complet, retrait des traces de peinture et d'enduit, livraison prête à recevoir.",
    intro:
      "Après les travaux, la poussière est partout : plafonds, rails, radiateurs, menuiseries. Nous livrons un chantier prêt à être remis au client ou à l'occupant.",
    audience: "Artisans, entreprises générales, architectes, promoteurs, particuliers",
    bullets: [
      "Dépoussiérage complet du haut vers le bas",
      "Retrait des traces de peinture, colle, enduit et silicone",
      "Nettoyage des vitrages, menuiseries et sanitaires neufs",
      "Évacuation des petits déchets et gravats résiduels",
    ],
    details: [
      "Nous distinguons le nettoyage grossier, réalisé pendant le chantier pour permettre l'avancée des corps d'état, et le nettoyage de livraison, effectué juste avant la réception.",
      "Le devis est établi au m² après visite ou sur plans, avec une date de livraison ferme : nos équipes s'adaptent aux dernières 48 heures avant réception, y compris le week-end.",
    ],
    faq: [
      {
        q: "Combien de temps avant la réception faut-il vous prévoir ?",
        a: "Idéalement 24 à 72 heures avant la visite de réception, une fois les corps d'état sortis.",
      },
      {
        q: "Le prix est-il au m² ?",
        a: "Oui, sur la base d'une visite ou des plans, en tenant compte du niveau d'encrassement.",
      },
    ],
  },
  {
    slug: "remise-en-etat",
    name: "Remise en état",
    navName: "Remise en état",
    h1: "Remise en état de locaux et logements",
    title: "Remise en état de locaux Île-de-France | PURE SPACE NETT",
    description:
      "Remise en état de logements et locaux très encrassés en Île-de-France : décapage des sols, dégraissage, désodorisation, remise à niveau complète.",
    intro:
      "Local resté vide, logement très encrassé, sol qui a perdu son aspect d'origine : la remise en état est une intervention lourde qui redonne un point de départ propre.",
    audience: "Propriétaires, agences, entreprises, syndics",
    bullets: [
      "Décapage et protection des sols durs",
      "Dégraissage des cuisines et sanitaires",
      "Traitement des odeurs et désinfection",
      "Débarras léger et évacuation des encombrants",
    ],
    details: [
      "Nous commençons par un diagnostic sur place : nature des revêtements, niveau d'encrassement, présence de moisissures. Le devis détaille chaque poste, sans surprise.",
      "Selon les surfaces, nous utilisons monobrosse, injection-extraction, vapeur ou nettoyage haute pression, avec les protections adaptées aux matériaux.",
    ],
    faq: [
      {
        q: "Une remise en état sauve-t-elle un vieux sol ?",
        a: "Souvent oui. Un décapage suivi d'une émulsion protectrice change radicalement l'aspect d'un sol plastique ou carrelé.",
      },
      {
        q: "Intervenez-vous en urgence ?",
        a: "Nous nous efforçons de proposer une intervention dans les 48 à 72 heures selon la charge.",
      },
    ],
  },
  {
    slug: "menage-etat-des-lieux",
    name: "Ménage état des lieux",
    navName: "État des lieux",
    h1: "Ménage pour état des lieux de sortie",
    title: "Ménage état des lieux 93 et Paris | PURE SPACE NETT",
    description:
      "Ménage complet avant état des lieux de sortie ou d'entrée en Île-de-France : cuisine, sanitaires, vitres, placards. Restitution sans retenue sur le dépôt.",
    intro:
      "Un état des lieux se joue sur les détails : joints, four, hotte, placards, vitres. Nous reprenons chaque point regardé par l'agent ou le propriétaire.",
    audience: "Locataires, propriétaires, agences immobilières, locations courte durée",
    bullets: [
      "Cuisine dégraissée, four et hotte compris",
      "Salle de bain détartrée, joints repris",
      "Vitres, volets, placards et plinthes",
      "Intervention rapide, souvent en une journée",
    ],
    details: [
      "Nous intervenons logement vide de préférence, juste avant la visite, pour éviter toute nouvelle salissure entre notre passage et l'état des lieux.",
      "Nous travaillons aussi pour les locations de courte durée avec des rotations rapides entre deux séjours.",
    ],
    faq: [
      {
        q: "Combien de temps pour un T2 ?",
        a: "En général une demi-journée à une journée selon l'état et la présence de meubles.",
      },
      {
        q: "Fournissez-vous les produits ?",
        a: "Oui, matériel et produits professionnels inclus.",
      },
    ],
  },
  {
    slug: "nettoyage-canapes-tapis",
    name: "Nettoyage de canapés, tapis et moquettes",
    navName: "Canapés & tapis",
    h1: "Nettoyage de canapés, tapis et moquettes",
    title: "Nettoyage canapé et tapis Paris Est | PURE SPACE NETT",
    description:
      "Nettoyage en profondeur de canapés, fauteuils, tapis et moquettes par injection-extraction, à domicile ou en entreprise en Île-de-France.",
    intro:
      "Le textile garde les taches, les odeurs et les acariens. L'injection-extraction décolle la saleté en profondeur et l'aspire, sans détremper le tissu.",
    audience: "Particuliers, bureaux, hôtels, salles d'attente",
    bullets: [
      "Canapés, fauteuils, chaises et têtes de lit",
      "Tapis, moquettes et sols textiles de bureaux",
      "Traitement des taches et des odeurs",
      "Séchage rapide, remise en service dans la journée",
    ],
    details: [
      "Nous testons d'abord le tissu sur une zone discrète, puis appliquons un détachant adapté avant l'extraction. Les tissus fragiles sont traités en méthode à faible humidité.",
      "En entreprise, nous intervenons volontiers en fin de journée pour que les espaces soient utilisables le lendemain matin.",
    ],
    faq: [
      {
        q: "Combien de temps de séchage ?",
        a: "Comptez 3 à 6 heures selon l'épaisseur du textile et l'aération de la pièce.",
      },
      {
        q: "Les taches anciennes partent-elles ?",
        a: "Souvent fortement atténuées ; nous vous disons honnêtement ce qui est atteignable avant d'intervenir.",
      },
    ],
  },
  {
    slug: "nettoyage-interieur-vehicule",
    name: "Nettoyage intérieur de véhicules",
    navName: "Intérieur véhicule",
    h1: "Nettoyage intérieur de véhicules",
    title: "Nettoyage intérieur voiture 93 | PURE SPACE NETT",
    description:
      "Nettoyage intérieur de voitures, utilitaires et flottes en Île-de-France : sièges, moquettes, plastiques, désodorisation. Sur place, sans déplacement pour vous.",
    intro:
      "Nous nettoyons l'intérieur de votre véhicule là où il est garé : sièges shampouinés, plastiques traités, habitacle désodorisé.",
    audience: "Particuliers, VTC, artisans, flottes d'entreprise",
    bullets: [
      "Aspiration complète, coffre et sous-sièges",
      "Shampouinage des sièges et moquettes",
      "Nettoyage des plastiques, vitres et seuils",
      "Traitement des odeurs de tabac et d'animaux",
    ],
    details: [
      "Pour les chauffeurs VTC, un passage régulier maintient une note d'habitacle élevée sans immobiliser le véhicule une demi-journée en centre de lavage.",
      "Pour les utilitaires d'artisans, nous traitons la poussière de chantier, les traces de plâtre et de peinture dans la cabine.",
    ],
    faq: [
      {
        q: "Faut-il un point d'eau ?",
        a: "Non pour l'intérieur : nous travaillons en méthode à faible humidité avec notre propre matériel.",
      },
      {
        q: "Proposez-vous des forfaits flotte ?",
        a: "Oui, tarif dégressif à partir de plusieurs véhicules sur un même site.",
      },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
