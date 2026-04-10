import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, isAdminEmail } from "@/lib/auth/verify";
import { getAdminDb } from "@/lib/firebase/admin";
import { ABANDON_INACTIVITY_MINUTES } from "@/lib/config";

export async function GET(req: NextRequest) {
  const user = await verifyIdToken(req.headers.get("authorization"));
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ abandons: [] });
  }
  const since = Date.now() - ABANDON_INACTIVITY_MINUTES * 60 * 1000;
  let eventsSnap;
  try {
    eventsSnap = await db
      .collection("events")
      .where("type", "==", "checkout_step")
      .where("createdAt", ">=", since)
      .limit(200)
      .get();
  } catch {
    eventsSnap = await db.collection("events").limit(200).get();
  }
  const abandons = eventsSnap.docs
    .map((d) => {
      const x = d.data() as {
        userId?: string;
        userEmail?: string;
        type?: string;
        payload?: { step?: string };
        createdAt?: number;
      };
      return {
        id: d.id,
        userId: x.userId,
        userEmail: x.userEmail,
        exitStep: x.payload?.step ?? x.type,
        createdAt: x.createdAt,
      };
    })
    .filter((a) => (a.createdAt ?? 0) >= since)
    .filter((a) => Boolean(a.userEmail));
  return NextResponse.json({ abandons, windowMinutes: ABANDON_INACTIVITY_MINUTES });
}
