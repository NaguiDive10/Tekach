# Adaptateur HTTP générique

Pour toute boutique capable d’émettre une requête **`POST` HTTPS** (cron serveur, worker, Zapier, Make, script PHP, etc.).

## Principe

1. Déclencher l’appel lorsque votre règle métier « panier abandonné » est vraie (délai d’inactivité, webhook panier, etc.).
2. Construire un JSON conforme à [Recovery API](../recovery-api.md) avec au minimum :
   - `action`: `cart_abandoned`
   - `siteId`: identifiant unique **stable** pour cette boutique (ex. `client-acme-prod`)
   - `contactEmail` (si relance email) ou données prévues par votre flux
   - `cartId` / `cartTotal` / `exitStep` selon disponibilité
3. Envoyer les en-têtes `Content-Type: application/json` et `x-n8n-secret`.

## Exemple Node (fetch)

```javascript
const BASE = process.env.RECOVERY_API_BASE_URL;
const SECRET = process.env.N8N_WEBHOOK_SECRET;

await fetch(`${BASE}/api/webhooks/n8n`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-n8n-secret": SECRET,
  },
  body: JSON.stringify({
    apiVersion: "1",
    siteId: "mon-site",
    action: "cart_abandoned",
    cartId: "panier-001",
    cartTotal: 49.99,
    contactEmail: "client@example.com",
    exitStep: "payment",
  }),
});
```

## Bonnes pratiques

- Stocker `RECOVERY_API_BASE_URL` et le secret dans des **secrets** d’environnement, jamais en clair dans le dépôt front.
- Utiliser le même `siteId` pour tous les appels d’une même boutique afin de filtrer les logs dans l’admin Tekach.
