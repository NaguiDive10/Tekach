import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";
import { resolveDashboardTenantId } from "@/lib/tenants/dashboard-access";

const DAY_MS = 24 * 60 * 60 * 1000;

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
    return NextResponse.json({
      tenantId,
      events7d: 0,
      abandons7d: 0,
      note: "Firestore admin indisponible",
    });
  }

  const since7 = Date.now() - 7 * DAY_MS;
  const eventsRef = db
    .collection("tenants")
    .doc(tenantId)
    .collection("events");

  let events7d = 0;
  let abandons7d = 0;
  try {
    const snap = await eventsRef
      .where("createdAt", ">=", since7)
      .limit(500)
      .get();
    events7d = snap.size;
    snap.docs.forEach((d) => {
      const t = (d.data() as { type?: string }).type;
      if (t === "checkout_abandon") abandons7d += 1;
    });
  } catch {
    /* index ou quota */
  }

  const tenantSnap = await db.collection("tenants").doc(tenantId).get();
  const tenant = tenantSnap.data() as { name?: string } | undefined;

  return NextResponse.json({
    tenantId,
    tenantName: tenant?.name ?? tenantId,
    events7d,
    abandons7d,
  });
}
