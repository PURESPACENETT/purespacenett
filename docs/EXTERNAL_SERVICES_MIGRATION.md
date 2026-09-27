# Migration des services externes — PURE SPACE NETT

## Objectif

Le site et le CRM ne doivent plus dépendre de Lovable pour leurs fonctions métier.

## Fournisseurs

| Fonction | Ancien service | Nouveau service | Variable serveur |
|---|---|---|---|
| E-mails transactionnels | Lovable Email | Resend | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Génération de prospection IA | Lovable AI Gateway | OpenAI Responses API via AI SDK | `OPENAI_API_KEY` |
| Qualification des devis IA | Lovable AI Gateway | OpenAI Responses API via AI SDK | `OPENAI_API_KEY` |
| Audit SEO IA | Lovable AI Gateway | OpenAI Responses API | `OPENAI_API_KEY` |
| Search Console | Lovable Connector Gateway | Google Search Console API | `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON` |
| Recherche Google Maps | Lovable Connector Gateway | Google Geocoding + Places API | `GOOGLE_MAPS_API_KEY` |
| Enrichissement Clay | Lovable Connector Gateway | Clay Public API | `CLAY_API_KEY` |
| Analytics | Variable nommée Lovable | Google Analytics / Google Ads | `VITE_GOOGLE_ANALYTICS_ID`, `VITE_GOOGLE_ADS_ID`, `VITE_GOOGLE_ADS_CONVERSION_LABEL` |

## Configuration Vercel obligatoire

Les secrets doivent être ajoutés dans Vercel et jamais dans Git.

- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_MAPS_API_KEY`
- `CLAY_API_KEY`

### Search Console

Le compte de service Google doit être autorisé sur la propriété Search Console de PURE SPACE NETT avec le niveau nécessaire à la lecture des données.

Le code utilise le scope :

`https://www.googleapis.com/auth/webmasters.readonly`

Le JSON du compte de service est stocké intégralement dans `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON`.

### E-mail

Resend exige qu'un domaine détenu par l'entreprise soit vérifié avant l'envoi depuis ce domaine. Utiliser de préférence un sous-domaine d'envoi dédié, par exemple `notify.purespacenett.com`.

La valeur de `RESEND_FROM_EMAIL` doit être une adresse autorisée sur le domaine vérifié, par exemple :

`PURE SPACE NETT <noreply@notify.purespacenett.com>`

### Google Maps

Le projet Google Cloud doit avoir les APIs Google Maps nécessaires activées et la clé doit être limitée aux APIs utilisées par le CRM.

### Clay

Le CRM utilise la Public API Clay avec l'en-tête `clay-api-key` et la base `https://api.clay.com/public/v0`.

## Compatibilité

Les mécanismes métier existants sont conservés :

- trois propositions d'e-mails de prospection ;
- qualification automatique des demandes de devis ;
- audit SEO structuré ;
- rapports Search Console globaux et par ville ;
- recherche locale de prospects avec rayon ;
- enrichissement des contacts via Clay ;
- idempotence des e-mails via l'en-tête Resend ;
- rendu React Email HTML + texte.

## Vérification finale

Avant de considérer la migration comme opérationnelle en production :

1. CI verte.
2. Build du site et du CRM.
3. Preview Vercel accessible.
4. Test d'un e-mail transactionnel réel.
5. Test d'une génération de trois e-mails de prospection.
6. Test d'une qualification de devis.
7. Test d'un audit SEO.
8. Test d'une lecture Search Console.
9. Test d'une recherche Google Maps.
10. Test d'un enrichissement Clay.
11. Vérification qu'aucun appel runtime vers `*.lovable.dev` ou package `@lovable.dev/*` ne subsiste.

## Références officielles

- OpenAI : https://platform.openai.com/docs
- Resend : https://resend.com/docs/api-reference/emails/send-email
- Google Search Console API : https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- Google service accounts : https://developers.google.com/identity/protocols/oauth2/service-account
- Google Places API : https://developers.google.com/maps/documentation/places/web-service/text-search
- Google Geocoding API : https://developers.google.com/maps/documentation/geocoding/geocoding
- Clay Public API : https://api.clay.com/public/v0
