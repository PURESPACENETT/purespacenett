# Changelog — audit PURE SPACE NETT

## 2026-10-26 — Initialisation de la mission

- Création de la branche de travail `fix/performance-devis` depuis `main`.
- Ajout de `audit-before.md` avec la stack identifiée, les métriques non mesurées, les tailles d'images présentes dans les métadonnées et les risques détectés par inspection statique.
- Aucun code applicatif modifié à ce stade.
- Aucune image restaurée/remplacée : les URL de stockage n'ont pas pu être testées depuis l'environnement disponible, donc la cause exacte du défaut d'affichage n'est pas encore confirmée.
- Aucun déploiement effectué.

## Modifications en attente de diagnostic confirmé

- Tester les URL `/__l5e/assets-v1/...` dans un navigateur réseau autorisé.
- Mesurer PageSpeed/Lighthouse mobile et desktop pour `/` et `/devis`.
- Vérifier les échecs CRM et e-mail, puis ajouter un mécanisme de reprise/alerte uniquement après inspection du schéma Supabase et du webhook existant.
