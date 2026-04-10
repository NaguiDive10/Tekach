"use client";

import { useAuth } from "@/contexts/AuthContext";

export function FirebaseNotice() {
  const { firebaseReady, loading } = useAuth();
  if (loading || firebaseReady) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      Firebase n’est pas configuré : copiez{" "}
      <code className="rounded bg-amber-100 px-1">.env.example</code> vers{" "}
      <code className="rounded bg-amber-100 px-1">.env.local</code> avec vos clés
      pour activer la connexion, le panier synchronisé et le tracking.
    </div>
  );
}
