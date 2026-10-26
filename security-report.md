# Rapport de sécurité — PURE SPACE NETT

Date de contrôle : 2026-10-26  
Projet Supabase : `dgppmlkpvmvjkhsghtji`

## Résumé

**Statut : non clôturé.** Les contrôles en lecture seule confirment que la table de limitation de débit est protégée par RLS et ne dispose d'aucune politique, ce qui bloque les opérations des rôles ordinaires tant qu'aucun droit de contournement n'est accordé. Le privilège SQL observé sur cette table est limité à `postgres` et `service_role`. La fonction de limitation utilise le client serveur. Aucun accès public direct n'est donc établi par les vérifications effectuées.

## Alertes et décisions

### Protection des mots de passe compromis
- L'advisor Supabase du 26/10/2026 signale `auth_leaked_password_protection` (WARN).
- L'état observé est désactivé.
- **Action restante :** activer le contrôle dans les paramètres Auth du projet, puis tester inscription, connexion et réinitialisation. Le connecteur disponible ne fournit pas de commande permettant de changer ce paramètre Auth. Aucune modification de configuration non vérifiable n'a été déclarée comme réalisée.

### Table `public.rate_limit_buckets`
- RLS est activé et aucune politique n'est définie.
- Les droits de table visibles dans `information_schema.role_table_grants` sont pour `postgres` et `service_role`; aucun droit accordé à `anon` ou `authenticated` n'a été retourné.
- Avec RLS activé et sans politique, les rôles ordinaires ne peuvent accéder aux lignes via les API PostgREST. Cette configuration est cohérente avec une table réservée au traitement serveur.
- **Décision :** conserver le refus par défaut; ajouter une politique « deny all » serait redondant et n'améliorerait pas la sécurité effective. Recontrôler les privilèges après toute migration.

### Avertissements de performance RLS
- L'advisor signale 20 avertissements `auth_rls_initplan`.
- Les politiques existantes incluent plusieurs expressions déjà écrites avec des sous-requêtes `SELECT auth.uid()` et `SELECT auth.jwt()`; l'advisor peut refléter d'autres expressions ou un état de cache.
- **Décision :** ne pas remplacer les politiques en masse sans cartographier chacune des 20 alertes et tester les accès autorisés/interdits. Aucune politique n'a été modifiée dans cette phase; le risque de régression d'autorisation serait supérieur au gain non mesuré.

## Fiabilité des demandes de devis

La revue du code montre que l'API insère une demande dans `quote_requests`, tente le webhook CRM, puis tente l'e-mail à `contact@purespacenett.com`. Les erreurs CRM et e-mail sont consignées, mais la réponse finale reste `{ ok: true }`. Il n'existe pas de statut durable de livraison dans ce parcours, et un nouvel envoi peut créer une nouvelle demande avec un nouvel UUID.

**Ce défaut est bloquant pour la mise en production selon les critères de mission.** Il faut une clé d'idempotence stable fournie par le client, une contrainte unique, des états durables de livraison et une reprise/alerte CRM et e-mail, puis des tests de bout en bout.

## Tests de sécurité réalisés
- Lecture des avis Supabase sécurité/performance.
- Lecture des politiques RLS exposées par `pg_policies`.
- Lecture des droits de table pour `rate_limit_buckets`.
- Lecture des index uniques de `quote_requests`, dont les index uniques conditionnels sur `source_external_id`.
- Aucune donnée client n'a été modifiée ou supprimée.
- Aucun test de connexion/inscription/réinitialisation n'a été exécuté; aucun changement de configuration Auth n'a été effectué.

## Décision
Ne pas fusionner ni promouvoir tant que le mécanisme de livraison durable et l'activation/test de la protection des mots de passe compromis ne sont pas terminés.