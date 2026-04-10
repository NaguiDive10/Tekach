import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_TENANT_ID } from "@/lib/tenants/constants";

/**
 * Alimente n8n / un worker : liste des événements `checkout_abandon` récents.
 * Sécuriser avec `CRON_SECRET` (header `x-cron-secret`).
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hours = Math.min(
    168,
    Math.max(1, Number(req.nextUrl.searchParams.get("hours")) || 24),
  );
  const since = Date.now() - hours * 60 * 60 * 1000;
  const tenantId =
    req.nextUrl.searchParams.get("tenantId")?.trim() || DEFAULT_TENANT_ID;

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ tenantId, events: [], note: "no admin db" });
  }

  let snap;
  try {
    snap = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("events")
      .where("createdAt", ">=", since)
      .limit(500)
      .get();
  } catch {
    snap = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("events")
      .limit(200)
      .get();
  }

  const events = snap.docs
    .map((d) => {
      const x = d.data() as {
        type?: string;
        createdAt?: number;
        sessionId?: string;
        payload?: Record<string, unknown>;
        identifiedEmail?: string | null;
      };
      return {
        id: d.id,
        type: x.type,
        createdAt: x.createdAt,
        sessionId: x.sessionId,
        payload: x.payload,
        identifiedEmail: x.identifiedEmail,
      };
    })
    .filter((e) => e.type === "checkout_abandon");

  return NextResponse.json({
    tenantId,
    windowHours: hours,
    count: events.length,
    events,
  });
}
