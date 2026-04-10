# Recovery API (webhook n8n / intégrations tierces)

Spécification du point d’entrée HTTP pour l’**agent de relance** : portable d’une boutique à l’autre, indépendamment du front (Next.js Tekach ou autre).

## Version du contrat

| Version | Statut | Notes |
|--------|--------|--------|
| `1` | Courante | Corps JSON décrit ci‑dessous. |

- Champ optionnel **`apiVersion`** dans le corps JSON : `"1"`. Si absent, le serveur traite la requête comme **v1**.
- En-tête optionnel **`X-Recovery-Api-Version: 1`** : doit correspondre à la version du corps ; en cas d’écart futur, le serveur pourra refuser (non appliqué en v1).

## Endpoint

- **Méthode :** `POST`
- **URL :** `{BASE_URL}/api/webhooks/n8n`  
  Exemple : `https://votre-domaine.com/api/webhooks/n8n`
- **`BASE_URL`** : origine publique du backend Tekach (variable d’environnement côté n8n : `RECOVERY_API_BASE_URL`).

## Authentification

| En-tête | Obligatoire | Description |
|---------|-------------|-------------|
| `x-n8n-secret` | Oui | Doit égaler `N8N_WEBHOOK_SECRET` côté serveur Tekach. |
| `Content-Type` | Recommandé | `application/json` |

Réponses d’erreur typiques :

- `401` — secret manquant ou invalide.
- `400` — JSON invalide ou corps ne respecte pas le schéma.
- `500` — indisponibilité Firestore Admin, etc.

## Résolution du site (multi-boutiques)

Champ optionnel **`siteId`** : identifiant stable de la boutique ou du tenant (lettres, chiffres, `_`, `-`, 1–64 caractères).

Ordre de résolution si **`siteId` est absent** dans le corps :

1. `defaultSiteId` dans la configuration admin Firestore (`adminConfig/global`).
2. Variable d’environnement serveur **`DEFAULT_SITE_ID`**.
3. Littéral **`default`**.

Tous les enregistrements dans `recoveryLogs` portent le **`siteId`** résolu pour filtrage et reporting.

## Schéma JSON (v1)

Toutes les propriétés sauf `action` sont optionnelles sauf indication contraire selon l’action.

```json
{
  "apiVersion": "1",
  "siteId": "ma-boutique-prod",
  "action": "cart_abandoned",
  "userId": "firebase-uid-or-external-id",
  "cartId": "cart-doc-id",
  "exitStep": "payment",
  "cartTotal": 129.9,
  "contactEmail": "client@example.com",
  "transcript": "…",
  "objectionSummary": "…",
  "promoCode": "SAVE5",
  "channel": "email"
}
```

### `action` (requis)

| Valeur | Rôle |
|--------|------|
| `cart_abandoned` | Crée un log de relance « en attente » avec contexte panier / contact. |
| `recovery_email_sent` | Journalise une relance email (nouvelle entrée de log). |
| `recovery_call_completed` | Journalise un appel vocal terminé (`transcript`, `objectionSummary`, `promoCode` utiles). |
| `mark_recovered` | Met à jour des logs existants pour l’utilisateur (voir ci‑dessous). |

### Champs transverses

| Champ | Type | Description |
|-------|------|-------------|
| `apiVersion` | `"1"` | Version du contrat. |
| `siteId` | string | Tenant / boutique (voir résolution ci‑dessus). |
| `userId` | string | Identifiant client côté boutique. |
| `cartId` | string | Identifiant panier. |
| `exitStep` | string | Dernière étape du tunnel (ex. `shipping`). |
| `cartTotal` | number | Montant panier (€). |
| `contactEmail` | string (email) | Email pour relance. |
| `transcript` | string | Transcription appel. |
| `objectionSummary` | string | Résumé objections. |
| `promoCode` | string | Code promo appliqué côté automation. |
| `channel` | `"email"` \| `"voice"` | Canal (selon action). |

### Réponses succès (extraits)

- `cart_abandoned` : `{ "ok": true, "logId": "<id>" }`
- `mark_recovered` : `{ "ok": true, "updated": <nombre> }` — cible les logs dont `userId` correspond et **`siteId`** correspond au site résolu pour la requête.

## Idempotence

Le webhook **ne garantit pas** l’idempotence stricte : un même abandon peut créer plusieurs logs si appelé plusieurs fois. Pour les intégrations tierces :

- Dédupliquer côté n8n (clé `cartId` + fenêtre temporelle), ou
- Vérifier côté boutique avant renvoi.

## Exemples cURL

### Abandon de panier

```bash
curl -sS -X POST "${RECOVERY_API_BASE_URL}/api/webhooks/n8n" \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: ${N8N_WEBHOOK_SECRET}" \
  -d '{
    "apiVersion": "1",
    "siteId": "woo-client-1",
    "action": "cart_abandoned",
    "cartId": "wc-cart-999",
    "exitStep": "checkout",
    "cartTotal": 89.5,
    "contactEmail": "acheteur@example.com"
  }'
```

### Marquer comme récupéré

```bash
curl -sS -X POST "${RECOVERY_API_BASE_URL}/api/webhooks/n8n" \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: ${N8N_WEBHOOK_SECRET}" \
  -d '{
    "action": "mark_recovered",
    "siteId": "woo-client-1",
    "userId": "user-123"
  }'
```

## Endpoint associé (copie email)

- `POST {BASE_URL}/api/automation/email-copy` — même secret `x-n8n-secret`, corps décrit dans le code ([`app/api/automation/email-copy/route.ts`](../app/api/automation/email-copy/route.ts)).

## RGPD

Le site marchand doit disposer du **consentement** et de la **finalité** pour les relances (email / voix). `contactEmail` et numéros ne doivent être transmis que dans ce cadre.
