# Audit initial — PURE SPACE NETT

- Date de démarrage : 2026-10-26
- Branche de travail : `fix/performance-devis`
- Dépôt : `PURESPACENETT/purespacenett`
- Production ciblée : `https://purespacenett.com`
- Périmètre prioritaire : performances mobile, affichage des images, formulaire `/devis`, transmission CRM et notification.

## Limites de mesure au démarrage

Les audits Lighthouse/PageSpeed exécutés via l'outil navigateur disponible ont été refusés par la limitation du plan du connecteur (plan_denied). Le réseau sortant du conteneur de travail ne résout pas le domaine, et le rendu public n'a donc pas pu être inspecté de façon indépendante depuis cet environnement. Les scores et métriques ci-dessous sont **non mesurés** — aucune valeur n'est estimée ou inventée.

| Page | Mode | Performance | LCP | INP | CLS | FCP | TBT | Speed Index | Poids / requêtes |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| / | Mobile | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré |
| / | Desktop | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré |
| /devis | Mobile | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré |
| /devis | Desktop | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré | Non mesuré |

## Stack identifiée dans le dépôt

- Application web : React 19 + TanStack Start / TanStack Router.
- Build : Vite 8, commande `bun run build`.
- Runtime/outillage : Bun, Node 22.x déclaré dans `package.json`.
- Hébergement prévu/configuré : Vercel (`vercel.json`, framework `tanstack-start`).
- Backend/base/stockage : Supabase; endpoint public `/api/public/devis`.
- CRM : pont webhook Supabase Edge Function, URL par défaut `/functions/v1/quote-request-webhook`; secrets attendus via Supabase Vault ou variables d'environnement.
- E-mail transactionnel : Resend, variables `RESEND_API_KEY` et `RESEND_FROM_EMAIL`; notification de devis destinée à `contact@purespacenett.com`.
- Analytics : module interne `src/lib/analytics`; attribution UTM/clic publicitaire.
- Dépôt GitHub : branche par défaut `main`; CI `.github/workflows/ci.yml`.

## Constats statiques vérifiables dans le code

### Images
Les URL d'images sont importées depuis des métadonnées `*.asset.json` et prennent la forme `/__l5e/assets-v1/<asset_id>/<nom>`. Les six métadonnées référencées sont présentes dans le dépôt. Cela ne prouve pas que les objets correspondants sont accessibles en production. L'utilisateur signale que certaines ou toutes les images ne s'affichent pas; le statut HTTP des URL et l'existence des objets doivent être confirmés avec un navigateur/réseau autorisé avant de changer les chemins.

Tailles déclarées dans les métadonnées :
- copropriété avant/après PNG : 947 694 octets;
- couloir JPG : 201 106 octets;
- bureaux JPG : 71 461 octets;
- sol brillant JPG : 453 880 octets;
- sol nettoyé JPG : 355 440 octets;
- logo JPG : 105 367 octets.

La photo principale avant/après est préchargée et marquée `fetchPriority="high"`; elle est PNG et la métadonnée indique environ 948 Ko. Optimisation à envisager uniquement après confirmation que l'image est correctement servie et mesure de son impact LCP.

### Formulaire et transmission
- Le formulaire client envoie un `FormData` à `POST /api/public/devis`.
- La validation serveur utilise Zod; l'endpoint limite les demandes à 5 par heure et possède un honeypot `company`.
- Les photos sont limitées à 5 fichiers, 5 Mo chacun, avec types MIME autorisés, puis stockées dans le bucket privé `quote-photos`.
- Le dossier est d'abord inséré dans Supabase `quote_requests`; si cet insert échoue, l'endpoint répond 500.
- Après insertion, le pont CRM est appelé si URL et secret sont disponibles. Les échecs CRM sont journalisés mais ne font pas échouer la réponse au navigateur.
- L'e-mail Resend est envoyé dans un bloc `try/catch`; un échec est journalisé, mais l'endpoint renvoie quand même `{ ok: true }`.
- Le comportement « demande enregistrée en base mais synchronisation CRM ou notification échouée » est donc possible. Il faut vérifier les tables, possibilités de reprise et journaux avant de modifier le flux.
- La clé de déduplication visible dans l'appel e-mail est idempotente pour l'e-mail; l'endpoint crée un nouvel UUID pour chaque requête. Une déduplication métier des soumissions répétées n'est pas démontrée par le code examiné.

## Risques et priorités initiales

1. **P0/P1 — Images** : confirmer les réponses HTTP des six URL et la configuration qui sert `/__l5e/assets-v1/`; ne pas remplacer les fichiers sans preuve de la cause.
2. **P1 — CRM/e-mail** : mettre en place une reprise/alerte durable pour les synchronisations échouées; ne pas prétendre qu'une notification a été envoyée si seul l'enregistrement DB a réussi.
3. **P1 — Performance mobile** : mesurer les 4 combinaisons page/appareil; vérifier le PNG LCP et le coût des scripts tiers.
4. **P1 — Formulaire** : tests de validation, double soumission, panne réseau, CRM et e-mail sur un environnement de test, sans polluer la production avec de faux prospects.
5. **P2 — Qualité** : exécuter lint/build/tests et les contrôles responsive/accessibilité après correction.

## Accès bloquants

- Le connecteur d'audit Lighthouse a refusé l'exécution avec `plan_denied`.
- L'accès Vercel au projet a retourné 403 pour l'équipe `team_Aytss4fobEBcvMooNB9GiBLA`; une demande d'autorisation à durée limitée a été générée et doit être approuvée par le propriétaire.
- Aucun secret n'a été affiché ni modifié.
- Aucun déploiement ni changement de production n'a été effectué.


## Résultats complémentaires après autorisation Vercel (26/10/2026)

- Les pages de production `/` et `/devis` répondent HTTP 200.
- Les six URL d'images testées directement sur la production répondent HTTP 404 et renvoient la page HTML de l'application au lieu du fichier image. Cause confirmée : la route de livraison `/__l5e/assets-v1/*` n'est pas configurée sur le déploiement Vercel de production.
- La page de devis et les images ont été testées dans une preview Vercel après ajout d'une règle de réécriture vers le projet Lovable d'origine.
- Dans la preview corrigée, les six URL d'images répondent HTTP 200 et renvoient les signatures de fichiers attendues (JPEG/PNG), avec des longueurs de réponse cohérentes avec les fichiers déclarés.
- L'endpoint `GET /api/public/devis` répond HTTP 405, `Allow: POST`, `Cache-Control: no-store` et `X-Robots-Tag: noindex, nofollow`, comportement attendu pour un endpoint de soumission POST.
- `/devis` dans la preview répond HTTP 200.
- Vercel Runtime Errors : aucune erreur sur les dernières 24 heures. Des erreurs historiques (9–20 octobre) signalaient une variable `SUPABASE_PUBLISHABLE_KEY` absente; elles doivent être vérifiées sur le déploiement courant avant de conclure.
- La tentative Lighthouse via l'outil HYPD est refusée avec `plan_denied`; les scores et métriques Core Web Vitals restent non mesurés.

## État des changements après diagnostic

La règle de réécriture a été ajoutée uniquement à la branche `fix/performance-devis`. Le déploiement Vercel correspondant est une preview `READY`, non promue en production. Les images sont donc corrigées et validées dans la preview; la production reste à 404 jusqu'à validation et déploiement contrôlé.
