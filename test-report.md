# Rapport de tests — PURE SPACE NETT

Date : 2026-10-26  
Branche : `fix/performance-devis`

## État initial

| Test | Résultat | Détail |
|---|---|---|
| Lighthouse accueil mobile | Bloqué | Le connecteur d'audit retourne `plan_denied`; score non disponible |
| Lighthouse accueil desktop | Bloqué | Le connecteur d'audit retourne `plan_denied`; score non disponible |
| Lighthouse devis mobile | Bloqué | Même limitation; aucun score inventé |
| Lighthouse devis desktop | Bloqué | Même limitation; aucun score inventé |
| Requêtes HTTP des images en production | Bloqué | DNS/réseau sortant indisponible dans le conteneur et navigateur d'audit non autorisé |
| Build et lint du dépôt | Non exécutés localement | Aucun environnement de build GitHub/Codex n'est disponible via cette action de lecture du dépôt |
| Soumission formulaire valide | Non testée | Nécessite un environnement de test avec services configurés |
| Validation champs invalides | Non testée dynamiquement | Validation client/serveur observée statiquement |
| Anti-doublon | À vérifier | L'endpoint génère un nouvel UUID par soumission; aucune idempotence de requête n'est visible dans le code examiné |
| Enregistrement Supabase | Non testé en production | Le code prévoit un insert dans `quote_requests`; aucune soumission réelle n'a été faite |
| Synchronisation CRM | Risque identifié | Les erreurs sont journalisées sans faire échouer la réponse HTTP |
| Notification e-mail | Risque identifié | Les erreurs Resend sont journalisées et absorbées |
| Responsive / navigation clavier | Non testé dynamiquement | À tester dans un navigateur réel |
| Console / erreurs réseau | Non mesurées | Pas de session navigateur instrumentée disponible |

## Conditions de clôture

- Capturer les quatre rapports Lighthouse avant/après.
- Confirmer les statuts HTTP de toutes les images.
- Exécuter les tests fonctionnels sur préproduction avec identifiants de test, et vérifier le CRM et l'e-mail.
- Lancer lint, build et tests dans CI.
- N'autoriser la mise en production qu'après réussite des tests critiques et revue du diff.
