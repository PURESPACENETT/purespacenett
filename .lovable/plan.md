# Audit fonctionnel et technique — PURE SPACE NETT

Audit en lecture seule du code source. Aucune modification faite. Le passage dans un vrai navigateur, route par route (ordinateur et mobile, console, réseau), est la première étape d'exécution ci-dessous.

## Derniers changements : bien présents
- Mentions légales : hébergeur Lovable Labs Incorporated, 1 Lincoln St, Boston, MA 02111, États-Unis, avec mention « à titre informatif », présent.
- CSP Report-Only : présente, politique conforme, aucun report-uri. En revanche, elle est posée deux fois (voir M1).
- TODO du limiteur de débit : présent, mais écrit deux fois (voir L1).

## Constats

### Blocker
Aucun constat de ce niveau dans le code lu.

### High
- **H1 — Le limiteur de débit est inefficace en production** (`src/lib/rate-limit.ts`, les 3 routes `/api/public/*`). Il garde ses compteurs en mémoire, alors que chaque instance du serveur a sa propre mémoire, qui repart souvent de zéro. La limite de 5 envois par heure n'est donc pas garantie. En plus, l'adresse IP est lue dans `x-forwarded-for`, qu'un robot peut falsifier. Recommandation : lire en priorité `cf-connecting-ip`. Plus tard, passer à un compteur stocké en base, sans changer l'API.
- **H2 — N'importe qui peut remplir le stockage des photos de devis** (`src/routes/api/public/devis.ts`). Sans vrai limiteur (H1), un robot peut envoyer 5 fois 5 Mo à chaque requête. De plus, l'extension du fichier vient de son nom d'origine sans aucun contrôle. Recommandation : déduire l'extension du type de fichier déjà validé (jpg, png, webp, heic, heif).

### Medium
- **M1 — En-tête CSP posé deux fois** (`src/server.ts` l.79 et l.81). Sans conséquence, mais c'est un doublon à retirer.
- **M2 — Sous-traitance : réponses sans `no-store` et sans `Retry-After`** (`src/routes/api/public/b2b-lead.ts`). La réponse de succès (l.98), l'erreur 502 (l.101) et la réponse 429 n'ont pas les mêmes en-têtes que les autres formulaires.
- **M3 — Piège anti-robots inopérant sur la sous-traitance** (`b2b-lead.ts`). Le schéma rejette déjà le champ `website` s'il est rempli, avec une erreur 400. Le test qui devait renvoyer un faux succès aux robots n'est donc jamais atteint. Recommandation : accepter le champ dans le schéma, puis renvoyer `ok` en silence.
- **M4 — Le piège anti-robots des avis renvoie une erreur 400** (`avis.ts`). Le robot voit qu'il a été repéré. Recommandation : faire comme en M3.
- **M5 — Le dossier des photos est recréé à chaque devis avec photos** (`devis.ts` l.77). C'est un appel inutile à chaque envoi. Recommandation : supprimer cet appel, le dossier existe déjà.
- **M6 — Des scripts Lovable autorisés en production** (`server.ts`). La règle `script-src` accepte `*.lovable.dev` et `connect-src` accepte la passerelle IA de Lovable, alors que le site en ligne n'en a sans doute pas besoin. À confirmer en observant les violations CSP avant de passer en mode bloquant.

### Low
- **L1 — Commentaire TODO dupliqué** (`rate-limit.ts` l.1-8).
- **L2 — Lien WhatsApp sans destinataire dans la demande d'avis** (`src/components/review-request.tsx` l.19). Le lien `wa.me/?text=` laisse le client choisir à qui envoyer le message, ce qui est voulu. À confirmer.
- **L3 — Numéros de téléphone dans l'espace admin** (`admin.tsx` l.654). Seuls les espaces sont retirés : un numéro saisi avec des points ou des tirets donne un lien d'appel invalide. Recommandation : ne garder que les chiffres et le signe +.
- **L4 — Mentions légales et politique de confidentialité en `noindex, follow`.** Ce choix est acceptable, mais il faut vérifier que ces pages sont bien exclues du plan du site, pour rester cohérent.

### Vérifié sans problème
- Formulaire d'avis : la case de consentement envoie bien la valeur `"true"`, que le serveur convertit correctement.
- Les pages de ville et de prestation inexistantes sont en `noindex`, `/connexion` est en `noindex, nofollow`, et les routes `/api` et `/admin` sont bloquées dans robots.txt.
- Les formulaires répondent 405 avec `X-Robots-Tag: noindex` quand on les ouvre directement.
- La carte Google ne se charge qu'après un clic du visiteur, et `frame-src` autorise bien google.com.
- Le numéro WhatsApp est centralisé dans `business.ts`.

## Étapes d'exécution après accord
1. Vérifier en navigateur, sur purespacenett.com, ordinateur et mobile : accueil, services, zones, devis (avec et sans photo), sous-traitance, contact, avis, FAQ, tarifs, bandeau cookies (accepter, refuser, « Gérer mes cookies »), liens téléphone, WhatsApp et Maps, pages 404, sitemap.xml, robots.txt, en-têtes, violations CSP dans la console. Ajouter au rapport ce qui ressort de ces tests.
2. Me dire si vous voulez que je corrige ensuite M1 à M5 et L1 à L3 : ce sont des corrections petites, sans changement de design. H1 et H2 demandent une décision sur le stockage des compteurs.
