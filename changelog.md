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

## Formulaire — améliorations de validation côté branche

- Ajout d'un verrou synchrone côté client pour ignorer les soumissions rapides concurrentes.
- Le formulaire affiche désormais le message d'erreur français renvoyé par l'API quand il est disponible, tout en conservant les données saisies pour permettre une nouvelle tentative.
- Ajout des attributs d'autocomplétion et de saisie mobile pour le nom, l'e-mail, le téléphone et l'adresse.
- Ajout d'une validation serveur du format du téléphone et d'une surface numérique comprise entre 1 et 100 000 m².
- Suppression de la promesse non garantie « votre demande arrive directement dans la boîte e-mail » au profit d'une formulation neutre.
- Le build Vercel de preview pour le commit `fcf27bd246b6c280e2fce142ad867347d968d52b` est terminé avec succès.
- Tests HTTP sur la preview mise à jour : accueil 200, `/devis` 200, GET API devis 405 avec Allow: POST, logo 200 image/jpeg, photo principale 200 image/png.
- Aucun POST de demande n'a été envoyé : le test CRM/e-mail de bout en bout reste à faire dans un environnement de test adapté.

- GitHub Actions CI sur le commit de la branche : installation réussie, lint réussi, build réussi (job `quality`).


## 2026-10-26 — fiabilité des demandes de devis
- Ajout de `request_id` UUID et index unique pour l'idempotence des soumissions.
- Ajout des colonnes de statut de livraison CRM/e-mail, compteur de tentatives, dernière erreur et dates de livraison.
- API : réutilisation de la demande existante lors d'une répétition du même identifiant; tentatives CRM et e-mail à nouveau effectuées avec la même clé d'idempotence d'e-mail; réponse d'erreur non-2xx si une livraison échoue.
- Formulaire : clé de demande stable conservée dans `sessionStorage`; champs du formulaire restaurés après rechargement; les champs restent présents après échec pour permettre une reprise.
- Types Supabase générés synchronisés avec les nouvelles colonnes.
- Migration additive appliquée au projet Supabase et ajoutée au dépôt.
- Aucun test POST réel ni déploiement de production n'a été déclaré comme effectué. Lighthouse explicitement exclu du périmètre.
