# Rapport de tests — PURE SPACE NETT

Date : 2026-10-26  
Branche : `fix/performance-devis`

## État initial

| Test | Résultat | Détail |
|---|---|---|
| Lighthouse accueil mobile | Bloqué | Le connecteur d'audit retourne `plan_denied`; score non disponible |
| Lighthouse accueil desktop | Bloqué | Le connecteur d'audit retourne `plan_denied`; score non disponible |
| Lighthouse devis mobile | Bloqué | Même limitation; aucun score inventé |
| Lighthouse devis desktop | Bloqué | Même limitation; aucun score inventé |
| Requêtes HTTP des images en production | Bloqué | DNS/réseau sortant indisponible dans le conteneur et navigateur d'audit non autorisé |
| Build et lint du dépôt | Non exécutés localement | Aucun environnement de build GitHub/Codex n'est disponible via cette action de lecture du dépôt |
| Soumission formulaire valide | Non testée | Nécessite un environnement de test avec services configurés |
| Validation champs invalides | Non testée dynamiquement | Validation client/serveur observée statiquement |
| Anti-doublon | À vérifier | L'endpoint génère un nouvel UUID par soumission; aucune idempotence de requête n'est visible dans le code examiné |
| Enregistrement Supabase | Non testé en production | Le code prévoit un insert dans `quote_requests`; aucune soumission réelle n'a été faite |
| Synchronisation CRM | Risque identifié | Les erreurs sont journalisées sans faire échouer la réponse HTTP |
| Notification e-mail | Risque identifié | Les erreurs Resend sont journalisées et absorbées |
| Responsive / navigation clavier | Non testé dynamiquement | À tester dans un navigateur réel |
| Console / erreurs réseau | Non mesurées | Pas de session navigateur instrumentée disponible |

## Conditions de clôture

- Capturer les quatre rapports Lighthouse avant/après.
- Confirmer les statuts HTTP de toutes les images.
- Exécuter les tests fonctionnels sur préproduction avec identifiants de test, et vérifier le CRM et l'e-mail.
- Lancer lint, build et tests dans CI.
- N'autoriser la mise en production qu'après réussite des tests critiques et revue du diff.

## Résultats complémentaires après accès Vercel (26/10/2026)

| Test | Résultat | Détail |
|---|---|---|
| Accueil production | PASS HTTP | HTTP 200 |
| Page /devis production | PASS HTTP | HTTP 200 |
| 6 images sur production | FAIL | Les six URL `/__l5e/assets-v1/...` répondent HTTP 404 |
| 6 images sur preview corrigée | PASS HTTP | Les six URL répondent HTTP 200; signatures JPEG/PNG cohérentes |
| Accueil preview corrigée | PASS HTTP | HTTP 200 |
| Page /devis preview corrigée | PASS HTTP | HTTP 200 |
| GET /api/public/devis | PASS | HTTP 405 attendu, `Allow: POST`, no-store et noindex |
| Erreurs runtime Vercel, dernières 24 h | PASS | Aucune erreur retournée sur cette période |
| Erreurs runtime historiques | À vérifier | 40 occurrences anciennes de `SUPABASE_PUBLISHABLE_KEY` manquante, dernière observée le 20/10 |
| Lighthouse mobile/desktop | Bloqué | Outil refusé par le plan (`plan_denied`); aucune mesure n'est inventée |
| Soumission POST réelle | Non testée | Aucun faux prospect n'a été envoyé à la base/CRM/e-mail de production |
| CRM et notification e-mail | Non validés | Nécessitent un scénario contrôlé en préproduction et vérification effective de la destination |

La règle de réécriture d'images est validée sur le déploiement de preview. La production n'est pas corrigée tant que cette modification n'est pas intégrée et promue après validation du reste du parcours.

## Vérifications du formulaire et de la preview après le dernier commit

| Test | Résultat | Détail |
|---|---|---|
| Build Vercel preview après changements formulaire | PASS | Build terminé; déploiement `dpl_2sgQDM8rVNjeWPTnbNxCLKDf32Lw` READY |
| Accueil preview | PASS | HTTP 200 |
| /devis preview | PASS | HTTP 200 |
| GET /api/public/devis | PASS | HTTP 405 attendu, `Allow: POST` |
| Logo preview | PASS | HTTP 200, `image/jpeg` |
| Photo principale preview | PASS | HTTP 200, `image/png` |
| Verrou double clic | Vérification statique | Ref `submitLockRef` ajouté; pas de test navigateur interactif disponible |
| Téléphone / surface | Vérification statique | Validation client/serveur ajoutée; POST de test non envoyé |
| Création CRM et notification Resend | Non testé | Ne pas confondre la réponse HTTP 200 d'une page avec la réussite d'une soumission |
| Lighthouse | Bloqué | Connecteur d'audit refuse le plan (`plan_denied`) |

- GitHub Actions CI : job `quality` terminé avec succès; installation, lint et build sont tous en succès sur le commit courant de la PR. Les tests dynamiques du formulaire, CRM et e-mail restent séparés de ce contrôle de build.
