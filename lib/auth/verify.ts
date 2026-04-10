import { getAdminApp } from "@/lib/firebase/admin";
import { parseAdminEmails } from "@/lib/config";

export type VerifiedUser = {
  uid: string;
  email: string | undefined;
  isAnonymous: boolean;
};

export async function verifyIdToken(
  authHeader: string | null,
): Promise<VerifiedUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const app = getAdminApp();
  if (!app) return null;
  try {
    const decoded = await app.auth().verifyIdToken(token);
    const firebaseMeta = decoded.firebase as
      | { sign_in_provider?: string }
      | undefined;
    const isAnonymous = firebaseMeta?.sign_in_provider === "anonymous";
    return {
      uid: decoded.uid,
      email: decoded.email,
      isAnonymous,
    };
  } catch {
    return null;
  }
}

/** Compte utilisable pour commande et relances (email connu, non anonyme). */
export function isRegisteredShopUser(user: VerifiedUser): boolean {
  return !user.isAnonymous && Boolean(user.email);
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const admins = parseAdminEmails();
  return admins.includes(email.toLowerCase());
}
