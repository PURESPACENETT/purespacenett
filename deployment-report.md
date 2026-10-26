# Rapport de déploiement — PURE SPACE NETT

Date du rapport : 2026-10-26

## État
- PR n° 53 : ouverte, brouillon; aucune fusion.
- La preview Vercel est en cours de génération pour les derniers commits de `fix/performance-devis`.
- Le domaine public n'a pas été promu vers cette version.
- Aucun envoi POST réel de devis n'a été confirmé dans cette mission.

## Changements de fiabilité
- Ajout d'une clé de demande stable et d'un index unique partiel.
- Ajout des états de livraison CRM et e-mail, compteur de tentatives et erreur persistante.
- L'API retourne une erreur non-2xx si l'une des livraisons n'est pas confirmée; la même demande peut être soumise à nouveau avec le même identifiant.

## Contrôles post-déploiement
Non applicables : aucune promotion de production n'a eu lieu.

## Blocages avant promotion
1. CI complète verte sur le dernier commit et revue du diff.
2. Soumission POST réelle en preview avec vérification de la ligne Supabase, du CRM et de la boîte de notification.
3. Tests du double clic, des validations, des échecs et de la reprise.
4. Confirmation de la configuration Supabase Auth; la protection des mots de passe compromis reste désactivée.
5. Lighthouse exclu du périmètre sur demande du propriétaire.

## Décision
Ne pas fusionner ni promouvoir avant preuve de livraison bout en bout.

## Dernière préproduction
- Commit testé : `6e22389cfee91f217dbaa7c151eb0867dc195f4d`.
- GitHub Actions : run `40377572363` SUCCESS; lint et build réussis.
- Vercel : preview `purespacenett-ekixy4fue-purespacenett.vercel.app` READY.
- GET accueil et `/devis` : HTTP 200; GET API : HTTP 405 attendu; logo : HTTP 200.
- Le test POST a été bloqué par Vercel Authentication (HTTP 302) depuis le client sandbox. Aucun enregistrement de test n'a été créé par cet essai.
- Aucun déploiement de production effectué.
