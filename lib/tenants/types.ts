/** Document `tenants/{tenantId}` */
export type TenantDoc = {
  name: string;
  createdAt: number;
  status: "active" | "suspended";
  /** @deprecated utiliser la sous-collection publishableKeys — conservé pour affichage */
  primaryPublishableKey?: string;
  /** Aligné sur l’ancien siteId / defaultSiteId recovery */
  defaultSiteId?: string;
  plan?: "mvp" | "pro";
};

/** `publishableKeys/{key}` → résolution rapide tenant */
export type PublishableKeyDoc = {
  tenantId: string;
  createdAt: number;
};

/** `tenants/{tenantId}/events/{eventId}` */
export type TenantEventDoc = {
  type: string;
  payload: Record<string, unknown>;
  sessionId: string;
  source: "sdk" | "demo" | "ingest";
  createdAt: number;
  /** Email issu de identify ou du payload */
  identifiedEmail?: string | null;
  /** UserId métier (e-commerce) si fourni */
  externalUserId?: string | null;
};

/** `tenantMemberships/{firebaseUid}` — accès dashboard marchand */
export type TenantMembershipDoc = {
  tenantId: string;
  email: string;
  role: "owner" | "viewer";
  createdAt: number;
};
