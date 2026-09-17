# PURE SPACE NETT — nouveau site optimisé pour Google

Objectif : un site rapide, complet et bien référencé pour attirer des demandes de devis en Île-de-France, en gardant votre domaine purespacenett.com.

## Ce que dit l'analyse

Votre site actuel n'apparaît pas dans les données de visibilité Google de Semrush : aujourd'hui il ne capte pratiquement aucune recherche. C'est une bonne nouvelle, il n'y a rien à casser et tout à gagner.

Ce que les gens cherchent réellement chaque mois en France (source Semrush) :
- société de nettoyage : 4 400 · nettoyage de bureaux : 1 000 · entreprise de nettoyage Paris : 1 000
- nettoyage fin de chantier : 1 300 · entreprise nettoyage fin de chantier : 260
- recherches locales type « entreprise de nettoyage 93 » : petits volumes mais très peu de concurrence, donc faciles à prendre

La concurrence sur ces requêtes est estimée faible à moyenne : un site bien construit avec des pages dédiées par service et par ville a de vraies chances.

## Le site que je construis

Une page d'accueil qui vend clairement : qui vous êtes, votre zone, vos services, devis gratuit, téléphone cliquable 07 59 48 30 21.

Une page dédiée par service (c'est le cœur du référencement, une page = une recherche) :
- Nettoyage de bureaux et locaux professionnels
- Nettoyage de copropriétés et résidences
- Entretien régulier de locaux commerciaux
- Nettoyage de vitres
- Nettoyage fin de chantier
- Remise en état
- Ménage état des lieux
- Nettoyage de canapés, tapis et moquettes
- Nettoyage intérieur de véhicules

Une page par zone clé : Le Pré-Saint-Gervais, Pantin, Les Lilas, Aubervilliers, Montreuil, Bagnolet, Saint-Denis, Paris Est, plus une page « Île-de-France ».

Plus : page Contact avec formulaire de devis, page À propos, page Tarifs / demande de devis, et une section conseils (articles) pour capter les recherches d'information.

## L'automatisation du SEO

- Chaque page reçoit automatiquement son titre, sa description et ses informations de partage, uniques et rédigés pour la recherche visée — pas de réglage manuel page par page.
- Un plan du site (sitemap.xml) se met à jour tout seul dès qu'une page est ajoutée, plus un fichier robots.txt correct.
- Les données structurées d'entreprise locale (activité, zone desservie, téléphone, horaires, avis) sont générées sur chaque page : c'est ce qui aide Google à vous afficher sur les recherches « près de moi ».
- Ajouter une nouvelle ville ou un nouveau service se fait en ajoutant une ligne de contenu ; la page, ses liens internes et son entrée au sitemap suivent automatiquement.
- Suivi : une fois le site en ligne, je peux relancer un contrôle SEO à la demande et corriger ce qui remonte.

## À faire de votre côté (je vous guide)

- Brancher purespacenett.com sur le nouveau site (opération à faire dans les réglages du projet, je vous accompagne).
- Votre fiche Google : à compléter et relier au site, c'est le premier levier pour du local.
- Me fournir : e-mail pro, horaires, quelques photos de chantiers, et 2-3 avis clients si vous en avez.

## Détails techniques

- TanStack Start : une route par page dans `src/routes`, métadonnées via `head()` par route (title, description, og:*, canonical auto-référencé).
- Contenu services/villes centralisé dans des fichiers de données typés (`src/content/services.ts`, `src/content/zones.ts`) ; les pages `/services/$slug` et `/zones/$slug` sont générées à partir de ces listes.
- JSON-LD : `LocalBusiness`/`CleaningService` au niveau racine, `Service` + `BreadcrumbList` sur les pages profondes.
- `sitemap.xml` dérivé du routeur, installé après mise en ligne du domaine public (aucune URL de préproduction n'y sera inscrite).
- Formulaire de devis : envoi par serveur (server function) ; si l'envoi d'e-mail est souhaité, cela nécessite d'activer le backend Lovable Cloud — à confirmer avant.
- Design sur-mesure via les jetons de couleur du projet (pas de dégradé violet générique), typographie et palette propres au secteur propreté, mobile d'abord.

## Points à confirmer

1. Voulez-vous recevoir les demandes de devis par e-mail (nécessite l'activation du backend) ou un simple lien mailto/WhatsApp suffit ?
2. Avez-vous un logo et des photos, ou je génère des visuels en attendant ?
