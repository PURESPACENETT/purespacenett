# Roadmap

- [x] CHANTIER B — Réorganiser /admin en onglets partageables et responsives
- [x] Intégrer les actions contextuelles dans le tableau des demandes existant
- [x] Préserver la modération des avis et tous les outils existants
- [x] Vérifier authentification, navigation, états et affichage mobile/desktop
- [x] Valider avec lint, tests ciblés et aperçu navigateur

- [x] CHANTIER C — Fiabiliser la modération des avis et les garde-fous QA
- [x] Confirmation avant publication, refus et dépublication
- [x] Bloquer les avis de test connus
- [x] Exclure les fichiers générés des contrôles ESLint
- [x] Vérifier les protections admin et l'absence de secrets côté client

- [x] CHANTIER D — Conversion : transformer davantage de visites en demandes
- [x] Clarifier le parcours du formulaire de devis en 3 étapes
- [x] Mesurer début de formulaire, ajout de photos, envoi et confirmation
- [x] Conserver des issues de secours explicites en cas d'échec d'envoi
- [x] Renforcer les CTA téléphone et WhatsApp sur la page devis
- [x] Ajouter une preuve sociale au parcours de devis
- [x] Valider lint et build sur GitHub Actions

- [ ] CHANTIER E — Sous-traitance B2B : renforcer l'acquisition et la qualification
- [x] Remplacer le lien Google utilisé pour demander un avis par le lien fourni
- [x] Mesurer le début et l'échec du formulaire de sous-traitance avec une source cohérente
- [x] Ajouter des options téléphone et WhatsApp après transmission d'une demande B2B
- [x] Ajouter un honeypot serveur sur le formulaire B2B
- [ ] Auditer le parcours de prospection et le raccordement CRM de bout en bout
- [ ] Vérifier les paramètres de production du pont B2B et les erreurs de transmission
- [x] Vérifier et renforcer les pages, CTA et messages dédiés aux entreprises de nettoyage
- [ ] Valider lint, build et tests du parcours B2B


- [ ] CHANTIER F — Suivi commercial : pilotage du pipeline et attribution
- [x] Renforcer le tableau de bord CRM avec pipeline par statut et valeur ouverte
- [x] Séparer le suivi sous-traitance, entreprises et particuliers
- [x] Ajouter le panier moyen des dossiers gagnés et les indicateurs de clôture
- [x] Enrichir les événements analytics avec UTM, référent et page d'atterrissage
- [x] Corriger le comptage des prospects intéressés pour éviter d'inclure les convertis
- [ ] Raccorder durablement les sources d'acquisition au dossier CRM et contrôler la déduplication


- [ ] CHANTIER H — Qualité technique finale
- [x] Renforcer le endpoint de devis : réponses sans cache et nettoyage des photos orphelines en cas d'échec
- [x] Vérifier les protections serveur, le rate limiting, le honeypot et les réponses HTTP des endpoints publics
- [ ] Vérifier le build et le lint finaux du site
- [ ] Contrôler le build et le lint du CRM après ajout du workflow CI
- [ ] Vérifier les parcours critiques : devis, photos, sous-traitance B2B, connexion admin et modération des avis
- [ ] Vérifier la cohérence production des connexions Supabase avant toute migration supplémentaire

- [x] Corrections post-audit (CSP en double, TODO en double, extension photos, stockage photos, en-têtes et piège anti-robots B2B)
