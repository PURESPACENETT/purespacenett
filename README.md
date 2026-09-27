# PURE SPACE NETT

Dépôt central de PURE SPACE NETT.

## Architecture

- **Site public** : application à la racine du dépôt.
- **CRM** : `apps/crm/`.
- **Documentation technique** : `docs/`.
- **CI** : `.github/workflows/`.
- **Données et services backend** : Supabase.

Le dépôt historique du CRM `PURESPACENETT/funnel-friendship` est conservé séparément comme sauvegarde pendant la période de validation de la centralisation.

## Séparation des responsabilités

### Projet ChatGPT « PURE SPACE NETT »

Référence pour :

- stratégie ;
- décisions métier ;
- besoins ;
- priorités ;
- cahier des charges ;
- SEO et marketing ;
- règles métier du CRM.

### GitHub / Codex

Référence pour :

- code ;
- tests ;
- corrections ;
- branches ;
- commits ;
- CI/CD ;
- documentation technique.

### Supabase

Référence pour :

- base de données ;
- authentification ;
- stockage ;
- Edge Functions ;
- configuration d'exécution.

Voir [`docs/PROJECT_OPERATING_MODEL.md`](docs/PROJECT_OPERATING_MODEL.md) et [`docs/CONTEXT_HANDOFF.md`](docs/CONTEXT_HANDOFF.md).

## Développement

Le développement est réalisé via GitHub/Codex.

Le dépôt ne doit pas contenir de secrets. Les variables d'environnement réelles restent hors Git.

Pour le CRM :

```sh
cd apps/crm
bun install --frozen-lockfile
bun run lint
bun test
bun run build
```

La CI dédiée au CRM se trouve dans `.github/workflows/crm-ci.yml`.
