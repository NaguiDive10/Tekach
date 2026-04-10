import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, isAdminEmail } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({
      totalRevenue: 0,
      recoveredRevenue: 0,
      recoveryRate: 0,
      aovRecovered: 0,
      ordersCount: 0,
    });
  }
  const ordersSnap = await db.collection("orders").limit(500).get();
  let totalRevenue = 0;
  let recoveredRevenue = 0;
  let recoveredCount = 0;
  ordersSnap.docs.forEach((d) => {
    const x = d.data() as { total?: number; recoverySource?: string };
    const t = x.total ?? 0;
    totalRevenue += t;
    if (x.recoverySource) {
      recoveredRevenue += t;
      recoveredCount += 1;
    }
  });
  const ordersCount = ordersSnap.size;
  const recoveryRate =
    ordersCount > 0 ? Math.round((recoveredCount / ordersCount) * 1000) / 10 : 0;
  const aovRecovered =
    recoveredCount > 0
      ? Math.round((recoveredRevenue / recoveredCount) * 100) / 100
      : 0;
  return NextResponse.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    recoveredRevenue: Math.round(recoveredRevenue * 100) / 100,
    recoveryRate,
    aovRecovered,
    ordersCount,
  });
}
