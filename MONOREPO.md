# Architecture du dépôt PURE SPACE NETT

Le dépôt centralise désormais deux applications distinctes :

- Le site public PURE SPACE NETT reste à la racine du dépôt afin de préserver son chemin de déploiement actuel.
- Le CRM issu de `PURESPACENETT/funnel-friendship` est intégré sous `apps/crm/`.

Les deux applications conservent leurs configurations, routes, migrations Supabase et dépendances propres. Aucune fusion de leurs fichiers de configuration racine n'a été effectuée.

Source CRM intégrée : `PURESPACENETT/funnel-friendship` — commit `c8786f2bc06dd2bc21ea72240287a87cea64b2e3`.

Le dépôt source du CRM reste conservé comme sauvegarde jusqu'à validation complète.
