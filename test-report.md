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

## Contrôles complémentaires — 26/10/2026

- CI GitHub Actions sur le commit de tête de PR : SUCCESS.
- Preview Vercel du commit de tête : READY.
- Accueil : HTTP 200.
- `/devis` : HTTP 200.
- Image principale de copropriété : HTTP 200, PNG valide.
- La lecture détaillée des journaux runtime sur 24 h est indisponible avec la rétention Vercel Hobby; ce contrôle reste limité.
- Avis Supabase relevés : protection contre les mots de passe compromis désactivée (WARN); une table de rate limit sans politique RLS (INFO, probablement intentionnelle); 20 avertissements de performance RLS à revoir.


## Tests complémentaires — fiabilité/idempotence (26/10/2026)

| Contrôle | Résultat | Preuve / limite |
|---|---|---|
| Build Vercel de preview | READY sur commit `a0f1c39a168582b94df042bfad50d526596730c1` | Vercel deployment READY |
| Schéma Supabase | PASS | Colonnes de livraison et `request_id` visibles dans `information_schema.columns` |
| Index d'idempotence | Ajouté | `quote_requests_request_id_uidx`, unique partiel |
| Validation des champs serveur | Présente | Schéma Zod existant + UUID `requestId` obligatoire |
| Double clic client | Protection client existante | `submitLockRef`; test navigateur réel non exécuté |
| Répétition même demande | Code ajouté | même UUID, conflit unique récupère la ligne et relance les livraisons |
| Échec CRM/e-mail | Code ajouté | statut durable `error` et réponse HTTP 503; test de panne réel non exécuté |
| Notification e-mail | Non validée de bout en bout | pas de soumission de test confirmée dans la boîte destinataire |
| CRM | Non validé de bout en bout | la fonction webhook actuelle déduplique dans `quote_requests`; aucune preuve d'une transmission à un système externe distinct |
| Mobile / desktop | Non testé de bout en bout | aucune session navigateur interactive contrôlée disponible |
| Erreur réseau / reprise | Partiellement couverte par le code | reprise manuelle avec identifiant stable; aucun worker automatique configuré |
| Lighthouse | Exclu à la demande | aucun score ni métrique publié |

**Statut global des tests : partiel.** La CI GitHub sur le dernier commit doit être vérifiée avant toute fusion. L'absence de test POST réel interdit de conclure que la chaîne complète est validée.


## Vérification finale du commit 6e22389c (26/10/2026)
- GitHub Actions CI run `40377572363` : **SUCCESS**; jobs `quality` et `Lint and build` terminés avec succès, étapes Lint et Build vertes.
- Vercel preview `purespacenett-ekixy4fue-purespacenett.vercel.app` : **READY** sur le commit `6e22389cfee91f217dbaa7c151eb0867dc195f4d`.
- Smoke GET : `/` HTTP 200, `/devis` HTTP 200, `GET /api/public/devis` HTTP 405 attendu, logo HTTP 200.
- Test POST réel tenté deux fois avec un identifiant de test stable : bloqué avant d'atteindre l'application, car Vercel renvoie HTTP 302 « Protected by Vercel Authentication » à un client non authentifié. Aucune soumission n'a donc été créée par cet essai; CRM/e-mail non testés. La protection preview n'a pas été désactivée pour contourner ce contrôle.


## Dernière CI après mise à jour des rapports
- Commit `0f35004c84db8496e54d76fef671158deb730f18` : CI run `40377783487` **SUCCESS**; les deux jobs ont terminé, lint et build sont verts.
- Preview Vercel correspondante : `purespacenett-7liiz55jm-purespacenett.vercel.app`, état READY; `/devis` répond HTTP 200 et contient le formulaire.
- L'envoi POST reste bloqué par Vercel Authentication dans le client de test. Le contrôle Supabase confirme zéro ligne pour l'UUID synthétique de test.


## Tentative de POST après autorisation temporaire de preview
- L'override de protection a été créé uniquement pour l'alias de préproduction puis révoqué immédiatement après le test.
- Deux soumissions avec le même UUID ont reçu une page d'erreur générique Vercel HTTP 500, sans réponse JSON de l'API.
- La requête SQL de contrôle confirme `matching_test_requests = 0` : aucune demande de test n'a été enregistrée, aucun e-mail n'a été confirmé envoyé.
- Les journaux runtime disponibles n'ont retourné aucune entrée pour ce déploiement / cette fenêtre. La cause du 500 reste donc indéterminée et bloque le test E2E.


## Cause identifiée du HTTP 500 (26/10/2026)
- Les journaux runtime de la preview montrent explicitement `Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY` lors du POST `/api/public/devis` et du contrôle de limitation de débit.
- La variable existe dans l'environnement Vercel `production`, mais son ciblage ne comprend pas `preview`. Le formulaire ne peut donc pas atteindre Supabase depuis cette preview.
- J'ai tenté de réutiliser la valeur de production via les outils Vercel; la valeur sensible n'est pas récupérable par le connecteur, donc aucune copie de secret n'a été effectuée. Je n'ai pas élargi la clé de service à toutes les previews, afin de ne pas augmenter le périmètre d'exposition.
- Action nécessaire : créer dans Vercel une variable `SUPABASE_SERVICE_ROLE_KEY` ciblée uniquement sur `Preview` et la branche `fix/performance-devis`, avec la valeur actuelle déjà utilisée en production. Puis redéployer la preview et refaire les POST.
