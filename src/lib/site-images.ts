export const siteImages = {
  logo: "/assets/pure-space-nett-logo.webp",
  bureaux: "/assets/bureaux-lumineux.webp",
  avantApres: "/assets/copropriete-avant-apres.webp",
  couloir: "/assets/couloir-residence-apres-nettoyage.webp",
  solBrillant: "/assets/sol-residence-brillant.webp",
  solNettoye: "/assets/sol-residence-nettoye.webp",
} as const;

const chantierImages = [
  siteImages.couloir,
  siteImages.solBrillant,
  siteImages.solNettoye,
  siteImages.avantApres,
  siteImages.bureaux,
] as const;

const serviceImageBySlug: Record<string, string> = {
  "nettoyage-bureaux": siteImages.bureaux,
  "nettoyage-copropriete": siteImages.avantApres,
  "entretien-locaux-commerciaux": siteImages.solBrillant,
  "nettoyage-vitres": siteImages.bureaux,
  "nettoyage-fin-de-chantier": siteImages.avantApres,
  "remise-en-etat": siteImages.couloir,
  "menage-etat-des-lieux": siteImages.solNettoye,
  "nettoyage-canapes-tapis": siteImages.solBrillant,
  "nettoyage-interieur-vehicule": siteImages.solNettoye,
};

export function getServiceImage(slug: string, index = 0) {
  return serviceImageBySlug[slug] ?? chantierImages[index % chantierImages.length];
}

export function getZoneImage(index: number) {
  return chantierImages[index % chantierImages.length];
}
