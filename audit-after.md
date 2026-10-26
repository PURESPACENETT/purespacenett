# Audit après corrections — PURE SPACE NETT

Date : 2026-10-26  
Branche : `fix/performance-devis`  
Déploiement preview : `purespacenett-1o2whjj35-purespacenett.vercel.app`

## Résumé

La cause du défaut d'images a été confirmée : les URL d'assets renvoyaient HTTP 404 sur la production. Une règle de réécriture a été ajoutée dans `vercel.json` sur la branche de travail et le déploiement preview sert maintenant correctement les six images vérifiées.

**Cet audit décrit l'état de la preview corrigée, pas l'état final de la production.** Aucun déploiement n'a été promu sur le domaine public.

## Comparaison avant / après

| Élément | Avant (production) | Après (preview) | Statut |
|---|---|---|---|
| Accueil | HTTP 200 | HTTP 200 | PASS |
| /devis | HTTP 200 | HTTP 200 | PASS |
| Logo | HTTP 404 | HTTP 200 | Corrigé en preview |
| Bureaux | HTTP 404 | HTTP 200 | Corrigé en preview |
| Copropriété avant/après | HTTP 404 | HTTP 200 | Corrigé en preview |
| Couloir | HTTP 404 | HTTP 200 | Corrigé en preview |
| Sol brillant | HTTP 404 | HTTP 200 | Corrigé en preview |
| Sol nettoyé | HTTP 404 | HTTP 200 | Corrigé en preview |
| GET /api/public/devis | HTTP 405 attendu | HTTP 405 attendu | PASS |
| Lighthouse Performance mobile/desktop | Non mesuré | Non mesuré | Bloqué par plan d'audit |
| LCP / INP / CLS / FCP / TBT / Speed Index | Non mesuré | Non mesuré | Bloqué par plan d'audit |
| Soumission formulaire de bout en bout | Non testée | Non testée | À faire |
| Création CRM et e-mail reçu | Non validés | Non validés | À faire |
| Anti-doublons | À vérifier | À vérifier | À faire |

## Cause et correction des images

Le HTML généré contenait les URL `/__l5e/assets-v1/<asset_id>/<filename>`, mais Vercel n'avait aucune règle de routage pour les assets de la plateforme Lovable. L'application répondait donc avec sa page 404 HTML au lieu du binaire image.

Correction proposée et vérifiée en preview : réécriture de ces URL vers le projet Lovable d'origine. Les six ressources ont répondu HTTP 200 avec des signatures binaires compatibles avec leur format déclaré.

### Risque restant

La réécriture dépend toujours du service d'assets du projet Lovable. Une solution plus durable consiste à récupérer les six fichiers originaux et à les versionner dans le dépôt (ou les stocker dans un bucket contrôlé par PURE SPACE NETT), puis à mettre à jour les métadonnées pour utiliser ces chemins stables. Cette migration n'a pas été faite car les fichiers binaires n'étaient pas disponibles dans le dépôt GitHub consulté.

## Sécurité et stabilité

- Les en-têtes observés sur `GET /api/public/devis` incluent HTTPS/HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` et une CSP en mode report-only.
- Le endpoint GET est fermé en 405; le POST est le seul mode autorisé.
- Aucune erreur runtime Vercel n'a été retournée pour les dernières 24 heures.
- Des erreurs historiques Supabase ont signalé l'absence de `SUPABASE_PUBLISHABLE_KEY`; vérifier la configuration du déploiement courant avant la clôture.
- Le mécanisme actuel permet encore qu'une demande soit enregistrée en base alors que le webhook CRM ou l'e-mail échoue sans que la réponse client indique cet échec. Il faut ajouter un statut durable et une reprise/alerte après revue du schéma Supabase.
- L'idempotence des soumissions répétées n'est pas démontrée par le code examiné; le test reste requis.

## Mesures Lighthouse

Le connecteur Lighthouse disponible a refusé l'exécution avec `plan_denied`. Aucun score ni aucune métrique de performance n'est indiqué sans mesure.

## Décision de déploiement

**Ne pas promouvoir en production à ce stade.** La correction d'image est validée sur la preview, mais les tests de formulaire, de synchronisation CRM, de notification e-mail, d'anti-doublons et de performance restent incomplets.
## Vérification après changements formulaire (preview)

- Build Vercel : terminé avec succès sur le commit `fcf27bd246b6c280e2fce142ad867347d968d52b`.
- Les pages `/` et `/devis` répondent HTTP 200.
- `GET /api/public/devis` répond HTTP 405 avec `Allow: POST`, conformément au contrat de l'endpoint.
- Logo et photo principale répondent HTTP 200 avec les types `image/jpeg` et `image/png`.
- La validation téléphone/surface, le verrou de soumission rapide et les messages d'erreur sont présents dans le code, mais restent à valider par tests navigateur/POST.
- Le CRM et l'e-mail ne sont pas encore validés de bout en bout; aucun faux prospect n'a été créé en production.

## CI

GitHub Actions a validé l'installation, le lint et le build sur le commit de la PR. Ce résultat confirme la compilation, pas la validation de bout en bout du formulaire, du CRM, de l'e-mail ni les scores Lighthouse.
