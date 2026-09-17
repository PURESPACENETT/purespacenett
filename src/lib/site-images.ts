import logoAsset from "@/assets/pure-space-nett-logo.jpg.asset.json";
import bureauxAsset from "@/assets/bureaux-lumineux.jpg.asset.json";
import avantApresAsset from "@/assets/copropriete-avant-apres.png.asset.json";
import couloirAsset from "@/assets/couloir-residence-apres-nettoyage.jpg.asset.json";
import solBrillantAsset from "@/assets/sol-residence-brillant.jpg.asset.json";
import solNettoyeAsset from "@/assets/sol-residence-nettoye.jpg.asset.json";

export const siteImages = {
  logo: logoAsset.url,
  bureaux: bureauxAsset.url,
  avantApres: avantApresAsset.url,
  couloir: couloirAsset.url,
  solBrillant: solBrillantAsset.url,
  solNettoye: solNettoyeAsset.url,
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
  "nettoyage-residences-coproprietes": siteImages.avantApres,
  "entretien-locaux-commerciaux": siteImages.solBrillant,
  "nettoyage-vitres": siteImages.bureaux,
  "nettoyage-fin-de-chantier": siteImages.avantApres,
  "remise-en-etat": siteImages.couloir,
  "menage-etat-des-lieux": siteImages.solNettoye,
  "nettoyage-canapes-tapis": siteImages.solBrillant,
  "nettoyage-interieur-vehicules": siteImages.solNettoye,
};

export function getServiceImage(slug: string, index = 0) {
  return serviceImageBySlug[slug] ?? chantierImages[index % chantierImages.length];
}

export function getZoneImage(index: number) {
  return chantierImages[index % chantierImages.length];
}