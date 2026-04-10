"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useIdToken } from "@/hooks/useIdToken";

type OrderRow = {
  id: string;
  total?: number;
  status?: string;
  createdAt?: number;
  invoiceUrl?: string;
};

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function AccountInner() {
  const router = useRouter();
  const {
    user,
    firebaseReady,
    signInEmail,
    signUpEmail,
    signInGoogle,
    signOut,
    loading,
  } = useAuth();
  const { getToken } = useIdToken();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const searchParams = useSearchParams();
  const ordered = searchParams.get("ordered");
  const nextRaw = searchParams.get("next");
  const nextPath = safeNextPath(nextRaw);

  useEffect(() => {
    if (!user?.email || !nextPath) return;
    router.replace(nextPath);
  }, [user?.email, nextPath, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!cancelled && data.orders) setOrders(data.orders);
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, ordered, user?.uid]);

  if (loading) {
    return <p className="text-sm text-stone-600">Chargement…</p>;
  }

  const loggedIn = Boolean(user?.email);

  return (
    <div className="space-y-10">
      {ordered && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Commande enregistrée : <strong>{ordered}</strong>. La facture PDF
          apparaît ci-dessous lorsqu’elle est disponible.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-[#0f1111]">
          {loggedIn ? "Mon compte" : "Se connecter"}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
          {loggedIn
            ? "Vos commandes et factures sont liées à ce compte."
            : "Ajoutez des articles au panier sans compte. Pour payer et être relancé (emails / appels conformes à votre consentement), créez un compte ou connectez-vous avec Google ou email."}
        </p>
      </div>

      {!loggedIn && firebaseReady && (
        <div className="max-w-md space-y-6 rounded-md border border-stone-200 bg-white p-6 shadow-sm">
          {nextPath ? (
            <p className="text-xs text-stone-500">
              Après connexion, vous serez redirigé vers{" "}
              <span className="font-medium text-stone-700">{nextPath}</span>.
            </p>
          ) : null}

          <button
            type="button"
            disabled={googleBusy}
            onClick={async () => {
              setAuthError(null);
              setGoogleBusy(true);
              try {
                await signInGoogle();
              } catch (e) {
                setAuthError(
                  e instanceof Error ? e.message : "Connexion Google impossible",
                );
              } finally {
                setGoogleBusy(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-stone-300 bg-white py-2.5 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-50"
          >
            <span className="text-lg" aria-hidden>
              G
            </span>
            {googleBusy ? "Connexion…" : "Continuer avec Google"}
          </button>

          <div className="relative text-center text-xs text-stone-400">
            <span className="relative z-10 bg-white px-2">ou par email</span>
            <span className="absolute left-0 right-0 top-1/2 z-0 h-px bg-stone-200" />
          </div>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError(null);
              try {
                if (mode === "signin") await signInEmail(email, password);
                else await signUpEmail(email, password);
              } catch (err) {
                setAuthError(
                  err instanceof Error ? err.message : "Échec de l’authentification",
                );
              }
            }}
          >
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                className={
                  mode === "signin"
                    ? "font-semibold text-[#c45500]"
                    : "text-stone-500"
                }
                onClick={() => setMode("signin")}
              >
                Déjà client
              </button>
              <button
                type="button"
                className={
                  mode === "signup"
                    ? "font-semibold text-[#c45500]"
                    : "text-stone-500"
                }
                onClick={() => setMode("signup")}
              >
                Créer un compte
              </button>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-inner outline-none focus:border-[#febd69]"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm shadow-inner outline-none focus:border-[#febd69]"
            />
            {authError ? (
              <p className="text-xs text-red-600">{authError}</p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-md bg-[#ffd814] py-2.5 text-sm font-medium text-[#0f1111] shadow-sm hover:bg-[#f7ca00]"
            >
              {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
        </div>
      )}

      {!firebaseReady && !loggedIn && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Configurez Firebase (dont la méthode Google dans la console) pour activer
          la connexion. En attendant, le panier fonctionne sur cet appareil via le
          stockage local.
        </div>
      )}

      {loggedIn && user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm">
          <span className="text-stone-700">{user.email}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[#c45500] hover:underline"
          >
            Déconnexion
          </button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-[#0f1111]">Vos commandes</h2>
        {!loggedIn ? (
          <p className="mt-3 text-sm text-stone-500">
            Connectez-vous pour voir l’historique et télécharger vos factures.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-200 rounded-md border border-stone-200 bg-white shadow-sm">
            {orders.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-stone-500">
                Aucune commande pour le moment.
              </li>
            )}
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm"
              >
                <div>
                  <p className="font-medium text-stone-900">{o.id}</p>
                  <p className="text-xs text-stone-500">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString("fr-FR")
                      : ""}{" "}
                    · {o.status}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {(o.total ?? 0).toFixed(2)} €
                  </span>
                  {o.invoiceUrl ? (
                    <a
                      href={o.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-stone-300 bg-stone-50 px-3 py-1 text-xs hover:bg-stone-100"
                    >
                      Facture PDF
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-stone-500">
        <Link href="/shop" className="text-[#c45500] hover:underline">
          Continuer vos achats
        </Link>
      </p>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="text-sm text-stone-600">Chargement…</p>}>
      <AccountInner />
    </Suspense>
  );
}
