import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/config";

const schema = z.object({
  userId: z.string(),
  cartTotalEuros: z.number(),
  objectionType: z.enum(["price", "technical", "shipping", "other"]),
});

const MAX_DISCOUNT_PERCENT = 0.05;
const NEGOTIATION_MIN_CART = 1000;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-voice-secret");
  if (!secret || secret !== process.env.VOICE_DISCOUNT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }
  const { userId, cartTotalEuros, objectionType } = parsed.data;

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore admin indisponible" },
      { status: 500 },
    );
  }

  const cfgSnap = await db.collection("adminConfig").doc("global").get();
  const cfg = cfgSnap.exists
    ? { ...DEFAULT_ADMIN_CONFIG, ...cfgSnap.data() }
    : DEFAULT_ADMIN_CONFIG;

  const minCart = cfg.cartValueForNegotiationEuros ?? NEGOTIATION_MIN_CART;
  const maxPct = Math.min(
    cfg.discountPercentMax ?? MAX_DISCOUNT_PERCENT,
    MAX_DISCOUNT_PERCENT,
  );

  if (objectionType !== "price") {
    return NextResponse.json({
      allowed: false,
      reason: "Négociation tarifaire réservée aux objections prix.",
    });
  }
  if (cartTotalEuros < minCart) {
    return NextResponse.json({
      allowed: false,
      reason: `Panier inférieur à ${minCart} €.`,
    });
  }

  const code = `TEK-${userId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const expiresAt = Date.now() + 1000 * 60 * 60 * 48;

  await db.collection("promoCodes").doc(code).set({
    code,
    percent: maxPct,
    maxUses: 1,
    uses: 0,
    cartMinTotal: minCart,
    expiresAt,
    createdForUserId: userId,
  });

  return NextResponse.json({
    allowed: true,
    promoCode: code,
    percent: maxPct,
    expiresAt,
    message: `Remise exceptionnelle de ${maxPct} % appliquée via code ${code}.`,
  });
}
