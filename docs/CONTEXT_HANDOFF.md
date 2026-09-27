# PURE SPACE NETT — Contrat de transmission ChatGPT → Codex

Ce document définit la frontière entre le besoin métier et son implémentation technique.

## Demande métier minimale

Lorsqu'une évolution est demandée, ChatGPT transmet à Codex autant que possible :

### Objectif
Ce que l'entreprise veut obtenir.

### Problème actuel
Ce qui ne fonctionne pas ou ce qui doit évoluer.

### Comportement attendu
Ce que l'utilisateur doit pouvoir faire après la correction.

### Contraintes
Contraintes métier, UX, sécurité, données ou compatibilité connues.

### Critères d'acceptation
Conditions permettant de considérer la fonctionnalité comme terminée.

## Responsabilité de Codex

Codex détermine ensuite :

- quels fichiers modifier ;
- quelle architecture utiliser ;
- quels tests ajouter ;
- si une migration Supabase est nécessaire ;
- comment préserver les fonctionnalités existantes ;
- comment valider la modification.

Codex ne doit pas inventer une règle métier lorsqu'elle n'est pas déterminée.

## En cas d'ambiguïté

Si une ambiguïté peut modifier le comportement métier, demander une décision dans ChatGPT.

Si l'ambiguïté est uniquement technique et sans impact métier, choisir l'option la plus simple, sûre et réversible.

## Retour technique

Après intervention, retourner :

```text
STATUT
- terminé / bloqué / à valider

MODIFICATIONS
- fichiers principaux
- comportement modifié

VALIDATION
- tests
- lint
- build
- CI

SUPABASE
- aucune modification / migration / fonction modifiée

DÉCISION REQUISE
- aucune / préciser
```
