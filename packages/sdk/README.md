# @tekach/sdk

SDK navigateur Tekach (tracking + identification) vers `POST /api/v1/ingest`.

## Installation par script

Déployez `public/sdk/v1.js` (généré par `npm run build:sdk`) sur votre CDN ou domaine Tekach.

```html
<script src="https://votre-domaine.com/sdk/v1.js" async></script>
<script>
  window.addEventListener("load", function () {
    if (!window.tekach) return;
    tekach.init({
      publishableKey: "VOTRE_PK",
    });
    tekach.track("page_view", { path: location.pathname });
  });
</script>
```

## API

- `tekach.init({ publishableKey, endpoint? })` — `endpoint` par défaut : même origine + `/api/v1/ingest`.
- `tekach.track(type, payload?)` — envoie un ou plusieurs événements (batch interne une requête par appel).
- `tekach.identify({ email?, userId? })` — associe la session à un contact.

Événements courants : `page_view`, `product_view`, `add_to_cart`, `checkout_start`, `checkout_step`, `checkout_abandon`. Le type `view_product` est normalisé en `product_view` côté serveur.

## Monorepo

Import dans l’app Next.js :

```ts
import { init, track, identify } from "@tekach/sdk";
```

Variable d’environnement : `NEXT_PUBLIC_TEKACH_PUBLISHABLE_KEY` (clé publique du tenant, ex. `pk_tekach_demo_local` après seed).
