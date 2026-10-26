# Rapport de sécurité — PURE SPACE NETT

Date : 2026-10-26

## Table de limitation de débit
- `public.rate_limit_buckets` conserve RLS activé sans politique.
- Les privilèges observés ne sont accordés qu'à `postgres` et `service_role`; aucun droit pour `anon` ou `authenticated` n'a été observé.
- Décision : conserver le refus par défaut; aucune politique redondante n'a été ajoutée.

## Protection des mots de passe compromis
- L'advisor Supabase signale toujours `auth_leaked_password_protection` (WARN).
- Le réglage n'a pas été activé, car les outils disponibles ne proposent pas de mutation des paramètres Supabase Auth. L'exécution SQL n'est pas un substitut sûr à un paramètre Auth.
- Action restante : activer dans le tableau de bord Supabase Auth > Security and Protection, puis tester inscription, connexion et réinitialisation.

## Performance RLS
- Les avertissements `auth_rls_initplan` doivent être associés individuellement aux politiques exactes avant toute réécriture.
- Les règles n'ont pas été modifiées en masse, afin de préserver les droits d'accès.

## Fiabilité
- Migration additive : identifiant unique de demande, états CRM/e-mail, compteur de tentatives et dernière erreur.
- Les demandes ne sont pas supprimées. Les erreurs de livraison donnent une réponse non-2xx et les états restent en base.
- La reprise actuelle dépend d'une nouvelle soumission avec le même identifiant; aucun worker planifié n'a été configuré.

## Statut
Sécurité partiellement traitée. L'alerte Auth reste ouverte et le parcours de devis n'est pas encore validé en bout en bout.