import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { verifyIdToken, isRegisteredShopUser } from "@/lib/auth/verify";
import { getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { fetchCatalog, unitPriceForVariant } from "@/lib/catalog";
import { buildInvoicePdfBuffer } from "@/lib/invoice-pdf";
import type { CartLine, Order } from "@/lib/types";

const lineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
});

const postSchema = z.object({
  items: z.array(lineSchema).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  promoCode: z.string().optional(),
});

async function resolvePromo(
  code: string | undefined,
  userId: string,
  subtotalBefore: number,
): Promise<{ percent: number; valid: boolean }> {
  if (!code) return { percent: 0, valid: true };
  const db = getAdminDb();
  if (!db) return { percent: 0, valid: false };
  const snap = await db.collection("promoCodes").doc(code.toUpperCase()).get();
  if (!snap.exists) return { percent: 0, valid: false };
  const d = snap.data()!;
  if (d.expiresAt < Date.now()) return { percent: 0, valid: false };
  if (d.uses >= d.maxUses) return { percent: 0, valid: false };
  if (subtotalBefore < (d.cartMinTotal ?? 0)) return { percent: 0, valid: false };
  if (d.createdForUserId && d.createdForUserId !== userId)
    return { percent: 0, valid: false };
  const pct = Number(d.percent) || 0;
  if (pct > 0.05) return { percent: 0, valid: false };
  return { percent: pct, valid: true };
}

export async function POST(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!isRegisteredShopUser(user)) {
    return NextResponse.json(
      {
        error:
          "Créez un compte ou connectez-vous (email ou Google) pour valider votre commande.",
      },
      { status: 403 },
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const { categories, products } = await fetchCatalog();
  void categories;
  const lines: CartLine[] = [];
  let subtotal = 0;
  for (const raw of parsed.data.items) {
    const p = products.find((x) => x.id === raw.productId);
    if (!p) {
      return NextResponse.json(
        { error: `Produit inconnu ${raw.productId}` },
        { status: 400 },
      );
    }
    const v = p.variants.find((x) => x.id === raw.variantId);
    if (!v) {
      return NextResponse.json({ error: "Variante invalide" }, { status: 400 });
    }
    const unit = unitPriceForVariant(p, raw.variantId);
    const title = `${p.name} — ${v.label}`;
    lines.push({
      productId: p.id,
      variantId: raw.variantId,
      quantity: raw.quantity,
      title,
      unitPrice: unit,
    });
    subtotal += unit * raw.quantity;
  }

  const promo = await resolvePromo(
    parsed.data.promoCode,
    user.uid,
    subtotal,
  );
  if (parsed.data.promoCode && !promo.valid) {
    return NextResponse.json({ error: "Code promo invalide" }, { status: 400 });
  }
  const discount = Math.round(subtotal * (promo.percent / 100) * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;

  const orderId = `ord_${Date.now()}_${user.uid.slice(0, 6)}`;
  const order: Order = {
    id: orderId,
    userId: user.uid,
    items: lines,
    subtotal,
    discount,
    total,
    status: "paid",
    contactEmail: parsed.data.contactEmail,
    contactPhone: parsed.data.contactPhone,
    shippingAddress: parsed.data.shippingAddress,
    createdAt: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    await db
      .collection("orders")
      .doc(orderId)
      .set({
        userId: order.userId,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        status: order.status,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone ?? null,
        shippingAddress: order.shippingAddress ?? null,
        createdAt: order.createdAt,
      });

    if (parsed.data.promoCode && promo.valid) {
      const ref = db
        .collection("promoCodes")
        .doc(parsed.data.promoCode.toUpperCase());
      await ref.update({ uses: FieldValue.increment(1) });
    }
  }

  let invoiceUrl: string | undefined;
  try {
    const buffer = await buildInvoicePdfBuffer(order, orderId);
    const storage = getAdminStorage();
    const bucketName =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`;
    if (storage && bucketName) {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`invoices/${orderId}.pdf`);
      await file.save(buffer, { contentType: "application/pdf" });
      const [signed] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
      });
      invoiceUrl = signed;
      if (db) {
        await db.collection("orders").doc(orderId).update({ invoiceUrl: signed });
      }
    }
  } catch {
    /* PDF ou Storage optionnel en dev */
  }

  return NextResponse.json({ order: { ...order, invoiceUrl } });
}

export async function GET(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ orders: [] });
  }
  const snap = await db
    .collection("orders")
    .where("userId", "==", user.uid)
    .limit(50)
    .get();
  const orders = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort(
      (a, b) =>
        ((b as { createdAt?: number }).createdAt ?? 0) -
        ((a as { createdAt?: number }).createdAt ?? 0),
    );
  return NextResponse.json({ orders });
}
