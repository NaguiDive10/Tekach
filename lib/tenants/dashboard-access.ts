import type { VerifiedUser } from "@/lib/auth/verify";
import { isAdminEmail } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_TENANT_ID } from "@/lib/tenants/constants";
import { getMembershipTenantId } from "@/lib/tenants/resolve";

/**
 * Résout le tenant accessible depuis le dashboard marchand.
 * — Adresses `ADMIN_EMAILS` : accès au tenant par défaut (démo / plateforme).
 * — Sinon : document `tenantMemberships/{uid}`.
 */
export async function resolveDashboardTenantId(
  user: VerifiedUser,
): Promise<string | null> {
  const db = getAdminDb();
  if (user.email && isAdminEmail(user.email)) {
    return DEFAULT_TENANT_ID;
  }
  if (!db) {
    return process.env.NODE_ENV === "development" ? DEFAULT_TENANT_ID : null;
  }
  const fromMember = await getMembershipTenantId(db, user.uid);
  return fromMember;
}
