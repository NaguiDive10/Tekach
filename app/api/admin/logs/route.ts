import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, isAdminEmail } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const siteFilter = req.nextUrl.searchParams.get("siteId")?.trim();
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ logs: [] });
  }
  const snap = await db
    .collection("recoveryLogs")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get()
    .catch(async () => {
      const s = await db.collection("recoveryLogs").limit(100).get();
      return s;
    });
  let logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (siteFilter) {
    logs = logs.filter((row) => {
      const sid = (row as { siteId?: string }).siteId ?? "default";
      return sid === siteFilter;
    });
  }
  return NextResponse.json({ logs });
}
