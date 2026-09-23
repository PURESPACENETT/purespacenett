# CHANTIER B — Espace privé compact et actionnable

## Objectif
Réorganiser l’espace `/admin` en onglets partageables, sans créer de page séparée, et rendre les demandes directement actionnables dans leur tableau actuel.

## Mise en œuvre
- Ajouter des onglets accessibles pilotés par le paramètre d’URL `?onglet=` : Tableau de bord, Demandes, Avis, SEO / Search Console et Outils.
- Conserver la protection existante de `/admin` et éviter les requêtes inutiles en ne chargeant les outils lourds que dans leur onglet.
- Transformer la liste des demandes en vue compacte : recherche, filtre de statut, résumé, détail dépliable, appel, e-mail, changement de statut avec état d’attente, confirmation et retour de succès/erreur.
- Conserver dans l’onglet Avis les filtres et les actions Publier, Refuser et Dépublier, avec confirmation pour les actions sensibles et retour d’état.
- Regrouper les chiffres Google et le suivi par ville dans SEO / Search Console ; placer l’analyse de rapport dans Outils.
- Afficher dans Tableau de bord les compteurs utiles et des raccourcis vers chaque onglet. Aucun onglet Prospection ne sera ajouté : le projet ne contient actuellement aucun tableau privé de prospection à déplacer.

## Validation
- Vérifier les URL rechargeables, la navigation clavier et les affichages mobile/desktop.
- Vérifier le parcours non connecté vers `/connexion` et les fonctions privées.
- Exécuter les contrôles TypeScript et lint disponibles, puis un test navigateur ciblé.
- Ne modifier ni supprimer aucune donnée métier.
