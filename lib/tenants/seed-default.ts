import { DEFAULT_TENANT_ID } from "@/lib/tenants/constants";
import type { PublishableKeyDoc, TenantDoc } from "@/lib/tenants/types";

/** Clé publique par défaut (seed + .env client). */
export function getDemoPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_TEKACH_PUBLISHABLE_KEY?.trim() ||
    "pk_tekach_demo_local"
  );
}

export function buildDefaultTenantDocs(): {
  tenantId: string;
  tenant: TenantDoc;
  publishableKey: string;
  keyDoc: PublishableKeyDoc;
} {
  const publishableKey = getDemoPublishableKey();
  const now = Date.now();
  return {
    tenantId: DEFAULT_TENANT_ID,
    publishableKey,
    tenant: {
      name: "Boutique démo Tekach",
      createdAt: now,
      status: "active",
      primaryPublishableKey: publishableKey,
      defaultSiteId: "default",
      plan: "mvp",
    },
    keyDoc: {
      tenantId: DEFAULT_TENANT_ID,
      createdAt: now,
    },
  };
}
