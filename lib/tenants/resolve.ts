import type { Firestore } from "firebase-admin/firestore";
import { DEFAULT_TENANT_ID } from "@/lib/tenants/constants";
import { getDemoPublishableKey } from "@/lib/tenants/seed-default";
import type { TenantDoc } from "@/lib/tenants/types";

export async function resolveTenantIdByPublishableKey(
  db: Firestore,
  publishableKey: string,
): Promise<string | null> {
  const trimmed = publishableKey.trim();
  if (!trimmed) return null;
  const keyRef = db.collection("publishableKeys").doc(trimmed);
  const snap = await keyRef.get();
  if (!snap.exists) {
    if (
      process.env.NODE_ENV === "development" &&
      trimmed === getDemoPublishableKey()
    ) {
      return DEFAULT_TENANT_ID;
    }
    return null;
  }
  const data = snap.data() as { tenantId?: string } | undefined;
  return typeof data?.tenantId === "string" ? data.tenantId : null;
}

export async function getTenant(
  db: Firestore,
  tenantId: string,
): Promise<TenantDoc | null> {
  const snap = await db.collection("tenants").doc(tenantId).get();
  if (!snap.exists) {
    if (
      process.env.NODE_ENV === "development" &&
      tenantId === DEFAULT_TENANT_ID
    ) {
      return {
        name: "Dev (sans seed)",
        createdAt: Date.now(),
        status: "active",
        defaultSiteId: "default",
        plan: "mvp",
      };
    }
    return null;
  }
  return snap.data() as TenantDoc;
}

export async function getMembershipTenantId(
  db: Firestore,
  firebaseUid: string,
): Promise<string | null> {
  const snap = await db
    .collection("tenantMemberships")
    .doc(firebaseUid)
    .get();
  if (!snap.exists) return null;
  const data = snap.data() as { tenantId?: string } | undefined;
  return typeof data?.tenantId === "string" ? data.tenantId : null;
}
