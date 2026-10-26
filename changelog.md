# Changelog — audit PURE SPACE NETT

## 2026-10-26 — Diagnostic initial et correction des images en preview

- Création de la branche `fix/performance-devis` depuis `main`.
- Ajout de `audit-before.md`, `test-report.md` et mise à jour des constats avec des mesures HTTP réelles.
- Confirmation de la cause des images cassées : les six URL `/__l5e/assets-v1/...` renvoient HTTP 404 sur le domaine de production, car la route de livraison des assets n'est pas présente dans la configuration Vercel de production.
- Modification de `vercel.json` dans la branche dédiée : ajout d'une réécriture de `/__l5e/assets-v1/:path*` vers le projet Lovable d'origine.
- Déploiement de preview Vercel créé automatiquement depuis le commit `255e48803d6ff555726cdbffe917ac8b199269ec`.
- Validation en preview : les six images répondent HTTP 200 avec des signatures de fichiers JPEG/PNG valides; `/` et `/devis` répondent HTTP 200; `GET /api/public/devis` répond HTTP 405 avec `Allow: POST`.
- Aucun changement de production ni promotion du déploiement n'a été effectué.

## En attente

- Valider la réécriture sur la durée et vérifier que la source d'assets reste accessible; à terme, préférer une copie des images dans les assets du dépôt ou un stockage stable sous contrôle du propriétaire, si les fichiers source sont récupérables.
- Obtenir des métriques Lighthouse; le connecteur HYPD est bloqué par `plan_denied`.
- Tester réellement le formulaire en préproduction, notamment CRM, e-mail, anti-doublons, validation, mobile et clavier.
- Vérifier les variables Supabase et le flux CRM/e-mail dans le déploiement courant.
- Exécuter lint/build/tests automatisés et ne promouvoir qu'après validation des tests critiques.
