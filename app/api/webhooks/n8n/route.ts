import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Firestore } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_ADMIN_CONFIG } from "@/lib/config";
import { resolveRecoverySiteId } from "@/lib/recovery/siteId";

const siteIdField = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .optional();

const schema = z.object({
  apiVersion: z.enum(["1"]).optional(),
  siteId: siteIdField,
  action: z.enum([
    "cart_abandoned",
    "recovery_email_sent",
    "recovery_call_completed",
    "mark_recovered",
  ]),
  userId: z.string().optional(),
  cartId: z.string().optional(),
  exitStep: z.string().optional(),
  cartTotal: z.number().optional(),
  contactEmail: z.string().email().optional(),
  transcript: z.string().optional(),
  objectionSummary: z.string().optional(),
  promoCode: z.string().optional(),
  channel: z.enum(["email", "voice"]).optional(),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-n8n-secret");
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const headerVersion = req.headers.get("x-recovery-api-version");
  if (headerVersion && headerVersion !== "1") {
    return NextResponse.json(
      { error: "Version API non supportée", supported: ["1"] },
      { status: 400 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }
  const body = parsed.data;

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore admin indisponible" },
      { status: 500 },
    );
  }
  const now = Date.now();
  const adminCfg = await getAdminConfig(db);
  const siteId = resolveRecoverySiteId(body, adminCfg);

  if (body.action === "cart_abandoned") {
    const cfg = adminCfg;
    const logRef = db.collection("recoveryLogs").doc();
    await logRef.set({
      id: logRef.id,
      siteId,
      userId: body.userId ?? body.cartId ?? null,
      cartId: body.cartId ?? null,
      channel: cfg.recoveryMode,
      status: "pending",
      exitStep: body.exitStep ?? null,
      cartTotal: body.cartTotal ?? null,
      contactEmail: body.contactEmail ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ ok: true, logId: logRef.id, siteId });
  }

  if (body.action === "recovery_email_sent") {
    const logRef = db.collection("recoveryLogs").doc();
    await logRef.set({
      id: logRef.id,
      siteId,
      userId: body.userId ?? null,
      cartId: body.cartId ?? null,
      channel: "email",
      status: "email_sent",
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ ok: true, logId: logRef.id, siteId });
  }

  if (body.action === "recovery_call_completed") {
    const logRef = db.collection("recoveryLogs").doc();
    await logRef.set({
      id: logRef.id,
      siteId,
      userId: body.userId ?? null,
      cartId: body.cartId ?? null,
      channel: "voice",
      status: "call_completed",
      transcript: body.transcript ?? null,
      objectionSummary: body.objectionSummary ?? null,
      promoCode: body.promoCode ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ ok: true, logId: logRef.id, siteId });
  }

  if (body.action === "mark_recovered") {
    const userKey = body.userId ?? "";
    if (!userKey) {
      return NextResponse.json({ ok: true, updated: 0, siteId });
    }
    const q = await db
      .collection("recoveryLogs")
      .where("userId", "==", userKey)
      .limit(25)
      .get();
    const batch = db.batch();
    let n = 0;
    q.docs.forEach((d) => {
      const data = d.data() as { siteId?: string };
      const docSite = data.siteId ?? "default";
      if (docSite !== siteId) return;
      batch.update(d.ref, { status: "recovered", updatedAt: now });
      n += 1;
    });
    if (n > 0) await batch.commit();
    return NextResponse.json({ ok: true, updated: n, siteId });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

async function getAdminConfig(db: Firestore) {
  const snap = await db.collection("adminConfig").doc("global").get();
  if (!snap.exists) return DEFAULT_ADMIN_CONFIG;
  return { ...DEFAULT_ADMIN_CONFIG, ...snap.data() } as typeof DEFAULT_ADMIN_CONFIG;
}
