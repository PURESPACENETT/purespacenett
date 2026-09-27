# Déploiement PURE SPACE NETT

## Objectif

Le code est développé et versionné dans GitHub. Vercel sert uniquement de plateforme d'exécution et de déploiement.

## Cycle de publication

ChatGPT — contexte métier
        ↓
GitHub / Codex — modification du code
        ↓
Pull Request
        ↓
CI — build, typecheck, tests, lint
        ↓
Vercel Preview — URL de test
        ↓
Validation fonctionnelle
        ↓
Merge dans main
        ↓
Vercel Production — publication

## Preview

Chaque branche ou Pull Request non issue de main doit produire un déploiement Preview Vercel. La Preview permet de vérifier visuellement et fonctionnellement une modification sans modifier la version de production.

Une nouvelle modification poussée sur la même branche met à jour la Preview correspondante.

## Production

main est la branche de publication. Une modification ne doit arriver dans main qu'après passage de la CI et validation de la Preview.

## Configuration Vercel

Le projet Vercel doit être connecté au dépôt GitHub :

- Repository : PURESPACENETT/purespacenett
- Root Directory : /
- Production Branch : main
- Framework : TanStack Start
- Build command : bun run build
- Install command : bun install

Les variables publiques Supabase nécessaires au navigateur sont déjà gérées par la configuration de build. Les secrets serveur doivent être ajoutés dans Vercel et ne doivent jamais être commités dans Git.

## Règle de sécurité

Une Preview ne doit pas être considérée comme une copie de production pour les données sensibles. Les variables et services de test doivent être séparés lorsque le changement touche l'authentification, les écritures Supabase, les e-mails ou d'autres opérations irréversibles.

## Référence

Le fonctionnement s'appuie sur les déploiements Git de Vercel et sur les déploiements Preview de TanStack Start/Nitro.
