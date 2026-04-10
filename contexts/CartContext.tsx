"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { CartLine, CartConsent, CartContact } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

const GUEST_STORAGE_KEY = "tekach_cart_guest";

type CartContextValue = {
  items: CartLine[];
  contact: CartContact;
  consent: CartConsent | null;
  promoCode: string;
  setPromoCode: (c: string) => void;
  addLine: (line: CartLine) => void;
  removeLine: (productId: string, variantId: string) => void;
  setQuantity: (productId: string, variantId: string, quantity: number) => void;
  clear: () => void;
  setContactField: (field: keyof CartContact, value: string) => void;
  setConsent: (c: CartConsent) => void;
  subtotal: number;
  syncing: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptyContact: CartContact = { email: "", phone: "" };

function mergeCartLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  const key = (l: CartLine) => `${l.productId}|${l.variantId}`;
  for (const l of a) map.set(key(l), { ...l });
  for (const l of b) {
    const k = key(l);
    const ex = map.get(k);
    if (ex) map.set(k, { ...ex, quantity: ex.quantity + l.quantity });
    else map.set(k, { ...l });
  }
  return Array.from(map.values());
}

function readGuestBlob(): {
  items?: CartLine[];
  contact?: CartContact;
  consent?: CartConsent | null;
  promoCode?: string;
} | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      items?: CartLine[];
      contact?: CartContact;
      consent?: CartConsent | null;
      promoCode?: string;
    };
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [contact, setContact] = useState<CartContact>(emptyContact);
  const [consent, setConsentState] = useState<CartConsent | null>(null);
  const [promoCode, setPromoCodeState] = useState("");
  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextRemoteRef = useRef(false);
  const guestMergedRef = useRef(false);
  const prevUidRef = useRef<string | null>(null);
  const cartSnapRef = useRef({
    items: [] as CartLine[],
    contact: emptyContact,
    consent: null as CartConsent | null,
    promoCode: "",
  });

  const uid = user?.uid ?? null;

  cartSnapRef.current = { items, contact, consent, promoCode };

  const persistGuest = useCallback(
    (next: {
      items?: CartLine[];
      contact?: CartContact;
      consent?: CartConsent | null;
      promoCode?: string;
    }) => {
      if (typeof window === "undefined") return;
      const prev = readGuestBlob() ?? {};
      const merged = { ...prev, ...next };
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(merged));
    },
    [],
  );

  const persistUserLocal = useCallback(
    (next: {
      items?: CartLine[];
      contact?: CartContact;
      consent?: CartConsent | null;
      promoCode?: string;
    }) => {
      if (typeof window === "undefined" || !uid) return;
      const key = `tekach_cart_${uid}`;
      const raw = window.localStorage.getItem(key);
      const base = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const merged = { ...base, ...next, uid };
      window.localStorage.setItem(key, JSON.stringify(merged));
    },
    [uid],
  );

  const pushFirestore = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!uid) return;
      const db = getClientDb();
      if (!db) return;
      setSyncing(true);
      try {
        skipNextRemoteRef.current = true;
        const ref = doc(db, "carts", uid);
        const snap = await getDoc(ref);
        const prev = snap.exists() ? snap.data() : {};
        await setDoc(
          ref,
          {
            ...prev,
            userId: uid,
            ...patch,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      } finally {
        setSyncing(false);
      }
    },
    [uid],
  );

  useEffect(() => {
    if (!user) guestMergedRef.current = false;
  }, [user]);

  useEffect(() => {
    const hadUid = prevUidRef.current;
    prevUidRef.current = uid;
    if (hadUid && !uid) {
      const s = cartSnapRef.current;
      persistGuest({
        items: s.items,
        contact: s.contact,
        consent: s.consent,
        promoCode: s.promoCode,
      });
    }
  }, [uid, persistGuest]);

  useEffect(() => {
    if (authLoading) return;
    if (user) return;
    const p = readGuestBlob();
    if (!p) return;
    if (p.items) setItems(p.items);
    if (p.contact) setContact({ ...emptyContact, ...p.contact });
    if (p.consent) setConsentState(p.consent);
    if (typeof p.promoCode === "string") setPromoCodeState(p.promoCode);
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || !uid) return;
    const db = getClientDb();
    const guestPayload = readGuestBlob();

    if (!db) {
      const key = `tekach_cart_${uid}`;
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      let baseItems: CartLine[] = [];
      let baseContact = emptyContact;
      let baseConsent: CartConsent | null = null;
      let basePromo = "";
      if (raw) {
        try {
          const p = JSON.parse(raw) as {
            items?: CartLine[];
            contact?: CartContact;
            consent?: CartConsent | null;
            promoCode?: string;
          };
          if (p.items) baseItems = p.items;
          if (p.contact) baseContact = { ...emptyContact, ...p.contact };
          if (p.consent) baseConsent = p.consent;
          if (typeof p.promoCode === "string") basePromo = p.promoCode;
        } catch {
          /* ignore */
        }
      }
      const hasGuest =
        guestPayload &&
        (guestPayload.items?.length ||
          guestPayload.contact?.email ||
          guestPayload.contact?.phone ||
          guestPayload.consent ||
          guestPayload.promoCode);
      if (hasGuest && !guestMergedRef.current) {
        guestMergedRef.current = true;
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(GUEST_STORAGE_KEY);
        }
      }
      if (guestPayload?.items?.length) {
        baseItems = mergeCartLines(baseItems, guestPayload.items);
      }
      if (guestPayload?.contact?.email || guestPayload?.contact?.phone) {
        baseContact = {
          ...baseContact,
          ...guestPayload.contact,
        };
      }
      if (guestPayload?.consent) baseConsent = guestPayload.consent;
      if (guestPayload?.promoCode) basePromo = guestPayload.promoCode;
      setItems(baseItems);
      setContact(baseContact);
      setConsentState(baseConsent);
      setPromoCodeState(basePromo);
      return;
    }

    const ref = doc(db, "carts", uid);
    const unsub: Unsubscribe = onSnapshot(ref, (snap) => {
      if (skipNextRemoteRef.current) {
        skipNextRemoteRef.current = false;
        return;
      }
      let nextItems: CartLine[] = [];
      let nextContact = emptyContact;
      let nextConsent: CartConsent | null = null;
      let nextPromo = "";

      if (snap.exists()) {
        const d = snap.data();
        if (d.items) nextItems = d.items as CartLine[];
        if (d.contact)
          nextContact = { ...emptyContact, ...(d.contact as CartContact) };
        if (d.consent) nextConsent = d.consent as CartConsent;
        if (typeof d.promoCode === "string") nextPromo = d.promoCode;
      } else {
        const key = `tekach_cart_${uid}`;
        const raw =
          typeof window !== "undefined"
            ? window.localStorage.getItem(key)
            : null;
        if (raw) {
          try {
            const p = JSON.parse(raw) as { items?: CartLine[] };
            if (p.items?.length) nextItems = p.items;
          } catch {
            /* ignore */
          }
        }
      }

      const g = guestPayload;
      if (
        g &&
        (g.items?.length ||
          g.contact?.email ||
          g.contact?.phone ||
          g.consent ||
          g.promoCode) &&
        !guestMergedRef.current
      ) {
        guestMergedRef.current = true;
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(GUEST_STORAGE_KEY);
        }
        if (g.items?.length) nextItems = mergeCartLines(nextItems, g.items);
        if (g.contact?.email || g.contact?.phone) {
          nextContact = { ...nextContact, ...g.contact };
        }
        if (g.consent) nextConsent = g.consent;
        if (g.promoCode) nextPromo = g.promoCode;
        skipNextRemoteRef.current = true;
        void setDoc(
          ref,
          {
            userId: uid,
            items: nextItems,
            contact: nextContact,
            consent: nextConsent,
            promoCode: nextPromo,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      }

      setItems(nextItems);
      setContact(nextContact);
      setConsentState(nextConsent);
      setPromoCodeState(nextPromo);
    });
    return () => unsub();
  }, [uid, authLoading]);

  const scheduleContactSync = useCallback(
    (nextContact: CartContact) => {
      if (user) {
        persistUserLocal({ contact: nextContact });
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          void pushFirestore({ contact: nextContact });
        }, 450);
      } else {
        persistGuest({ contact: nextContact });
      }
    },
    [user, persistUserLocal, persistGuest, pushFirestore],
  );

  const setContactField = useCallback(
    (field: keyof CartContact, value: string) => {
      setContact((c) => {
        const next = { ...c, [field]: value };
        scheduleContactSync(next);
        return next;
      });
    },
    [scheduleContactSync],
  );

  const setConsent = useCallback(
    (c: CartConsent) => {
      setConsentState(c);
      if (user) {
        persistUserLocal({ consent: c });
        void pushFirestore({ consent: c });
      } else {
        persistGuest({ consent: c });
      }
    },
    [user, persistUserLocal, persistGuest, pushFirestore],
  );

  const addLine = useCallback(
    (line: CartLine) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (x) => x.productId === line.productId && x.variantId === line.variantId,
        );
        let next: CartLine[];
        if (idx >= 0) {
          next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + line.quantity,
          };
        } else {
          next = [...prev, line];
        }
        if (user) {
          persistUserLocal({ items: next });
          void pushFirestore({ items: next });
        } else {
          persistGuest({ items: next });
        }
        return next;
      });
    },
    [user, persistUserLocal, persistGuest, pushFirestore],
  );

  const removeLine = useCallback(
    (productId: string, variantId: string) => {
      setItems((prev) => {
        const next = prev.filter(
          (x) => !(x.productId === productId && x.variantId === variantId),
        );
        if (user) {
          persistUserLocal({ items: next });
          void pushFirestore({ items: next });
        } else {
          persistGuest({ items: next });
        }
        return next;
      });
    },
    [user, persistUserLocal, persistGuest, pushFirestore],
  );

  const setQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      setItems((prev) => {
        const next =
          quantity <= 0
            ? prev.filter(
                (x) =>
                  !(x.productId === productId && x.variantId === variantId),
              )
            : prev.map((x) =>
                x.productId === productId && x.variantId === variantId
                  ? { ...x, quantity }
                  : x,
              );
        if (user) {
          persistUserLocal({ items: next });
          void pushFirestore({ items: next });
        } else {
          persistGuest({ items: next });
        }
        return next;
      });
    },
    [user, persistUserLocal, persistGuest, pushFirestore],
  );

  const clear = useCallback(() => {
    setItems([]);
    setPromoCodeState("");
    if (user) {
      persistUserLocal({ items: [], promoCode: "" });
      void pushFirestore({ items: [], promoCode: "" });
    } else {
      persistGuest({ items: [], promoCode: "" });
    }
  }, [user, persistUserLocal, persistGuest, pushFirestore]);

  const subtotal = useMemo(
    () => items.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [items],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setPromoCode = useCallback(
    (c: string) => {
      setPromoCodeState(c);
      if (user) {
        persistUserLocal({ promoCode: c });
        void pushFirestore({ promoCode: c });
      } else {
        persistGuest({ promoCode: c });
      }
    },
    [user, persistUserLocal, persistGuest, pushFirestore],
  );

  const value = useMemo(
    () => ({
      items,
      contact,
      consent,
      promoCode,
      setPromoCode,
      addLine,
      removeLine,
      setQuantity,
      clear,
      setContactField,
      setConsent,
      subtotal,
      syncing,
    }),
    [
      items,
      contact,
      consent,
      promoCode,
      setPromoCode,
      addLine,
      removeLine,
      setQuantity,
      clear,
      setContactField,
      setConsent,
      subtotal,
      syncing,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart dans CartProvider");
  return ctx;
}
