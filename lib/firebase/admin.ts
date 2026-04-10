import * as admin from "firebase-admin";

let cached: admin.app.App | null = null;

export function getAdminApp(): admin.app.App | null {
  if (cached) return cached;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const json = JSON.parse(raw) as admin.ServiceAccount;
    cached = admin.initializeApp({
      credential: admin.credential.cert(json),
    });
    return cached;
  } catch {
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.firestore();
}

export function getAdminStorage(): admin.storage.Storage | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.storage();
}
