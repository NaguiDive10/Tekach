# Adaptateur de référence : WooCommerce

WooCommerce n’expose pas toujours un « abandon » unique comme Tekach : on combine **hooks WordPress** et/ou un **cron** + requête HTTP vers la Recovery API.

## Option A — Hook `woocommerce_cart_updated` + file d’attente

1. Plugin léger ou `functions.php` : à chaque mise à jour du panier, enregistrer `cart_id`, `email` (si client connecté ou email saisi), `total`, horodatage en transient ou table custom.
2. Tâche cron WordPress (`wp_schedule_event`) toutes les 15–30 min : lister les paniers **sans commande** dont l’âge &gt; N minutes.
3. Pour chaque candidat, `POST` vers `{RECOVERY_API_BASE_URL}/api/webhooks/n8n` avec le corps [documenté](../recovery-api.md), par exemple :

```json
{
  "apiVersion": "1",
  "siteId": "woo-mon-domaine-com",
  "action": "cart_abandoned",
  "cartId": "wc-12345",
  "userId": "wp-user-7",
  "cartTotal": 120.0,
  "contactEmail": "client@example.com",
  "exitStep": "checkout"
}
```

## Option B — Webhook sortant + n8n

1. Utiliser un plugin « webhooks » ou un hook `woocommerce_order_status_*` **uniquement** pour les commandes annulées / abandonnées si votre flux le permet.
2. Le nœud n8n **mappe** le JSON WooCommerce vers le schéma Tekach (même `siteId` pour toute la boutique).

## `siteId` recommandé

Format stable par instance : `woo-{slug-site}` ou `{client}-{env}`, ex. `woo-bijouterie-prod`, pour distinguer plusieurs boutiques dans un même backend Tekach multi-tenant.

## RGPD

Ne transmettre l’email que si la collecte est conforme (case à cocher checkout, compte client, etc.).
