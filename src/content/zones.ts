export type Zone = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  context: string;
  neighbours: string[];
  serviceSlugs: string[];
};

const allServices = [
  "nettoyage-bureaux",
  "nettoyage-copropriete",
  "entretien-locaux-commerciaux",
  "nettoyage-vitres",
  "nettoyage-fin-de-chantier",
  "remise-en-etat",
  "menage-etat-des-lieux",
  "nettoyage-canapes-tapis",
  "nettoyage-interieur-vehicule",
];

export const zones: Zone[] = [
  {
    slug: "le-pre-saint-gervais",
    name: "Le Pré-Saint-Gervais",
    title: "Entreprise de nettoyage au Pré-Saint-Gervais | PURE SPACE NETT",
    description:
      "PURE SPACE NETT, entreprise de nettoyage basée au Pré-Saint-Gervais (93310) : bureaux, copropriétés, fin de chantier, vitres. Devis gratuit sous 24 h.",
    intro:
      "Nous sommes installés au Pré-Saint-Gervais : c'est notre ville, nous y intervenons en quelques minutes.",
    context:
      "Commerces de la rue André Joineau, petits immeubles de copropriété, bureaux et ateliers reconvertis : nous connaissons le tissu local et pouvons passer à l'improviste en cas d'urgence.",
    neighbours: ["Pantin", "Les Lilas", "Paris 19e"],
    serviceSlugs: allServices,
  },
  {
    slug: "pantin",
    name: "Pantin",
    title: "Entreprise de nettoyage à Pantin (93500) | PURE SPACE NETT",
    description:
      "Nettoyage de bureaux, copropriétés, commerces et fin de chantier à Pantin. Entreprise voisine, intervention rapide. Devis gratuit sous 24 h.",
    intro:
      "Pantin est notre commune voisine : bureaux du secteur des Grands Moulins, copropriétés du centre, commerces de la mairie.",
    context:
      "Le quartier d'affaires en pleine croissance génère beaucoup de besoins en entretien de bureaux et en nettoyage de livraison après travaux. Nous y intervenons plusieurs fois par semaine.",
    neighbours: ["Le Pré-Saint-Gervais", "Les Lilas", "Aubervilliers"],
    serviceSlugs: allServices,
  },
  {
    slug: "les-lilas",
    name: "Les Lilas",
    title: "Entreprise de nettoyage aux Lilas (93260) | PURE SPACE NETT",
    description:
      "Nettoyage de parties communes, bureaux, vitres et ménage état des lieux aux Lilas. Entreprise locale du Pré-Saint-Gervais. Devis gratuit.",
    intro:
      "Aux Lilas, nous entretenons surtout des parties communes de copropriétés et des commerces de proximité.",
    context:
      "Immeubles anciens avec escaliers en bois, halls carrelés, locaux poubelles exigus : nous adaptons produits et matériel pour ne pas abîmer les surfaces d'origine.",
    neighbours: ["Le Pré-Saint-Gervais", "Bagnolet", "Paris 20e"],
    serviceSlugs: allServices,
  },
  {
    slug: "aubervilliers",
    name: "Aubervilliers",
    title: "Entreprise de nettoyage à Aubervilliers | PURE SPACE NETT",
    description:
      "Nettoyage de locaux, entrepôts, bureaux et fin de chantier à Aubervilliers (93300). Interventions ponctuelles ou contrats réguliers.",
    intro:
      "À Aubervilliers, nous travaillons pour des locaux d'activité, des showrooms et des chantiers de rénovation.",
    context:
      "Les grandes surfaces d'entrepôts et de showrooms demandent du matériel adapté : autolaveuse, nettoyage haute pression, interventions hors horaires d'exploitation.",
    neighbours: ["Pantin", "Saint-Denis", "Paris 19e"],
    serviceSlugs: allServices,
  },
  {
    slug: "montreuil",
    name: "Montreuil",
    title: "Entreprise de nettoyage à Montreuil (93100) | PURE SPACE NETT",
    description:
      "Nettoyage de bureaux, copropriétés, canapés et remise en état à Montreuil. Entreprise de nettoyage de l'est parisien. Devis gratuit sous 24 h.",
    intro:
      "Montreuil mélange ateliers d'artistes, bureaux et copropriétés : nos prestations y sont très variées.",
    context:
      "Beaucoup de demandes de remise en état et de nettoyage de textiles chez les particuliers, ainsi que d'entretien de locaux associatifs et de coworkings.",
    neighbours: ["Bagnolet", "Les Lilas", "Paris 20e"],
    serviceSlugs: allServices,
  },
  {
    slug: "bagnolet",
    name: "Bagnolet",
    title: "Entreprise de nettoyage à Bagnolet (93170) | PURE SPACE NETT",
    description:
      "Nettoyage de parties communes, bureaux, vitrines et état des lieux à Bagnolet. Entreprise locale, intervention rapide, devis gratuit.",
    intro:
      "À Bagnolet, nous entretenons des résidences, des bureaux du secteur Gallieni et des commerces.",
    context:
      "Proximité immédiate du périphérique : nous sommes sur place en moins de quinze minutes depuis notre base, y compris pour une urgence de dégât ou de dépôt sauvage.",
    neighbours: ["Les Lilas", "Montreuil", "Paris 20e"],
    serviceSlugs: allServices,
  },
  {
    slug: "saint-denis",
    name: "Saint-Denis",
    title: "Entreprise de nettoyage à Saint-Denis (93200) | PURE SPACE NETT",
    description:
      "Nettoyage de bureaux, copropriétés, fin de chantier et remise en état à Saint-Denis. Contrats réguliers ou interventions ponctuelles.",
    intro:
      "À Saint-Denis, nous accompagnons syndics, bailleurs et entreprises sur des surfaces importantes.",
    context:
      "Résidences de grande taille et immeubles de bureaux : nous mettons en place des plannings affichés, des contrôles qualité et un référent joignable directement.",
    neighbours: ["Aubervilliers", "Pantin", "Paris 18e"],
    serviceSlugs: allServices,
  },
  {
    slug: "paris",
    name: "Paris",
    title: "Entreprise de nettoyage à Paris est | PURE SPACE NETT",
    description:
      "Entreprise de nettoyage à Paris, en particulier 10e, 11e, 18e, 19e et 20e : bureaux, commerces, vitres, fin de chantier, état des lieux.",
    intro:
      "Nous intervenons dans tout Paris, avec une présence renforcée sur les arrondissements de l'est : 10e, 11e, 18e, 19e et 20e.",
    context:
      "Contraintes parisiennes bien connues : stationnement, accès par cour, horaires de livraison, voisinage. Nous organisons nos passages pour ne gêner ni les riverains ni votre activité.",
    neighbours: ["Le Pré-Saint-Gervais", "Pantin", "Bagnolet"],
    serviceSlugs: allServices,
  },
  {
    slug: "ile-de-france",
    name: "Île-de-France",
    title: "Entreprise de nettoyage en Île-de-France | PURE SPACE NETT",
    description:
      "PURE SPACE NETT intervient dans toute l'Île-de-France : nettoyage de bureaux, copropriétés, fin de chantier, vitres, remise en état. Devis gratuit sous 24 h.",
    intro:
      "Notre base est en Seine-Saint-Denis, mais nous nous déplaçons dans toute l'Île-de-France pour les chantiers et les contrats réguliers.",
    context:
      "Hauts-de-Seine, Val-de-Marne, Val-d'Oise, Seine-et-Marne, Yvelines, Essonne : pour les interventions ponctuelles éloignées, nous regroupons les déplacements afin de garder un tarif juste.",
    neighbours: ["Paris", "Seine-Saint-Denis", "Val-de-Marne"],
    serviceSlugs: allServices,
  },
];

export const getZone = (slug: string) => zones.find((z) => z.slug === slug);
