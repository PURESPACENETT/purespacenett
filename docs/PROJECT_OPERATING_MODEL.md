# PURE SPACE NETT — Modèle opérationnel ChatGPT / GitHub / Supabase

## Objectif

Séparer clairement le **contexte métier** de PURE SPACE NETT et le **code exécutable**, sans dupliquer le projet ni perdre les décisions déjà prises.

## Architecture de référence

```
PURE SPACE NETT
       │
       ├── ChatGPT — Projet « PURE SPACE NETT »
       │      ├── stratégie
       │      ├── décisions métier
       │      ├── besoins et priorités
       │      ├── cahier des charges
       │      ├── SEO / marketing
       │      └── règles métier du CRM
       │
       ├── GitHub / Codex
       │      ├── code
       │      ├── corrections
       │      ├── tests
       │      ├── branches
       │      ├── commits
       │      └── CI/CD
       │
       └── Supabase
              ├── base de données
              ├── authentification
              ├── stockage
              └── fonctions / services backend
```

## 1. Ce qui appartient au Projet ChatGPT

Le Projet ChatGPT est la référence pour le **contexte métier**.

Il contient notamment :

- les objectifs commerciaux ;
- les priorités et arbitrages métier ;
- les besoins fonctionnels ;
- les règles de prospection ;
- les exigences SEO et marketing ;
- les décisions d'organisation du CRM ;
- les contraintes opérationnelles ;
- les éléments nécessaires pour formuler les demandes à Codex.

Le contexte métier n'a pas vocation à être recopié intégralement dans le dépôt Git.

## 2. Ce qui appartient à GitHub / Codex

GitHub est la référence pour l'**état du logiciel**.

Le dépôt central est `PURESPACENETT/purespacenett`.

Structure :

- site public : racine du dépôt ;
- CRM : `apps/crm/` ;
- documentation technique : `docs/` ;
- CI : `.github/workflows/`.

Codex intervient sur :

- le code source ;
- les tests ;
- les migrations et fonctions versionnées ;
- la configuration applicative ;
- les workflows GitHub ;
- les corrections et refactorings ;
- les branches et commits.

## 3. Ce qui appartient à Supabase

Supabase est la référence pour les **données et services d'exécution** :

- PostgreSQL ;
- Auth ;
- Storage ;
- Edge Functions ;
- configuration et secrets d'environnement.

Les secrets ne doivent jamais être copiés dans ChatGPT, GitHub ou des fichiers versionnés.

## 4. Flux de travail

### A — ChatGPT

Le besoin est défini dans le Projet « PURE SPACE NETT » :

1. objectif ;
2. problème constaté ;
3. comportement attendu ;
4. contraintes métier ;
5. critères d'acceptation.

### B — GitHub / Codex

Codex :

1. inspecte le code existant ;
2. identifie les fichiers concernés ;
3. applique une correction ciblée ;
4. ajoute ou adapte les tests ;
5. exécute la CI ;
6. crée un commit ou une PR lorsque nécessaire.

### C — Supabase

Si la modification concerne les données ou le backend :

1. identifier la ressource Supabase concernée ;
2. modifier les migrations/fonctions versionnées si nécessaire ;
3. éviter toute modification destructive non validée ;
4. vérifier le comportement avec les tests disponibles.

### D — Retour vers ChatGPT

Le résultat technique est résumé avec :

- fichiers modifiés ;
- comportement corrigé ;
- tests effectués ;
- état de la CI ;
- éventuels points nécessitant une décision métier.

## 5. Règle de séparation

**ChatGPT ne remplace pas GitHub comme source de vérité du code.**

**GitHub ne remplace pas le Projet ChatGPT comme source de vérité du contexte métier.**

**Supabase ne doit pas être traité comme un espace de documentation métier.**

Chaque système conserve uniquement la partie dont il est responsable.

## 6. Règle anti-duplication

Ne pas créer dans GitHub un « contexte métier complet » pour reproduire le contenu du Projet ChatGPT.

Dans GitHub, conserver uniquement :

- les décisions techniques nécessaires au développement ;
- les contrats d'interface ;
- les règles métier suffisamment précises pour être exécutées par le logiciel ;
- la documentation technique.

Les décisions commerciales et stratégiques restent dans le Projet ChatGPT.

## 7. Règle de développement

Le dépôt central `PURESPACENETT/purespacenett` est la référence pour le développement du site et du CRM.

Le dépôt historique `PURESPACENETT/funnel-friendship` reste conservé comme sauvegarde jusqu'à validation complète de la centralisation.

Les modifications futures du CRM doivent être effectuées dans `apps/crm/`.

## 8. Principes de sécurité

- Ne jamais versionner de secret, clé privée ou mot de passe.
- Ne pas copier les variables d'environnement réelles dans la documentation.
- Ne pas effectuer de migration destructive sans vérification préalable.
- Préférer les changements réversibles et testables.
- Toute modification importante doit être identifiable par un commit ou une PR.
