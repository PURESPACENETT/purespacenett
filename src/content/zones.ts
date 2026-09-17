export type Zone = {
  slug: string;
  name: string;
  /** Code postal principal (vide pour les zones larges comme l'Île-de-France). */
  postalCode: string;
  /** Département ou périmètre administratif, utilisé dans les balises locales. */
  department: string;
  title: string;
  description: string;
  intro: string;
  context: string;
  /** Quartiers et secteurs desservis, affichés et repris dans les données locales. */
  sectors: string[];
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
    postalCode: "93310",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Le Pré-Saint-Gervais (93310) — Bureaux & copropriétés",
    description:
      "Entreprise de nettoyage au Pré-Saint-Gervais 93310 : bureaux, copropriétés, vitres, fin de chantier. Intervention rapide sur toute la commune, devis gratuit sous 24 h.",
    intro:
      "Nous sommes installés au Pré-Saint-Gervais : c'est notre ville, nous y intervenons en quelques minutes.",
    context:
      "Commerces de la rue André Joineau, petits immeubles de copropriété, bureaux et ateliers reconvertis : nous connaissons le tissu local et pouvons passer à l'improviste en cas d'urgence.",
    sectors: [
      "Centre-ville / rue André Joineau",
      "Quartier des Sept-Arpents",
      "Quartier Danton",
      "Abords du parc départemental Hocquette",
      "Secteur Jean Jaurès",
    ],
    neighbours: ["Pantin", "Les Lilas", "Paris 19e"],
    serviceSlugs: allServices,
  },
  {
    slug: "pantin",
    name: "Pantin",
    postalCode: "93500",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Pantin (93500) — Bureaux, immeubles, commerces",
    description:
      "Société de nettoyage à Pantin 93500 : entretien de bureaux, parties communes, commerces et fin de chantier. Entreprise voisine, devis gratuit sous 24 h.",
    intro:
      "Pantin est notre commune voisine : bureaux du secteur des Grands Moulins, copropriétés du centre, commerces de la mairie.",
    context:
      "Le quartier d'affaires en pleine croissance génère beaucoup de besoins en entretien de bureaux et en nettoyage de livraison après travaux. Nous y intervenons plusieurs fois par semaine.",
    sectors: [
      "Grands Moulins / bords du canal de l'Ourcq",
      "Quatre-Chemins",
      "Église de Pantin",
      "Hoche / Mairie",
      "Les Courtillières",
    ],
    neighbours: ["Le Pré-Saint-Gervais", "Les Lilas", "Aubervilliers"],
    serviceSlugs: allServices,
  },
  {
    slug: "les-lilas",
    name: "Les Lilas",
    postalCode: "93260",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Les Lilas (93260) — Parties communes & bureaux",
    description:
      "Entreprise de nettoyage aux Lilas 93260 : parties communes, halls, bureaux, vitres et ménage d'état des lieux. Entreprise locale du 93, devis gratuit.",
    intro:
      "Aux Lilas, nous entretenons surtout des parties communes de copropriétés et des commerces de proximité.",
    context:
      "Immeubles anciens avec escaliers en bois, halls carrelés, locaux poubelles exigus : nous adaptons produits et matériel pour ne pas abîmer les surfaces d'origine.",
    sectors: [
      "Mairie des Lilas",
      "Secteur Métro Mairie des Lilas",
      "Quartier de l'Avenir",
      "Les Sentes",
      "Romainville / Bruyères",
    ],
    neighbours: ["Le Pré-Saint-Gervais", "Bagnolet", "Paris 20e"],
    serviceSlugs: allServices,
  },
  {
    slug: "aubervilliers",
    name: "Aubervilliers",
    postalCode: "93300",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Aubervilliers (93300) — Locaux, entrepôts, chantiers",
    description:
      "Société de nettoyage à Aubervilliers 93300 : locaux d'activité, entrepôts, showrooms, bureaux et fin de chantier. Contrats réguliers ou interventions ponctuelles.",
    intro:
      "À Aubervilliers, nous travaillons pour des locaux d'activité, des showrooms et des chantiers de rénovation.",
    context:
      "Les grandes surfaces d'entrepôts et de showrooms demandent du matériel adapté : autolaveuse, nettoyage haute pression, interventions hors horaires d'exploitation.",
    sectors: [
      "Quatre-Chemins",
      "Landy / Front populaire",
      "Villette / Quatre-Chemins",
      "Fort d'Aubervilliers",
      "Centre-ville / Mairie",
    ],
    neighbours: ["Pantin", "Saint-Denis", "Paris 19e"],
    serviceSlugs: allServices,
  },
  {
    slug: "montreuil",
    name: "Montreuil",
    postalCode: "93100",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Montreuil (93100) — Bureaux, immeubles, textiles",
    description:
      "Entreprise de nettoyage à Montreuil 93100 : bureaux, coworkings, copropriétés, canapés et remise en état. Entreprise de l'est parisien, devis gratuit sous 24 h.",
    intro:
      "Montreuil mélange ateliers d'artistes, bureaux et copropriétés : nos prestations y sont très variées.",
    context:
      "Beaucoup de demandes de remise en état et de nettoyage de textiles chez les particuliers, ainsi que d'entretien de locaux associatifs et de coworkings.",
    sectors: [
      "Croix de Chavaux",
      "Bas-Montreuil",
      "Mairie de Montreuil",
      "La Noue / Clos Français",
      "Boissière / Ruffins",
    ],
    neighbours: ["Bagnolet", "Les Lilas", "Paris 20e"],
    serviceSlugs: allServices,
  },
  {
    slug: "bagnolet",
    name: "Bagnolet",
    postalCode: "93170",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Bagnolet (93170) — Résidences, bureaux, vitrines",
    description:
      "Entreprise de nettoyage à Bagnolet 93170 : parties communes, bureaux du secteur Gallieni, vitrines et ménage d'état des lieux. Intervention rapide, devis gratuit.",
    intro:
      "À Bagnolet, nous entretenons des résidences, des bureaux du secteur Gallieni et des commerces.",
    context:
      "Proximité immédiate du périphérique : nous sommes sur place en moins de quinze minutes depuis notre base, y compris pour une urgence de dégât ou de dépôt sauvage.",
    sectors: [
      "Gallieni",
      "Centre-ville / Mairie",
      "Les Coutures",
      "La Noue",
      "Plateau / Malmaison",
    ],
    neighbours: ["Les Lilas", "Montreuil", "Paris 20e"],
    serviceSlugs: allServices,
  },
  {
    slug: "saint-denis",
    name: "Saint-Denis",
    postalCode: "93200",
    department: "Seine-Saint-Denis (93)",
    title: "Nettoyage Saint-Denis (93200) — Immeubles & bureaux",
    description:
      "Société de nettoyage à Saint-Denis 93200 : parties communes de résidences, bureaux, fin de chantier et remise en état. Contrats réguliers pour syndics et bailleurs.",
    intro:
      "À Saint-Denis, nous accompagnons syndics, bailleurs et entreprises sur des surfaces importantes.",
    context:
      "Résidences de grande taille et immeubles de bureaux : nous mettons en place des plannings affichés, des contrôles qualité et un référent joignable directement.",
    sectors: [
      "Centre-ville / Basilique",
      "Pleyel",
      "La Plaine Saint-Denis",
      "Franc-Moisin",
      "Stade de France",
    ],
    neighbours: ["Aubervilliers", "Pantin", "Paris 18e"],
    serviceSlugs: allServices,
  },
  {
    slug: "paris",
    name: "Paris",
    postalCode: "75000",
    department: "Paris (75)",
    title: "Nettoyage Paris est — 10e, 11e, 18e, 19e, 20e | PURE SPACE NETT",
    description:
      "Entreprise de nettoyage à Paris, surtout 10e, 11e, 18e, 19e et 20e : bureaux, commerces, vitres, fin de chantier, état des lieux. Devis gratuit sous 24 h.",
    intro:
      "Nous intervenons dans tout Paris, avec une présence renforcée sur les arrondissements de l'est : 10e, 11e, 18e, 19e et 20e.",
    context:
      "Contraintes parisiennes bien connues : stationnement, accès par cour, horaires de livraison, voisinage. Nous organisons nos passages pour ne gêner ni les riverains ni votre activité.",
    sectors: [
      "Paris 10e — Gare du Nord, Canal Saint-Martin",
      "Paris 11e — République, Nation",
      "Paris 18e — Montmartre, La Chapelle",
      "Paris 19e — Belleville, La Villette",
      "Paris 20e — Gambetta, Père-Lachaise",
    ],
    neighbours: ["Le Pré-Saint-Gervais", "Pantin", "Bagnolet"],
    serviceSlugs: allServices,
  },
  {
    slug: "ile-de-france",
    name: "Île-de-France",
    postalCode: "",
    department: "Île-de-France",
    title: "Nettoyage en Île-de-France — Entreprise PURE SPACE NETT",
    description:
      "PURE SPACE NETT intervient dans toute l'Île-de-France : nettoyage de bureaux, copropriétés, fin de chantier, vitres et remise en état. Devis gratuit sous 24 h.",
    intro:
      "Notre base est en Seine-Saint-Denis, mais nous nous déplaçons dans toute l'Île-de-France pour les chantiers et les contrats réguliers.",
    context:
      "Hauts-de-Seine, Val-de-Marne, Val-d'Oise, Seine-et-Marne, Yvelines, Essonne : pour les interventions ponctuelles éloignées, nous regroupons les déplacements afin de garder un tarif juste.",
    sectors: [
      "Seine-Saint-Denis (93)",
      "Paris (75)",
      "Hauts-de-Seine (92)",
      "Val-de-Marne (94)",
      "Val-d'Oise (95)",
      "Seine-et-Marne (77), Yvelines (78), Essonne (91)",
    ],
    neighbours: ["Paris", "Seine-Saint-Denis", "Val-de-Marne"],
    serviceSlugs: allServices,
  },
];

export const getZone = (slug: string) => zones.find((z) => z.slug === slug);

/**
 * Requêtes locales réellement tapées sur Google pour une ville et ses quartiers.
 * Utilisées dans le contenu des pages de villes (maillage interne + mots-clés locaux).
 */
export const zoneQueries = (zone: Zone): { query: string; servicePath?: string }[] => {
  const area = zone.postalCode ? `${zone.name} ${zone.postalCode}` : zone.name;
  const base: { query: string; servicePath?: string }[] = [
    { query: `entreprise de nettoyage ${zone.name}` },
    { query: `société de nettoyage ${area}` },
    { query: `nettoyage de bureaux ${zone.name}`, servicePath: "/services/nettoyage-bureaux" },
    {
      query: `nettoyage parties communes copropriété ${zone.name}`,
      servicePath: "/services/nettoyage-copropriete",
    },
    {
      query: `nettoyage fin de chantier ${zone.name}`,
      servicePath: "/services/nettoyage-fin-de-chantier",
    },
    { query: `nettoyage de vitres ${zone.name}`, servicePath: "/services/nettoyage-vitres" },
    {
      query: `ménage état des lieux ${zone.name}`,
      servicePath: "/services/menage-etat-des-lieux",
    },
    { query: `remise en état après travaux ${zone.name}`, servicePath: "/services/remise-en-etat" },
  ];
  const bySector = zone.sectors.map((sector) => ({
    query: `nettoyage ${sector.split(" / ")[0]!.replace(/ — .*$/, "")} ${zone.name}`,
  }));
  return [...base, ...bySector];
};
