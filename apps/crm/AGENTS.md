# PURE SPACE NETT — Instructions for Codex

## Source of truth

- Le contexte métier, les priorités et les décisions commerciales sont maintenus dans le Projet ChatGPT « PURE SPACE NETT ».
- Le code, les tests, les migrations versionnées et la configuration technique sont maintenus dans ce dépôt GitHub.
- Supabase est la source de vérité pour les données et services d'exécution.

## Règles de travail

1. Lire `docs/PROJECT_OPERATING_MODEL.md` et `docs/CONTEXT_HANDOFF.md` pour comprendre la séparation des responsabilités.
2. Inspecter l'existant avant toute modification.
3. Ne pas réécrire inutilement une fonctionnalité existante.
4. Toute correction fonctionnelle doit être accompagnée d'une validation adaptée.
5. Ne jamais versionner de secrets ou de variables d'environnement réelles.
6. Ne pas effectuer de migration destructive sans vérification explicite.
7. Pour le CRM, travailler sous `apps/crm/` ; ne pas réintroduire l'ancien dépôt comme application parallèle.
8. Ne pas utiliser Lovable comme outil de développement de référence pour ce projet. GitHub/Codex est le flux de développement retenu.
9. Préserver l'historique Git déjà publié : pas de force push, rebase ou réécriture de commits publiés.
10. Lorsqu'une décision métier manque et peut changer le comportement attendu, la faire remonter à ChatGPT plutôt que l'inventer.

## Validation

Avant de considérer une modification terminée :

- exécuter les tests pertinents ;
- exécuter le lint/typecheck/build lorsqu'ils existent ;
- vérifier la CI GitHub ;
- signaler séparément toute intervention Supabase.

## Compte rendu attendu

Retourner systématiquement :

- statut ;
- fichiers modifiés ;
- comportement corrigé ;
- validation effectuée ;
- impact éventuel sur Supabase ;
- décision métier restante, s'il y en a une.
