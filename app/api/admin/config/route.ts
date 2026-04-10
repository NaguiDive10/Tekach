import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyIdToken, isAdminEmail } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/config";

const patchSchema = z.object({
  recoveryMode: z.enum(["email", "voice"]).optional(),
  voiceCartMinEuros: z.number().positive().optional(),
  callDelayMinutes: z.number().positive().optional(),
  discountPercentMax: z.number().max(0.05).optional(),
  cartValueForNegotiationEuros: z.number().positive().optional(),
  defaultSiteId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});

export async function GET(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ config: DEFAULT_ADMIN_CONFIG });
  }
  const snap = await db.collection("adminConfig").doc("global").get();
  if (!snap.exists) {
    return NextResponse.json({ config: DEFAULT_ADMIN_CONFIG });
  }
  return NextResponse.json({
    config: { ...DEFAULT_ADMIN_CONFIG, ...snap.data() },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Admin Firebase requis" },
      { status: 500 },
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }
  await db
    .collection("adminConfig")
    .doc("global")
    .set(parsed.data, { merge: true });
  const snap = await db.collection("adminConfig").doc("global").get();
  return NextResponse.json({
    config: { ...DEFAULT_ADMIN_CONFIG, ...snap.data() },
  });
}
