# CRM PURE SPACE NETT

Application CRM interne de PURE SPACE NETT pour la prospection B2B, le suivi des prospects, les devis et les actions commerciales.

## Architecture

- Code source : GitHub `PURESPACENETT/purespacenett`
- Application : `apps/crm/`
- Base de données : Supabase
- Déploiement : pipeline GitHub → Vercel
- IA de prospection : OpenAI
- E-mails transactionnels : Resend

## Développement

Depuis la racine du dépôt :

```sh
bun install --frozen-lockfile
bun run lint
bun run build
```

Pour travailler spécifiquement sur le CRM :

```sh
cd apps/crm
bun run dev
```

## Règle d'architecture

GitHub est la source de vérité du développement. Les modifications doivent être effectuées dans le dépôt puis validées par la CI avant déploiement.

Les anciens artefacts Lovable peuvent être conservés uniquement comme historique tant qu'une dépendance fonctionnelle n'a pas encore été migrée.
