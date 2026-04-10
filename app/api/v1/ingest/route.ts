import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { resolveTenantIdByPublishableKey, getTenant } from "@/lib/tenants/resolve";
import { normalizeIngestEventType } from "@/lib/tenants/events";
import type { TenantEventDoc } from "@/lib/tenants/types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, X-Tekach-Key, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

const eventItemSchema = z.object({
  type: z.string().min(1).max(128),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const bodySchema = z
  .object({
    sessionId: z.string().min(8).max(128).optional(),
    events: z.array(eventItemSchema).max(50).default([]),
    identify: z
      .object({
        email: z.string().email().optional(),
        userId: z.string().min(1).max(256).optional(),
      })
      .optional(),
  })
  .refine(
    (d) =>
      d.events.length > 0 ||
      Boolean(d.identify?.email || d.identify?.userId),
    { message: "events ou identify requis" },
  );

function extractPublishableKey(req: NextRequest): string | null {
  const h = req.headers.get("x-tekach-key")?.trim();
  if (h) return h;
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t.startsWith("pk_")) return t;
  }
  return null;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const key = extractPublishableKey(req);
  if (!key) {
    return NextResponse.json(
      { error: "Clé manquante (X-Tekach-Key ou Bearer pk_…)" },
      { status: 401, headers: corsHeaders },
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Service indisponible" },
      { status: 503, headers: corsHeaders },
    );
  }

  const tenantId = await resolveTenantIdByPublishableKey(db, key);
  if (!tenantId) {
    return NextResponse.json(
      { error: "Clé invalide" },
      { status: 401, headers: corsHeaders },
    );
  }

  const tenant = await getTenant(db, tenantId);
  if (!tenant || tenant.status !== "active") {
    return NextResponse.json(
      { error: "Tenant inactif" },
      { status: 403, headers: corsHeaders },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", details: parsed.error.flatten() },
      { status: 400, headers: corsHeaders },
    );
  }

  const { sessionId: bodySession, events, identify } = parsed.data;
  const sessionId =
    bodySession ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sess_${Date.now()}`);

  const identifiedEmail = identify?.email ?? null;
  const externalUserId = identify?.userId ?? null;

  const batch = db.batch();
  const eventsCol = db.collection("tenants").doc(tenantId).collection("events");

  let written = 0;
  for (const ev of events) {
    const type = normalizeIngestEventType(ev.type);
    const ref = eventsCol.doc();
    const doc: TenantEventDoc = {
      type,
      payload: (ev.payload ?? {}) as Record<string, unknown>,
      sessionId,
      source: "sdk",
      createdAt: Date.now(),
      identifiedEmail,
      externalUserId,
    };
    batch.set(ref, doc);
    written += 1;
  }

  if (identify && (identify.email || identify.userId)) {
    const idRef = eventsCol.doc();
    const identifyDoc: TenantEventDoc = {
      type: "identify",
      payload: {
        ...(identify.email ? { email: identify.email } : {}),
        ...(identify.userId ? { userId: identify.userId } : {}),
      },
      sessionId,
      source: "sdk",
      createdAt: Date.now(),
      identifiedEmail,
      externalUserId,
    };
    batch.set(idRef, identifyDoc);
    written += 1;
  }

  await batch.commit();

  await db
    .collection("tenants")
    .doc(tenantId)
    .set(
      {
        lastIngestAt: Date.now(),
        eventCountTotal: FieldValue.increment(written),
      },
      { merge: true },
    );

  return NextResponse.json(
    { ok: true, tenantId, sessionId, accepted: written },
    { headers: corsHeaders },
  );
}
