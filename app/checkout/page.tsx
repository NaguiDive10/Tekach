"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTracking } from "@/hooks/useTracking";
import { useIdToken } from "@/hooks/useIdToken";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    contact,
    setContactField,
    consent,
    setConsent,
    promoCode,
    setPromoCode,
    clear,
  } = useCart();
  const { user, firebaseReady, signInGoogle } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);
  const { track } = useTracking();
  const { getToken } = useIdToken();
  const [step, setStep] = useState<"contact" | "consent" | "pay">("contact");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const payRef = useRef(false);

  useEffect(() => {
    if (!user?.email) return;
    void track("checkout_start", { itemCount: items.length });
  }, [items.length, track, user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    void track("checkout_step", { step });
  }, [step, track, user?.email]);

  useEffect(() => {
    const onLeave = () => {
      if (!user?.email) return;
      if (step === "pay" && !payRef.current) {
        void track("checkout_abandon", { step: "payment" });
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [step, track, user?.email]);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-stone-600">
        <p>Panier vide.</p>
        <Link href="/shop" className="mt-4 inline-block text-stone-900 underline">
          Boutique
        </Link>
      </div>
    );
  }

  const submitOrder = async () => {
    setError(null);
    if (!consent?.privacyAccepted || !consent.marketingAndCalls) {
      setError("Veuillez accepter les cases obligatoires.");
      return;
    }
    const token = await getToken();
    if (!token) {
      setError("Authentification requise.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          contactEmail: contact.email,
          contactPhone: contact.phone,
          promoCode: promoCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur commande");
      payRef.current = true;
      const db = getClientDb();
      if (db && user) {
        await setDoc(
          doc(db, "userConsents", user.uid),
          {
            privacyAccepted: consent.privacyAccepted,
            marketingAndCalls: consent.marketingAndCalls,
            recordedAt: consent.recordedAt,
            email: contact.email,
            lastOrderId: data.order?.id,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      }
      clear();
      window.location.href = `/account?ordered=${encodeURIComponent(data.order?.id ?? "")}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const accountRequired = !user?.email;

  if (accountRequired) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-semibold text-[#0f1111]">Commander</h1>
        <p className="text-sm text-stone-600">
          Votre panier est conservé. Pour valider la commande et être relancé
          (emails / appels) avec votre accord, connectez-vous ou créez un
          compte.
        </p>
        <div className="rounded-md border border-stone-200 bg-white p-6 shadow-sm">
          {firebaseReady ? (
            <>
              <button
                type="button"
                disabled={googleBusy}
                onClick={async () => {
                  setGoogleBusy(true);
                  try {
                    await signInGoogle();
                  } finally {
                    setGoogleBusy(false);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-stone-300 bg-white py-2.5 text-sm font-medium shadow-sm hover:bg-stone-50 disabled:opacity-50"
              >
                Continuer avec Google
              </button>
              <p className="mt-4 text-center text-xs text-stone-500">
                ou
              </p>
              <Link
                href="/account?next=/checkout"
                className="mt-4 flex w-full justify-center rounded-md bg-[#ffd814] py-2.5 text-sm font-medium text-[#0f1111] hover:bg-[#f7ca00]"
              >
                Email / créer un compte
              </Link>
            </>
          ) : (
            <p className="text-sm text-amber-800">
              Activez Firebase pour vous connecter.{" "}
              <Link href="/account" className="underline">
                Page de connexion
              </Link>
            </p>
          )}
        </div>
        <Link
          href="/cart"
          className="inline-block text-sm text-[#c45500] hover:underline"
        >
          ← Retour au panier
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-[#0f1111]">Commander</h1>
      <p className="mt-2 text-xs text-stone-500">
        Sous-total : {subtotal.toFixed(2)} € — email et téléphone pour la
        livraison ; relances uniquement avec votre consentement (compte requis).
      </p>

      <div className="mt-8 flex gap-2 text-xs">
        {(["contact", "consent", "pay"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`rounded-full px-3 py-1 ${
              step === s
                ? "bg-stone-900 text-white"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {s === "contact"
              ? "Contact"
              : s === "consent"
                ? "Consentement"
                : "Paiement"}
          </button>
        ))}
      </div>

      {step === "contact" && (
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs text-stone-500">Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContactField("email", e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs text-stone-500">Téléphone</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContactField("phone", e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm"
              autoComplete="tel"
            />
          </div>
          <p className="text-[11px] leading-relaxed text-stone-500">
            Synchronisés sur votre compte (Firestore) pour le suivi de commande ;
            les relances marketing ne concernent que les clients connectés ayant
            accepté les cases à l’étape suivante.
          </p>
          <button
            type="button"
            onClick={() => setStep("consent")}
            className="w-full rounded-full bg-stone-900 py-3 text-sm text-white"
          >
            Continuer
          </button>
        </div>
      )}

      {step === "consent" && (
        <div className="mt-8 space-y-4 text-sm">
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={privacy}
              onChange={(e) => setPrivacy(e.target.checked)}
            />
            <span className="text-stone-600">
              J’accepte la{" "}
              <Link href="/legal/confidentialite" className="underline">
                politique de confidentialité
              </Link>{" "}
              et le traitement de mes données pour la commande (obligatoire).
            </span>
          </label>
          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span className="text-stone-600">
              J’accepte d’être relancé par email et/ou appel téléphonique
              automatisé à propos de mon panier (obligatoire pour les relances
              Tekach).
            </span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (!privacy || !marketing) {
                setError("Les deux cases sont requises pour continuer.");
                return;
              }
              setError(null);
              setConsent({
                privacyAccepted: privacy,
                marketingAndCalls: marketing,
                recordedAt: Date.now(),
              });
              setStep("pay");
            }}
            className="w-full rounded-full bg-stone-900 py-3 text-sm text-white"
          >
            Valider et payer
          </button>
        </div>
      )}

      {step === "pay" && (
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs text-stone-500">Code promo (optionnel)</label>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm uppercase"
            />
          </div>
          <p className="text-xs text-stone-500">
            Paiement démo : aucune carte requise. La commande est enregistrée
            comme payée et une facture PDF est générée si Storage est configuré.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={busy || !firebaseReady}
            onClick={() => void submitOrder()}
            className="w-full rounded-full bg-stone-900 py-3 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Traitement…" : "Confirmer et générer la facture"}
          </button>
        </div>
      )}
    </div>
  );
}
