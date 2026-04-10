import { NextRequest, NextResponse } from "next/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { verifyIdToken } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";
import { resolveDashboardTenantId } from "@/lib/tenants/dashboard-access";

export async function GET(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const tenantId = await resolveDashboardTenantId(user);
  if (!tenantId) {
    return NextResponse.json({ error: "Aucun tenant associé" }, { status: 403 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ events: [] });
  }

  const limit = Math.min(
    50,
    Math.max(5, Number(req.nextUrl.searchParams.get("limit")) || 30),
  );

  let docs: QueryDocumentSnapshot[] = [];
  try {
    const snap = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("events")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    docs = snap.docs;
  } catch {
    const snap = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("events")
      .limit(limit)
      .get();
    docs = snap.docs.sort(
      (a, b) =>
        ((b.data() as { createdAt?: number }).createdAt ?? 0) -
        ((a.data() as { createdAt?: number }).createdAt ?? 0),
    );
  }

  const events = docs.map((d) => {
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
  });

  return NextResponse.json({ events });
}
