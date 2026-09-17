# Devis en ligne, suivi des demandes et référencement local

Quatre chantiers : une vraie page de devis qui envoie les demandes automatiquement, un espace privé pour les consulter, l'affichage local (téléphone, horaires 7h–22h, carte) sur l'accueil et les villes, et les fichiers qui aident Google à trouver toutes vos pages.

## 1. Page /devis

- Nouvelle page dédiée `/devis` avec le formulaire complet déjà repris de votre ancien site (nom, e-mail, téléphone, adresse, type de bien, surface, prestation, fréquence, précisions, accord d'utilisation des données).
- Titre, description et données structurées propres à cette page pour Google.
- Liens vers `/devis` depuis : le bouton principal de l'accueil, le bandeau « devis » de chaque page service, chaque page de ville, le menu et le pied de page.
- La page contact garde un formulaire court et renvoie vers `/devis`.

## 2. Enregistrement et envoi automatique

- Chaque demande est enregistrée, puis un e-mail récapitulatif part vers contact@purespacenett.com.
- L'envoi automatique par e-mail nécessite un domaine e-mail configuré. Tant que ce n'est pas fait, la demande est bien enregistrée et visible dans votre espace privé, et le message d'accusé de réception s'affiche au client. Je vous présenterai la fenêtre de configuration au moment de la mise en place.
- Les photos ne peuvent pas être joints : le formulaire invite à les envoyer par WhatsApp ou e-mail.
- Protection anti-spam simple (limite d'envois, champ piège) et vérification des champs côté serveur.

## 3. Espace privé « Devis reçus »

- Page `/admin` accessible seulement après connexion avec votre e-mail et votre mot de passe.
- Liste des demandes de la plus récente à la plus ancienne : date, nom, e-mail, téléphone, message, plus le type de bien, la surface, la prestation et la fréquence.
- Liens cliquables pour appeler ou répondre directement, marquage « traité », recherche par nom ou e-mail.
- Page de connexion `/connexion`. Aucune inscription publique : votre compte est le seul autorisé, les autres visiteurs ne voient rien.

## 4. Optimisation Google Local

- Accueil et pages de villes : bloc visible avec le téléphone cliquable, les horaires (7h–22h) et la zone d'intervention.
- Carte Google Maps intégrée, chargée seulement quand on arrive dessus pour ne pas ralentir la page. Sans adresse précise de votre part, la carte est centrée sur Le Pré-Saint-Gervais et, sur chaque page de ville, sur la ville concernée.
- Données structurées enrichies (horaires, téléphone, zone desservie) sur l'accueil et chaque page de ville.

## 5. robots.txt et plan de site

- `robots.txt` complété pour autoriser toutes vos pages et indiquer l'emplacement du plan de site.
- Plan de site généré automatiquement à partir des pages du site : accueil, services, villes, tarifs, à propos, contact et devis. Toute nouvelle ville ou prestation y apparaît sans intervention.
- Point important : l'adresse du plan de site doit contenir votre adresse publique définitive. Il faut donc publier le site et relier purespacenett.com ; je finalise ce fichier juste après, dans la foulée.

## Détails techniques

- Lovable Cloud activé : table `quote_requests` (colonnes nom, e-mail, téléphone, adresse, type de bien, surface, prestation, fréquence, message, statut, date), RLS + GRANTs, insertion publique via une route serveur uniquement (pas d'écriture directe depuis le navigateur), lecture réservée au rôle `admin` via table `user_roles` + fonction `has_role`.
- `src/routes/api/public/devis.ts` : validation Zod, rate limit, insertion via client service role, envoi e-mail si domaine configuré, réponse JSON.
- Auth e-mail/mot de passe activée ; `/admin` sous un layout `_authenticated` avec contrôle du rôle admin ; lecture des devis par server function protégée.
- `head()` par page pour `/devis`, `/connexion` exclue de l'indexation ; sitemap dérivé du routeur avec `staticData.sitemap`.
- Carte via iframe Google Maps `loading="lazy"`, sans clé API.
